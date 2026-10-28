#!/usr/bin/env python3
"""修复简中同名多印组卡图错位：Bill's 图库把同编号的球纹/反闪变体也列为独立印刷，
旧的按名游标对齐会整体错位。本脚本把同名印刷按「连续相似度聚类」分组（变体与原版
相似度高、不同插画差异大），簇数与条目数一致时按序重派每簇第一张图。
用法：repair-cn-groups.py <hq-data文件> <Bill's页面URL> [--apply]
不带 --apply 只报告每组簇数/条目数，不写文件。"""
import json, re, io, base64, sys, urllib.request, html as ihtml
import numpy as np
from PIL import Image

FN, BILLS = sys.argv[1], sys.argv[2]
APPLY = '--apply' in sys.argv
THRESH = 0.085

def get(url, referer=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'RipJoy/1.3 (personal project)'})
    if referer: req.add_header('Referer', referer)
    with urllib.request.urlopen(req, timeout=30) as r: return r.read()

bh = get(BILLS).decode('utf-8', 'ignore')
blocks = re.findall(r'data-cat="([a-z]+)" data-name="([^"]*)" data-cn="([^"]*)" data-code="([^"]*)"[^>]*>.*?src="(https://bills-archive[^"]+)"', bh)
seen, bills_by_name = set(), {}
for cat, en, cn, code, url in blocks:
    cn = ihtml.unescape(cn)
    if url in seen: continue
    seen.add(url); bills_by_name.setdefault(cn, []).append(url)

def thumb_arr(raw):
    im = Image.open(io.BytesIO(raw)).convert('L').resize((24, 34))
    a = np.asarray(im, dtype=np.float32) / 255.0
    return a

def clusters_of(urls):
    arrs = [thumb_arr(get(u)) for u in urls]
    clusters = [[0]]
    for i in range(1, len(urls)):
        first = arrs[clusters[-1][0]]
        if float(np.abs(arrs[i] - first).mean()) > THRESH: clusters.append([i])
        else: clusters[-1].append(i)
    return clusters, arrs

def to_uri(raw, hi):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    w, q = (400, 64) if hi else (260, 54)
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

HIGH = {'RR', 'RRR', 'SR', 'SAR', 'UR', 'AR', 'ACE'}
d = json.load(open(FN))
from collections import defaultdict
groups = defaultdict(list)
for c in d['cards']: groups[c['n']].append(c)
fixed, flagged = 0, []
for name, entries in groups.items():
    if len(entries) < 2: continue
    entries = sorted(entries, key=lambda x: int(x['no']))
    queue = bills_by_name.get(name, [])
    if len(queue) < len(entries):
        flagged.append((name, f'queue {len(queue)} < entries {len(entries)}')); continue
    cl, _ = clusters_of(queue)
    if len(cl) != len(entries):
        flagged.append((name, f'clusters {len(cl)} != entries {len(entries)} (queue {len(queue)})')); continue
    changed_here = []
    for entry, cluster in zip(entries, cl):
        raw = get(queue[cluster[0]])
        new_img = to_uri(raw, entry.get('rk') in HIGH)
        if new_img != entry['img']: changed_here.append(entry['no'])
        if APPLY: entry['img'] = new_img
    if changed_here: fixed += len(changed_here)
    print(f"{name}: entries {[e['no'] for e in entries]} clusters {[len(c) for c in cl]} changed {changed_here}")
print('groups fixed imgs:', fixed)
print('flagged:', flagged)
if APPLY:
    json.dump(d, open(FN, 'w'), ensure_ascii=False)
    import os; print('wrote', FN, f"{os.path.getsize(FN)/1e6:.2f}MB")
