#!/usr/bin/env python3
"""太晶盛聚 SAR/HR 缺图卡第二轮补图：在 TCGdex 日版来源弹中按全国图鉴号 + 稀有度
精确匹配同卡 SAR/金卡印刷（日文面，插画与简中版一致），替换掉同名普通图兜底。"""
import json, io, base64, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'RipJoy/1.2'})
    with urllib.request.urlopen(req, timeout=30) as r: return r.read()

def jget(url):
    for _ in range(3):
        try: return json.loads(get(url))
        except Exception: pass
    return None

def to_uri(raw, width=460, q=72):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    if im.width > width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

# 目标：编号 -> (图鉴号, 想要的印刷)  SAR=特别插画稀有 / GOLD=金卡
DEX = {'厄诡椪': 1017, '海豚侠ex': 964, '铁武者ex': 1006, '铁头壳ex': 1023, '沙铁皮ex': 989,
       '桃歹郎ex': 1025, '太乐巴戈斯ex': 1024, '铁斑叶ex': 1010, '波荡水ex': 1009}
TARGETS = {  # num: 'SAR' | 'GOLD'
    '225': 'SAR', '228': 'SAR', '229': 'SAR', '235': 'SAR', '236': 'SAR', '237': 'SAR',
    '238': 'SAR', '241': 'SAR', '248': 'SAR',
    '255': 'GOLD', '256': 'GOLD', '257': 'GOLD', '259': 'GOLD'}
JA_SETS = ['sv4K', 'sv4M', 'sv5K', 'sv5M', 'sv6', 'sv6a', 'sv7', 'sv8a']

d = json.load(open('data/zh-cn-CSV9.5C.json'))
by_num = {c['no']: c for c in d['cards']}
want_dex = {DEX[by_num[n]['n']] for n in TARGETS if by_num[n]['n'] in DEX}
print('target dex:', sorted(want_dex))

candidates = []  # (dex, rarity, image, setid, name)
for s in JA_SETS:
    lst = jget(f'https://api.tcgdex.net/v2/ja/cards?set={s}') or []
    def probe(c):
        det = jget(f"https://api.tcgdex.net/v2/ja/cards/{c['id']}")
        if not det: return None
        dex = (det.get('dexId') or [None])[0]
        if dex in want_dex and det.get('rarity') in ('Special Illustration Rare', 'Secret Rare', 'Hyper Rare', 'Ultra Rare') and det.get('image'):
            return (dex, det['rarity'], det['image'], s, det['name'])
        return None
    with ThreadPoolExecutor(max_workers=12) as ex:
        for r in ex.map(probe, lst):
            if r: candidates.append(r)
    print(s, 'scanned', len(lst), '| candidates so far', len(candidates))

for num, kind in TARGETS.items():
    card = by_num[num]; dex = DEX.get(card['n'])
    if dex is None: print(num, card['n'], 'no dex mapping'); continue
    opts = [c for c in candidates if c[0] == dex]
    if kind == 'SAR': pick = next((o for o in opts if o[1] == 'Special Illustration Rare'), None)
    else: pick = next((o for o in opts if o[1] in ('Hyper Rare', 'Secret Rare')), None) or \
                next((o for o in opts if o[1] == 'Special Illustration Rare'), None)
    if pick:
        try:
            card['img'] = to_uri(get(pick[2] + '/high.webp'))
            print(f"FILLED-JA {num} {card['n']} <- {pick[4]} ({pick[3]}, {pick[1]})")
        except Exception as e: print(num, 'dl fail', e)
    else:
        print(f"NO-JA {num} {card['n']} (dex {dex}, opts={[(o[1], o[3]) for o in opts]})")
json.dump(d, open('data/zh-cn-CSV9.5C.json', 'w'), ensure_ascii=False)
import os; print('final size', f"{os.path.getsize('data/zh-cn-CSV9.5C.json')/1e6:.1f}MB")
