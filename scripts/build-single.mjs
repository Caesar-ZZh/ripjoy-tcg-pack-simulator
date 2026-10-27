// 构建单文件版 dist/ripjoy-standalone.html：内联 CSS/JS 与全部卡池数据，可离线打开（卡图仍走 TCGdex CDN）
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = async (p) => readFile(new URL(p, root), 'utf8');

const strip = (src) => src
  .replace(/^import .*$/gm, '')
  .replace(/^export (const|let|function|class) /gm, '$1 ')
  .replace(/^export \{.*\};?$/gm, '');

const css = await read('src/styles.css');
const jsParts = [];
for (const f of ['src/engine.js', 'src/particles.js', 'src/fx.js', 'src/app.js']) jsParts.push(strip(await read(f)));
const embed = {};
for (const f of ['data/en-sv03.5.json', 'data/en-sv08.json', 'data/en-sv10.json', 'data/ja-sv2a.json']) {
  embed[f] = JSON.parse(await read(f));
}
let html = await read('index.html');
html = html.replace('<link rel="stylesheet" href="src/styles.css">', () => `<style>\n${css}\n</style>`);
html = html.replace('<script type="module" src="src/app.js"></script>',
  () => `<script>window.__RIPJOY_EMBED__=${JSON.stringify(embed)};</script>\n<script>\n${jsParts.join('\n')}\n</script>`);
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/ripjoy-standalone.html', root), html);
console.log('dist/ripjoy-standalone.html', (html.length / 1024).toFixed(0) + 'KB');
