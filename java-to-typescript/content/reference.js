/* Reference: Common Gotchas, Cheat Sheet, Learning Checklist.
 * Checklist items are rendered as checkboxes; app.js remembers their state in localStorage. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};

(function () {
  const checklist = (id, items) =>
    '<ul class="checklist">' +
    items.map((text, i) =>
      `<li><label><input type="checkbox" data-check="${id}-${i}"><span>${text}</span></label></li>`
    ).join('') +
    '</ul>';

  window.TOPIC_GROUPS.reference = [

    /* ================================================================== */
    {
      id: 'gotchas',
      group: 'Reference',
      title: 'Common Gotchas',
      summary: 'The mistakes Java developers make most often in TypeScript, and how to avoid them.',
      keywords: 'gotcha pitfall mistake bug this binding sort equality json validation zod await float',
      intro: `Each of these compiles without complaint and then does something a Java developer doesn't expect.`,
      sections: [
        {
          id: 'runtime-types',
          title: 'Types are not checked at runtime',
          body: `<p>Jackson fails if JSON doesn't fit the class. <code>JSON.parse</code> returns whatever the JSON contains,
            and <code>as User</code> just tells the compiler to believe it. Validate data at the edges of your program, for
            example with <a href="https://zod.dev" target="_blank" rel="noopener">zod</a>.</p>`,
          compare: {
            sel: {},
            pw: {},
            segs: [
              [`User u = mapper.readValue(json, User.class);   // throws if it doesn't fit`, `const u = JSON.parse(json) as User;   // no check: wrong data fails later`],
              ['', `import { z } from 'zod';

const UserSchema = z.object({ name: z.string(), age: z.number() });
type User = z.infer<typeof UserSchema>;    // the type comes from the schema

const u = UserSchema.parse(JSON.parse(json));   // throws if it doesn't fit`, 'Jackson validates against the class'],
            ],
          },
        },
        {
          id: 'this',
          title: 'Losing "this"',
          body: `<p>A method passed as a value forgets the object it came from, so <code>this</code> is
            <code>undefined</code> when it runs. Java's <code>this::save</code> never has this problem.</p>`,
          compare: {
            sel: {},
            pw: {},
            segs: [
              [`button.onClick(this::save);`, `button.onClick(this.save);          // bug: this is undefined inside save
button.onClick(() => this.save());  // OK`],
              ['', `class Form {
  save = () => { … };               // arrow function field: always bound
}`, 'Method references are always bound'],
            ],
          },
        },
        {
          id: 'sort',
          title: 'sort() compares as text',
          compare: {
            sel: {},
            pw: {},
            segs: [
              [`List.of(10, 9, 1).stream().sorted().toList()   // [1, 9, 10]`, `[10, 9, 1].sort()                 // [1, 10, 9]
[10, 9, 1].sort((a, b) => a - b)  // [1, 9, 10]`],
            ],
          },
        },
        {
          id: 'equality',
          title: '== and object equality',
          compare: {
            sel: {},
            pw: {},
            segs: [
              [`"5".equals(5)    // false`, `'5' == 5          // true: == converts types
'5' === 5         // false: always use ===`],
              [`new Point(1, 2).equals(new Point(1, 2))   // true for a record`, `const a = { x: 1, y: 2 };
const b = { x: 1, y: 2 };
a === b                     // false: different objects`],
              [`new HashSet<>(List.of(p1, p1copy)).size()   // 1`, `new Set([a, b]).size        // 2: Sets and Maps compare objects by reference`],
            ],
          },
        },
        {
          id: 'numbers',
          title: 'Numbers',
          compare: {
            sel: {},
            pw: {},
            segs: [
              [`7 / 2          // 3`, `7 / 2          // 3.5: use Math.trunc() or Math.floor()`],
              [`1 / 0          // ArithmeticException`, `1 / 0          // Infinity`],
              [`Integer.parseInt("12px")   // NumberFormatException`, `Number('12px')             // NaN
Number.parseInt('12px', 10) // 12: stops at the first non-digit`],
              [`0.1 + 0.2 == 0.3          // false (double)`, `0.1 + 0.2 === 0.3          // false: same floating-point maths`],
            ],
          },
          callout: {
            type: 'tip',
            body: `For money, store whole cents in a <code>number</code> (or a <code>bigint</code>), as you would with
              <code>long</code> in Java. There's no built-in <code>BigDecimal</code>.`,
          },
        },
        {
          id: 'await',
          title: 'Missing await',
          compare: {
            sel: {},
            pw: {},
            segs: [
              [`User u = loadUser(id).join();`, `const u = loadUser(id);    // bug: u is a Promise<User>
const u2 = await loadUser(id);`],
              [`try { save(u).join(); } catch (CompletionException e) { … }`, `try { save(u); } catch (e) { … }          // bug: the error escapes
try { await save(u); } catch (e) { … }    // OK`],
            ],
          },
        },
        {
          id: 'for-in',
          title: 'for...in and truthiness',
          compare: {
            sel: {},
            pw: {},
            segs: [
              [`for (String s : list) { … }`, `for (const s in list) { … }    // bug: s is '0', '1', '2'
for (const s of list) { … }    // OK`],
              [`if (count != 0) { … }`, `if (count) { … }               // careful: also false for NaN
if (count !== 0) { … }         // says what you mean`],
              [`int limit = opts.limit != null ? opts.limit : 10;`, `const limit = opts.limit || 10;    // bug: a limit of 0 becomes 10
const limit2 = opts.limit ?? 10;   // OK`],
            ],
          },
        },
      ],
    },

    /* ================================================================== */
    {
      id: 'cheat-sheet',
      group: 'Reference',
      title: 'Cheat Sheet',
      summary: 'One page of Java → TypeScript translations to keep open while you code.',
      keywords: 'cheat sheet reference summary quick lookup table',
      intro: `Quick translations for the things you type every day. Each topic in the guide explains the details.`,
      sections: [
        {
          id: 'table',
          title: 'Java → TypeScript',
          table: [
            'Variables & types',
            ['Constant', 'final int max = 10;', 'const max = 10;'],
            ['Variable', 'int count = 0;', 'let count = 0;'],
            ['Long integer', 'long big = 1L << 60;', 'const big = 1n << 60n;'],
            ['Nullable value', 'Optional<String> name', 'name: string | undefined'],
            ['Default if missing', 'opt.orElse("guest")', "name ?? 'guest'"],
            ['Safe navigation', 'opt.map(User::address).map(Address::city)', 'user?.address?.city'],
            ['String format', 'String.format("%s is %d", n, a)', '`${n} is ${a}`'],
            ['String equality', 'a.equals(b)', 'a === b'],
            ['Parse a number', 'Integer.parseInt(s)', 'Number.parseInt(s, 10)'],
            'Functions & classes',
            ['Method', 'int add(int a, int b) { … }', 'function add(a: number, b: number): number { … }'],
            ['Lambda', '(a, b) -> a + b', '(a, b) => a + b'],
            ['Varargs', 'int sum(int... n)', 'function sum(...n: number[])'],
            ['Default argument', '// overload', "function greet(name: string, greeting = 'Hi')"],
            ['Constructor fields', 'this.repo = repo;', 'constructor(private readonly repo: Repo) {}'],
            ['Getter', 'public int getAge()', 'get age(): number'],
            ['Override', '@Override', 'override'],
            ['Interface', 'interface Shape { double area(); }', 'interface Shape { area(): number }'],
            ['Record', 'record Point(int x, int y) {}', 'type Point = { x: number; y: number };'],
            ['Copy with change', 'new Point(p.x(), 5)', '{ ...p, y: 5 }'],
            ['Enum', 'enum Size { S, M, L }', "type Size = 's' | 'm' | 'l';"],
            ['Generic method', 'static <T> T first(List<T> l)', 'function first<T>(l: T[]): T | undefined'],
            ['Type check', 'if (o instanceof Circle c)', 'if (o instanceof Circle)'],
            'Collections',
            ['New list', 'new ArrayList<String>()', 'const list: string[] = []'],
            ['Add / size', 'list.add(x); list.size()', 'list.push(x); list.length'],
            ['Contains', 'list.contains(x)', 'list.includes(x)'],
            ['Filter + map', 'list.stream().filter(f).map(m).toList()', 'list.filter(f).map(m)'],
            ['Find first', 'stream().filter(f).findFirst()', 'list.find(f)'],
            ['Sort numbers', 'Collections.sort(nums)', 'nums.sort((a, b) => a - b)'],
            ['Join strings', 'String.join(", ", list)', "list.join(', ')"],
            ['Map', 'new HashMap<String, Integer>()', 'new Map<string, number>()'],
            ['Put / get', 'map.put(k, v); map.get(k)', 'map.set(k, v); map.get(k)'],
            ['Group by', 'collect(Collectors.groupingBy(f))', 'Map.groupBy(list, f)'],
            ['Remove duplicates', 'new LinkedHashSet<>(list)', '[...new Set(list)]'],
            'Errors & async',
            ['Throw', 'throw new IllegalStateException("x");', "throw new Error('x');"],
            ['Catch', 'catch (IOException e)', 'catch (e) { if (e instanceof …) }'],
            ['Wrap a cause', 'new RuntimeException("x", e)', "new Error('x', { cause: e })"],
            ['Async result', 'CompletableFuture<User>', 'Promise<User>'],
            ['Wait for it', 'future.join()', 'await promise'],
            ['Run in parallel', 'CompletableFuture.allOf(a, b)', 'await Promise.all([a, b])'],
            ['Sleep', 'Thread.sleep(1000);', 'await sleep(1000); // node:timers/promises'],
            'Tooling',
            ['Print', 'System.out.println(x);', 'console.log(x);'],
            ['Build', 'mvn compile', 'npx tsc'],
            ['Run tests', 'mvn test', 'npx vitest run'],
            ['Add dependency', '<dependency> in pom.xml', 'npm install <name>'],
          ],
        },
      ],
    },

    /* ================================================================== */
    {
      id: 'learning-checklist',
      group: 'Reference',
      title: 'Learning Checklist',
      summary: 'A step-by-step path from your first .ts file to writing idiomatic TypeScript.',
      keywords: 'checklist plan learning path progress roadmap',
      intro: `A practical order for learning TypeScript as a Java developer. Tick items as you go: your progress is saved in
        this browser.`,
      sections: [
        {
          id: 'basics',
          title: '1. Get set up',
          body: checklist('basics', [
            `Install Node.js (LTS) and create a project with <code>npm init -y</code> (<a href="#/setup">guide</a>).`,
            `Add TypeScript, <code>tsx</code> and <code>@types/node</code>, and run <code>npx tsc --init</code>.`,
            `Check that <code>"strict": true</code> is on in <code>tsconfig.json</code>.`,
            `Run a file with <code>npx tsx</code> and type-check it with <code>npx tsc --noEmit</code>.`,
            `Set up your editor so type errors show as you type (VS Code does this out of the box).`,
          ]),
        },
        {
          id: 'language',
          title: '2. Learn the language',
          body: checklist('language', [
            `Understand that types are erased, and how structural typing works (<a href="#/type-system">guide</a>).`,
            `Use <code>const</code> by default, and <code>===</code> always (<a href="#/variables">guide</a>).`,
            `Replace <code>Optional</code> with <code>T | undefined</code>, <code>?.</code> and <code>??</code> (<a href="#/null-safety">guide</a>).`,
            `Write standalone functions with default and optional parameters (<a href="#/functions">guide</a>).`,
            `Translate a stream pipeline into array methods (<a href="#/streams">guide</a>).`,
            `Model a small domain with types and object literals instead of classes (<a href="#/records">guide</a>).`,
          ]),
        },
        {
          id: 'types',
          title: '3. Think in TypeScript types',
          body: checklist('types', [
            `Replace an enum with a union of string literals (<a href="#/enums">guide</a>).`,
            `Model a sealed hierarchy as a discriminated union with an exhaustive <code>switch</code> (<a href="#/unions-narrowing">guide</a>).`,
            `Derive DTOs with <code>Pick</code>, <code>Omit</code> and <code>Partial</code> (<a href="#/generics/utility">guide</a>).`,
            `Validate JSON at the boundary with zod instead of trusting <code>as</code> (<a href="#/gotchas/runtime-types">guide</a>).`,
          ]),
        },
        {
          id: 'real-code',
          title: '4. Write real code',
          body: checklist('real-code', [
            `Call an HTTP API with <code>fetch</code> and <code>async</code>/<code>await</code> (<a href="#/async">guide</a>).`,
            `Write unit tests with Vitest, using <code>vi.fn()</code> for test doubles (<a href="#/testing">guide</a>).`,
            `Add ESLint (typescript-eslint) and Prettier, with <code>no-floating-promises</code> turned on (<a href="#/tooling">guide</a>).`,
            `Read through <a href="#/gotchas">Common Gotchas</a> and check your code for each one.`,
            `Port a small Java utility or service you know well, and compare the two versions.`,
          ]),
        },
      ],
    },
  ];
})();
