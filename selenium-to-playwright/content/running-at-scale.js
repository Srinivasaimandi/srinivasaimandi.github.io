/* Running at Scale topics: Parallel Execution, Reporting, CI/CD.
 * Same format as content/topics.js (see the comment at the top of that file). */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.runningAtScale = [

  /* ================================================================== */
  {
    id: 'parallel',
    group: 'Running at Scale',
    title: 'Parallel Execution',
    summary: 'TestNG threads + ThreadLocal + Grid vs. worker processes and sharding.',
    keywords: 'parallel threads threadlocal workers grid shard sharding serial order priority',
    intro: `Running Selenium in parallel takes three pieces: TestNG's <code>parallel</code> attribute, a
      <code>ThreadLocal&lt;WebDriver&gt;</code> so threads don't share a browser, and often a Selenium Grid. Playwright runs test
      files in parallel <strong>by default</strong>, in separate worker processes, each with its own browser.`,
    sections: [
      {
        id: 'local',
        title: 'Turning it on',
        compare: {
          sel: { file: 'testng.xml', lang: 'xml' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`<suite name="Regression" parallel="methods" thread-count="4">`, `
export default defineConfig({
  fullyParallel: true, // also run tests inside one file in parallel
  workers: 4,          // or '50%' of CPU cores; default is half the cores`],
            [`
  <test name="All">
    <packages>
      <package name="tests"/>
    </packages>
  </test>
</suite>`, `
  testDir: './tests',
});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Override from the command line with <code>npx playwright test --workers=1</code> — useful when debugging a test
            that only fails in parallel.`,
        },
      },
      {
        id: 'threadlocal',
        title: 'No ThreadLocal driver',
        compare: {
          sel: { file: 'DriverManager.java' },
          pw: { file: 'Playwright' },
          segs: [
            [`
public final class DriverManager {
  private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

  public static WebDriver get() { return DRIVER.get(); }
  public static void set(WebDriver driver) { DRIVER.set(driver); }

  public static void quit() {
    DRIVER.get().quit();
    DRIVER.remove();
  }
}`, '', 'Not needed: each test gets its own page fixture'],
          ],
        },
        callout: {
          type: 'diff',
          title: 'Workers are processes, not threads',
          body: `Each worker is a separate Node.js process. That means no shared browser to protect — but also that module-level
            variables are <em>not</em> shared between workers. Tests must not depend on state set by another test.`,
        },
      },
      {
        id: 'order',
        title: 'Controlling order',
        compare: {
          sel: { file: 'tests/OrderTest.java' },
          pw: { file: 'tests/order.spec.ts' },
          segs: [
            [`// Tests in a class depend on each other`, `test.describe.configure({ mode: 'serial' });`],
            [`
@Test(priority = 1)
public void createOrder() { }`, `test('create order', async ({ page }) => { });`],
            [`
@Test(priority = 2, dependsOnMethods = "createOrder")
public void cancelOrder() { }`, `test('cancel order', async ({ page }) => { }); // skipped if the previous one fails`],
          ],
        },
        callout: {
          type: 'warn',
          body: `Serial mode is an escape hatch. Independent tests that create their own data (through the API or a fixture) are
            faster and easier to debug, because any single test can run on its own.`,
        },
      },
      {
        id: 'sharding',
        title: 'Selenium Grid → sharding',
        body: `<p>Selenium scales out by sending commands to a Grid of remote browsers. Playwright scales out by splitting the
          test suite into <em>shards</em> and running each shard on a different CI machine, each with local browsers.</p>`,
        compare: {
          sel: { file: 'DriverFactory.java' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`
WebDriver driver = new RemoteWebDriver(
    new URL("http://grid.example.com:4444"), new ChromeOptions());`, `
npx playwright test --shard=1/4   # on machine 1
npx playwright test --shard=2/4   # on machine 2 ... and so on`],
            [`// The Grid aggregates nothing: each node reports separately`, `
# Combine the shards' blob reports into one HTML report
npx playwright merge-reports --reporter html ./all-blob-reports`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Use <code>reporter: process.env.CI ? 'blob' : 'html'</code> so each shard writes a mergeable blob report. The
            <a href="#/ci-cd/sharding">CI/CD</a> topic shows a full GitHub Actions matrix.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'reporting',
    group: 'Running at Scale',
    title: 'Reporting',
    summary: 'Built-in HTML, JUnit and JSON reporters, steps and attachments, retries and flaky tests.',
    keywords: 'report reporter html junit allure extent attachment annotation retry flaky',
    intro: `In Java you wire up reporting yourself: Surefire XML, ExtentReports or Allure, plus listeners for screenshots.
      Playwright includes several reporters — HTML, JUnit, JSON, list, dot — and you can run several at once. Allure
      still works through a plugin if your team relies on it.`,
    sections: [
      {
        id: 'reporters',
        title: 'Configuring reporters',
        compare: {
          sel: { file: 'ReportManager.java (ExtentReports)' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            ['', `
export default defineConfig({
  reporter: [`],
            [`// Console output comes from Maven/Surefire`, `    ['list'],                                         // console output`],
            [`
ExtentReports extent = new ExtentReports();
extent.attachReporter(new ExtentSparkReporter("target/report.html"));
ExtentTest test = extent.createTest("Login");
test.pass("Logged in");
extent.flush();`, `    ['html', { open: 'never' }],                      // playwright-report/index.html`],
            [`// JUnit XML is written to target/surefire-reports/`, `    ['junit', { outputFile: 'results/junit.xml' }], // for CI dashboards`],
            ['', `
  ],
});`],
          ],
        },
        callout: {
          type: 'tip',
          title: 'Using Allure?',
          body: `Run <code>npm i -D allure-playwright</code> and add <code>['allure-playwright']</code> to the
            <code>reporter</code> list. Steps, attachments and annotations below show up in Allure too.`,
        },
      },
      {
        id: 'steps',
        title: 'Steps, attachments and annotations',
        compare: {
          sel: { file: 'Allure + TestNG' },
          pw: { file: 'tests/checkout.spec.ts' },
          segs: [
            [`
@Step("Add {product} to cart")
public void addToCart(String product) { ... }`, `
await test.step('Add Laptop to cart', async () => {
  await page.getByRole('button', { name: 'Add to cart' }).click();
});`],
            [`Allure.addAttachment("order.json", "application/json", json);`, `
await test.info().attach('order.json', {
  body: json,
  contentType: 'application/json',
});`],
            [`
@Issue("SHOP-123")
@Test
public void checkout() { }`, `
test('checkout', {
  tag: '@smoke',
  annotation: { type: 'issue', description: 'SHOP-123' },
}, async ({ page }) => { });`],
          ],
        },
      },
      {
        id: 'retries',
        title: 'Retries and flaky tests',
        compare: {
          sel: { file: 'RetryAnalyzer.java' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`
public class Retry implements IRetryAnalyzer {
  private int count = 0;

  @Override
  public boolean retry(ITestResult result) {
    return count++ < 2;
  }
}`, `
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});`],
            [`@Test(retryAnalyzer = Retry.class)`, `// applies to every test; override with test.describe.configure({ retries: 1 })`],
          ],
        },
        callout: {
          type: 'pw',
          body: `A test that fails and then passes on retry is reported as <strong>flaky</strong>, not as passed — so retries
            keep the pipeline green without hiding problems. Combine with <code>trace: 'on-first-retry'</code> to capture a trace
            exactly when a test is flaky.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'ci-cd',
    group: 'Running at Scale',
    title: 'CI/CD',
    summary: 'GitHub Actions workflows for both, the official Docker image, and sharding in a matrix.',
    keywords: 'ci cd github actions jenkins docker pipeline workflow yaml shard matrix',
    intro: `In CI, a Selenium job needs Java, Maven, a browser and a matching driver (or a Grid). A Playwright job needs Node.js
      plus one command that installs the browsers and their OS dependencies. If you said yes during
      <code>npm init playwright</code>, a workflow was already generated for you.`,
    sections: [
      {
        id: 'github-actions',
        title: 'GitHub Actions',
        compare: {
          sel: { file: '.github/workflows/tests.yml', lang: 'yaml' },
          pw: { file: '.github/workflows/playwright.yml', lang: 'yaml' },
          segs: [
            [`
name: tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4`, `
name: playwright
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4`],
            [`
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven`, `
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: npm`],
            [`      - uses: browser-actions/setup-chrome@v1`, `
      - run: npm ci
      - run: npx playwright install --with-deps`],
            [`      - run: mvn -B test -Dheadless=true`, `      - run: npx playwright test`],
            [`
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: surefire-reports
          path: target/surefire-reports/`, `
      - uses: actions/upload-artifact@v4
        if: \${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Only need one browser in CI? <code>npx playwright install --with-deps chromium</code> is much faster than
            installing all three.`,
        },
      },
      {
        id: 'docker',
        title: 'Docker',
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`
# Browsers run in a container; tests run outside and connect to it
docker run -d -p 4444:4444 --shm-size=2g selenium/standalone-chrome
mvn test -Dgrid.url=http://localhost:4444`, `
# Tests AND browsers run in the official image
# (use the tag that matches your @playwright/test version)
docker run --rm --ipc=host -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.xx.0-noble npx playwright test`],
          ],
        },
        callout: {
          type: 'tip',
          body: `In GitHub Actions you can skip the install step by running the whole job in that image:
            <code>container: { image: mcr.microsoft.com/playwright:v1.xx.0-noble }</code>.`,
        },
      },
      {
        id: 'sharding',
        title: 'Sharding in a CI matrix',
        compare: {
          sel: { file: 'Selenium Grid', lang: 'yaml' },
          pw: { file: '.github/workflows/playwright.yml', lang: 'yaml' },
          segs: [
            [`# Scale out by adding Grid nodes; one Maven job drives them all`, `
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]`],
            ['', `
    steps:
      # ...checkout, setup-node, npm ci, install browsers...
      - run: npx playwright test --shard=\${{ matrix.shard }}
      - uses: actions/upload-artifact@v4
        if: \${{ !cancelled() }}
        with:
          name: blob-report-\${{ strategy.job-index }}
          path: blob-report/`],
            ['', `
  merge-reports:
    needs: test
    if: \${{ !cancelled() }}
    runs-on: ubuntu-latest
    steps:
      # ...checkout, setup-node, npm ci, download all blob-report-* artifacts...
      - run: npx playwright merge-reports --reporter html ./all-blob-reports`],
          ],
        },
      },
      {
        id: 'ci-settings',
        title: 'CI-friendly config',
        compare: {
          sel: { file: 'pom.xml / testng.xml', lang: 'text' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            ['', `export default defineConfig({`],
            [`Fail the build if someone left a focused test: no built-in check`, `  forbidOnly: !!process.env.CI,   // fail if test.only was committed`],
            [`Retries: IRetryAnalyzer`, `  retries: process.env.CI ? 2 : 0,`],
            [`Threads: thread-count in testng.xml`, `  workers: process.env.CI ? 2 : undefined,`],
            [`Reports: Surefire XML`, `
  reporter: process.env.CI ? [['github'], ['html'], ['junit', { outputFile: 'junit.xml' }]] : 'html',
});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `The <code>github</code> reporter adds failure annotations right on the pull request's changed files.`,
        },
      },
    ],
  },
];
