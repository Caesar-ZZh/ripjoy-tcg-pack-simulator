#!/usr/bin/env python3
"""RipJoy 全量数据审计：SETS 配置 vs 数据文件、池子完整性、图片/价格/logo、高清包覆盖。"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

app = open('src/app.js', encoding='utf-8').read()
sets = []
for m in re.finditer(r"\{ key: '([^']+)', file: '([^']+)'.*?sname: '([^']+)', lang: '([^']+)', total: (\d+), pack: (\d+)[, }]", app):
    sets.append(dict(key=m.group(1), file=m.group(2), sname=m.group(3), lang=m.group(4), total=int(m.group(5)), pack=int(m.group(6))))
print(f"SETS entries: {len(sets)}")

def tier_of(c):
    if c.get('rk'):
        return {'C': 'C', 'U': 'U', 'R': 'R', 'RR': 'RR', 'ACE': 'ACE', 'SR': 'UR', 'SAR': 'SAR', 'UR': 'HR'}.get(c['rk'], '?')
    r = (c.get('r') or '').lower()
    if 'black white' in r: return 'BWR'
    if 'shiny' in r: return 'UR' if 'ultra' in r else 'AR'
    if 'special' in r: return 'SAR'
    if 'hyper' in r: return 'HR'
    if 'illustration' in r: return 'AR'
    if 'ace' in r: return 'ACE'
    if 'double' in r: return 'RR'
    if r == 'secret rare': return 'UR'
    if 'ultra' in r: return 'UR'
    if 'rare' in r: return 'R'
    if 'uncommon' in r: return 'U'
    return 'C'

HIGH = {'RR', 'RRR', 'SR', 'SAR', 'UR', 'AR', 'ACE'}
all_ids = {}
problems, notes = [], []
for s in sets:
    path = s['file']
    live = path
    if 'zh-cn' in path and os.path.exists('pushroot/' + path): live = 'pushroot/' + path
    if not os.path.exists(live):
        problems.append(f"{s['key']}: 数据文件缺失 {live}"); continue
    d = json.load(open(live))
    p2p = live.replace('.json', '.p2.json')
    if 'zh-cn' in path and os.path.exists(p2p):
        d = {**d, 'cards': d['cards'] + json.load(open(p2p))['cards']}
    cards = d['cards']
    tag = f"{s['key']}({s['sname']})"
    if len(cards) != s['total']: problems.append(f"{tag}: 卡数 {len(cards)} != 配置 total {s['total']}")
    if d.get('pack') != s['pack']: problems.append(f"{tag}: 数据 pack={d.get('pack')} != 配置 {s['pack']}（引擎读数据文件！）")
    if d.get('lang') != s['lang']: notes.append(f"{tag}: 数据 lang={d.get('lang')} 配置 {s['lang']}")
    ids = [c['id'] for c in cards]
    if len(set(ids)) != len(ids): problems.append(f"{tag}: 重复 id {len(ids)-len(set(ids))} 个")
    for i in ids:
        if i in all_ids: problems.append(f"{tag}: id 与 {all_ids[i]} 跨弹冲突 {i}")
        all_ids[i] = s['key']
    noimg = [c['id'] for c in cards if not c.get('img')]
    if noimg: problems.append(f"{tag}: {len(noimg)} 张无图 {noimg[:3]}")
    badimg = [c['id'] for c in cards if c.get('img') and not (c['img'].startswith('data:') or c['img'].startswith('https://assets.tcgdex'))]
    if badimg: notes.append(f"{tag}: {len(badimg)} 张图 URL 异常前缀 {badimg[:2]}")
    tiers = {}
    for c in cards: tiers[tier_of(c)] = tiers.get(tier_of(c), 0) + 1
    for need in ('C', 'U', 'R'):
        if not tiers.get(need): problems.append(f"{tag}: 池子缺 {need} 档（包结构会缺卡）")
    priced = sum(1 for c in cards if c.get('p') is not None)
    notes.append(f"{tag}: 档位 {dict(sorted(tiers.items()))} | 有价 {priced}/{len(cards)} | logo {'有' if d.get('logo') else '无'} | 画师 {sum(1 for c in cards if c.get('ill'))}")
    dupno = {}
    for c in cards: dupno.setdefault(str(c.get('no')), []).append(c['id'])
    dups = {k: v for k, v in dupno.items() if len(v) > 1}
    if dups: notes.append(f"{tag}: 同编号多条目 {list(dups.items())[:3]}")
    if 'zh-cn' in path and os.path.exists('pushroot/' + path.replace('.json', '.p2.json')):
        pass  # 分片全高清模式：无高清包，跳过覆盖检查
    elif 'zh-cn' in path:
        hi_path = 'pushroot/' + path.replace('.json', '.hi.json')
        if not os.path.exists(hi_path): problems.append(f"{tag}: 高清包缺失")
        else:
            hi = json.load(open(hi_path))
            want = {c['id'] for c in cards if c.get('rk') in HIGH}
            miss = want - set(hi); extra = set(hi) - {c['id'] for c in cards}
            if miss: problems.append(f"{tag}: 高清包缺 {len(miss)} 张高稀有 {sorted(miss)[:3]}")
            if extra: problems.append(f"{tag}: 高清包多余 key {sorted(extra)[:3]}")
print("\n== 问题 ==")
print('\n'.join(problems) if problems else '（无）')
print("\n== 明细/提示 ==")
print('\n'.join(notes))
