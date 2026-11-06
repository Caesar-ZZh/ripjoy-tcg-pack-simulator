#!/usr/bin/env python3
"""简中 6 弹真实卡包包装图（52poke 简体中文版单包正面图）：
黑雷奔流/白焰迸涌取 5 张装单包；星彩晶璃/璀璨诡幻/利刃猛醒取常规版 5 张装
（ plain “补充包.png” 是 20 张装，勿用）；30 周年取简体中文版补充包。
下载原图 -> 缩放 700w -> webp q86 -> 写出 src/packart-5.js（单分片，<=2.8MB）。
注意：media.52poke.com 对非浏览器 UA 返 Cloudflare 拦截，须用 Chrome UA + Referer。
用法：python3 scripts/build-packart-cn.py"""
import base64, io, json, os, subprocess, time
from PIL import Image

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
# (set key, 52poke 原图 URL, 输出文件名)
PACKS = [
    ('CSV10.5C', 'https://media.52poke.com/wiki/f/f5/TCG_%E6%9C%B1%26%E7%B4%AB_%E9%BB%91%E9%9B%B7%E5%A5%94%E6%B5%81_%E8%A1%A5%E5%85%85%E5%8C%85_5%E5%BC%A0%E8%A3%85.png', 'CSV10.5C-1.webp'),
    ('CSV10.6C', 'https://media.52poke.com/wiki/d/d2/TCG_%E6%9C%B1%26%E7%B4%AB_%E7%99%BD%E7%84%B0%E8%BF%B8%E6%B6%8C_%E8%A1%A5%E5%85%85%E5%8C%85_5%E5%BC%A0%E8%A3%85.png', 'CSV10.6C-1.webp'),
    ('30thC', 'https://media.52poke.com/wiki/f/f2/TCG_30%E5%91%A8%E5%B9%B4%E5%BA%86%E5%85%B8_%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%E7%89%88%E8%A1%A5%E5%85%85%E5%8C%85.png', '30thC-1.webp'),
    ('CSV9C', 'https://media.52poke.com/wiki/9/90/TCG_%E6%9C%B1%26%E7%B4%AB_%E6%98%9F%E5%BD%A9%E6%99%B6%E7%92%83_%E5%B8%B8%E8%A7%84%E7%89%88%E8%A1%A5%E5%85%85%E5%8C%85.png', 'CSV9C-1.webp'),
    ('CSV8C', 'https://media.52poke.com/wiki/8/89/TCG_%E6%9C%B1%26%E7%B4%AB_%E7%92%80%E7%92%A8%E8%AF%A1%E5%B9%BB_%E5%B8%B8%E8%A7%84%E7%89%88%E8%A1%A5%E5%85%85%E5%8C%85.png', 'CSV8C-1.webp'),
    ('CSV7C', 'https://media.52poke.com/wiki/d/d4/TCG_%E6%9C%B1%26%E7%B4%AB_%E5%88%A9%E5%88%83%E7%8C%9B%E9%86%92_%E5%B8%B8%E8%A7%84%E7%89%88%E8%A1%A5%E5%85%85%E5%8C%85.png', 'CSV7C-1.webp'),
]
TMP = '/tmp/packart-cn'
os.makedirs(TMP, exist_ok=True)

def curl(url, out):
    for i in range(3):
        r = subprocess.run(['curl', '-sS', '--retry', '1', '--max-time', '120',
                            '-A', UA, '-H', 'Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                            '-H', 'Referer: https://wiki.52poke.com/', '-o', out, url])
        if r.returncode == 0 and os.path.getsize(out) > 10000:
            return True
        time.sleep(2 * (i + 1))
    return False

part = {}
for key, url, fn in PACKS:
    raw = os.path.join(TMP, fn + '.orig')
    if not curl(url, raw):
        raise SystemExit('DOWNLOAD FAIL ' + key + ' ' + url)
    im = Image.open(raw).convert('RGBA')
    w = 700
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=86)
    webp = os.path.join(TMP, fn)
    open(webp, 'wb').write(buf.getvalue())
    part[fn] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    print(key, fn, f'{im.width}x{im.height}', f'{len(buf.getvalue())//1024}KB', flush=True)

body = 'Object.assign(window.__PACKART_IMG = window.__PACKART_IMG || {}, ' + json.dumps(part) + ');\n'
assert len(body) <= 2_800_000, f'chunk too big: {len(body)}'
open('src/packart-5.js', 'w').write(body)
print('src/packart-5.js', len(body) // 1024, 'KB,', len(part), 'imgs')
print("PACKART add: 'CSV7C': ['CSV7C-1.webp'], 'CSV8C': ['CSV8C-1.webp'], 'CSV9C': ['CSV9C-1.webp'], 'CSV10.5C': ['CSV10.5C-1.webp'], 'CSV10.6C': ['CSV10.6C-1.webp'], '30thC': ['30thC-1.webp']")
print('PACKART_SRC add: CSV7C: 5, CSV8C: 5, CSV9C: 5, CSV10.5C: 5, CSV10.6C: 5, 30thC: 5')
