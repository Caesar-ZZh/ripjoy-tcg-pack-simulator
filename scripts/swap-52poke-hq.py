#!/usr/bin/env python3
"""原地升级：把已有数据文件中能从 52poke 按编号取到的卡图换成 640px/q88 版。
编号键控、逐卡对应，不动卡表与任何对齐关系。用法：
  swap-52poke-hq.py set <hq文件> <SET_ID>          # 主弹：文件名前缀 = SET_ID
  swap-52poke-hq.py 151 <hq文件>                    # 收集啦151：前缀按子弹页面探测
"""
import sys, json, re, io, base64, hashlib, urllib.request, urllib.parse, time
from collections import Counter
from PIL import Image

def get(url, referer=None, tries=5):
    import subprocess, time
    cmd = ['curl', '-sS', '--retry', '3', '--max-time', '60', '-A', 'RipJoy/1.3 (personal project)']
    if referer: cmd += ['-H', f'Referer: {referer}']
    cmd += [url]
    for i in range(3):
        r = subprocess.run(cmd, capture_output=True)
        if r.returncode == 0 and r.stdout: return r.stdout
        time.sleep(2 * (i + 1))
    raise IOError(f'curl failed for {url}: {r.stderr.decode()[:200]}')

def to_uri(raw):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    if im.width > 640: im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=88)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

def thumb_url(fname, width=640):
    h = hashlib.md5(fname.encode()).hexdigest()
    q = urllib.parse.quote(fname)
    return f'https://media.52poke.com/wiki/thumb/{h[0]}/{h[:2]}/{q}/{width}px-{q}'

mode = sys.argv[1]
if mode == 'set':
    fn, set_id = sys.argv[2], sys.argv[3]
    d = json.load(open(fn))
    ok = fail = skip = 0
    for i, c in enumerate(d['cards']):
        if c.get('img'):
            try:
                _im = Image.open(io.BytesIO(base64.b64decode(c['img'].split(',', 1)[1])))
                if _im.width >= 560: skip += 1; continue
            except Exception: pass
        fname = f"{set_id}{int(c['no']):03d}.png"
        try:
            c['img'] = to_uri(get(thumb_url(fname), referer='https://wiki.52poke.com/')); ok += 1
        except Exception: fail += 1
        if i % 40 == 39: json.dump(d, open(fn, 'w'), ensure_ascii=False)
    json.dump(d, open(fn, 'w'), ensure_ascii=False)
    print(fn, 'swapped:', ok, 'kept-old:', fail, 'already-hq:', skip)
elif mode == '151':
    fn = sys.argv[2]
    d = json.load(open(fn))
    prefs = {}
    for sub in ('旅', '望', '惊', '聚'):
        title = f'收集啦151 {sub}（TCG）'
        page_html = get('https://wiki.52poke.com/wiki/' + urllib.parse.quote(title)).decode('utf-8', 'ignore')
        cnt = Counter(p for p, _ in re.findall(r'([A-Za-z0-9.]+?)(\d{3})\.png', page_html) if len(p) >= 3)
        prefs[sub] = cnt.most_common(1)[0][0] if cnt else '151C'
    print('prefixes:', prefs)
    ok = fail = skip = 0
    for i, c in enumerate(d['cards']):
        if c.get('img'):
            try:
                _im = Image.open(io.BytesIO(base64.b64decode(c['img'].split(',', 1)[1])))
                if _im.width >= 560: skip += 1; continue
            except Exception: pass
        fname = f"{prefs[c['sub']]}{int(c['no']):03d}.png"
        try:
            c['img'] = to_uri(get(thumb_url(fname), referer='https://wiki.52poke.com/')); ok += 1
        except Exception: fail += 1
        if i % 40 == 39: json.dump(d, open(fn, 'w'), ensure_ascii=False)
    json.dump(d, open(fn, 'w'), ensure_ascii=False)
    print(fn, 'swapped:', ok, 'kept-old:', fail, 'already-hq:', skip)
