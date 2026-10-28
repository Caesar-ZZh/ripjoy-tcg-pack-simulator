#!/usr/bin/env python3
"""从 hq-data 原始简中数据生成 Pages 部署版（pushroot/data/）：
- 主文件 zh-cn-XXX.json：全卡缩略图 200px/q50（网格/托盘/普通卡翻卡用），保证 <5MB 可推送
- 高清包 zh-cn-XXX.hi.json：仅高稀有卡（rk in RR/SR/SAR/UR/AR/ACE）的干净单次转码图
  （源宽上限 460px、q72），进开包/图鉴时按需加载，翻卡与大图自动换高清
在项目根目录运行：python3 scripts/build-deploy-cn.py"""
import json, io, base64, os
from PIL import Image

HIGH = {'RR', 'RRR', 'SR', 'SAR', 'UR', 'AR', 'ACE', 'SSR'}
os.makedirs('pushroot/data', exist_ok=True)

def dec(uri):
    return Image.open(io.BytesIO(base64.b64decode(uri.split(',', 1)[1]))).convert('RGB')

def enc(im, w, q):
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

for fn in sorted(os.listdir('hq-data')):
    if not fn.startswith('zh-cn-'): continue
    d = json.load(open(f'hq-data/{fn}'))
    hi = {}
    for c in d['cards']:
        if not c.get('img', '').startswith('data:'): continue
        im = dec(c['img'])
        if c.get('rk') in HIGH: hi[c['id']] = enc(im, 460, 72)
        c['img'] = enc(im, 200, 50)
    main_out = f'pushroot/data/{fn}'
    hi_out = f'pushroot/data/{fn.replace(".json", ".hi.json")}'
    json.dump(d, open(main_out, 'w'), ensure_ascii=False)
    json.dump(hi, open(hi_out, 'w'), ensure_ascii=False)
    print(fn, 'main', f"{os.path.getsize(main_out)/1e6:.2f}MB", '| hi', f"{os.path.getsize(hi_out)/1e6:.2f}MB", f"({len(hi)} rares)")
