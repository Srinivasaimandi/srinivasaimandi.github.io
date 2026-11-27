/* Errors & Async: Exceptions & Error Handling, Async: Futures → Promises.
 * Same format as described at the top of content/topics.js. */
window.TOPIC_GROUPS = window.TOPIC_GROUPS || {};
window.TOPIC_GROUPS.errorsAsync = [

  /* ================================================================== */
  {
    id: 'exceptions',
    group: 'Errors & Async',
    title: 'Exceptions & Error Handling',
    summary: 'No checked exceptions, catch gives you unknown, and custom errors extend Error.',
    keywords: 'exception try catch finally throw throws checked custom error cause unknown instanceof try-with-resources',
    intro: `<code>try</code>, <code>catch</code>, <code>finally</code> and <code>throw</code> all exist, but there are no
      checked exceptions, no <code>throws</code> clause and only one <code>catch</code> block per <code>try</code>.`,
    sections: [
      {
        id: 'try-catch',
        title: 'try / catch',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`try {
    Config c = loadConfig(path);
}`, `try {
  const c = loadConfig(path);
}`],
            [`catch (FileNotFoundException e) {
    log.warn("No config, using defaults");
}
catch (IOException e) {
    throw new UncheckedIOException(e);
}`, `catch (e) {                      // e is unknown
  if (e instanceof NotFoundError) {
    console.warn('No config, using defaults');
  } else {
    throw e;                       // rethrow anything you don't handle
  }
}`],
            [`finally {
    lock.unlock();
}`, `finally {
  lock.release();
}`],
          ],
        },
        callout: {
          type: 'diff',
          body: `JavaScript can throw <em>any</em> value, not only errors, so the caught value is typed <code>unknown</code>.
            Check it with <code>instanceof</code> before reading <code>e.message</code>.`,
        },
      },
      {
        id: 'custom',
        title: 'Custom errors',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}`, `export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';   // shows in stack traces
  }
}`],
            [`throw new NotFoundException("User " + id);`, `throw new NotFoundError(\`User \${id}\`);`],
            [`throw new ServiceException("Lookup failed", e);   // cause`, `throw new Error('Lookup failed', { cause: e });`],
            [`e.getMessage()
e.getCause()`, `e.message
e.cause`],
          ],
        },
      },
      {
        id: 'checked',
        title: 'Checked exceptions',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`User parse(String json) throws ParseException { … }`, `/** @throws {ParseError} when the JSON is not a valid user */
function parse(json: string): User { … }`],
          ],
        },
        callout: {
          type: 'tip',
          body: `The compiler never tells callers which errors a function can throw. When failure is an expected outcome, such as
            invalid input, return a <a href="#/unions-narrowing/results">result union</a> so callers have to deal with it.`,
        },
      },
      {
        id: 'resources',
        title: 'try-with-resources',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`try (var in = Files.newInputStream(path)) {
    return new String(in.readAllBytes(), UTF_8);
}`, `const file = await open(path);     // from 'node:fs/promises'
try {
  return await file.readFile('utf8');
} finally {
  await file.close();
}`],
          ],
        },
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'async',
    group: 'Errors & Async',
    title: 'Async: Futures → Promises',
    summary: 'CompletableFuture becomes Promise, and async/await keeps code readable. No threads to manage.',
    keywords: 'async await promise completablefuture future thread executor sleep timeout parallel all race fetch http event loop',
    intro: `JavaScript runs your code on a single thread. Slow work such as network calls, file access and timers is
      asynchronous and returns a <code>Promise</code>, the equivalent of a <code>CompletableFuture</code>. With
      <code>async</code>/<code>await</code>, it reads like ordinary blocking code.`,
    sections: [
      {
        id: 'promise',
        title: 'CompletableFuture → Promise',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`CompletableFuture<User> loadUser(String id) {
    return CompletableFuture.supplyAsync(() -> repo.find(id));
}`, `async function loadUser(id: string): Promise<User> {
  return repo.find(id);
}`],
            [`User user = loadUser("42").join();      // blocks the thread`, `const user = await loadUser('42');      // pauses this function only`],
            [`loadUser("42")
    .thenApply(User::name)
    .thenAccept(System.out::println)
    .exceptionally(e -> { log.error("failed", e); return null; });`, `loadUser('42')
  .then(u => u.name)
  .then(name => console.log(name))
  .catch(e => console.error('failed', e));`],
          ],
        },
        callout: {
          type: 'warn',
          title: "Don't forget await",
          body: `Without <code>await</code>, you get the <code>Promise</code> rather than the value, and any error it throws is
            not caught by your <code>try</code>. The ESLint rule <code>@typescript-eslint/no-floating-promises</code> catches
            this.`,
        },
      },
      {
        id: 'errors',
        title: 'Errors in async code',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`try {
    User u = loadUser(id).get();
} catch (ExecutionException e) {
    handle(e.getCause());
}`, `try {
  const u = await loadUser(id);
} catch (e) {
  handle(e);
}`],
          ],
        },
      },
      {
        id: 'parallel',
        title: 'Running in parallel',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`var userF = loadUser(id);
var ordersF = loadOrders(id);
CompletableFuture.allOf(userF, ordersF).join();
User user = userF.join();
List<Order> orders = ordersF.join();`, `const [user, orders] = await Promise.all([
  loadUser(id),
  loadOrders(id),
]);`],
            [`CompletableFuture.anyOf(primary, backup).join();   // first to finish`, `await Promise.race([primary, backup]);   // first to finish`],
            ['', `await Promise.any([primary, backup]);    // first to succeed`, 'Combine exceptionally() and anyOf()'],
            ['', `const results = await Promise.allSettled(tasks);
// [{ status: 'fulfilled', value }, { status: 'rejected', reason }]`, 'Collect each future yourself'],
          ],
        },
      },
      {
        id: 'timers',
        title: 'Sleeping and timeouts',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`Thread.sleep(1000);`, `import { setTimeout as sleep } from 'node:timers/promises';
await sleep(1000);`],
            [`HttpResponse<String> res = client.send(
    HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(5)).build(),
    BodyHandlers.ofString());`, `const res = await fetch(url, { signal: AbortSignal.timeout(5000) });`],
            [`String body = res.body();
User u = mapper.readValue(body, User.class);`, `const u = (await res.json()) as User;   // unchecked: see Common Gotchas`],
          ],
        },
      },
      {
        id: 'threads',
        title: 'Threads and concurrency',
        compare: {
          sel: {},
          pw: {},
          segs: [
            [`ExecutorService pool = Executors.newFixedThreadPool(4);`, `// not needed for I/O: one thread handles many requests at once`],
            [`synchronized (lock) { counter++; }`, `counter++;              // no other code runs in between`],
            [`// CPU-heavy work on a background thread`, `import { Worker } from 'node:worker_threads';
new Worker(new URL('./resize.js', import.meta.url));`],
          ],
        },
        callout: {
          type: 'diff',
          body: `Only one piece of your code runs at a time, so there are no data races and no locks. Other code can still run
            at every <code>await</code>, so values you read before an <code>await</code> may have changed after it. Long
            CPU-bound loops block everything, so move them to a worker thread.`,
        },
      },
    ],
  },
];
