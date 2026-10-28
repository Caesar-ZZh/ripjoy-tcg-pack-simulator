#!/usr/bin/env python3
"""从 Bulbagarden Archives 抓取每弹真实卡包包装图（500px 缩略图，够 248px 展示位 2x 清晰）。
每弹必须通过 ACCEPT 正则才收（防同名误抓）；带重试与限速。
用法：python3 scripts/fetch-packart.py —— 结果 assets/packs/<key>-<n>.<ext> + PACKART 清单。"""
import json, os, re, time, urllib.request, urllib.parse

API = 'https://archives.bulbagarden.net/w/api.php'
UA = {'User-Agent': 'RipJoy/1.0 (personal fan project)'}
os.makedirs('assets/packs', exist_ok=True)

SETS = {
 'taijing': (['CSV9.5C Booster', 'Terastal Gathering Chinese Booster'], r'CSV9\.5C|Terastal Gathering'),
 'CSV9C': (['CSV9C Booster', 'Stellar Miracle Chinese Booster'], r'CSV9C|Stellar Miracle'),
 'CSV8C': (['CSV8C Booster'], r'CSV8C'),
 'CSV7C': (['CSV7C Booster'], r'CSV7C'),
 '151C': (['Collect 151 Chinese Booster', '151 Booster Chinese'], r'151'),
 '151en': (['151 Booster Scarlet', 'SV3.5 Booster', 'MEW Booster Scarlet Violet'], r'151|SV3\.5|MEV'),
 'sv08.5': (['Prismatic Evolutions Booster', 'SV8a Booster'], r'Prismatic|SV8a|Terastal Fes'),
 'sv08': (['SV8 Booster'], r'SV8 |SV8\.png|Surging'),
 'sv09': (['SV9 Booster'], r'SV9 |SV9\.png|Journey'),
 'sv10': (['SV10 Booster'], r'SV10|Destined|Glory of Team Rocket'),
 'me01': (['ME1 Booster', 'Mega Evolution Booster'], r'ME1|Mega Evolution'),
 'sv05': (['SV5 Booster'], r'SV5 |SV5\.png|Temporal'),
 'sv10.5b': (['Black Bolt Booster'], r'Black Bolt|SV11B'),
 'sv10.5w': (['White Flare Booster'], r'White Flare|SV11W'),
 'me02': (['ME2 Booster', 'Phantasmal Flames Booster'], r'ME2|Phantasmal'),
 'me02.5': (['ME2a Booster', 'Ascended Heroes Booster'], r'ME2a|Ascended'),
 'sv04.5': (['Paldean Fates Booster', 'SV4a Booster'], r'Paldean|SV4a|Shiny Treasure'),
 'sv06.5': (['Shrouded Fable Booster', 'SV6a Booster'], r'Shrouded|SV6a|Night Wanderer'),
 'sv06': (['SV6 Booster'], r'SV6 |SV6\.png|Twilight|Mask of Change'),
 'sv07': (['SV7 Booster'], r'SV7 |SV7\.png|Stellar'),
 'sv04': (['SV4 Booster'], r'SV4 |SV4\.png|Paradox'),
 'sv01': (['SV1 Booster'], r'SV1 |SV1\.png|Scarlet Violet'),
 'sv02': (['SV2 Booster'], r'SV2 |SV2\.png|Paldea Evolved|Clay Burst|Snow Hazard'),
 'sv03': (['SV3 Booster'], r'SV3 |SV3\.png|Obsidian|Ruler of the Black Flame'),
 '151ja': (['SV2a Booster'], r'SV2a'),
 'SV9a': (['SV9a Booster'], r'SV9a|Heat Wave'),
 'SV9tw': (['SV9 Booster Battle Partners'], r'SV9 |Battle Partners'),
 'SV10tw': (['SV10 Booster Glory Team Rocket'], r'SV10|Glory of Team Rocket'),
}
BAD = ('box', 'blister', 'case', 'display', 'elite', 'bundle', 'tin', 'checklane', 'poster', 'logo', 'energy', 'coin', 'back', 'sealed', 'jumbo', 'mini', 'deck', 'theme')

def api_get(params, tries=3):
    url = API + '?' + urllib.parse.urlencode(params)
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception:
            time.sleep(2 * (i + 1))
    return {}

def search(q):
    r = api_get({'action': 'query', 'list': 'search', 'srsearch': q, 'srnamespace': 6, 'format': 'json', 'srlimit': 14})
    return [x['title'] for x in r.get('query', {}).get('search', [])]

def thumb_url(title):
    r = api_get({'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|size', 'iiurlwidth': 500, 'format': 'json'})
    for p in r.get('query', {}).get('pages', {}).values():
        ii = p.get('imageinfo') or []
        if ii and ii[0]['height'] > ii[0]['width']: return ii[0].get('thumburl') or ii[0]['url']
    return None

manifest = {}
for key, (queries, accept) in SETS.items():
    titles = []
    for q in queries:
        for t in search(q):
            low = t.lower()
            if 'booster' in low and not any(b in low for b in BAD) and re.search(accept, t) and t not in titles: titles.append(t)
        time.sleep(0.5)
        if len(titles) >= 3: break
    got = []
    for t in titles[:3]:
        u = thumb_url(t); time.sleep(0.5)
        if not u: continue
        ext = os.path.splitext(urllib.parse.urlparse(u).path)[1] or '.png'
        fn = f'assets/packs/{key}-{len(got)+1}{ext}'
        try:
            req = urllib.request.Request(u, headers=UA)
            data = urllib.request.urlopen(req, timeout=30).read()
        except Exception as e:
            print(key, 'download fail', e); continue
        open(fn, 'wb').write(data); got.append(fn.split('/')[-1])
        print(key, '<-', t, f'{len(data)//1024}KB')
    if got: manifest[key] = got
    else: print(key, 'MISS')
print('\nPACKART =', json.dumps(manifest, ensure_ascii=False))
