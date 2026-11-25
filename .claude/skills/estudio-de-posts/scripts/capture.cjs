// Captura frames do post animado com Playwright.
// node capture.cjs <post.html> <pasta> all <fps> [escala]
// node capture.cjs <post.html> <pasta> keys 0 [escala] '[t1,t2,...]'
const { chromium } = require('playwright');
(async () => {
  const [html, out, mode, fps, scale] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: +(scale || 1) });
  await p.goto('file://' + html + '#capture', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  const fonts = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).join(','));
  const esperadas = await p.evaluate(() => (document.querySelector('meta[name="estudio:fontes"]') || {}).content || '');
  const faltando = esperadas.split(',').filter(Boolean).filter(f => !fonts.includes(f));
  if (faltando.length) console.warn('AVISO: fontes do perfil não carregaram:', faltando.join(', '), '| carregadas:', fonts || 'nenhuma');
  const total = await p.evaluate(() => window.TOTAL);
  const stage = await p.$('#stage');
  const times = mode === 'keys' ? JSON.parse(process.argv[7]) : [...Array(Math.round(total * +fps)).keys()].map(i => i / +fps);
  let i = 0;
  for (const t of times) {
    await p.evaluate(t => renderAt(t), t);
    await stage.screenshot({ path: `${out}/f${String(i++).padStart(4, '0')}.png` });
  }
  // checagem: elementos que saem da área do card no estado final de cada cena
  const vaza = await p.evaluate(() => {
    const r = [];
    document.querySelectorAll('.scene').forEach((sc, k) => {
      renderAt(+sc.dataset.e - 0.3);
      const R = sc.getBoundingClientRect();
      sc.querySelectorAll('*').forEach(e => { const q = e.getBoundingClientRect(); if (q.width && (q.right > R.right + 1 || q.bottom > R.bottom + 1 || q.left < R.left - 1)) r.push(`cena ${k + 1}: "${(e.textContent || e.className || e.tagName).trim().slice(0, 40)}"`); });
    });
    return r;
  });
  console.log('frames', i, 'duração', total, 's');
  if (vaza.length) console.warn('AVISO: elementos fora do card ->', vaza.slice(0, 10).join(' | '));
  await b.close();
})();
