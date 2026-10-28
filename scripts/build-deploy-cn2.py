#!/usr/bin/env python3
"""全高清部署版：从 hq-data 原始数据生成 pushroot/data/ 双分片。
每弹拆成 <name>.json（元信息 + 前半卡）与 <name>.p2.json（后半卡），
单片 <5MB 满足 push-files 上限；app 的 loadSet 并行拉取后合并。
在项目根目录运行：python3 scripts/build-deploy-cn2.py"""
import json, os, shutil

if os.path.exists('pushroot/data'): shutil.rmtree('pushroot/data')
os.makedirs('pushroot/data')
for fn in sorted(os.listdir('hq-data')):
    if not fn.startswith('zh-cn-'): continue
    d = json.load(open(f'hq-data/{fn}'))
    cards = d['cards']; half = (len(cards) + 1) // 2
    p1 = {**d, 'cards': cards[:half]}
    p2 = {'cards': cards[half:]}
    o1, o2 = f'pushroot/data/{fn}', f'pushroot/data/{fn.replace(".json", ".p2.json")}'
    json.dump(p1, open(o1, 'w'), ensure_ascii=False)
    json.dump(p2, open(o2, 'w'), ensure_ascii=False)
    print(fn, f"part1 {os.path.getsize(o1)/1e6:.2f}MB ({half}) | part2 {os.path.getsize(o2)/1e6:.2f}MB ({len(cards)-half})")
