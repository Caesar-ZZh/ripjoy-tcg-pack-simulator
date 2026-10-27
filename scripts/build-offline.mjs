// 构建完全离线版 dist/ripjoy-offline.html：代码 + 卡池数据 + 全部卡图（data URI）内嵌。
// 需先运行 scripts/fetch-images.py 生成 data/images-embedded.json。
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = async (p) => readFile(new URL(p, root), 'utf8');
const strip = (src) => src.replace(/^import .*$/gm, '').replace(/^export (const|let|function|class) /gm, '$1 ').replace(/^export \{.*\};?$/gm, '');

const css = await read('src/styles.css');
const jsParts = [];
for (const f of ['src/engine.js', 'src/particles.js', 'src/fx.js', 'src/app.js']) jsParts.push(strip(await read(f)));
const imgs = JSON.parse(await read('data/images-embedded.json'));
const embed = {};
for (const f of ['data/en-sv03.5.json', 'data/en-sv08.json', 'data/en-sv10.json', 'data/ja-sv2a.json']) {
  const d = JSON.parse(await read(f));
  if (imgs.logos[d.id]) d.logo = imgs.logos[d.id];
  embed[f] = d;
}
let html = await read('index.html');
html = html.replace('<link rel="stylesheet" href="src/styles.css">', () => `<style>\n${css}\n</style>`);
html = html.replace('<script type="module" src="src/app.js"></script>',
  () => `<script>window.__RIPJOY_EMBED__=${JSON.stringify(embed)};window.__RIPJOY_IMGS__=${JSON.stringify(imgs.cards)};</script>\n<script>\n${jsParts.join('\n')}\n</script>`);
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/ripjoy-offline.html', root), html);
console.log('dist/ripjoy-offline.html', (html.length / 1024 / 1024).toFixed(1) + 'MB');
