#!/usr/bin/env python3
"""原地封顶：hq-data 简中五弹中宽度 >560 的卡图缩到 560/q84（控制部署体积），
≤560 的原样不动（零二次压缩损失）。逐卡对应，不动对齐。"""
import json, io, base64, os
from PIL import Image

for fn in sorted(os.listdir('hq-data')):
    if not fn.startswith('zh-cn-'): continue
    p = f'hq-data/{fn}'
    d = json.load(open(p))
    n = 0
    for c in d['cards']:
        if not c.get('img'): continue
        raw = base64.b64decode(c['img'].split(',', 1)[1])
        im = Image.open(io.BytesIO(raw))
        if im.width > 560:
            im = im.convert('RGB').resize((560, round(im.height * 560 / im.width)), Image.LANCZOS)
            buf = io.BytesIO(); im.save(buf, 'WEBP', quality=84)
            c['img'] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
            n += 1
    json.dump(d, open(p, 'w'), ensure_ascii=False)
    print(fn, 'capped:', n, f"-> {os.path.getsize(p)/1e6:.1f}MB")
