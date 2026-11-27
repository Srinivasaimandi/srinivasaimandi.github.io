/* Reference topic: Migration Checklist.
 * Checklist items are rendered as checkboxes; app.js remembers their state in localStorage. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};

(function () {
  const checklist = (id, items) =>
    '<ul class="checklist">' +
    items.map((text, i) =>
      `<li><label><input type="checkbox" data-check="${id}-${i}"><span>${text}</span></label></li>`
    ).join('') +
    '</ul>';

  window.TOPIC_GROUPS.migration = [
    {
      id: 'migration-checklist',
      group: 'Reference',
      title: 'Migration Checklist',
      summary: 'A step-by-step plan for moving an existing Selenium Java suite to Playwright.',
      keywords: 'migrate migration plan checklist port convert',
      intro: `A practical order of work for moving an existing Selenium Java suite to Playwright TypeScript. Tick items as
        you go — your progress is saved in this browser.`,
      sections: [
        {
          id: 'plan',
          title: '1. Plan',
          body: checklist('plan', [
            `List your suites, their size, and which tests are flaky today — the flaky ones are often the biggest wins.`,
            `Migrate <strong>by feature</strong>, not file by file: start with the smoke suite or one critical user journey.`,
            `Keep the Selenium suite running in CI until the Playwright version covers the same ground.`,
            `Agree on conventions up front: folder layout, page object style, locator strategy, test data.`,
          ]),
          callout: {
            type: 'warn',
            title: "Don't translate line by line",
            body: `A literal port keeps Selenium's waits, XPath and helpers — and their flakiness. Translate the
              <em>intent</em> of each test using Playwright's idioms.`,
          },
        },
        {
          id: 'project',
          title: '2. Set up the project',
          body: checklist('project', [
            `Run <code>npm init playwright@latest</code> (TypeScript, <code>tests</code> folder, GitHub Actions workflow).`,
            `Configure <code>baseURL</code>, timeouts and browser projects in <code>playwright.config.ts</code>.`,
            `Add ESLint with <code>@typescript-eslint/no-floating-promises</code> to catch missing <code>await</code>s.`,
            `Set <code>trace: 'on-first-retry'</code>, <code>retries</code> and <code>forbidOnly</code> for CI.`,
            `Add <code>playwright/.auth</code>, <code>test-results</code> and <code>playwright-report</code> to <code>.gitignore</code>.`,
            `Get one test passing in CI before migrating more.`,
          ]),
        },
        {
          id: 'framework',
          title: '3. Translate the framework',
          body: checklist('framework', [
            `Driver factory and Options → <a href="#/browsers">playwright.config.ts projects</a>.`,
            `Base test class, <code>@BeforeMethod</code>/<code>@AfterMethod</code> → <a href="#/fixtures">fixtures</a>.`,
            `Page objects → classes with <code>Locator</code> fields and <code>async</code> methods; drop <code>PageFactory</code> (<a href="#/page-objects">guide</a>).`,
            `<code>@DataProvider</code> → loops over data arrays (<a href="#/data-driven">guide</a>).`,
            `Login helpers → a setup project with <a href="#/auth-reuse">storage state</a>.`,
            `Screenshot listeners and ExtentReports → built-in reporters and traces (<a href="#/reporting">guide</a>).`,
            `<code>IRetryAnalyzer</code> → the <code>retries</code> setting.`,
            `<code>ThreadLocal&lt;WebDriver&gt;</code> and Grid setup → delete; use workers and sharding (<a href="#/parallel">guide</a>).`,
          ]),
        },
        {
          id: 'tests',
          title: '4. Translate each test',
          body: checklist('tests', [
            `Replace <code>By.id</code> / XPath with <code>getByRole</code>, <code>getByLabel</code> or <code>getByTestId</code> where possible.`,
            `Delete <code>WebDriverWait</code>, implicit waits and <code>Thread.sleep</code>.`,
            `Turn <code>Assert.assertEquals(el.getText(), …)</code> into <code>await expect(locator).toHaveText(…)</code>.`,
            `Replace <code>switchTo().frame()</code> with <code>frameLocator()</code>, window handles with <code>Page</code> objects, and alerts with <code>page.once('dialog')</code>.`,
            `Remove JavaScript-click and scroll workarounds — actionability checks handle them.`,
            `<code>await</code> every action and every locator assertion.`,
            `Run the new test 10+ times (<code>--repeat-each=10</code>) to prove it's stable before deleting the old one.`,
          ]),
        },
        {
          id: 'beyond',
          title: '5. Then take advantage',
          body: checklist('beyond', [
            `Create test data through the <a href="#/api-testing">API</a> instead of the UI.`,
            `<a href="#/network-mocking">Mock</a> slow or unreliable third-party services.`,
            `Add <a href="#/assertions/visual">visual comparisons</a> for layout-heavy pages.`,
            `Run WebKit and Firefox projects to cover Safari- and Firefox-specific bugs.`,
            `Shard the suite across CI machines once it grows.`,
          ]),
        },
      ],
    },
  ];
})();
