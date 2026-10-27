#!/usr/bin/env python3
"""补齐太晶盛聚缺图卡（同名第二/第三版印刷，52poke 与官方库图库都只有一张同名图）：
先在 TCGdex 英文弹中按英文名找同卡高稀有印刷（SAR/HR/UR，卡图为英文面但插画一致）；
找不到的复用同名第一版印刷的简中卡图。"""
import json, re, io, base64, html as ihtml, urllib.request
from PIL import Image

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'RipJoy/1.2'})
    with urllib.request.urlopen(req, timeout=30) as r: return r.read()

def to_uri(raw, width=460, q=72):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    if im.width > width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

d = json.load(open('data/zh-cn-CSV9.5C.json'))
missing = [c for c in d['cards'] if not c['img']]
print('missing:', [(c['no'], c['n'], c['r']) for c in missing])

# 简中名 -> 英文名（Bill's 图库 data 属性）
bh = get('http://billsarchive.com/terastal-gathering-cn.html').decode('utf-8', 'ignore')
cn2en = {}
for en, cn in re.findall(r'data-name="([^"]*)" data-cn="([^"]*)"', bh):
    cn2en.setdefault(ihtml.unescape(cn), ihtml.unescape(en))
for c in missing: print(' ', c['n'], '->', cn2en.get(c['n']))

# TCGdex 英文弹轻量列表（候选来源弹）
CAND_SETS = ['sv02', 'sv04', 'sv06', 'sv06.5', 'sv07']
en_cards = []
for s in CAND_SETS:
    lst = json.loads(get(f'https://api.tcgdex.net/v2/en/cards?set={s}'))
    for c in lst:
        det = json.loads(get(f"https://api.tcgdex.net/v2/en/cards/{c['id']}"))
        if det.get('rarity') in ('Special Illustration Rare', 'Hyper Rare', 'Ultra Rare') and det.get('image'):
            en_cards.append({'name': det['name'], 'rarity': det['rarity'], 'image': det['image'], 'set': s})
print('candidate EN high-rarity cards:', len(en_cards))
# 已抓全量的本地弹也纳入（sv05/sv08.5/sv09/me01）
import glob
for f in glob.glob('data/en-*.json'):
    dd = json.load(open(f))
    for c in dd['cards']:
        if c['r'] in ('Special Illustration Rare', 'Hyper Rare', 'Ultra Rare'):
            en_cards.append({'name': c['n'], 'rarity': c['r'], 'image': c['img'], 'set': dd['id']})

by_name = {}
for c in en_cards: by_name.setdefault(c['name'], []).append(c)
used = {}
for c in missing:
    en = cn2en.get(c['n'])
    opts = by_name.get(en, []) if en else []
    # 优先同稀有类别
    want = 'Hyper Rare' if c['r'] == 'Hyper Rare' else 'Special Illustration Rare' if c['r'] == 'Special Illustration Rare' else None
    pick = next((o for o in opts if o['rarity'] == want), None) or (opts[0] if opts else None)
    if pick:
        try:
            c['img'] = to_uri(get(pick['image'] + '/high.webp'))
            print(f"FILLED-EN {c['no']} {c['n']} <- {pick['name']} ({pick['set']}, {pick['rarity']})")
            continue
        except Exception as e: print('dl fail', c['n'], e)
    # 兜底：同名第一版印刷的简中图
    sib = next((x for x in d['cards'] if x['n'] == c['n'] and x['img']), None)
    if sib: c['img'] = sib['img']; print(f"FALLBACK-CN {c['no']} {c['n']} <- same-name print {sib['no']}")
    else: print(f"STILL-MISSING {c['no']} {c['n']}")
json.dump(d, open('data/zh-cn-CSV9.5C.json', 'w'), ensure_ascii=False)
import os; print('final size', f"{os.path.getsize('data/zh-cn-CSV9.5C.json')/1e6:.1f}MB",
                  '| still missing:', sum(1 for c in d['cards'] if not c['img']))
