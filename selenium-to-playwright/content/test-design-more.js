/* More Test Design topics, appended after the ones in content/test-design.js (must load after it).
 * Same format as content/topics.js. */
window.TOPIC_GROUPS.testDesign.push(

  /* ================================================================== */
  {
    id: 'organizing-tests',
    group: 'Test Design',
    title: 'Tags & Annotations',
    summary: 'TestNG groups, enabled=false and descriptions vs. describe blocks, tags, skip/fixme/slow/only.',
    keywords: 'organize describe group groups tag tags annotation skip fixme fail slow only grep subset',
    intro: `TestNG organizes tests with classes, <code>groups</code> and attributes on <code>@Test</code>. Playwright uses
      nested <code>test.describe</code> blocks, <strong>tags</strong>, and annotation helpers such as <code>test.skip</code>
      and <code>test.fixme</code> — and you choose which tests to run with <code>--grep</code>.`,
    sections: [
      {
        id: 'grouping',
        title: 'Grouping tests',
        compare: {
          sel: { file: 'tests/CheckoutTest.java' },
          pw: { file: 'tests/checkout.spec.ts' },
          segs: [
            [`public class CheckoutTest {`, `test.describe('checkout', () => {`],
            [`  // TestNG can't nest groups of tests (JUnit 5 uses @Nested classes)`, `
  test.describe('as a guest', () => {
    test('asks for an email', async ({ page }) => { });
  });`],
            [`
  @Test(description = "Pays with a saved card")
  public void paysWithSavedCard() { }`, `  test('pays with a saved card', async ({ page }) => { });`],
            [`}`, `});`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Hooks such as <code>test.beforeEach</code> inside a <code>describe</code> apply only to the tests in that block —
            a neat way to share setup between a handful of tests.`,
        },
      },
      {
        id: 'tags',
        title: 'Tags (TestNG groups)',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`
@Test(groups = {"smoke", "checkout"})
public void paysWithCard() { }`, `test('pays with card', { tag: ['@smoke', '@checkout'] }, async ({ page }) => { });`],
            [`
@Test(groups = "checkout") // on the class: applies to every method
public class CheckoutTest { }`, `test.describe('checkout', { tag: '@checkout' }, () => { /* ... */ });`],
          ],
        },
      },
      {
        id: 'running-subsets',
        title: 'Running a subset',
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`mvn test -Dgroups=smoke`, `npx playwright test --grep @smoke`],
            [`mvn test -DexcludedGroups=slow`, `npx playwright test --grep-invert @slow`],
            [`mvn test -Dgroups="smoke,checkout"          # either group`, `npx playwright test --grep "@smoke|@checkout"   # either tag`],
            ['', `npx playwright test --grep "(?=.*@smoke)(?=.*@checkout)"  # both tags`],
            [`mvn test -Dtest="CheckoutTest#paysWithCard"`, `npx playwright test -g "pays with card"`],
            [`# or <include name="smoke"/> in testng.xml`, `# or grep: /@smoke/ on a project in playwright.config.ts`],
          ],
        },
      },
      {
        id: 'annotations',
        title: 'Skip, fixme, fail, slow, only',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`@Test(enabled = false)`, `test.skip('not ready yet', async ({ page }) => { });`],
            [`
@Test
public void uploadsFile() {
  if (isFirefox()) throw new SkipException("Not on Firefox");`, `
test('uploads file', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'Not on Firefox');`],
            [`// Known bug: disable it and leave a comment`, `
// Not run; shown as "fixme" in the report
test.fixme('totals include tax', async ({ page }) => { });`],
            [`@Test(expectedExceptions = AssertionError.class)`, `
// Runs, and passes only while it still fails
test.fail('known bug SHOP-77', async ({ page }) => { });`],
            [`@Test(timeOut = 120000)`, `test.slow(); // inside a test: triples its timeout`],
            [`// Run one test: right-click → Run in the IDE`, `test.only('focus on this one', async ({ page }) => { });`],
          ],
        },
        callout: {
          type: 'warn',
          body: `A forgotten <code>test.only</code> silently skips the rest of the suite. Set
            <code>forbidOnly: !!process.env.CI</code> in the config so CI fails instead.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'global-setup',
    group: 'Test Design',
    title: 'Global Setup & Teardown',
    summary: '@BeforeSuite/@AfterSuite become setup and teardown projects (or a globalSetup file).',
    keywords: 'beforesuite aftersuite global setup teardown seed database once project dependencies globalsetup',
    intro: `For work that must happen once per run — seeding a database, starting a mock server, logging in — TestNG has
      <code>@BeforeSuite</code> and <code>@AfterSuite</code>. Playwright's recommended equivalent is a <strong>setup
      project</strong>: setup code written as ordinary tests, which other projects depend on.`,
    sections: [
      {
        id: 'hooks',
        title: 'Writing setup and teardown',
        compare: {
          sel: { file: 'hooks/SuiteHooks.java' },
          pw: { file: 'tests/global.setup.ts / global.teardown.ts' },
          segs: [
            [`
public class SuiteHooks {
  @BeforeSuite
  public void seedDatabase() {
    TestData.seed();
  }`, `
// tests/global.setup.ts
import { test as setup } from '@playwright/test';

setup('seed database', async ({ request }) => {
  await request.post('/api/test-data/seed');
});`],
            [`
  @AfterSuite(alwaysRun = true)
  public void cleanDatabase() {
    TestData.clean();
  }
}`, `
// tests/global.teardown.ts
import { test as teardown } from '@playwright/test';

teardown('clean database', async ({ request }) => {
  await request.post('/api/test-data/clean');
});`],
          ],
        },
      },
      {
        id: 'wiring',
        title: 'Wiring them up',
        compare: {
          sel: { file: 'testng.xml', lang: 'xml' },
          pw: { file: 'playwright.config.ts' },
          segs: [
            [`
<suite name="Regression">
  <test name="All">
    <classes>`, `
export default defineConfig({
  projects: [`],
            [`      <class name="hooks.SuiteHooks"/>`, `
    { name: 'setup db', testMatch: '**/global.setup.ts', teardown: 'cleanup db' },
    { name: 'cleanup db', testMatch: '**/global.teardown.ts' },`],
            [`      <class name="tests.CheckoutTest"/>`, `
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup db'], // runs after setup, before teardown
    },`],
            [`
    </classes>
  </test>
</suite>`, `
  ],
});`],
          ],
        },
        callout: {
          type: 'diff',
          title: 'Why a project, not a hook?',
          body: `Setup projects are real tests: they appear in the HTML report, record traces, can use fixtures such as
            <code>page</code> and <code>request</code>, and if setup fails, the dependent tests are skipped with a clear reason.
            The teardown project runs after every project that depends on the setup has finished.`,
        },
      },
      {
        id: 'global-file',
        title: 'The globalSetup alternative',
        compare: {
          sel: { file: 'hooks/SuiteHooks.java' },
          pw: { file: 'global-setup.ts' },
          segs: [
            ['', `
// playwright.config.ts
export default defineConfig({
  globalSetup: './global-setup',
  globalTeardown: './global-teardown',
});`, 'Registered in testng.xml instead'],
            [`
@BeforeSuite
public void createRunId() {
  System.setProperty("runId", String.valueOf(System.currentTimeMillis()));
}`, `
// global-setup.ts
import { type FullConfig } from '@playwright/test';

export default async function globalSetup(config: FullConfig) {
  process.env.RUN_ID = Date.now().toString(); // visible to every worker
}`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>globalSetup</code> is a plain function: no fixtures, no traces, and it doesn't show up in the report.
            Prefer setup projects, and keep <code>globalSetup</code> for simple things like setting environment variables.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'test-data',
    group: 'Test Design',
    title: 'Test Data Management',
    summary: 'Unique data per test, fake data, builders, and creating and cleaning up data via the API.',
    keywords: 'test data faker datafaker builder factory unique random uuid seed cleanup parallelindex',
    intro: `Playwright runs tests in parallel by default, so tests that share accounts or records will collide. The rule:
      <strong>every test creates the data it needs</strong>, makes it unique, and cleans it up.`,
    sections: [
      {
        id: 'unique',
        title: 'Unique values',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`String email = "user_" + System.currentTimeMillis() + "@example.com";`, `const email = \`user_\${Date.now()}@example.com\`;`],
            [`String id = UUID.randomUUID().toString();`, `
import { randomUUID } from 'node:crypto';
const id = randomUUID();`],
            [`
// Keep parallel threads apart with the thread id
long threadId = Thread.currentThread().getId();`, `
// Index of this worker (0 .. workers-1): e.g. pick one test account per worker
const slot = test.info().parallelIndex;
const account = accounts[slot];`],
          ],
        },
      },
      {
        id: 'faker',
        title: 'Realistic fake data',
        compare: {
          sel: { file: 'Datafaker' },
          pw: { file: '@faker-js/faker' },
          segs: [
            [`Faker faker = new Faker();`, `import { faker } from '@faker-js/faker'; // npm i -D @faker-js/faker`],
            [`String name = faker.name().fullName();`, `const name = faker.person.fullName();`],
            [`String email = faker.internet().emailAddress();`, `const email = faker.internet.email();`],
            [`String street = faker.address().streetAddress();`, `const street = faker.location.streetAddress();`],
            [`Faker seeded = new Faker(new Random(42)); // repeatable values`, `faker.seed(42); // repeatable values`],
          ],
        },
      },
      {
        id: 'builders',
        title: 'Builders and factories',
        body: `<p>Instead of a builder class, TypeScript usually uses a factory function with sensible defaults and an
          <code>overrides</code> object — spread syntax does the rest.</p>`,
        compare: {
          sel: { file: 'UserFactory.java (Lombok @Builder)' },
          pw: { file: 'data/user.factory.ts' },
          segs: [
            [`
public static User randomUser() {
  return User.builder()
      .name(faker.name().fullName())
      .email(faker.internet().emailAddress())
      .role(Role.CUSTOMER)
      .build();
}`, `
export function buildUser(overrides: Partial<User> = {}): User {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
    ...overrides, // anything passed in wins
  };
}`],
            [`User admin = randomUser().toBuilder().role(Role.ADMIN).build();`, `const admin = buildUser({ role: 'admin' });`],
          ],
        },
      },
      {
        id: 'lifecycle',
        title: 'Create through the API, clean up in a fixture',
        compare: {
          sel: { file: 'tests/ProductTest.java' },
          pw: { file: 'fixtures.ts' },
          segs: [
            ['', `
export const test = base.extend<{ product: Product }>({
  product: async ({ request }, use) => {`],
            [`
@BeforeMethod
public void createProduct() {
  product = api.createProduct(ProductFactory.random());
}`, `
    const res = await request.post('/api/products', { data: buildProduct() });
    const product = await res.json();`],
            ['', `    await use(product);`, 'The test runs in between'],
            [`
@AfterMethod(alwaysRun = true)
public void deleteProduct() {
  api.deleteProduct(product.getId());
}`, `
    await request.delete('/api/products/' + product.id);
  },
});`],
          ],
        },
        callout: {
          type: 'diff',
          body: `Never rely on data another test created or on test order. A test that builds its own data can run alone, in
            parallel, or be retried — which is exactly what Playwright will do with it.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'custom-assertions',
    group: 'Test Design',
    title: 'Custom Assertions & Helpers',
    summary: 'Assertion helpers and AssertJ vs. expect.extend custom matchers and built-in matchers.',
    keywords: 'custom matcher assertion helper assertj hamcrest expect extend configure merge',
    intro: `Java suites grow assertion helpers and use AssertJ or Hamcrest for readable checks. In Playwright you can add your
      own matchers to <code>expect</code> with <code>expect.extend</code> — and make them retry just like the built-in ones.`,
    sections: [
      {
        id: 'matcher',
        title: 'From a helper method to a custom matcher',
        compare: {
          sel: { file: 'AssertionHelpers.java' },
          pw: { file: 'fixtures.ts' },
          segs: [
            [`
public static void assertPrice(WebElement el, double expected) {
  double actual = Double.parseDouble(el.getText().replace("$", ""));
  Assert.assertEquals(actual, expected, 0.001, "price");
}`, `
import { expect as baseExpect, type Locator } from '@playwright/test';

export const expect = baseExpect.extend({
  async toHavePrice(locator: Locator, expected: number, options?: { timeout?: number }) {
    let actual: number | undefined;
    let pass = true;
    try {
      // retry until the price matches, like a built-in matcher
      await baseExpect.poll(async () => {
        actual = Number((await locator.innerText()).replace('$', ''));
        return actual;
      }, options).toBe(expected);
    } catch {
      pass = false;
    }
    return {
      pass,
      name: 'toHavePrice',
      message: () => 'expected price ' + expected + ', got ' + actual,
    };
  },
});`],
            [`assertPrice(driver.findElement(By.id("total")), 42.5);`, `await expect(page.locator('#total')).toHavePrice(42.5);`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Export the custom <code>expect</code> from the same <code>fixtures.ts</code> as your custom <code>test</code>.
            Combine matchers and fixtures from several files with <code>mergeExpects()</code> and <code>mergeTests()</code>.`,
        },
      },
      {
        id: 'assertj',
        title: 'AssertJ-style checks on values',
        compare: {
          sel: { file: 'AssertJ' },
          pw: { file: 'expect' },
          segs: [
            [`assertThat(names).hasSize(3).contains("Apple");`, `
expect(names).toHaveLength(3);
expect(names).toContain('Apple');`],
            [`assertThat(order.getTotal()).isGreaterThan(0);`, `expect(order.total).toBeGreaterThan(0);`],
            [`assertThat(user.getRole()).isEqualTo("admin");`, `expect(user).toMatchObject({ role: 'admin' }); // checks only these fields`],
            [`
assertThat(product).usingRecursiveComparison()
    .ignoringFields("id").isEqualTo(expected);`, `expect(product).toEqual({ id: expect.any(String), name: 'Laptop' });`],
            [`assertThat(message).matches("Order #\\\\d+ placed");`, `expect(message).toMatch(/Order #[0-9]+ placed/);`],
          ],
        },
      },
      {
        id: 'configure',
        title: 'Preconfigured expect',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`// Each WebDriverWait sets its own timeout`, `
const slowExpect = expect.configure({ timeout: 15_000 });
await slowExpect(page.getByText('Report ready')).toBeVisible();`],
            [`SoftAssert soft = new SoftAssert();`, `
const softExpect = expect.configure({ soft: true });
await softExpect(page.getByTestId('total')).toHaveText('$42.50');`],
          ],
        },
      },
    ],
  },
);
