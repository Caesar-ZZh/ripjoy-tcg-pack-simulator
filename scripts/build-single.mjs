// 构建单文件版 dist/ripjoy-standalone.html：内联 CSS/JS 与全部卡池数据，可离线打开（卡图仍走 TCGdex CDN）
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = async (p) => readFile(new URL(p, root), 'utf8');

const strip = (src) => src
  .replace(/^import .*$/gm, '')
  .replace(/^export (const|let|function|class) /gm, '$1 ')
  .replace(/^export \{.*\};?$/gm, '');

const css = await read('src/styles.css');
let packartJs = '';
for (const f of (await readdir(new URL('src/', root))).filter(x => /^packart-\d+\.js$/.test(x)).sort()) packartJs += await read('src/' + f) + '\n';
const jsParts = [];
for (const f of ['src/engine.js', 'src/particles.js', 'src/fx.js', 'src/cardbacks.js', 'src/app.js']) jsParts.push(strip(await read(f)));
const embed = {};
for (const f of (await readdir(new URL('data/', root))).filter(x => x.endsWith('.json') && x !== 'images-embedded.json').sort().map(x => 'data/' + x)) {
  embed[f] = JSON.parse(await read(f));
}
let html = await read('index.html');
html = html.replace(/<link rel="stylesheet" href="src\/styles\.css[^"]*">/, () => `<style>\n${css}\n</style>`);
html = html.replace('<script type="module" src="src/app.js"></script>',
  () => `<script>${packartJs}<\/script>\n<script>window.__RIPJOY_EMBED__=${JSON.stringify(embed)};</script>\n<script>\n${jsParts.join('\n')}\n</script>`);
if (/<(script|link)[^>]+(src|href)="src\//.test(html)) throw new Error('内联不完整：仍有外部资源引用');
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/ripjoy-standalone.html', root), html);
console.log('dist/ripjoy-standalone.html', (html.length / 1024).toFixed(0) + 'KB');
