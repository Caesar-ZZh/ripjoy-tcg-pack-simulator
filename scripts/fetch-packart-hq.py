#!/usr/bin/env python3
"""高清版真实卡包包装图：按已知 Bulbagarden 标题下载原图，编码 600w(CN 700w) webp q86，
按 ≤2.8MB 自动分片写出 src/packart-<n>.js（自初始化 Object.assign 形式，支持懒加载）。
打印 PACKART_SRC（set key -> 分片号）供粘贴进 app.js。"""
import base64, io, json, os, time, urllib.parse, urllib.request
from PIL import Image

API = 'https://archives.bulbagarden.net/w/api.php'
UA = {'User-Agent': 'RipJoy/1.0 (personal fan project)'}
TITLES = {
 'taijing': ['File:CSV9.5 Pack.png'],
 '151C': ['File:151 Booster Gather 20 Pack.png', 'File:151 Booster Gather 5 Pack.png', 'File:151 Booster Hope 20 Pack.png'],
 '151en': ['File:151 Booster.png'],
 '151ja': ['File:SV2a Pokémon Card 151 pack.png', 'File:SV2a K pack.png'],
 'SV9a': ['File:SV9a Hot Wind Arena pack.jpg'],
 'SV9tw': ['File:SV9 Traditional Chinese pack.png'],
 'SV10tw': ['File:SV10 Glory of the Rocket Gang Traditional Chinese.png'],
 'sv01': ['File:SV1 Booster Gyarados.png', 'File:SV1 Booster Miraidon.png', 'File:SV1 Booster Koraidon.png'],
 'sv02': ['File:SV2 Booster Skeledirge.png', 'File:SV2 Booster Quaquaval.png', 'File:SV2 Booster Meowscarada.png'],
 'sv03': ['File:SV3 Booster Tyranitar.png', 'File:SV3 Booster Dragonite.png', 'File:SV3 Booster Charizard.png'],
 'sv04': ['File:SV4 Booster Armarouge.png', 'File:SV4 Booster Garchomp.png', 'File:SV4 Booster Roaring Moon.png'],
 'sv04.5': ['File:Paldean Fates Booster Ceruledge.png', 'File:Paldean Fates Booster Pikachu.png', 'File:Paldean Fates Booster Dondozo.png'],
 'sv05': ['File:SV5 Booster Iron Crown.png', 'File:SV5 Booster Walking Wake.png', 'File:SV5 Booster Iron Leaves.png'],
 'sv06': ['File:SV6 Booster Dragapult.png', 'File:SV6 Booster Ursaluna.png'],
 'sv06.5': ['File:Shrouded Fable Booster Fezandipiti.png', 'File:Shrouded Fable Booster Munkidori.png', 'File:Shrouded Fable Booster Pecharunt.png'],
 'sv07': ['File:SV7 Booster Galvantula.png', 'File:SV7 Booster Terapagos.png', 'File:SV7 Booster Lapras.png'],
 'sv08': ['File:SV8 Booster Archaludon.png', 'File:SV8 Booster Pikachu.png', 'File:SV8 Booster Latias.png'],
 'sv08.5': ['File:Prismatic Evolutions Booster Leafeon Glaceon.png', 'File:Prismatic Evolutions Booster Espeon Umbreon.png', 'File:Prismatic Evolutions Booster Eevee Sylveon.png'],
 'sv09': ['File:SV9 Booster Hop Zacian.png', 'File:SV9 Booster Lillie Clefairy.png', 'File:SV9 Booster N Zoroark.png'],
 'sv10': ['File:SV10 Booster Cynthia Garchomp.png', 'File:SV10 Booster Giovanni Mewtwo.png', 'File:SV10 Booster Ethan Ho-Oh.png'],
 'sv10.5b': ['File:SV11 Black Bolt pack.png'],
 'sv10.5w': ['File:SV11 White Flare pack.png'],
 'me01': ['File:ME1 Booster Mega Kangaskhan.png', 'File:ME1 Booster Mega Lucario.png', 'File:ME1 Booster Mega Gardevoir.png'],
 'me02': ['File:ME2 Booster Mega Gengar.png', 'File:ME2 Booster Mega Heracross.png', 'File:ME2 Booster Mega Lopunny.png'],
 'me02.5': ['File:Ascended Heroes Booster.png'],
}
ORDER = ['taijing', '151C', '151ja', 'SV9a', 'SV9tw', 'SV10tw', 'sv01', 'sv02', 'sv03', 'sv04', 'sv04.5', 'sv05', 'sv06', 'sv06.5', 'sv07', 'sv08', 'sv08.5', 'sv09', 'sv10', 'sv10.5b', 'sv10.5w', 'me01', 'me02', 'me02.5', '151en']
CN = {'taijing', '151C'}

def orig_url(title):
    url = API + '?' + urllib.parse.urlencode({'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|size', 'format': 'json'})
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers=UA)
            r = json.load(urllib.request.urlopen(req, timeout=30))
            for p in r.get('query', {}).get('pages', {}).values():
                ii = p.get('imageinfo') or []
                if ii: return ii[0]['url']
            return None
        except Exception: time.sleep(2 * (i + 1))
    return None

items = []  # (key, filename, data_uri)
for key in ORDER:
    for i, title in enumerate(TITLES[key], 1):
        u = orig_url(title); time.sleep(0.4)
        if not u: print('MISS', key, title); continue
        req = urllib.request.Request(u, headers=UA)
        raw = urllib.request.urlopen(req, timeout=60).read()
        im = Image.open(io.BytesIO(raw)).convert('RGBA')
        w = 700 if key in CN else 600
        if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=86)
        fn = f'{key}-{i}.webp'
        items.append((key, fn, 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()))
        print(key, fn, f'{im.width}x{im.height}', f'{len(buf.getvalue())//1024}KB', flush=True)

parts, cur, cursize, srcmap = [], {}, 0, {}
for key, fn, uri in items:
    if cursize + len(uri) > 2_800_000 and cur: parts.append(cur); cur, cursize = {}, 0
    cur[fn] = uri; cursize += len(uri); srcmap[key] = len(parts) + 1
if cur: parts.append(cur)
for i, part in enumerate(parts, 1):
    body = 'Object.assign(window.__PACKART_IMG = window.__PACKART_IMG || {}, ' + json.dumps(part) + ');\n'
    open(f'src/packart-{i}.js', 'w').write(body)
    print(f'src/packart-{i}.js', len(body) // 1024, 'KB,', len(part), 'imgs')
print('PACKART_SRC =', json.dumps(srcmap))
