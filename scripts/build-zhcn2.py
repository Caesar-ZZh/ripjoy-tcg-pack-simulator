#!/usr/bin/env python3
"""通用简中弹构建：build-zhcn2.py <setCode> <52poke页面名> <Bill's页面URL> <官方张数>
例：build-zhcn2.py CSV9C 星彩晶璃（TCG） https://billsarchive.com/stellar-crystal-cn.html 208
卡表/稀有度来自 52poke wikitext；卡图优先 52poke 扫描（按 md5 路径规则，文件前缀从
52poke 页面 HTML 自动探测），缺失用 Bill's 官方库镜像按简中名分组对齐补齐；
同名多版印刷仍缺图的用同名第一版图兜底（与太晶盛聚同策略）。图一律转 webp data URI 内嵌。
产物 data/zh-cn-<setCode>.json，图片按分级尺寸转码（高稀有 400px/q64、普通 260px/q54）。"""
import json, re, io, base64, hashlib, html as ihtml, sys, urllib.request
from PIL import Image

SET_ID, PAGE, BILLS, OFFICIAL = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
RARITY_MAP = {'C': 'Common', 'U': 'Uncommon', 'R': 'Rare', 'RR': 'Double Rare', 'RRR': 'Double Rare',
              'SR': 'Ultra Rare', 'SAR': 'Special Illustration Rare', 'UR': 'Hyper Rare',
              'AR': 'Illustration Rare', 'CHR': 'Illustration Rare', 'ACE': 'ACE SPEC Rare'}
HIGH = {'RR', 'RRR', 'SR', 'SAR', 'UR', 'AR'}

def get(url, referer=None):
    import subprocess, time
    cmd = ['curl', '-sS', '--retry', '3', '--max-time', '60', '-A', 'RipJoy/1.3 (personal project)']
    if referer: cmd += ['-H', f'Referer: {referer}']
    cmd += [url]
    for i in range(3):
        r = subprocess.run(cmd, capture_output=True)
        if r.returncode == 0 and r.stdout: return r.stdout
        time.sleep(2 * (i + 1))
    raise IOError(f'curl failed for {url}: {r.stderr.decode()[:200]}')

def to_uri(raw, hi):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    w, q = (640, 88)
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

# 1) 卡表
api = ('https://wiki.52poke.com/api.php?action=query&prop=revisions&rvprop=content'
       f'&rvslots=main&titles={urllib.request.quote(PAGE)}&format=json')
wt = json.loads(get(api).decode())['query']['pages']
wt = list(wt.values())[0]['revisions'][0]['slots']['main']['*']
pat = re.compile(r'\{\{卡牌列表/entry\w+\|(\d+)/\d+\|\{\{(?:C|TCG)\|([^|}]+)(?:\|[^}]*)?\}\}\|[^|]*\|[^|]*\|([A-Z]*)')
cards, unknown = [], set()
for line in wt.split('\n'):
    if '卡牌列表/entry' not in line: continue
    m = pat.search(line)
    if m:
        rk = m.group(3) or 'C'
        if rk not in RARITY_MAP: unknown.add(rk)
        cards.append({'num': int(m.group(1)), 'n': m.group(2).strip(), 'rk': rk})
print(f'[{SET_ID}] card list: {len(cards)}, unknown rarity letters: {unknown or "none"}')

# 2) 52poke 图片文件前缀：从页面 HTML 里找形如 XXX123.png 的卡图文件名
page_html = get('https://wiki.52poke.com/wiki/' + urllib.request.quote(PAGE)).decode('utf-8', 'ignore')
prefixes = re.findall(r'([A-Za-z0-9.]+?)(\d{3})\.png', page_html)
from collections import Counter
pref = Counter(p for p, _ in prefixes if len(p) >= 3)
FILE_PREFIX = pref.most_common(1)[0][0] if pref else SET_ID
print(f'[{SET_ID}] 52poke file prefix: {FILE_PREFIX} (candidates {pref.most_common(3)})')

def poke_url(num, width):
    fname = f'{FILE_PREFIX}{num:03d}.png'
    h = hashlib.md5(fname.encode()).hexdigest()
    return f'https://media.52poke.com/wiki/thumb/{h[0]}/{h[:2]}/{fname}/{width}px-{fname}'

# 3) Bill's 图库按名分组
bh = get(BILLS).decode('utf-8', 'ignore')
blocks = re.findall(r'data-cat="([a-z]+)" data-name="([^"]*)" data-cn="([^"]*)" data-code="([^"]*)"[^>]*>.*?src="(https://bills-archive[^"]+)"', bh)
seen, bills_by_name = set(), {}
for cat, en, cn, code, url in blocks:
    cn = ihtml.unescape(cn); key = (cn, code, en)
    if key in seen: continue
    seen.add(key); bills_by_name.setdefault(cn, []).append(url)
print(f"[{SET_ID}] bills distinct: {len(seen)} covering {len(bills_by_name)} names")

# 4) 逐卡取图（顺序执行保同名游标对齐）
name_cursor = {}
def fetch_img(card):
    hi = card['rk'] in HIGH
    try: return to_uri(get(poke_url(card['num'], 640), referer='https://wiki.52poke.com/'), hi), '52poke'
    except Exception: pass
    queue = bills_by_name.get(card['n'], []); idx = name_cursor.get(card['n'], 0)
    if idx < len(queue):
        name_cursor[card['n']] = idx + 1
        try: return to_uri(get(queue[idx]), hi), 'bills'
        except Exception: return None, 'fail'
    return None, 'none'

results = {}
for c in sorted(cards, key=lambda x: x['num']):
    results[c['num']] = fetch_img(c)
print(f'[{SET_ID}] sources:', Counter(v[1] for v in results.values()))

out_cards, rar_count = [], {}
for c in sorted(cards, key=lambda x: x['num']):
    r = RARITY_MAP.get(c['rk'], 'Common'); rar_count[r] = rar_count.get(r, 0) + 1
    out_cards.append({'id': f"{SET_ID}-{c['num']:03d}", 'n': c['n'], 'no': f"{c['num']:03d}",
                      'r': r, 'rk': c['rk'], 'img': results[c['num']][0], 'p': None, 'cur': 'EUR', 'ill': None})
# 同名兜底
for c in out_cards:
    if not c['img']:
        sib = next((x for x in out_cards if x['n'] == c['n'] and x['img']), None)
        if sib: c['img'] = sib['img']
missing = [c['n'] + '#' + c['no'] for c in out_cards if not c['img']]
print(f'[{SET_ID}] missing after fallback: {len(missing)}', missing[:8])
set_name = PAGE.replace('（TCG）', '')
out = {'id': SET_ID, 'lang': 'zh-cn', 'name': set_name, 'logo': None, 'symbol': None,
       'total': len(out_cards), 'official': OFFICIAL, 'pack': 5, 'rarities': rar_count, 'cards': out_cards}
fn = f'data/zh-cn-{SET_ID}.json'
with open(fn, 'w') as f: json.dump(out, f, ensure_ascii=False)
import os; print(f'[{SET_ID}] wrote {fn}', f"{os.path.getsize(fn)/1e6:.1f}MB", rar_count)
