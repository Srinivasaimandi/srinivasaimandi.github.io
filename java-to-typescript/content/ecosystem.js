/* Ecosystem: Modules & Packages, Testing: JUnit → Vitest, Build & Tooling.
 * Same format as described at the top of content/topics.js. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
(function () {
// A plain-text table in the cheat-sheet style: rows of [what, java, typescript], or a string for a group heading.
const textTable = rows =>
  '<div class="table-wrap"><table class="cheat"><thead><tr><th></th><th class="sel">Java</th><th class="pw">TypeScript</th></tr></thead><tbody>' +
  rows.map(r => typeof r === 'string'
    ? `<tr class="group"><td colspan="3">${r}</td></tr>`
    : `<tr><td>${r[0]}</td><td class="sel">${r[1]}</td><td class="pw">${r[2]}</td></tr>`
  ).join('') +
  '</tbody></table></div>';

window.TOPIC_GROUPS.ecosystem = [

  /* ================================================================== */
  {
    id: 'modules',
    group: 'Ecosystem',
    title: 'Modules & Packages',
    summary: 'import/export instead of packages, npm instead of Maven Central.',
    keywords: 'import export default named module package npm dependency maven central node_modules import type',
    intro: `Every file is a module with its own scope. You choose exactly what it exports, and other files import those
      names by relative path. Third-party code comes from the npm registry, the equivalent of Maven Central.`,
    sections: [
      {
        id: 'exports',
        title: 'Exporting and importing',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`public class PriceCalculator { … }`, `export class PriceCalculator { … }`],
            [`class Helper { … }        // package-private`, `class Helper { … }        // not exported: private to this file`],
            [`import com.shop.pricing.PriceCalculator;`, `import { PriceCalculator } from './pricing/price-calculator.js';`],
            [`import com.shop.pricing.*;`, `import * as pricing from './pricing/index.js';`],
            ['', `import type { Order } from './orders.js';    // types only: removed when compiled`, 'Imports are always kept'],
          ],
        },
        callout: {
          type: 'tip',
          body: `Prefer named exports (<code>export class X</code>) over <code>export default</code>. Named exports keep one
            name for each thing across the code base, and editors can auto-import them reliably.`,
        },
      },
      {
        id: 'dependencies',
        title: 'Dependencies',
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`# add a <dependency> to pom.xml`, `npm install zod                # adds to "dependencies"`],
            [`# <scope>test</scope>`, `npm install --save-dev vitest  # adds to "devDependencies"`],
            [`mvn dependency:tree`, `npm ls`],
            [`mvn versions:display-dependency-updates`, `npm outdated`],
            [`# ~/.m2/repository (shared cache)`, `# node_modules/ (per project: add it to .gitignore)`],
          ],
        },
        callout: {
          type: 'warn',
          body: `Commit <code>package-lock.json</code>: it pins the exact version of every dependency, including indirect ones.
            In CI, install with <code>npm ci</code>, which installs exactly what the lock file says.`,
        },
      },
      {
        id: 'types',
        title: 'Types for JavaScript libraries',
        body: `<p>Most libraries ship their own type definitions. For older JavaScript libraries, the community publishes types
          separately in <code>@types/…</code> packages.</p>`,
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            ['', `npm install express
npm install --save-dev @types/express`, 'Every JAR carries its own types'],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'testing',
    group: 'Ecosystem',
    title: 'Testing: JUnit → Vitest',
    summary: 'describe/it/expect instead of annotations, and vi.fn() instead of Mockito.',
    keywords: 'test junit vitest jest describe it expect assert beforeEach mock mockito spy verify when thenReturn',
    intro: `Vitest and Jest are the most popular TypeScript test runners, and their APIs are almost identical. Tests are
      functions registered with <code>it</code> (or <code>test</code>), grouped with <code>describe</code>, instead of
      annotated methods.`,
    sections: [
      {
        id: 'test',
        title: 'A test class',
        compare: {
          sel: { file: 'CalculatorTest.java' },
          pw: { file: 'calculator.test.ts' },
          segs: [
            [`import static org.junit.jupiter.api.Assertions.*;`, `import { beforeEach, describe, expect, it } from 'vitest';`],
            [`class CalculatorTest {
    private Calculator calc;`, `describe('Calculator', () => {
  let calc: Calculator;`],
            [`    @BeforeEach
    void setUp() { calc = new Calculator(); }`, `  beforeEach(() => { calc = new Calculator(); });`],
            [`    @Test
    void addsTwoNumbers() {
        assertEquals(5, calc.add(2, 3));
    }`, `  it('adds two numbers', () => {
    expect(calc.add(2, 3)).toBe(5);
  });`],
            [`    @Test
    void rejectsDivisionByZero() {
        assertThrows(ArithmeticException.class, () -> calc.divide(1, 0));
    }
}`, `  it('rejects division by zero', () => {
    expect(() => calc.divide(1, 0)).toThrow(RangeError);
  });
});`],
          ],
        },
        callout: {
          type: 'warn',
          body: `In TypeScript, <code>1 / 0</code> is <code>Infinity</code> rather than an exception, so this
            <code>divide</code> has to check for zero and throw by itself.`,
        },
      },
      {
        id: 'assertions',
        title: 'Assertions',
        compare: {
          sel: { file: 'JUnit 5' },
          pw: { file: 'Vitest' },
          segs: [
            [`assertEquals(5, total);`, `expect(total).toBe(5);`],
            [`assertEquals(expectedUser, user);     // equals()`, `expect(user).toEqual(expectedUser);   // compares contents`],
            [`assertTrue(list.isEmpty());`, `expect(list).toHaveLength(0);`],
            [`assertTrue(names.contains("Asha"));`, `expect(names).toContain('Asha');`],
            [`assertNull(result);`, `expect(result).toBeUndefined();`],
            [`assertEquals(0.3, 0.1 + 0.2, 1e-9);`, `expect(0.1 + 0.2).toBeCloseTo(0.3);`],
            [`assertThrows(NotFoundException.class, () -> service.load("x"));`, `await expect(service.load('x')).rejects.toThrow(NotFoundError);`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>toBe</code> compares with <code>===</code>, which is right for numbers and strings. For objects and
            arrays use <code>toEqual</code>, the equivalent of comparing with <code>equals()</code>.`,
        },
      },
      {
        id: 'mocking',
        title: 'Mocking: Mockito → vi.fn()',
        compare: {
          sel: { file: 'Mockito' },
          pw: { file: 'Vitest' },
          segs: [
            [`UserRepository repo = mock(UserRepository.class);`, `const repo = { find: vi.fn(), save: vi.fn() };`],
            [`when(repo.find("42")).thenReturn(Optional.of(asha));`, `repo.find.mockResolvedValue(asha);        // find returns a Promise`],
            [`var service = new UserService(repo);
service.rename("42", "Asha R");`, `const service = new UserService(repo);
await service.rename('42', 'Asha R');`],
            [`verify(repo).save(argThat(u -> u.name().equals("Asha R")));`, `expect(repo.save).toHaveBeenCalledWith(
  expect.objectContaining({ name: 'Asha R' }),
);`],
          ],
        },
        callout: {
          type: 'diff',
          body: `Thanks to structural typing, a test double is just an object with the right methods. You rarely need a mocking
            framework to create one: <code>vi.fn()</code> only records calls and stubs return values.`,
        },
      },
      {
        id: 'running',
        title: 'Running tests',
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'terminal', lang: 'shell' },
          segs: [
            [`mvn test`, `npx vitest run`],
            [`mvn test -Dtest=CalculatorTest`, `npx vitest run calculator`],
            ['', `npx vitest                  # watch mode: reruns on save`, 'IDE support only'],
            [`mvn test jacoco:report`, `npx vitest run --coverage`],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'tooling',
    group: 'Ecosystem',
    title: 'Build & Tooling',
    summary: 'What replaces Maven, Checkstyle, Lombok, Jackson and the rest of your Java toolbox.',
    keywords: 'maven gradle npm pnpm eslint prettier checkstyle lombok jackson spring logging ide vscode tools',
    intro: `A rough map from the Java tools you know to their usual TypeScript counterparts. Most are npm packages that you
      add as <code>devDependencies</code> and run through <code>npm run</code> scripts.`,
    sections: [
      {
        id: 'map',
        title: 'Tool map',
        body: textTable([
          'Build and run',
          ['Runtime', 'JVM', 'Node.js (or Deno, Bun)'],
          ['Compiler', 'javac', 'tsc'],
          ['Build tool', 'Maven, Gradle', 'npm scripts (or pnpm, yarn)'],
          ['Package registry', 'Maven Central', 'npm registry'],
          ['Run without building', 'java Main.java', 'npx tsx main.ts'],
          'Code quality',
          ['Linter', 'Checkstyle, SpotBugs, PMD', 'ESLint with typescript-eslint'],
          ['Formatter', 'google-java-format, Spotless', 'Prettier'],
          ['Tests', 'JUnit 5, TestNG', 'Vitest, Jest'],
          ['Mocks', 'Mockito', 'vi.fn(), jest.fn()'],
          ['Coverage', 'JaCoCo', 'vitest --coverage'],
          'Libraries',
          ['Boilerplate', 'Lombok', 'not needed: types and object literals'],
          ['JSON', 'Jackson', 'JSON.parse() and JSON.stringify(), plus zod to validate'],
          ['HTTP client', 'java.net.http.HttpClient', 'fetch()'],
          ['Web framework', 'Spring Boot', 'NestJS, Express, Fastify'],
          ['Logging', 'SLF4J + Logback', 'console, or pino'],
          ['Dates', 'java.time', 'Date, or date-fns / Luxon'],
        ]),
      },
      {
        id: 'scripts',
        title: 'Lifecycle → npm scripts',
        compare: {
          sel: { file: 'terminal', lang: 'shell' },
          pw: { file: 'package.json', lang: 'json' },
          segs: [
            [`mvn compile`, `"scripts": {
  "build": "tsc",`],
            [`mvn test`, `  "test": "vitest run",`],
            [`mvn checkstyle:check`, `  "lint": "eslint . && tsc --noEmit",`],
            [`mvn spring-boot:run`, `  "dev": "tsx watch src/main.ts"
}`],
          ],
        },
        callout: {
          type: 'tip',
          body: `Run any script with <code>npm run &lt;name&gt;</code>. Unlike Maven phases, scripts don't call each other
            automatically: each one runs only the command you give it.`,
        },
      },
    ],
  },
];
})();
