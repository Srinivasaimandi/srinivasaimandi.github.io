/* Collections: Lists, Maps & Sets; Streams → Array Methods.
 * Same format as described at the top of content/topics.js. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.collections = [

  /* ================================================================== */
  {
    id: 'collections',
    group: 'Collections',
    title: 'Lists, Maps & Sets',
    summary: 'ArrayList → arrays, HashMap → Map or Record, plus tuples and read-only collections.',
    keywords: 'list arraylist array map hashmap record set hashset tuple immutable readonly List.of',
    intro: `TypeScript has no collections framework. The built-in array covers <code>List</code>, and the built-in
      <code>Map</code> and <code>Set</code> cover the rest. Plain objects are also used as maps with string keys.`,
    sections: [
      {
        id: 'lists',
        title: 'List → array',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`List<String> names = new ArrayList<>();`, `const names: string[] = [];`],
            [`List<String> fixed = List.of("a", "b");`, `const fixed = ['a', 'b'];`],
            [`names.add("Asha");
names.add(0, "Ravi");`, `names.push('Asha');
names.unshift('Ravi');`],
            [`names.get(0)
names.get(names.size() - 1)`, `names[0]
names.at(-1)                     // last item`],
            [`names.set(0, "Zara");`, `names[0] = 'Zara';`],
            [`names.size()
names.isEmpty()`, `names.length
names.length === 0`],
            [`names.contains("Asha")
names.indexOf("Asha")`, `names.includes('Asha')
names.indexOf('Asha')`],
            [`names.remove(0);
names.remove("Asha");`, `names.splice(0, 1);
names.splice(names.indexOf('Asha'), 1);   // check for -1 first`],
            [`List<String> copy = new ArrayList<>(names);
List<String> all = new ArrayList<>(a); all.addAll(b);`, `const copy = [...names];
const all = [...a, ...b];`],
          ],
        },
        callout: {
          type: 'warn',
          body: `Reading past the end of an array returns <code>undefined</code> instead of throwing. Turn on
            <code>noUncheckedIndexedAccess</code> so <code>names[5]</code> is typed <code>string | undefined</code> and the
            compiler reminds you.`,
        },
      },
      {
        id: 'maps',
        title: 'Map → Map or Record',
        body: `<p>Use <code>Map</code> when keys are added and removed at runtime. Use a plain object typed as
          <code>Record&lt;K, V&gt;</code> for a fixed set of string keys, such as configuration or lookups.</p>`,
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Map<String, Integer> stock = new HashMap<>();`, `const stock = new Map<string, number>();`],
            [`stock.put("apple", 3);
stock.get("apple")
stock.getOrDefault("pear", 0)`, `stock.set('apple', 3);
stock.get('apple')              // number | undefined
stock.get('pear') ?? 0`],
            [`stock.containsKey("apple")
stock.remove("apple");
stock.size()`, `stock.has('apple')
stock.delete('apple');
stock.size`],
            [`stock.merge("apple", 1, Integer::sum);`, `stock.set('apple', (stock.get('apple') ?? 0) + 1);`],
            [`for (var e : stock.entrySet()) {
    System.out.println(e.getKey() + "=" + e.getValue());
}`, `for (const [fruit, count] of stock) {
  console.log(\`\${fruit}=\${count}\`);
}`],
            [`Map<String, String> colours = Map.of(
    "error", "red",
    "ok", "green");`, `const colours: Record<string, string> = {
  error: 'red',
  ok: 'green',
};`],
          ],
        },
        callout: {
          type: 'warn',
          title: 'Object keys are compared by reference',
          body: `A <code>Map</code> with object keys has no <code>hashCode()</code>/<code>equals()</code> to call: two objects
            with the same fields are two different keys. Use a string or number key, such as an id.`,
        },
      },
      {
        id: 'sets',
        title: 'Set',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Set<String> seen = new HashSet<>();
seen.add("a");
seen.contains("a")
seen.size()`, `const seen = new Set<string>();
seen.add('a');
seen.has('a')
seen.size`],
            [`List<String> unique = new ArrayList<>(new LinkedHashSet<>(list));`, `const unique = [...new Set(list)];      // keeps first-seen order`],
          ],
        },
      },
      {
        id: 'readonly',
        title: 'Immutable collections and tuples',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`List<String> roles = List.of("admin", "user");
roles.add("guest");   // UnsupportedOperationException`, `const roles: readonly string[] = ['admin', 'user'];
roles.push('guest');  // compile error`],
            [`Map<String, Integer> m = Map.copyOf(source);`, `const m: ReadonlyMap<string, number> = new Map(source);`],
            [`record Pair(String name, int score) {}
Pair p = new Pair("Asha", 90);`, `const p: [string, number] = ['Asha', 90];
const [name, score] = p;      // destructuring`],
          ],
        },
        callout: {
          type: 'diff',
          body: `<code>readonly</code> is checked only by the compiler; the array can still be changed at runtime by code that
            ignores the type. <code>Object.freeze()</code> makes it immutable at runtime too.`,
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'streams',
    group: 'Collections',
    title: 'Streams → Array Methods',
    summary: 'filter, map, reduce and friends work directly on arrays. Plus grouping and sorting.',
    keywords: 'stream filter map reduce collect collectors groupingBy toMap sorted comparator findFirst anyMatch flatMap distinct',
    intro: `Arrays have the stream operations built in, so there is no <code>.stream()</code> and no <code>collect()</code>.
      One difference: each step runs right away and builds a new array, while Java streams are lazy.`,
    sections: [
      {
        id: 'basics',
        title: 'filter, map, reduce',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`List<String> names = users.stream()
    .filter(u -> u.active())
    .map(User::name)
    .toList();`, `const names = users
  .filter(u => u.active)
  .map(u => u.name);`],
            [`int total = orders.stream()
    .mapToInt(Order::amount)
    .sum();`, `const total = orders.reduce((sum, o) => sum + o.amount, 0);`],
            [`List<String> tags = posts.stream()
    .flatMap(p -> p.tags().stream())
    .distinct()
    .toList();`, `const tags = [...new Set(posts.flatMap(p => p.tags))];`],
            [`String csv = names.stream().collect(Collectors.joining(","));`, `const csv = names.join(',');`],
            [`List<User> firstThree = users.stream().limit(3).toList();`, `const firstThree = users.slice(0, 3);`],
          ],
        },
      },
      {
        id: 'searching',
        title: 'Finding and matching',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Optional<User> admin = users.stream()
    .filter(User::isAdmin)
    .findFirst();`, `const admin = users.find(u => u.isAdmin);   // User | undefined`],
            [`boolean anyAdmin = users.stream().anyMatch(User::isAdmin);
boolean allActive = users.stream().allMatch(User::active);
boolean noneBanned = users.stream().noneMatch(User::banned);`, `const anyAdmin = users.some(u => u.isAdmin);
const allActive = users.every(u => u.active);
const noneBanned = !users.some(u => u.banned);`],
            [`long count = users.stream().filter(User::active).count();`, `const count = users.filter(u => u.active).length;`],
            [`int max = scores.stream().max(Integer::compare).orElseThrow();`, `const max = Math.max(...scores);   // -Infinity if empty`],
          ],
        },
      },
      {
        id: 'sorting',
        title: 'Sorting',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`List<User> byAge = users.stream()
    .sorted(Comparator.comparingInt(User::age))
    .toList();`, `const byAge = users.toSorted((a, b) => a.age - b.age);`],
            [`users.sort(Comparator.comparing(User::name));   // in place`, `users.sort((a, b) => a.name.localeCompare(b.name));   // in place`],
            [`.sorted(Comparator.comparingInt(User::age).reversed())`, `.toSorted((a, b) => b.age - a.age)`],
          ],
        },
        callout: {
          type: 'warn',
          title: 'sort() without a comparator sorts as text',
          body: `<code>[10, 9, 1].sort()</code> gives <code>[1, 10, 9]</code>, because the default order compares the values as
            strings. Always pass a comparator for numbers: <code>(a, b) =&gt; a - b</code>. <code>sort()</code> changes the
            array; <code>toSorted()</code> returns a sorted copy.`,
        },
      },
      {
        id: 'collecting',
        title: 'Collectors → Map, Object and groupBy',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Map<String, User> byId = users.stream()
    .collect(Collectors.toMap(User::id, u -> u));`, `const byId = new Map(users.map(u => [u.id, u]));`],
            [`Map<Role, List<User>> byRole = users.stream()
    .collect(Collectors.groupingBy(User::role));`, `const byRole = Map.groupBy(users, u => u.role);`],
            [`Map<Boolean, List<User>> split = users.stream()
    .collect(Collectors.partitioningBy(User::active));`, `const active = users.filter(u => u.active);
const inactive = users.filter(u => !u.active);`],
          ],
        },
        callout: {
          type: 'tip',
          body: `<code>Map.groupBy</code> and <code>Object.groupBy</code> are recent additions (ES2024). They need Node.js 21+
            and <code>"lib": ["es2024"]</code> or a later <code>target</code> in <code>tsconfig.json</code>. On older setups,
            build the map with <code>reduce</code>.`,
        },
      },
    ],
  },
];
