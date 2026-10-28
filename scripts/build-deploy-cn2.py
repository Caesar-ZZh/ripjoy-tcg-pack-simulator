#!/usr/bin/env python3
"""高清部署版：从 hq-data 原始数据生成 pushroot/data/ 分片。
每弹拆成 <name>.json（元信息 + 首片卡）与 <name>.p2.json、.p3.json…
（单片 ≤3.6MB 满足 push-files 上限）；app 的 loadSet 按 SETS.parts 并行拉取后合并。
在项目根目录运行：python3 scripts/build-deploy-cn2.py —— 输出每弹分片数供更新 app.js。"""
import json, os, shutil

LIMIT = 3_600_000
if os.path.exists('pushroot/data'): shutil.rmtree('pushroot/data')
os.makedirs('pushroot/data')
for fn in sorted(os.listdir('hq-data')):
    if not fn.startswith('zh-cn-'): continue
    d = json.load(open(f'hq-data/{fn}'))
    cards = d['cards']
    # 按序列化体积贪心分片
    chunks, cur, cursize = [], [], 200
    for c in cards:
        s = len(json.dumps(c, ensure_ascii=False)) + 1
        if cur and cursize + s > LIMIT: chunks.append(cur); cur, cursize = [], 200
        cur.append(c); cursize += s
    if cur: chunks.append(cur)
    for i, ch in enumerate(chunks):
        out = fn if i == 0 else fn.replace('.json', f'.p{i + 1}.json')
        payload = {**d, 'cards': ch} if i == 0 else {'cards': ch}
        json.dump(payload, open(f'pushroot/data/{out}', 'w'), ensure_ascii=False)
        print(fn, f'part{i + 1}', f"{os.path.getsize('pushroot/data/' + out)/1e6:.2f}MB", f'({len(ch)} cards)')
    print('=>', fn, 'parts:', len(chunks))
