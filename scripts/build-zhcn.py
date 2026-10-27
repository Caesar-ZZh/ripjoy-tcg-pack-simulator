#!/usr/bin/env python3
"""构建简体中文弹「太晶盛聚 CSV9.5C」数据（259 张）。
卡表（编号/简中名/稀有度）：神奇宝贝百科 52poke 页面 太晶盛聚（TCG） 的 wikitext。
卡图（均为真实简中卡面）：
  1) 52poke media 卡图扫描（已有上传的 48 张，优先，高清）；
  2) Bill's Archive 图库（数据源为官方中文卡牌数据库，300px webp）按简中名分组顺序对齐补齐。
两路都下载转码为 webp data URI 内嵌进 JSON —— 该弹在任何版本（含应用内预览）都能显示卡图。
TCGdex 的 zh-cn 只有弹系元数据、无卡级数据，故走此路线。"""
import json, re, io, base64, hashlib, html as ihtml, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

SET_ID = 'CSV9.5C'
PAGE = '太晶盛聚（TCG）'
BILLS = 'http://billsarchive.com/terastal-gathering-cn.html'
RARITY_MAP = {'C': 'Common', 'U': 'Uncommon', 'R': 'Rare', 'RR': 'Double Rare',
              'SR': 'Ultra Rare', 'SAR': 'Special Illustration Rare', 'UR': 'Hyper Rare',
              'AR': 'Illustration Rare', 'CHR': 'Illustration Rare'}
HIGH = {'RR', 'SR', 'SAR', 'UR', 'AR'}

def get(url, referer=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'RipJoy/1.2 (personal project)'})
    if referer: req.add_header('Referer', referer)
    with urllib.request.urlopen(req, timeout=30) as r: return r.read()

def to_uri(raw, width, q):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    if im.width > width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

# ---------- 1) 52poke 卡表 ----------
api = ('https://wiki.52poke.com/api.php?action=query&prop=revisions&rvprop=content'
       f'&rvslots=main&titles={urllib.request.quote(PAGE)}&format=json')
wt = json.loads(get(api).decode())['query']['pages']
wt = list(wt.values())[0]['revisions'][0]['slots']['main']['*']
pat = re.compile(r'\{\{卡牌列表/entry\w+\|(\d+)/\d+\|\{\{(?:C|TCG)\|([^|}]+)(?:\|[^}]*)?\}\}\|[^|]*\|[^|]*\|([A-Z]*)')
cards = []
for line in wt.split('\n'):
    if '卡牌列表/entry' not in line: continue
    m = pat.search(line)
    if m: cards.append({'num': int(m.group(1)), 'n': m.group(2).strip(), 'rk': m.group(3) or 'C'})
print(f'card list: {len(cards)}')

# ---------- 2) Bill's 图库：按简中名分组的 v1 图（官方库顺序） ----------
bh = get(BILLS).decode('utf-8', 'ignore')
blocks = re.findall(r'data-cat="([a-z]+)" data-name="([^"]*)" data-cn="([^"]*)" data-code="([^"]*)"[^>]*>.*?src="(https://bills-archive[^"]+)"', bh)
# 每个 (name,cn,code) 的第一张即 v1 基础版；后续 -2/-3 为纹样变体，跳过
seen, bills_by_name = set(), {}
for cat, en, cn, code, url in blocks:
    cn = ihtml.unescape(cn)
    key = (cn, code, en)
    if key in seen: continue
    seen.add(key)
    bills_by_name.setdefault(cn, []).append(url)
print(f"bills distinct prints: {len(seen)} covering {len(bills_by_name)} names")

# ---------- 3) 逐卡取图：52poke 优先，Bill's 按同名顺序补齐 ----------
def poke_url(num, width):
    fname = f'{SET_ID}{num:03d}.png'
    h = hashlib.md5(fname.encode()).hexdigest()
    return f'https://media.52poke.com/wiki/thumb/{h[0]}/{h[:2]}/{fname}/{width}px-{fname}'

name_cursor = {}
def fetch_img(card):
    rar = card['rk']; hi = rar in HIGH
    width, q = (460, 70) if hi else (300, 62)
    try:
        return to_uri(get(poke_url(card['num'], width), referer='https://wiki.52poke.com/'), width, q), '52poke'
    except Exception:
        pass
    queue = bills_by_name.get(card['n'], [])
    idx = name_cursor.get(card['n'], 0)
    if idx < len(queue):
        name_cursor[card['n']] = idx + 1
        try: return to_uri(get(queue[idx]), width, q), 'bills'
        except Exception: return None, 'fail'
    return None, 'none'

results = {}
with ThreadPoolExecutor(max_workers=1) as ex:  # 顺序执行以保证同名游标对齐
    for c in sorted(cards, key=lambda x: x['num']):
        results[c['num']] = fetch_img(c)
from collections import Counter
print('image sources:', Counter(v[1] for v in results.values()))

out_cards, rar_count = [], {}
for c in sorted(cards, key=lambda x: x['num']):
    r = RARITY_MAP.get(c['rk'], 'Common'); rar_count[r] = rar_count.get(r, 0) + 1
    out_cards.append({'id': f"{SET_ID}-{c['num']:03d}", 'n': c['n'], 'no': f"{c['num']:03d}",
                      'r': r, 'img': results[c['num']][0], 'p': None, 'cur': 'EUR', 'ill': None})
missing = [c['n'] + '#' + c['no'] for c in out_cards if not c['img']]
print('missing images:', len(missing), missing[:20])
out = {'id': SET_ID, 'lang': 'zh-cn', 'name': '太晶盛聚', 'logo': None, 'symbol': None,
       'total': len(out_cards), 'official': 208, 'pack': 5, 'rarities': rar_count, 'cards': out_cards}
with open('data/zh-cn-CSV9.5C.json', 'w') as f: json.dump(out, f, ensure_ascii=False)
import os; print('wrote data/zh-cn-CSV9.5C.json', f"{os.path.getsize('data/zh-cn-CSV9.5C.json')/1e6:.1f}MB", rar_count)
