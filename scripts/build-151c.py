#!/usr/bin/env python3
"""收集啦151：旅/望/惊/聚 四个子弹合并为一弹。卡表 52poke、卡图 Bill's collect-151
按简中名分组对齐（52poke 扫描以各子页探测到的文件前缀尝试），同名兜底。"""
import json, re, io, base64, hashlib, html as ihtml, urllib.request, urllib.parse
from collections import Counter
from PIL import Image

RARITY_MAP = {'C': 'Common', 'U': 'Uncommon', 'R': 'Rare', 'RR': 'Double Rare', 'RRR': 'Double Rare',
              'SR': 'Ultra Rare', 'SAR': 'Special Illustration Rare', 'UR': 'Hyper Rare',
              'AR': 'Illustration Rare', 'ACE': 'ACE SPEC Rare'}
HIGH = {'RR', 'RRR', 'SR', 'SAR', 'UR', 'AR'}
SUBS = ['旅', '望', '惊', '聚']

def get(url, referer=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'RipJoy/1.3 (personal project)'})
    if referer: req.add_header('Referer', referer)
    with urllib.request.urlopen(req, timeout=30) as r: return r.read()

def to_uri(raw, hi):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    w, q = (400, 64) if hi else (260, 54)
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

cards, seen_keys = [], set()
pat = re.compile(r'\{\{卡牌列表/entry\w+\|(\d+)/\d+\|\{\{(?:C|TCG)\|([^|}]+)(?:\|[^}]*)?\}\}\|[^|]*\|[^|]*\|([A-Z]*)')
cards, seen_keys = [], set()
for sub in SUBS:
    title = f'收集啦151 {sub}（TCG）'
    api = ('https://wiki.52poke.com/api.php?action=query&prop=revisions&rvprop=content'
           f'&rvslots=main&titles={urllib.parse.quote(title)}&format=json')
    wt = json.loads(get(api).decode())['query']['pages']
    wt = list(wt.values())[0]['revisions'][0]['slots']['main']['*']
    page_html = get('https://wiki.52poke.com/wiki/' + urllib.parse.quote(title)).decode('utf-8', 'ignore')
    prefs = Counter(p for p, _ in re.findall(r'([A-Za-z0-9.]+?)(\d{3})\.png', page_html) if len(p) >= 3)
    prefix = prefs.most_common(1)[0][0] if prefs else '151C'
    n0 = 0
    for line in wt.split('\n'):
        if '卡牌列表/entry' not in line: continue
        m = pat.search(line)
        if m:
            key = (int(m.group(1)), m.group(2).strip(), m.group(3) or 'C')
            if key in seen_keys: continue
            seen_keys.add(key); n0 += 1
            cards.append({'sub': sub, 'num': int(m.group(1)), 'n': m.group(2).strip(),
                          'rk': m.group(3) or 'C', 'prefix': prefix})
    print(f'[{sub}] new unique entries: {n0}, prefix: {prefix} {prefs.most_common(2)}')
print('total unique entries:', len(cards))

bh = get('https://billsarchive.com/collect-151-cn.html').decode('utf-8', 'ignore')
blocks = re.findall(r'data-cat="([a-z]+)" data-name="([^"]*)" data-cn="([^"]*)" data-code="([^"]*)"[^>]*>.*?src="(https://bills-archive[^"]+)"', bh)
seen, bills_by_name = set(), {}
for cat, en, cn, code, url in blocks:
    cn = ihtml.unescape(cn); key = (cn, code, en)
    if key in seen: continue
    seen.add(key); bills_by_name.setdefault(cn, []).append(url)
print('bills distinct:', len(seen), 'names:', len(bills_by_name))

name_cursor = {}
def fetch_img(card):
    hi = card['rk'] in HIGH
    fname = f"{card['prefix']}{card['num']:03d}.png"
    h = hashlib.md5(fname.encode()).hexdigest()
    for width in (400 if hi else 300,):
        try: return to_uri(get(f'https://media.52poke.com/wiki/thumb/{h[0]}/{h[:2]}/{fname}/{width}px-{fname}', referer='https://wiki.52poke.com/'), hi), '52poke'
        except Exception: pass
    queue = bills_by_name.get(card['n'], []); idx = name_cursor.get(card['n'], 0)
    if idx < len(queue):
        name_cursor[card['n']] = idx + 1
        try: return to_uri(get(queue[idx]), hi), 'bills'
        except Exception: return None, 'fail'
    return None, 'none'

results = [fetch_img(c) for c in cards]
print('sources:', Counter(s for _, s in results))
out_cards, rar_count = [], {}
for c, (img, src) in zip(cards, results):
    r = RARITY_MAP.get(c['rk'], 'Common'); rar_count[r] = rar_count.get(r, 0) + 1
    out_cards.append({'id': f"151C-{c['sub']}-{c['num']:03d}", 'n': c['n'], 'no': f"{c['num']:03d}",
                      'r': r, 'rk': c['rk'], 'img': img, 'p': None, 'cur': 'EUR', 'ill': None, 'sub': c['sub']})
for c in out_cards:
    if not c['img']:
        sib = next((x for x in out_cards if x['n'] == c['n'] and x['img']), None)
        if sib: c['img'] = sib['img']
missing = [c['n'] + '#' + c['id'] for c in out_cards if not c['img']]
print('missing after fallback:', len(missing), missing[:10])
out = {'id': '151C', 'lang': 'zh-cn', 'name': '收集啦151', 'logo': None, 'symbol': None,
       'total': len(out_cards), 'official': 151, 'pack': 5, 'rarities': rar_count, 'cards': out_cards}
with open('data/zh-cn-151C.json', 'w') as f: json.dump(out, f, ensure_ascii=False)
import os; print('wrote data/zh-cn-151C.json', f"{os.path.getsize('data/zh-cn-151C.json')/1e6:.1f}MB", rar_count)
