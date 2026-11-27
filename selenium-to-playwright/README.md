# Selenium → Playwright

A side-by-side guide that teaches Selenium (Java) engineers Playwright (TypeScript).
Every topic shows Selenium on the left and Playwright on the right; equivalent lines share a row.

## Run it

No build step and no dependencies. Either open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 4173
```

Then visit http://localhost:4173.

## Project layout

```
index.html            page shell: top bar, sidebar, content area
assets/styles.css     theme (light/dark), layout, comparison grid, responsive rules
assets/highlight.js   tiny syntax highlighter (java, ts, shell, xml, yaml, text)
assets/app.js         router (#/topic/section), sidebar, page rendering, copy buttons
content/topics.js     topic list: Getting Started, Core Concepts, Cheat Sheet
content/core-concepts-more.js  Async/Await, Shadow DOM, Element State, Web Tables, Cookies, Emulation
content/test-design.js       Page Object Model, Fixtures, Data-driven Tests
content/test-design-more.js  Tags & Annotations, Global Setup, Test Data, Custom Assertions
content/beyond-selenium.js   Network Mocking, API Testing, Authentication Reuse, Debugging
content/running-at-scale.js  Parallel Execution, Reporting, CI/CD
content/migration.js         Migration Checklist (ticks are saved in localStorage)
```

`topics.js` pulls in the group files with `...window.TOPIC_GROUPS.<name>` (or single topics such as
`window.TOPIC_GROUPS.core.shadowDom`), so menu order follows
that array. Group files must be loaded before `topics.js` in `index.html`.

## Adding or editing a topic

Everything is data in the `content/` files. A topic looks like:

```js
{
  id: 'locators',                 // URL: #/locators
  group: 'Core Concepts',         // sidebar heading
  title: 'Locators',
  summary: 'Shown on the home page card',
  intro: 'Lead paragraph (HTML allowed)',
  sections: [
    {
      id: 'classic',              // URL: #/locators/classic
      title: 'CSS, XPath, id and friends',
      body: '<p>Optional prose</p>',
      compare: {
        sel: { file: 'LoginTest.java' },          // lang defaults to java
        pw:  { file: 'login.spec.ts' },           // lang defaults to ts
        segs: [
          ['driver.findElement(By.id("email"))', "page.locator('#email')"],
          ['Thread.sleep(1000);', '', 'Optional text shown on the empty side'],
        ],
      },
      callout: { type: 'diff' | 'tip' | 'warn' | 'pw', title: 'Optional', body: 'HTML' },
    },
  ],
}
```

- Each `segs` pair renders as one row, so matching lines line up. Leave a side as `''` when it has no counterpart.
- Code is written in template literals: keep it flush-left, escape `${` as `\${`, and avoid backslashes.
- To announce a future topic, add `{ group: 'Test Design', title: 'Page Object Model', soon: true }`.
