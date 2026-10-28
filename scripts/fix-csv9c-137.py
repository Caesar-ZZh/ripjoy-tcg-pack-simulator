#!/usr/bin/env python3
"""CSV9C #136/#137 撞号修复（重建后重演）：铝钢桥龙条目改编号 137，
铝钢龙/铝钢桥龙各自从 Bill's 按名取第一张印刷图（640/q88 编码）；
洛托姆 #062、旋转洛托姆 #161 从基线文件移植旧图兜底。"""
import json, re, io, base64, subprocess, html as ihtml
from PIL import Image

def get(url):
    r = subprocess.run(['curl', '-sS', '--retry', '3', '--max-time', '60', '-A', 'RipJoy/1.3', url], capture_output=True)
    if r.returncode != 0 or not r.stdout: raise IOError(r.stderr.decode()[:150])
    return r.stdout

def to_uri(raw):
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    if im.width > 640: im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=88)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()

d = json.load(open('data/zh-cn-CSV9C.json'))
base = json.load(open('baseline-CSV9C.json'))
bmap = {c['id']: c for c in base['cards']}

bh = get('https://billsarchive.com/stellar-crystal-cn.html').decode('utf-8', 'ignore')
blocks = re.findall(r'data-cat="([a-z]+)" data-name="([^"]*)" data-cn="([^"]*)" data-code="([^"]*)"[^>]*>.*?src="(https://bills-archive[^"]+)"', bh)
by_name = {}
for cat, en, cn, code, url in blocks:
    cn = ihtml.unescape(cn)
    by_name.setdefault(cn, []).append(url)

pair = [c for c in d['cards'] if c['id'] == 'CSV9C-136']
assert len(pair) == 2, len(pair)
for c in pair:
    q = by_name.get(c['n'], [])
    print(c['n'], 'bills prints:', len(q))
    if q: c['img'] = to_uri(get(q[0]))
qiaolong = next(c for c in pair if c['n'] == '铝钢桥龙')
qiaolong['no'] = '137'; qiaolong['id'] = 'CSV9C-137'
print('桥龙 -> 137 done')
for cid in ('CSV9C-062', 'CSV9C-161'):
    c = next(x for x in d['cards'] if x['id'] == cid)
    if not c.get('img') and bmap.get(cid, {}).get('img'):
        c['img'] = bmap[cid]['img']; print(cid, 'filled from baseline')
json.dump(d, open('data/zh-cn-CSV9C.json', 'w'), ensure_ascii=False)
ids = [c['id'] for c in d['cards']]
print('entries:', len(ids), 'unique:', len(set(ids)), 'no-img:', [c['id'] for c in d['cards'] if not c.get('img')])
