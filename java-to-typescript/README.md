# Java → TypeScript

A side-by-side guide that teaches Java developers TypeScript.
Every topic shows Java on the left and TypeScript on the right; equivalent lines share a row.

It uses the same engine as the Selenium → Playwright guide (`../selenium-to-playwright/`), with its own
labels, colours and storage keys (`j2t-theme`, `j2t-check:*`), so the two guides don't overwrite each other's settings.

## Run it

No build step and no dependencies. Open `index.html` directly in a browser, or serve the site root:

```bash
python3 -m http.server 4173
```

Then visit http://localhost:4173/java-to-typescript/.

## Project layout

```
index.html                 page shell: top bar, sidebar, content area
assets/styles.css          theme (light/dark), layout, comparison grid, responsive rules
assets/highlight.js        tiny syntax highlighter (java, ts, json, shell, xml, yaml, text)
assets/app.js              router (#/topic/section), sidebar, home page, copy buttons
content/topics.js          menu order, and the content format reference
content/getting-started.js Setup & Tooling, Your First Program, How TypeScript Types Work
content/core-language.js   Variables, Null Safety, Control Flow, Methods → Functions
content/collections.js     Lists, Maps & Sets; Streams → Array Methods
content/oop.js             Classes, Interfaces, Inheritance, Generics & Utility Types
content/beyond-java.js     Union Types & Narrowing, Enums → Literal Unions, Records → Data Objects
content/errors-async.js    Exceptions, Async: Futures → Promises
content/ecosystem.js       Modules & Packages, Testing: JUnit → Vitest, Build & Tooling
content/reference.js       Common Gotchas, Cheat Sheet, Learning Checklist (ticks saved in localStorage)
```

## Adding or editing a topic

Everything is data in the `content/` files; the format is described at the top of `content/topics.js`.
A new content file must be added to `index.html` before `topics.js`, and spread into `window.TOPICS` there.

- Each `segs` pair renders as one row, so matching lines line up. Leave a side as `''` when it has no counterpart,
  and give a third item to explain why.
- Code is written in template literals: keep it flush-left, escape `${` as `\${` and backticks as `` \` ``.
- Prefer examples that compile. The TypeScript examples were checked with `tsc --strict`
  (plus `noUncheckedIndexedAccess`) and the Vitest ones run, so keep new ones to the same standard.
