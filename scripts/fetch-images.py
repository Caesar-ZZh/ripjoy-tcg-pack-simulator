#!/usr/bin/env python3
"""v2 分级画质：RR 以上高稀有卡用 high.webp 转码至 460px/q72；其余用原始 low.webp 不二次压缩。
产出 data/images-embedded.json 供离线单文件版使用。"""
import json, glob, base64, io, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

def tier_lv(r):
    r = (r or '').lower()
    if 'special' in r or 'hyper' in r: return 4
    if 'illustration' in r or 'ultra' in r: return 3
    if 'ace' in r or 'double' in r: return 2
    if 'rare' in r: return 1
    if 'uncommon' in r: return 0
    return 0

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'RipJoy/1.1'})
    with urllib.request.urlopen(req, timeout=25) as r: return r.read()

def transcode(raw, width, quality):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    if im.width > width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=quality)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

def raw_uri(raw): return 'data:image/webp;base64,' + base64.b64encode(raw).decode()

cards = {}; logos = {}; meta = {}
for f in sorted(glob.glob('data/*.json')):
    if 'images' in f: continue
    d = json.load(open(f)); meta[d['id']] = d
    for c in d['cards']: cards[c['id']] = (c['img'], tier_lv(c['r']))
    if d.get('logo'): logos[d['id']] = d['logo']
print(f'{len(cards)} cards', flush=True)

def work(item):
    cid, (img, lv) = item
    try:
        if lv >= 2:
            try: return cid, transcode(fetch(img + '/high.webp'), 460, 72)
            except Exception: return cid, transcode(fetch(img + '/high.png'), 460, 72)
        try: return cid, raw_uri(fetch(img + '/low.webp'))
        except Exception: return cid, transcode(fetch(img + '/low.png'), 245, 80)
    except Exception: return cid, None

out = {}; fails = []
with ThreadPoolExecutor(max_workers=16) as ex:
    for i, (cid, uri) in enumerate(ex.map(work, cards.items())):
        if uri: out[cid] = uri
        else: fails.append(cid)
        if (i + 1) % 250 == 0: print(f'{i+1}/{len(cards)}', flush=True)
logo_out = {}
for sid, url in logos.items():
    try: logo_out[sid] = transcode(fetch(url + '.png'), 420, 80)
    except Exception as e: print('logo fail', sid, e)
json.dump({'cards': out, 'logos': logo_out}, open('data/images-embedded.json', 'w'))
total = sum(len(v) for v in out.values()) + sum(len(v) for v in logo_out.values())
print(f'done: {len(out)} images, fails={len(fails)} {fails[:5]}, data-uri total {total/1e6:.1f}MB')
