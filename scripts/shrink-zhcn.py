#!/usr/bin/env python3
"""把简中数据文件里的内嵌卡图二次转码压小（GitHub push-files 约 5MB 上限）。
用法：shrink-zhcn.py data/zh-cn-CSV8C.json [更多文件...]
分级：高稀有（rk in RR/SR/SAR/UR/AR）340px/q58，普通 220px/q48。已达标的文件自动跳过重写。"""
import json, io, base64, sys, os
from PIL import Image

HIGH = {'RR', 'RRR', 'SR', 'SAR', 'UR', 'AR'}

def reenc(uri, hi):
    raw = base64.b64decode(uri.split(',', 1)[1])
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    w, q = (340, 58) if hi else (220, 48)
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

for fn in sys.argv[1:]:
    d = json.load(open(fn))
    n = 0
    for c in d['cards']:
        if c.get('img') and c['img'].startswith('data:'):
            c['img'] = reenc(c['img'], c.get('rk') in HIGH); n += 1
    out = json.dumps(d, ensure_ascii=False)
    with open(fn, 'w') as f: f.write(out)
    print(fn, 're-encoded', n, 'images ->', f"{os.path.getsize(fn)/1e6:.2f}MB")
