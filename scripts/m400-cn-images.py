#!/usr/bin/env python3
"""简中弹卡图400px 重编码：从 data/ 高清母版重编码，生成 pushroot/data/ 部署分片。
- 640px 源 -> 400px webp q65；300px 源 -> 保持 300px，webp q60
- 只改 img 字段的编码尺寸/质量；卡数据（id/n/no/rk/r/p/ill/cur）与弹元信息原样保留
- 分片上限 2.4MB（2 片一推 <= 5MB 推送上限）；新分片数供更新 app.js SETS.parts
- data/ 高清母版不动；400px 重编码后母版写 m400-data/（本地留档，不推送）
- 输出文件名带 -m400 后缀（zh-cn-30thC-m400.json / .p2 / .p3…），与线上高清分片
  不重名：新旧共存、滚动升级不断档（旧 app.js 不碰新文件，新 app.js 不碰旧文件）；
  新文件名在 jsDelivr 上无缓存，首拉即新数据，无需 purge
- pushroot/data 里旧的简中分片先清掉（保留 meta.json）；仓库里删不掉的旧 .p4~.p15
  文件在新 parts 生效后不再被拉取
在项目根目录运行：python3 scripts/m400-cn-images.py —— 输出每弹新旧体积与分片数。"""
import json, io, base64, os
from PIL import Image

LIMIT = 2_400_000
TARGET_W = 400  # 400px 折中版：比 320px 清晰（小字可读），比高清小约 70%
QUALITY = 65
QUALITY_SMALL = 60  # 300px 源（老五弹）：q60 比 q65 每弹省约 0.4MB，刚好压进 3 分片
SETS = ['zh-cn-151C.json', 'zh-cn-CSV7C.json', 'zh-cn-CSV8C.json',
        'zh-cn-CSV9C.json', 'zh-cn-CSV9.5C.json', 'zh-cn-CSV10.5C.json',
        'zh-cn-CSV10.6C.json', 'zh-cn-30thC.json']

def dec(uri):
    return Image.open(io.BytesIO(base64.b64decode(uri.split(',', 1)[1]))).convert('RGB')

def enc(im):
    if im.width > TARGET_W:
        im = im.resize((TARGET_W, round(im.height * TARGET_W / im.width)), Image.LANCZOS)
        q = QUALITY
    else:
        q = QUALITY_SMALL
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

os.makedirs('m400-data', exist_ok=True)
os.makedirs('pushroot/data', exist_ok=True)
for fn in list(os.listdir('pushroot/data')):
    if fn.startswith('zh-cn-') and fn.endswith('.json'):
        os.remove(f'pushroot/data/{fn}')

print(f"{'set':22} {'cards':>5} {'old MB':>7} {'new MB':>7} {'parts':>5}  chunks")
results = {}
for fn in SETS:
    src = json.load(open(f'data/{fn}'))
    old_size = os.path.getsize(f'data/{fn}')
    n_slim, n_skip = 0, 0
    for c in src['cards']:
        img = c.get('img', '')
        if img.startswith('data:'):
            c['img'] = enc(dec(img))
            n_slim += 1
        else:
            n_skip += 1
    if n_skip:
        print(f'WARN {fn}: {n_skip} cards without data: img, left untouched')
    slim_path = f'm400-data/{fn}'
    json.dump(src, open(slim_path, 'w'), ensure_ascii=False)
    new_size = os.path.getsize(slim_path)
    cards = src['cards']
    chunks, cur, cursize = [], [], 200
    for c in cards:
        s = len(json.dumps(c, ensure_ascii=False)) + 1
        if cur and cursize + s > LIMIT:
            chunks.append(cur); cur, cursize = [], 200
        cur.append(c); cursize += s
    if cur:
        chunks.append(cur)
    chunk_sizes = []
    for i, ch in enumerate(chunks):
        out = fn.replace('.json', '-m400.json') if i == 0 else fn.replace('.json', f'-m400.p{i + 1}.json')
        payload = {**src, 'cards': ch} if i == 0 else {'cards': ch}
        json.dump(payload, open(f'pushroot/data/{out}', 'w'), ensure_ascii=False)
        chunk_sizes.append(os.path.getsize(f'pushroot/data/{out}') / 1e6)
    results[fn] = len(chunks)
    print(f"{fn:22} {len(cards):5d} {old_size/1e6:7.2f} {new_size/1e6:7.2f} {len(chunks):5d}  " +
          ' '.join(f'{s:.2f}' for s in chunk_sizes))
print('=> parts:', {fn.replace('zh-cn-', '').replace('.json', ''): p for fn, p in results.items()})
