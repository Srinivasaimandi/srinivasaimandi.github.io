/* Renders the sidebar, topic pages and side-by-side comparisons from window.TOPICS. */
(function () {
  'use strict';

  const TOPICS = window.TOPICS || [];
  const LIVE = TOPICS.filter(t => !t.soon);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const hl = window.highlight;

  const nav = $('#nav');
  const main = $('#content');
  const copyStore = [];

  const clean = code => (code || '').replace(/^\s*\n/, '').replace(/\s+$/, '');
  const SITE = 'Selenium → Playwright';

  /* ---------------- Sidebar ---------------- */

  function renderNav() {
    const groups = [];
    for (const t of TOPICS) {
      let g = groups.find(x => x.name === t.group);
      if (!g) groups.push((g = { name: t.group, items: [] }));
      g.items.push(t);
    }
    nav.innerHTML =
      `<a class="nav-item" href="#/" data-id="" data-search="overview home start">Overview</a>` +
      groups.map(g => `
        <div class="nav-group">
          <div class="nav-title">${g.name}</div>
          ${g.items.map(t => t.soon
            ? `<span class="nav-item soon" data-search="${t.title.toLowerCase()}">${t.title}<em>soon</em></span>`
            : `<a class="nav-item" href="#/${t.id}" data-id="${t.id}"
                 data-search="${(t.title + ' ' + (t.keywords || '')).toLowerCase()}">${t.title}</a>`
          ).join('')}
        </div>`).join('');
  }

  function setActive(id) {
    $$('.nav-item', nav).forEach(a => a.classList.toggle('active', a.dataset.id === id));
  }

  $('#filter').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('.nav-item', nav).forEach(a => { a.hidden = !!q && !a.dataset.search.includes(q); });
    $$('.nav-group', nav).forEach(g => { g.hidden = !$$('.nav-item', g).some(a => !a.hidden); });
  });

  /* ---------------- Building blocks ---------------- */

  function cell(code, lang, side, placeholder) {
    const c = clean(code);
    if (!c) {
      const text = placeholder || (side === 'pw' ? 'Not needed in Playwright' : 'No direct Selenium equivalent');
      return `<div class="cell ${side} empty"><span>${text}</span></div>`;
    }
    return `<pre class="cell ${side}"><code>${hl(c, lang)}</code></pre>`;
  }

  function paneHead(side, label, file) {
    return `<div class="pane-head ${side}">
      <span class="tool">${label}</span>
      ${file ? `<span class="file">${file}</span>` : ''}
      <button class="copy" data-side="${side}" title="Copy all ${side === 'sel' ? 'Selenium' : 'Playwright'} code">Copy</button>
    </div>`;
  }

  function renderCompare(cmp) {
    const sel = Object.assign({ lang: 'java' }, cmp.sel);
    const pw = Object.assign({ lang: 'ts' }, cmp.pw);
    const id = copyStore.push({
      sel: cmp.segs.map(s => clean(s[0])).filter(Boolean).join('\n'),
      pw: cmp.segs.map(s => clean(s[1])).filter(Boolean).join('\n'),
    }) - 1;
    return `
      <div class="compare" data-copy="${id}">
        <div class="compare-head">
          ${paneHead('sel', 'Selenium · Java', sel.file)}
          ${paneHead('pw', 'Playwright · TypeScript', pw.file)}
        </div>
        ${cmp.segs.map(([s, p, placeholder]) =>
          `<div class="seg">${cell(s, sel.lang, 'sel', placeholder)}${cell(p, pw.lang, 'pw', placeholder)}</div>`
        ).join('')}
      </div>`;
  }

  const CALLOUT = {
    diff: { label: 'Key difference', icon: '⇄' },
    tip: { label: 'Tip', icon: '✦' },
    warn: { label: 'Watch out', icon: '!' },
    pw: { label: 'Playwright-only', icon: '★' },
  };

  function renderCallout(c) {
    const kind = CALLOUT[c.type] || CALLOUT.tip;
    return `<aside class="callout ${c.type || 'tip'}">
      <div class="callout-title"><span class="callout-icon">${kind.icon}</span>${c.title || kind.label}</div>
      <div class="callout-body">${c.body}</div>
    </aside>`;
  }

  function renderTable(rows) {
    return `<div class="table-wrap"><table class="cheat">
      <thead><tr><th>Task</th><th class="sel">Selenium · Java</th><th class="pw">Playwright · TypeScript</th></tr></thead>
      <tbody>${rows.map(r => typeof r === 'string'
        ? `<tr class="group"><td colspan="3">${r}</td></tr>`
        : `<tr><td>${r[0]}</td><td class="sel"><code>${hl(r[1], 'java')}</code></td><td class="pw"><code>${hl(r[2], 'ts')}</code></td></tr>`
      ).join('')}</tbody>
    </table></div>`;
  }

  function renderSection(t, s) {
    return `
      <section id="${t.id}--${s.id}">
        <h2><a class="anchor" href="#/${t.id}/${s.id}" aria-label="Link to section">#</a>${s.title}</h2>
        ${s.body ? `<div class="prose">${s.body}</div>` : ''}
        ${s.compare ? renderCompare(s.compare) : ''}
        ${s.table ? renderTable(s.table) : ''}
        ${[].concat(s.callout || []).map(renderCallout).join('')}
      </section>`;
  }

  /* ---------------- Pages ---------------- */

  function renderTopic(t) {
    copyStore.length = 0;
    const i = LIVE.indexOf(t);
    const prev = LIVE[i - 1];
    const next = LIVE[i + 1];
    const toc = t.sections.length > 1
      ? `<nav class="toc"><span>On this page</span>${t.sections.map(s => `<a href="#/${t.id}/${s.id}">${s.title}</a>`).join('')}</nav>`
      : '';
    main.innerHTML = `
      <article class="topic">
        <div class="eyebrow">${t.group}</div>
        <h1>${t.title}</h1>
        <p class="lead">${t.intro}</p>
        ${toc}
        ${t.sections.map(s => renderSection(t, s)).join('')}
        <footer class="pager">
          ${prev ? `<a class="prev" href="#/${prev.id}"><small>← Previous</small>${prev.title}</a>` : '<span></span>'}
          ${next ? `<a class="next" href="#/${next.id}"><small>Next →</small>${next.title}</a>` : '<span></span>'}
        </footer>
      </article>`;
  }

  function renderHome() {
    copyStore.length = 0;
    const demo = renderCompare({
      sel: { file: 'LoginTest.java' },
      pw: { file: 'login.spec.ts' },
      segs: [
        [`driver.get("https://example.com/login");`, `await page.goto('https://example.com/login');`],
        [`driver.findElement(By.id("email")).sendKeys("tom@example.com");`, `await page.getByLabel('Email').fill('tom@example.com');`],
        [`driver.findElement(By.id("login")).click();`, `await page.getByRole('button', { name: 'Log in' }).click();`],
        [`new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.urlContains("/dashboard"));`, ''],
        [`WebElement heading = driver.findElement(By.tagName("h1"));
Assert.assertEquals(heading.getText(), "Welcome");`,
         `await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome');`],
      ],
    });
    main.innerHTML = `
      <article class="topic home">
        <div class="eyebrow">Selenium Java → Playwright TypeScript</div>
        <h1>Learn Playwright through the Selenium you already know</h1>
        <p class="lead">Every topic puts <strong class="t-sel">Selenium</strong> on the left and
          <strong class="t-pw">Playwright</strong> on the right. Lines that do the same job sit on the same
          row — <em>hover a row</em> to see the pair.</p>
        ${demo}
        <h2>Five mindset shifts</h2>
        <ol class="shifts">
          <li><strong>Locators, not elements.</strong> A locator is a recipe that is re-resolved every time you use it, so stale elements disappear.</li>
          <li><strong>Auto-waiting.</strong> Every action waits for the element to be visible, stable and enabled. Delete your <code>WebDriverWait</code>s.</li>
          <li><strong>Web-first assertions.</strong> <code>await expect(locator)…</code> retries until it passes, so the wait and the check are one line.</li>
          <li><strong>Contexts, not drivers.</strong> Each test gets a fresh browser context in milliseconds. Isolation and parallelism are the default.</li>
          <li><strong><code>await</code> everything.</strong> Actions and assertions return Promises; a missing <code>await</code> is the classic beginner bug.</li>
        </ol>
        <h2>Topics</h2>
        <div class="cards">
          ${LIVE.map(t => `<a class="card" href="#/${t.id}"><span class="card-group">${t.group}</span><strong>${t.title}</strong><span>${t.summary || ''}</span></a>`).join('')}
        </div>
      </article>`;
  }

  /* ---------------- Router ---------------- */

  function route() {
    const [, id = '', sec] = location.hash.split('/');
    const topic = LIVE.find(t => t.id === id);
    if (topic) renderTopic(topic); else renderHome();
    $$('input[data-check]', main).forEach(cb => { cb.checked = localStorage.getItem('check:' + cb.dataset.check) === '1'; });
    setActive(topic ? topic.id : '');
    document.title = topic ? `${topic.title} · ${SITE}` : SITE;
    document.body.classList.remove('nav-open');
    const target = sec && document.getElementById(`${id}--${sec}`);
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }

  /* ---------------- Interactions ---------------- */

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return Promise.resolve();
  }

  main.addEventListener('click', e => {
    const btn = e.target.closest('.copy');
    if (!btn) return;
    const entry = copyStore[btn.closest('.compare').dataset.copy];
    copyText(entry[btn.dataset.side]).then(() => {
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
    });
  });

  main.addEventListener('change', e => {
    const cb = e.target.closest('input[data-check]');
    if (cb) localStorage.setItem('check:' + cb.dataset.check, cb.checked ? '1' : '0');
  });

  $('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

  $('#theme-btn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('stp-theme', next);
  });

  $$('.side-toggle button').forEach(b => b.addEventListener('click', () => {
    document.body.dataset.side = b.dataset.side;
    $$('.side-toggle button').forEach(x => x.classList.toggle('on', x === b));
  }));

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight') $('.pager .next')?.click();
    if (e.key === 'ArrowLeft') $('.pager .prev')?.click();
  });

  renderNav();
  window.addEventListener('hashchange', route);
  route();
})();
