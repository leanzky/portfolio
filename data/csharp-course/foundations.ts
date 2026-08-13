import type { Module } from "./types";

/** Modules 00–03: the platform, the language, design, and async. */
export const foundationModules: Module[] = [
  {
    id: "orientation",
    number: "00",
    title: "Orientation: what .NET actually is",
    blurb:
      "Before writing code, get the vocabulary straight. Half of what makes job ads confusing is that the platform was renamed twice and the old names never died.",
    outcome:
      "You can read any .NET job posting and know exactly which technology it means, and you can create, run, and debug a project from the command line.",
    lessons: [
      {
        id: "landscape",
        title: "The landscape in one page",
        minutes: 30,
        summary:
          "C# is the language. .NET is the platform it runs on. The confusion comes from three generations of that platform sharing similar names.",
        why: "Interviewers ask 'what is the difference between .NET Framework and .NET Core?' constantly, because it instantly separates people who read a tutorial from people who understand what they are running on.",
        points: [
          ".NET Framework 4.8 is the old, Windows-only platform from 2002. It is in maintenance mode, still runs an enormous amount of enterprise software, and a lot of job ads that say '.NET' mean this.",
          ".NET Core 1–3.1 was the cross-platform rewrite. At version 5 Microsoft dropped the word 'Core' — so .NET 5, 6, 7, 8, 9, 10 are the continuation of .NET Core, not of .NET Framework.",
          "Even-numbered releases (6, 8, 10) are LTS — Long Term Support, 3 years. Odd ones are STS, 18 months. Companies overwhelmingly run LTS versions, so target the current LTS unless told otherwise.",
          "The pieces: the CLR (runtime that executes your code, handles garbage collection and JIT), the BCL (the built-in class library — List, HttpClient, File), the SDK (compiler plus the dotnet CLI), and NuGet (the package manager, npm's equivalent).",
          "Your C# compiles to IL (intermediate language) in an assembly (.dll), which the CLR JIT-compiles to machine code at runtime. This is why decompilers like ILSpy can read any .NET binary, and why 'obfuscation' is a product category in this ecosystem.",
          "ASP.NET Core is the web framework built on .NET: web APIs, MVC, Razor Pages, Blazor, SignalR. Entity Framework Core is the ORM. MAUI is mobile/desktop. Those five names cover most job descriptions.",
        ],
        code: [
          {
            caption: "Check what you actually have installed",
            language: "bash",
            code: `dotnet --version         # SDK version driving the CLI
dotnet --list-sdks       # every SDK installed
dotnet --list-runtimes   # every runtime that can execute apps
dotnet --info            # everything, plus your OS/architecture`,
          },
        ],
        pitfalls: [
          "Assuming a tutorial written for .NET Framework applies to .NET 8. Template code differs enough (especially Program.cs and Startup.cs) that you will get lost. Check the publication date and version on every tutorial.",
          "Installing the Runtime when you needed the SDK. The Runtime only runs apps; the SDK builds them. Install the SDK.",
        ],
        interview: [
          {
            q: "What is the difference between .NET Framework and .NET (Core)?",
            a: "Framework is the legacy Windows-only platform, last version 4.8, still supported but not getting new features. Modern .NET is a cross-platform rewrite that runs on Linux, macOS and Windows, is open source, ships side-by-side versions, and is significantly faster. New work should target the current LTS release; Framework work is usually maintenance of existing systems.",
          },
          {
            q: "What is the CLR?",
            a: "The Common Language Runtime — the virtual machine that executes .NET code. It JIT-compiles IL to native instructions, and provides garbage collection, type safety, and exception handling. Analogous to the JVM.",
          },
        ],
        practice:
          "Install the current LTS SDK from dotnet.microsoft.com, then run all four commands above and note down which runtimes you have. Write yourself one sentence explaining what a runtime is without using the word 'runtime'.",
      },
      {
        id: "toolchain",
        title: "Toolchain: CLI, projects, solutions, NuGet",
        minutes: 45,
        summary:
          "The dotnet CLI does everything an IDE does. Learning it first means you understand what the IDE buttons are actually doing.",
        why: "Every CI pipeline you will ever touch runs dotnet restore, dotnet build, dotnet test — not a GUI. Knowing the CLI is what lets you debug a broken build on a server.",
        points: [
          "A project (.csproj) is one compiled unit — one dll or exe. A solution (.sln) is just a container that groups projects so tooling can build them together. Real applications are many projects in one solution.",
          "dotnet new is the template engine: 'console', 'classlib', 'webapi', 'xunit', 'blazor', 'mvc'. Run dotnet new list to see them all.",
          "The .csproj is XML and is meant to be read and hand-edited. Modern SDK-style projects are short — they include all .cs files in the folder automatically, so you never list source files.",
          "NuGet packages are added with dotnet add package. They land in the .csproj as a PackageReference; restore downloads them to a global cache, not into your repo. There is no node_modules.",
          "bin/ and obj/ are build output and must never be committed — the default .gitignore for dotnet handles it (dotnet new gitignore).",
          "IDE choice: Visual Studio 2022 Community on Windows is the full experience and what most .NET shops use. VS Code plus the C# Dev Kit extension is lighter and cross-platform. JetBrains Rider is the paid favourite. Learn one deeply; the CLI is the common denominator.",
        ],
        code: [
          {
            caption: "Create a realistic solution from scratch",
            language: "bash",
            code: `dotnet new sln -n ShopApi
dotnet new webapi -n ShopApi.Api
dotnet new classlib -n ShopApi.Core
dotnet new xunit -n ShopApi.Tests

dotnet sln add ShopApi.Api ShopApi.Core ShopApi.Tests
dotnet add ShopApi.Api reference ShopApi.Core
dotnet add ShopApi.Tests reference ShopApi.Core

dotnet add ShopApi.Api package Serilog.AspNetCore
dotnet restore
dotnet build
dotnet run --project ShopApi.Api`,
          },
          {
            caption: "An SDK-style project file, annotated",
            language: "xml",
            code: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <!-- Nullable reference types on: the compiler warns about possible nulls -->
    <Nullable>enable</Nullable>
    <!-- Lets you skip "using System;" in every file -->
    <ImplicitUsings>enable</ImplicitUsings>
    <!-- Recommended: make warnings fail the build so they never pile up -->
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.3" />
  </ItemGroup>
</Project>`,
          },
        ],
        pitfalls: [
          "Committing bin/ and obj/. It bloats the repo and causes bizarre 'file is locked' errors for collaborators.",
          "Adding a package to the wrong project in a multi-project solution, then wondering why the type is not found. Always pass the project explicitly: dotnet add <project> package <name>.",
        ],
        interview: [
          {
            q: "What is the difference between dotnet build, dotnet run, and dotnet publish?",
            a: "build compiles to bin/Debug for local development. run builds then executes. publish produces a self-contained, deployment-ready folder — trimmed of build artefacts, with dependencies resolved and configuration for the target runtime. Deployments use publish output, never bin/.",
          },
        ],
        practice:
          "Build the ShopApi solution above by hand. Open the .csproj files and read every line. Then delete bin/ and obj/ and rebuild to prove nothing important lived there.",
      },
      {
        id: "first-program",
        title: "How a C# program starts and runs",
        minutes: 40,
        summary:
          "Top-level statements, namespaces, assemblies, and what actually happens between pressing run and seeing output.",
        why: "Modern templates hide Main() behind top-level statements. If you have never seen the expanded form, older codebases — which is most codebases — will look alien.",
        points: [
          "Every executable needs an entry point. Classically that is static void Main(string[] args) inside a class. Since C# 9, a single file can use top-level statements and the compiler generates that wrapper for you.",
          "Namespaces organise types and prevent name collisions; file-scoped namespaces (namespace Shop.Api; with a semicolon) are the modern form and save a level of indentation.",
          "using directives import namespaces. ImplicitUsings adds the common ones (System, System.Linq, System.Collections.Generic) automatically for every file.",
          "Debug builds keep symbols and skip optimisations so you can step through code. Release builds optimise and are what you deploy. A bug that only appears in Release is usually a timing or optimisation assumption.",
          "Console.WriteLine is your first debugging tool, but learn the actual debugger early: breakpoints, step over/into, watch windows, and conditional breakpoints will save you hundreds of hours.",
        ],
        code: [
          {
            caption: "The same program, both styles",
            language: "csharp",
            code: `// Modern: top-level statements (Program.cs)
var name = args.Length > 0 ? args[0] : "world";
Console.WriteLine($"Hello, {name}!");

// What the compiler generates for you:
namespace HelloApp;

internal class Program
{
    private static void Main(string[] args)
    {
        var name = args.Length > 0 ? args[0] : "world";
        Console.WriteLine($"Hello, {name}!");
    }
}`,
          },
        ],
        pitfalls: [
          "Putting business logic in Program.cs because the template started you there. Move anything beyond wiring into its own class in its own file the moment it grows past a few lines.",
          "Only one file per project may use top-level statements. A second one is a compile error.",
        ],
        interview: [
          {
            q: "What is an assembly?",
            a: "The compiled output of a project — a .dll or .exe containing IL, metadata describing every type, and a manifest with version and dependency information. It is the unit of deployment, versioning, and security in .NET.",
          },
        ],
        practice:
          "Write a console app that takes a number as a command-line argument and prints the FizzBuzz sequence up to it. Set a breakpoint inside the loop, run under the debugger, and inspect the loop variable. Then handle the case where the argument is missing or not a number.",
      },
      {
        id: "reading-errors",
        title: "Reading errors, and using the docs like a professional",
        minutes: 25,
        summary:
          "C# error messages are precise and consistently coded. Learning to read a stack trace is a bigger productivity win than any language feature.",
        why: "In a real job, most of your day is spent understanding code and failures that you did not write. Nobody expects you to know everything; they expect you to diagnose efficiently.",
        points: [
          "Compiler errors have codes (CS0246 = type or namespace not found, usually a missing using or package reference; CS8618 = non-nullable field not initialised). Searching the code finds the exact explanation.",
          "Read a stack trace bottom-up to see the call chain, then top-down for the throw site. The first line of your own code in the trace is nearly always where to start.",
          "InnerException matters. An 'An error occurred while saving' from EF Core is useless; its InnerException naming a foreign-key constraint is the real message. Always log or inspect the full exception chain.",
          "learn.microsoft.com is the canonical documentation and genuinely good — the language reference, API browser, and tutorials are all first-party. Always check the version selector matches your target framework.",
          "The source of the framework itself is on GitHub (dotnet/runtime, dotnet/aspnetcore). Reading how HttpClient or the DI container is implemented is a legitimate and fast way to answer 'but what does it actually do?'.",
        ],
        pitfalls: [
          "Copying a fix from Stack Overflow that targets .NET Framework or an old .NET Core version. Check the date and the API before pasting.",
          "Catching an exception and logging only ex.Message. You lose the stack trace and the inner exception — log the whole exception object.",
        ],
        practice:
          "Deliberately break your FizzBuzz app four ways: misspell a type, remove a using, dereference a null, and index past the end of an array. Read each error and write down the code and what it means in your own words.",
      },
    ],
  },

  {
    id: "language-core",
    number: "01",
    title: "C# language core",
    blurb:
      "The parts of the language you use every single day, plus the parts interviewers reliably probe. Coming from Python or TypeScript, the type system is the real adjustment.",
    outcome:
      "You can read and write idiomatic modern C# without looking up syntax, and you can explain value versus reference semantics with confidence.",
    lessons: [
      {
        id: "types-memory",
        title: "Value types, reference types, and where things live",
        minutes: 60,
        summary:
          "The single most-tested concept in C# interviews, and the source of the most confusing bugs for people arriving from JavaScript or Python.",
        why: "This distinction explains why a method sometimes changes your object and sometimes does not. Getting it wrong produces bugs that are invisible in code review.",
        points: [
          "Value types (int, double, bool, char, DateTime, all structs, all enums) hold their data directly. Assigning one copies the value.",
          "Reference types (class, string, array, List, delegate, interface) hold a reference to data elsewhere. Assigning one copies the reference — both variables now point at the same object.",
          "The usual shorthand is 'value types on the stack, reference types on the heap'. It is close enough for interviews but not strictly true: a value type inside a class lives on the heap with its owner. Say the accurate version and you stand out.",
          "string is a reference type that behaves like a value type: it is immutable, and equality compares content, not identity. Every 'modification' allocates a new string.",
          "Boxing is wrapping a value type in an object so it can be treated as a reference type. It allocates and costs performance — the reason generics exist and why List<int> beats the ancient ArrayList.",
          "Passing arguments: by default everything is passed by value (for a reference type, the reference is copied). ref passes the variable itself, out is ref that must be assigned by the callee, and in passes a read-only reference.",
        ],
        code: [
          {
            caption: "The behaviour that trips everyone up",
            language: "csharp",
            code: `// Value type: independent copy
int a = 5;
int b = a;
b = 10;
Console.WriteLine(a); // 5 — unaffected

// Reference type: same object, two names
var list1 = new List<string> { "x" };
var list2 = list1;
list2.Add("y");
Console.WriteLine(list1.Count); // 2 — the "other" list changed

// Reassigning the parameter does NOT affect the caller...
static void Reassign(List<string> items) => items = new List<string>();
// ...but mutating the object does.
static void Mutate(List<string> items) => items.Add("added");

// ref makes reassignment visible to the caller
static void ReallyReassign(ref List<string> items) => items = new List<string>();`,
          },
          {
            caption: "Boxing, and how to see it",
            language: "csharp",
            code: `int number = 42;
object boxed = number;      // boxing: allocates on the heap
int unboxed = (int)boxed;   // unboxing: cast back

// Why generics matter: no boxing, and type safety at compile time
List<int> fast = new() { 1, 2, 3 };          // stays as int
System.Collections.ArrayList slow = new();    // boxes every int
slow.Add(1);`,
          },
        ],
        pitfalls: [
          "Mutable structs. A struct that changes its own state produces baffling bugs because you are often modifying a copy. Keep structs small and immutable, or use a class.",
          "Comparing reference types with == expecting content equality. For your own classes that compares references unless you override equality — or use a record, which does it for you.",
        ],
        interview: [
          {
            q: "Explain the difference between a struct and a class.",
            a: "A struct is a value type: copied on assignment, no inheritance (other than interfaces), cheap to allocate, and good for small immutable data like a coordinate or a money amount. A class is a reference type: copied by reference, supports inheritance, and is the default choice for anything with identity or behaviour. Guidance is to use a struct only when the type is small, immutable, logically a single value, and short-lived.",
          },
          {
            q: "Is string a value type or a reference type?",
            a: "A reference type, but immutable and with value equality semantics, so it behaves like a value type in everyday use. Immutability is why repeated concatenation in a loop is expensive and why StringBuilder exists.",
          },
          {
            q: "What is boxing and why should you care?",
            a: "Converting a value type to object, which allocates a heap object and copies the value. It costs an allocation and adds garbage collection pressure. It matters in hot paths — generics and Span exist largely to avoid it.",
          },
        ],
        practice:
          "Write a small program with a Point struct and a Point class, both mutable. Pass each into a method that changes X, print the results, and explain out loud why they differ. Then make the struct immutable with readonly and see which line stops compiling.",
      },
      {
        id: "nullability",
        title: "Null safety: the feature that changes how you write C#",
        minutes: 45,
        summary:
          "Nullable reference types turn 'this might be null' from a runtime surprise into a compiler warning. Modern codebases have this on.",
        why: "NullReferenceException is the most common production crash in .NET history. A candidate who writes null-aware code by default looks experienced immediately.",
        points: [
          "With <Nullable>enable</Nullable>, string means 'never null' and string? means 'may be null'. The compiler tracks flow and warns when you dereference something that could be null.",
          "Operators to know: ?. (null-conditional call), ?? (null-coalescing default), ??= (assign if null), and ! (null-forgiving — tells the compiler you know better).",
          "The ! operator is a promise, not a check. Every use is a place you have taken responsibility for a crash. Use it rarely and deliberately.",
          "Guard clauses at the top of a method beat nested ifs. ArgumentNullException.ThrowIfNull(x) is the one-liner for it.",
          "required members and init-only setters let you build objects that are impossible to construct in an invalid state — the compiler enforces that the caller supplies them.",
          "Prefer returning an empty collection over null. Callers can foreach an empty list; they crash on a null one.",
        ],
        code: [
          {
            caption: "Null-aware code in practice",
            language: "csharp",
            code: `public class Customer
{
    public required string Name { get; init; }   // caller must supply it
    public string? MiddleName { get; init; }     // genuinely optional
    public List<Order> Orders { get; init; } = []; // never null
}

public string DescribeCustomer(Customer? customer)
{
    // Guard clause: fail fast, at the boundary, with a clear message
    ArgumentNullException.ThrowIfNull(customer);

    var middle = customer.MiddleName ?? "(none)";
    var firstOrderId = customer.Orders.FirstOrDefault()?.Id ?? 0;

    return $"{customer.Name}, middle: {middle}, first order: {firstOrderId}";
}

// Pattern matching reads better than != null
if (customer is not null && customer.Orders is { Count: > 0 })
{
    Console.WriteLine("Has orders");
}`,
          },
        ],
        pitfalls: [
          "Sprinkling ! to silence warnings. You have not fixed anything — you have hidden the compiler's correct opinion and kept the crash.",
          "Nullable annotations do not exist at runtime. Data crossing a boundary (JSON, database, an old library) can still hand you a null in a non-nullable field. Validate at boundaries.",
        ],
        interview: [
          {
            q: "How do you avoid NullReferenceException?",
            a: "Enable nullable reference types so the compiler flags risky dereferences; use guard clauses to reject nulls at method boundaries; prefer required and init to make invalid objects unconstructible; return empty collections rather than null; and validate external input at the edge of the system, because annotations are compile-time only.",
          },
        ],
        practice:
          "Take your FizzBuzz app, enable Nullable and TreatWarningsAsErrors in the csproj, and fix every warning without using the ! operator once.",
      },
      {
        id: "collections",
        title: "Collections and the interfaces above them",
        minutes: 50,
        summary:
          "Which collection to reach for, and why the type you declare in a method signature matters more than the one you instantiate.",
        why: "Choosing List where a Dictionary belongs turns an O(1) lookup into an O(n) scan. This is the most common self-inflicted performance problem in application code.",
        points: [
          "List<T> — ordered, index access, the default. Add is O(1) amortised, Contains is O(n).",
          "Dictionary<TKey, TValue> — key lookup in O(1). If you are writing list.FirstOrDefault(x => x.Id == id) inside a loop, you want a dictionary.",
          "HashSet<T> — unique membership, O(1) Contains. Ideal for de-duplication and 'have I seen this?' checks.",
          "Queue<T> and Stack<T> — FIFO and LIFO. Rarer in business code, common in interview questions.",
          "The interfaces: IEnumerable<T> is 'you can iterate this, once, forward'. ICollection<T> adds Count and Add. IList<T> adds indexing. IReadOnlyList<T> exposes reading without allowing mutation.",
          "Accept the least specific interface you can in parameters (IEnumerable<T>) and return the most useful concrete-but-safe type (IReadOnlyList<T> or a materialised List<T>). This keeps callers flexible without leaking mutability.",
          "IQueryable<T> looks like IEnumerable<T> but builds a query to be translated (to SQL, by EF Core). Confusing the two is how you accidentally load a whole table into memory.",
          "yield return builds a lazy sequence — elements are produced only as the consumer asks for them.",
        ],
        code: [
          {
            caption: "Picking the right structure",
            language: "csharp",
            code: `// O(n) per lookup inside a loop = O(n*m) overall
foreach (var order in orders)
{
    var customer = customers.FirstOrDefault(c => c.Id == order.CustomerId);
}

// O(1) per lookup: build the index once
var byId = customers.ToDictionary(c => c.Id);
foreach (var order in orders)
{
    if (byId.TryGetValue(order.CustomerId, out var customer))
    {
        // TryGetValue avoids both a double lookup and a KeyNotFoundException
    }
}`,
          },
          {
            caption: "Lazy sequences with yield",
            language: "csharp",
            code: `public static IEnumerable<int> ReadNumbers(string path)
{
    foreach (var line in File.ReadLines(path))   // streams, does not load the file
    {
        if (int.TryParse(line, out var value))
        {
            yield return value;                  // produced on demand
        }
    }
}

// Nothing has been read yet at this point:
var numbers = ReadNumbers("data.txt");
// Reading starts here, and stops after 10 items:
var firstTen = numbers.Take(10).ToList();`,
          },
        ],
        pitfalls: [
          "Modifying a collection while iterating it. It throws InvalidOperationException. Iterate a copy (ToList()) or build a new collection.",
          "Returning IEnumerable<T> backed by a database query or a file handle from a service — the caller may enumerate it after the connection is disposed. Materialise before returning.",
        ],
        interview: [
          {
            q: "When would you use a Dictionary instead of a List?",
            a: "When you look items up by a key more often than you enumerate them. Dictionary gives O(1) average lookup versus O(n) for scanning a list. The cost is memory overhead and losing insertion order as a first-class concept.",
          },
          {
            q: "What is the difference between IEnumerable and IQueryable?",
            a: "IEnumerable executes in memory with LINQ to Objects — once you switch to it, everything after runs on the client. IQueryable builds an expression tree that a provider like EF Core translates into SQL, so filtering happens in the database. Calling AsEnumerable or ToList too early forces the whole table into memory.",
          },
        ],
        practice:
          "Generate 100,000 records, then find 1,000 of them by id twice: once with FirstOrDefault over a List and once via a Dictionary. Time both with Stopwatch. The number you see is the reason this lesson exists.",
      },
      {
        id: "linq",
        title: "LINQ, properly",
        minutes: 60,
        summary:
          "LINQ is how C# developers express data transformations. Fluency here is assumed in every interview, and deferred execution is the part people get wrong.",
        why: "You will use LINQ in almost every method you write, and again through EF Core against the database. Sloppy LINQ becomes slow SQL.",
        points: [
          "Method syntax (collection.Where(x => ...)) is what real codebases use. Query syntax (from x in collection where ...) exists and appears in older code; be able to read it.",
          "Deferred execution: Where, Select, OrderBy build a query but do not run it. Execution happens when you enumerate — foreach, ToList, ToArray, Count, First, Any.",
          "That means a query variable re-runs every time you enumerate it. Enumerating a database query three times means three round trips. ToList() once, then reuse.",
          "First vs FirstOrDefault vs Single vs SingleOrDefault: First throws if empty; FirstOrDefault returns null/default; Single throws if there is not exactly one; SingleOrDefault throws if there is more than one. Use Single when 'more than one' is a bug you want to hear about.",
          "Any() is what you want for existence checks — Count() > 0 may enumerate everything.",
          "GroupBy returns groups with a Key and the items; combined with Select it covers most reporting requirements.",
          "Select projects to a new shape (map), SelectMany flattens nested collections (flatMap), Aggregate folds (reduce).",
        ],
        code: [
          {
            caption: "The queries you will write weekly",
            language: "csharp",
            code: `var topCustomers = orders
    .Where(o => o.PlacedAt >= DateTime.UtcNow.AddDays(-30))
    .GroupBy(o => o.CustomerId)
    .Select(g => new
    {
        CustomerId = g.Key,
        Total = g.Sum(o => o.Amount),
        Count = g.Count()
    })
    .Where(x => x.Total > 1000)
    .OrderByDescending(x => x.Total)
    .Take(10)
    .ToList();   // one execution, right here

// Flattening
var allItems = orders.SelectMany(o => o.Items).ToList();

// Existence, cheaply
bool hasPending = orders.Any(o => o.Status == OrderStatus.Pending);

// Exactly one, or it is a bug
var config = settings.Single(s => s.Key == "ConnectionString");`,
          },
          {
            caption: "Deferred execution biting you",
            language: "csharp",
            code: `var query = customers.Where(c => c.IsActive);   // nothing has run

customers.Add(new Customer { Name = "Late", IsActive = true });

Console.WriteLine(query.Count());  // includes "Late" — the query ran just now

var snapshot = customers.Where(c => c.IsActive).ToList(); // frozen at this moment`,
          },
        ],
        pitfalls: [
          "Calling ToList() in the middle of a chain 'to be safe'. Against a database that pulls every row into memory before filtering.",
          "Multiple enumeration. If you foreach a query and then Count() it, you did the work twice. Some analysers flag this; take the warning seriously.",
          "Side effects inside Select. LINQ is meant to be a transformation; hiding a save or a log call inside it makes the code lie about what it does.",
        ],
        interview: [
          {
            q: "What is deferred execution in LINQ?",
            a: "Most LINQ operators return a query object rather than results. The query only runs when enumerated — by foreach, ToList, Count, First, and so on. It allows composing queries efficiently, but it means the same query variable can produce different results at different times, and enumerating it repeatedly repeats the work.",
          },
          {
            q: "First versus Single?",
            a: "First returns the first match and throws if there are none; Single asserts there is exactly one and throws if there are zero or more than one. Using Single documents an invariant — if a second row appears, you want the exception rather than silently taking one at random.",
          },
        ],
        practice:
          "Given a list of orders, produce: total revenue per month, the top 5 products by quantity, and every customer with no orders in the last 90 days. Write each as a single LINQ chain, then rewrite one of them as a foreach loop and compare how they read.",
      },
      {
        id: "strings-dates",
        title: "Strings, dates, and formatting without bugs",
        minutes: 35,
        summary:
          "Two mundane areas that produce a surprising share of production incidents, especially across time zones and cultures.",
        why: "Every business application handles money, dates, and user-visible text. A candidate who mentions UTC and culture-invariant parsing unprompted signals real experience.",
        points: [
          "String interpolation ($\"...\") is the default. Composite formatting and concatenation still appear in old code.",
          "Strings are immutable: building one in a loop with += allocates a new string every iteration. Use StringBuilder past a handful of concatenations.",
          "Comparison: use string.Equals(a, b, StringComparison.OrdinalIgnoreCase) for identifiers and keys. Culture-sensitive comparison for user-facing sorting only. The infamous example is Turkish, where uppercasing 'i' does not give 'I'.",
          "Store and compute in UTC — DateTime.UtcNow, never DateTime.Now — and convert to local time only for display. DateTimeOffset carries the offset with it and is usually the better choice for timestamps.",
          "DateOnly and TimeOnly exist now for the cases where a time component was always meaningless (a birthday, an opening hour).",
          "Money is decimal, never double. double is binary floating point and cannot represent 0.1 exactly; decimal is base 10 and designed for currency.",
          "Parse defensively: TryParse over Parse for anything from a user or a file, and CultureInfo.InvariantCulture for machine-readable data.",
        ],
        code: [
          {
            caption: "Small choices that prevent incidents",
            language: "csharp",
            code: `// Money
decimal price = 19.99m;             // NOT double
Console.WriteLine(price.ToString("C", new CultureInfo("en-PH"))); // currency format

// Time
var createdAt = DateTimeOffset.UtcNow;                 // store this
var display = createdAt.ToLocalTime().ToString("f");   // show this

// Parsing input you do not control
if (!decimal.TryParse(input, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount))
{
    return Results.BadRequest("Amount is not a valid number.");
}

// Building strings in a loop
var sb = new StringBuilder();
foreach (var line in lines) sb.AppendLine(line.Trim());
var report = sb.ToString();`,
          },
        ],
        pitfalls: [
          "Using double for currency. Rounding errors accumulate and accounting will find them.",
          "Storing local times in the database. Daylight saving and multi-region users make the data unrecoverable.",
          "Using ToUpper() to compare strings — it allocates and is culture-dependent. Use StringComparison.OrdinalIgnoreCase.",
        ],
        interview: [
          {
            q: "Why decimal instead of double for money?",
            a: "double is IEEE binary floating point: values like 0.1 have no exact representation, so arithmetic accumulates tiny errors. decimal is a 128-bit base-10 type with 28–29 significant digits, exact for the values money actually takes. It is slower, which does not matter for business arithmetic.",
          },
        ],
        practice:
          "Write a method that takes a list of transactions with amounts and UTC timestamps and produces a monthly statement in a given time zone and currency. Then write a test that would fail if you had used DateTime.Now.",
      },
    ],
  },

  {
    id: "design",
    number: "02",
    title: "Object design and modern C#",
    blurb:
      "How to structure types so that code stays changeable. This is the material that separates 'can write C#' from 'can be trusted with a feature'.",
    outcome:
      "You can design a small set of classes and interfaces that a reviewer would accept, and justify each choice.",
    lessons: [
      {
        id: "classes-records",
        title: "Classes, records, and structs — choosing deliberately",
        minutes: 45,
        summary:
          "Three ways to define a type, with different equality, mutability, and copying behaviour.",
        why: "Reaching for record for DTOs and class for services is the current idiom. Using them correctly makes your code look current; using class for everything looks like a 2015 tutorial.",
        points: [
          "class — reference type, identity-based equality, mutable by default. Use for anything with behaviour or a lifecycle: services, entities, controllers.",
          "record — a class with compiler-generated value equality, ToString, and a with expression for non-destructive copies. Ideal for DTOs, API contracts, query results, and value objects.",
          "record struct — a value type with the same conveniences, for small data.",
          "Properties are the public surface, fields are private state. Auto-properties (public string Name { get; set; }) cover most cases; init makes them settable only during construction.",
          "Primary constructors (public class Service(IRepo repo)) reduce ceremony, and are especially neat for dependency injection.",
          "Prefer immutability where you can. An object that cannot change after construction cannot be corrupted by a caller or by another thread.",
        ],
        code: [
          {
            caption: "Each type doing its job",
            language: "csharp",
            code: `// DTO / contract: value equality, immutable, cheap to copy
public record OrderSummary(Guid Id, string CustomerName, decimal Total)
{
    public OrderSummary WithDiscount(decimal pct) => this with { Total = Total * (1 - pct) };
}

// Value object: small, immutable, compared by value
public readonly record struct Money(decimal Amount, string Currency);

// Service: behaviour and dependencies, primary constructor
public class OrderService(IOrderRepository repository, ILogger<OrderService> logger)
{
    public async Task<OrderSummary?> GetAsync(Guid id, CancellationToken ct)
    {
        var order = await repository.FindAsync(id, ct);
        if (order is null)
        {
            logger.LogWarning("Order {OrderId} not found", id);
            return null;
        }
        return new OrderSummary(order.Id, order.Customer.Name, order.Total);
    }
}

// Records compare by value:
var a = new OrderSummary(id, "Ana", 100m);
var b = new OrderSummary(id, "Ana", 100m);
Console.WriteLine(a == b); // True — a class would print False`,
          },
        ],
        pitfalls: [
          "Using a record for an EF Core entity. Entities have identity and mutable state tracked by the ORM; value equality fights that model.",
          "Public settable properties on everything. If a property should never change after creation, use init or a private setter and say so in the type.",
        ],
        interview: [
          {
            q: "What problem do records solve?",
            a: "They remove the boilerplate around immutable data types: value-based equality and GetHashCode, a readable ToString, deconstruction, and with expressions for copies with modifications. They express intent — this type is data, defined by its values, not an entity with identity.",
          },
        ],
        practice:
          "Model a small domain — Invoice, LineItem, Customer, Money — deciding class versus record versus record struct for each, and write one paragraph defending each choice.",
      },
      {
        id: "interfaces-di",
        title: "Interfaces, abstraction, and dependency inversion",
        minutes: 50,
        summary:
          "Why professional C# is written against interfaces, and how that connects directly to testing and to the DI container you will meet in ASP.NET Core.",
        why: "Nearly every ASP.NET Core codebase is organised around constructor injection of interfaces. Understanding why makes the framework feel obvious rather than magical.",
        points: [
          "An interface is a contract: the members a type promises to provide, with no implementation. A class can implement many interfaces but inherit only one base class.",
          "Abstract classes sit between: they can hold shared implementation and state. Use an abstract class when implementations genuinely share code; use an interface when you only need the contract.",
          "Dependency inversion: high-level code should depend on abstractions, not concrete details. Your OrderService should depend on IEmailSender, not on SmtpEmailSender.",
          "This is what makes code testable. A test can supply a fake IEmailSender, so testing the service does not send email.",
          "Do not create an interface for every class reflexively. An interface with exactly one implementation that will never have another is ceremony. Create them at real seams: I/O, external services, data access, anything slow or nondeterministic.",
          "Composition over inheritance: deep inheritance hierarchies are brittle. Prefer small collaborating objects. Inheritance is for genuine 'is-a' relationships with shared behaviour.",
        ],
        code: [
          {
            caption: "Depending on an abstraction, and testing it",
            language: "csharp",
            code: `public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body, CancellationToken ct = default);
}

public class OrderService(IOrderRepository repository, IEmailSender email)
{
    public async Task PlaceAsync(Order order, CancellationToken ct)
    {
        await repository.AddAsync(order, ct);
        await email.SendAsync(order.CustomerEmail, "Order received", $"Total: {order.Total:C}", ct);
    }
}

// In a test, no SMTP server exists — and that is the point.
public class FakeEmailSender : IEmailSender
{
    public List<string> Sent { get; } = [];
    public Task SendAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        Sent.Add(to);
        return Task.CompletedTask;
    }
}`,
          },
        ],
        pitfalls: [
          "Interfaces named after their single implementation (IOrderServiceImpl). Name interfaces after the capability, not the class.",
          "Leaking implementation detail through the interface — an IRepository that returns IQueryable ties every caller to EF Core.",
        ],
        interview: [
          {
            q: "Interface or abstract class?",
            a: "Interface when you need a contract that unrelated types can implement, and because C# allows only single inheritance. Abstract class when implementations share real code or state and form a genuine hierarchy. In modern C# most abstraction is via interfaces, with default interface methods available for the rare case where you need to add a member without breaking implementers.",
          },
          {
            q: "Why is dependency injection useful?",
            a: "It inverts control of dependency creation: a class declares what it needs and receives it, rather than constructing it. That makes dependencies explicit and visible in the constructor, lets you swap implementations per environment, and makes unit testing possible without touching real infrastructure.",
          },
        ],
        practice:
          "Refactor a class that news up a HttpClient and a file logger inside itself so both arrive through the constructor as interfaces. Then write a unit test that would have been impossible before.",
      },
      {
        id: "solid",
        title: "SOLID, demonstrated rather than recited",
        minutes: 55,
        summary:
          "Five principles that get asked about by name. Knowing the acronym is worth nothing; showing a violation and its fix is worth a lot.",
        why: "'Tell me about SOLID' is a standard mid-level question. Most candidates recite definitions. Bringing a concrete before-and-after is memorable.",
        points: [
          "Single Responsibility — a class should have one reason to change. A class that fetches, formats, and emails a report has three.",
          "Open/Closed — extend behaviour by adding types, not by editing a switch statement in ten places. Strategy pattern via an interface is the usual tool.",
          "Liskov Substitution — any implementation must be usable wherever the abstraction is expected. If your implementation throws NotSupportedException for half the interface, the abstraction is wrong.",
          "Interface Segregation — many small focused interfaces beat one fat one. Nobody should implement members they do not need.",
          "Dependency Inversion — depend on abstractions; details depend on abstractions too. This is the one the framework itself enforces through DI.",
          "The honest caveat: these are heuristics, not laws. Over-applying them produces a maze of one-method interfaces. Reviewers value judgement about when a principle is worth its complexity.",
        ],
        code: [
          {
            caption: "Open/Closed: from switch to strategy",
            language: "csharp",
            code: `// Before: every new payment method edits this method
public decimal CalculateFee(string method, decimal amount) => method switch
{
    "gcash" => amount * 0.02m,
    "card"  => amount * 0.035m,
    _ => throw new NotSupportedException(method)
};

// After: a new method is a new class, nothing existing changes
public interface IFeeStrategy
{
    string Method { get; }
    decimal Calculate(decimal amount);
}

public class GcashFee : IFeeStrategy
{
    public string Method => "gcash";
    public decimal Calculate(decimal amount) => amount * 0.02m;
}

public class FeeCalculator(IEnumerable<IFeeStrategy> strategies)
{
    // The DI container injects every registered IFeeStrategy automatically
    public decimal Calculate(string method, decimal amount) =>
        strategies.Single(s => s.Method == method).Calculate(amount);
}`,
          },
        ],
        pitfalls: [
          "Splitting classes until each has one method, then needing eight of them to do anything. Cohesion matters as much as separation.",
          "Treating SOLID as a checklist in code review instead of a way of talking about coupling and change.",
        ],
        interview: [
          {
            q: "Give an example of the Single Responsibility Principle from your own code.",
            a: "Answer with a specific refactor: a class that did too much, the reasons it kept changing, how you split it, and what got easier afterwards (usually testing). Concrete beats textbook every time.",
          },
        ],
        practice:
          "Find the largest class in a project you have already written, list every reason it might need to change, and split it along those lines. Keep the tests passing.",
      },
      {
        id: "modern-syntax",
        title: "Pattern matching, generics, and extension methods",
        minutes: 45,
        summary:
          "The syntax that makes modern C# concise. Reviewers notice when you write C# 12 rather than C# 5 with newer keywords.",
        why: "Fluency in these features makes your code shorter and clearer, and shows you have followed the language rather than learned it once.",
        points: [
          "switch expressions replace long if/else chains and produce a value; the compiler checks you handled every case for enums.",
          "Property, type, relational, and list patterns let you match on shape: obj is Customer { Orders.Count: > 0 } c.",
          "Generics give type safety without duplication. Constraints (where T : class, where T : IComparable<T>, where T : new()) narrow what T can be so you can use its members.",
          "Extension methods add methods to types you do not own — the entire LINQ library is extension methods on IEnumerable<T>. Use them for genuinely general utilities, not to hide business logic.",
          "Tuples return multiple values without defining a type: (bool ok, string? error) Validate(...). Good for private helpers; prefer a record for public APIs.",
          "Collection expressions ([1, 2, 3] and [..first, ..second]) are the current short form for building collections.",
        ],
        code: [
          {
            caption: "Expressive, current C#",
            language: "csharp",
            code: `// switch expression with patterns
public static string Describe(object value) => value switch
{
    null => "nothing",
    int n when n < 0 => "negative number",
    int n => $"number {n}",
    string { Length: 0 } => "empty string",
    string s => $"text of length {s.Length}",
    Customer { Orders.Count: > 0 } c => $"{c.Name}, a returning customer",
    Customer c => $"{c.Name}, no orders yet",
    _ => value.GetType().Name
};

// Generic method with a constraint
public static T? MaxOrDefault<T>(IEnumerable<T> items) where T : IComparable<T>
{
    T? best = default;
    foreach (var item in items)
        if (best is null || item.CompareTo(best) > 0) best = item;
    return best;
}

// Extension method
public static class StringExtensions
{
    public static string Truncate(this string value, int max) =>
        value.Length <= max ? value : value[..max] + "...";
}

var headline = article.Title.Truncate(60);`,
          },
        ],
        pitfalls: [
          "Cramming a whole algorithm into one switch expression. If a branch needs three lines, use a method.",
          "Extension methods on object, or ones that quietly depend on global state. They are hard to discover and harder to test.",
        ],
        interview: [
          {
            q: "What are generics for?",
            a: "Writing code once that works over many types while keeping compile-time type safety and avoiding boxing. List<T> is the canonical example: one implementation, no casts, no runtime type errors, no allocation when storing value types.",
          },
        ],
        practice:
          "Rewrite a nested if/else chain from earlier work as a switch expression, and write one generic extension method you would genuinely reuse — for example Batch<T>(this IEnumerable<T> source, int size).",
      },
      {
        id: "exceptions",
        title: "Exceptions, resources, and failing well",
        minutes: 40,
        summary:
          "When to throw, when to catch, when to let it fly, and how to guarantee cleanup.",
        why: "Exception handling is where inexperience is most visible. A try/catch that swallows everything is an instant red flag in a code review or a take-home test.",
        points: [
          "Throw for exceptional conditions, not for control flow. A user submitting an invalid form is expected — return a validation result, do not throw.",
          "Catch only what you can handle. If you cannot do anything useful, let it propagate to a global handler that logs and returns a clean response.",
          "Never catch Exception and continue silently. Empty catch blocks hide the bug and turn a crash into corrupted data.",
          "throw; rethrows preserving the stack trace. throw ex; resets it and destroys the evidence — a classic interview trap.",
          "Custom exceptions carry meaning: OrderNotFoundException tells a handler exactly what happened and lets it map to a 404.",
          "using guarantees Dispose even if an exception is thrown — for file handles, database connections, HTTP responses. The declaration form (using var stream = ...) disposes at end of scope.",
          "finally runs regardless; use it when you need cleanup that is not IDisposable.",
        ],
        code: [
          {
            caption: "Handling failure honestly",
            language: "csharp",
            code: `public async Task<Order> GetOrderAsync(Guid id, CancellationToken ct)
{
    var order = await repository.FindAsync(id, ct);
    // A missing order is a real condition callers must handle
    return order ?? throw new OrderNotFoundException(id);
}

public class OrderNotFoundException(Guid id)
    : Exception($"Order {id} was not found.")
{
    public Guid OrderId { get; } = id;
}

// Catch narrowly, add context, preserve the original
try
{
    await paymentGateway.ChargeAsync(request, ct);
}
catch (HttpRequestException ex)
{
    logger.LogError(ex, "Payment gateway unreachable for order {OrderId}", request.OrderId);
    throw new PaymentUnavailableException("Payment service is unavailable.", ex);
}

// Deterministic cleanup
using var stream = File.OpenRead(path);
using var reader = new StreamReader(stream);
var content = await reader.ReadToEndAsync(ct);`,
          },
        ],
        pitfalls: [
          "catch (Exception) { } — the empty catch. It converts a loud failure into a silent one.",
          "throw ex; instead of throw;. You lose the original stack trace and the real origin of the bug.",
          "Using exceptions for expected validation. They are slow and they obscure the normal path.",
        ],
        interview: [
          {
            q: "What is the difference between throw and throw ex?",
            a: "throw rethrows the current exception preserving the original stack trace. throw ex resets the stack trace to the current line, so the actual origin is lost. Use throw, or wrap in a new exception passing the original as the inner exception.",
          },
          {
            q: "What does using do?",
            a: "It is syntactic sugar for try/finally that calls Dispose on an IDisposable, guaranteeing release of unmanaged resources — file handles, sockets, database connections — even when an exception is thrown. There is an await using form for IAsyncDisposable.",
          },
        ],
        practice:
          "Write a method that reads a JSON config file and returns a typed object. Handle: file missing, malformed JSON, and a missing required field — each with a distinct, meaningful outcome. No catch (Exception) allowed.",
      },
    ],
  },

  {
    id: "async",
    number: "03",
    title: "Async, concurrency, and performance",
    blurb:
      "Everything in ASP.NET Core is async. Understanding what await actually does is the difference between an app that handles a thousand users and one that falls over at fifty.",
    outcome:
      "You can write correct async code end to end, explain why it scales, and recognise the deadlock patterns that kill production apps.",
    lessons: [
      {
        id: "async-model",
        title: "The async/await mental model",
        minutes: 55,
        summary:
          "await does not create a thread. It releases the current one until the awaited work finishes. That single sentence is the whole point.",
        why: "This is the highest-value concept in server-side .NET, and one of the most common technical interview questions above junior level.",
        points: [
          "A web server has a limited pool of threads. If a thread sits blocked waiting for a database, it serves nobody. Async lets that thread go back to the pool and handle other requests, then resume yours when the data arrives.",
          "Task represents work that will complete; Task<T> completes with a value. ValueTask avoids an allocation when the result is often already available — used in hot paths, rarely in application code.",
          "async marks a method as containing awaits and lets the compiler build a state machine; await suspends the method and schedules the rest as a continuation.",
          "Async is about I/O — network, disk, database. It does not make CPU work faster. For CPU-bound parallelism you want Parallel.ForEach or Task.Run, which is a different tool.",
          "Async all the way: an async method should be awaited by an async caller. Mixing in a blocking call in the middle defeats the purpose and risks deadlock.",
          "Naming convention: suffix async methods with Async (GetOrderAsync). Return Task, not void — async void cannot be awaited and its exceptions crash the process.",
        ],
        code: [
          {
            caption: "Async through every layer",
            language: "csharp",
            code: `// Controller / endpoint
app.MapGet("/orders/{id}", async (Guid id, IOrderService service, CancellationToken ct) =>
{
    var order = await service.GetAsync(id, ct);
    return order is null ? Results.NotFound() : Results.Ok(order);
});

// Service
public async Task<OrderSummary?> GetAsync(Guid id, CancellationToken ct)
{
    var order = await repository.FindAsync(id, ct);   // thread is released here
    return order is null ? null : Map(order);
}

// Repository
public async Task<Order?> FindAsync(Guid id, CancellationToken ct) =>
    await db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);`,
          },
          {
            caption: "Concurrent versus sequential",
            language: "csharp",
            code: `// Sequential: 300ms + 300ms + 300ms
var user = await GetUserAsync(id, ct);
var orders = await GetOrdersAsync(id, ct);
var prefs = await GetPreferencesAsync(id, ct);

// Concurrent: about 300ms total, when the calls are independent
var userTask = GetUserAsync(id, ct);
var ordersTask = GetOrdersAsync(id, ct);
var prefsTask = GetPreferencesAsync(id, ct);
await Task.WhenAll(userTask, ordersTask, prefsTask);
var profile = new Profile(userTask.Result, ordersTask.Result, prefsTask.Result);`,
          },
        ],
        pitfalls: [
          "Task.WhenAll against a single EF Core DbContext. DbContext is not thread-safe — concurrent queries on one context throw. Use separate contexts or run them sequentially.",
          "async void anywhere except an event handler. Exceptions from it cannot be caught by the caller and will take down the process.",
        ],
        interview: [
          {
            q: "Does await create a new thread?",
            a: "No. await asynchronously waits for an operation to complete, releasing the current thread back to the pool in the meantime. For I/O the work is handled by the OS and completion ports, with no thread blocked at all. Only Task.Run or explicit threading moves work onto another thread, and that is for CPU-bound work.",
          },
          {
            q: "Why is async important in a web application?",
            a: "Thread pool threads are a limited resource. Blocking one on I/O means it cannot serve other requests, so throughput collapses under load and the pool grows to compensate, costing memory and context switching. Async frees threads during I/O so the same hardware handles far more concurrent requests.",
          },
        ],
        practice:
          "Write a console app that fetches five URLs. Time it sequentially, then with Task.WhenAll. Then convert a synchronous file-reading method into a proper async one and thread a CancellationToken through it.",
      },
      {
        id: "cancellation",
        title: "Cancellation, timeouts, and doing several things at once",
        minutes: 40,
        summary:
          "CancellationToken is the .NET convention for 'stop, nobody needs this any more'. ASP.NET Core hands you one automatically for every request.",
        why: "Threading a token through your call stack is a small habit that reviewers immediately read as professional. Its absence reads as tutorial code.",
        points: [
          "Accept CancellationToken ct as the last parameter of every async method and pass it down. When a user closes the browser, ASP.NET Core cancels the request token and your database query stops instead of running to completion for nobody.",
          "CancellationTokenSource creates tokens; CreateLinkedTokenSource combines several so any of them can cancel; the constructor overload taking a TimeSpan gives you a timeout.",
          "Cancellation is cooperative — nothing is forcibly killed. Long CPU loops must check ct.ThrowIfCancellationRequested() themselves.",
          "Task.WhenAll waits for all and aggregates failures; Task.WhenAny returns the first to finish, which is how you race a call against a timeout.",
          "For bounded parallelism over a collection, Parallel.ForEachAsync with MaxDegreeOfParallelism prevents firing a thousand simultaneous requests at a service that will rate-limit you.",
        ],
        code: [
          {
            caption: "Timeouts and bounded parallelism",
            language: "csharp",
            code: `// Give an operation five seconds, honouring the caller's cancellation too
using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
timeout.CancelAfter(TimeSpan.FromSeconds(5));

try
{
    var result = await client.GetAsync(url, timeout.Token);
}
catch (OperationCanceledException) when (!ct.IsCancellationRequested)
{
    // Our timeout fired, not the caller cancelling
    logger.LogWarning("Upstream call timed out after 5s");
}

// Process 1,000 items, at most 8 at a time
await Parallel.ForEachAsync(
    items,
    new ParallelOptions { MaxDegreeOfParallelism = 8, CancellationToken = ct },
    async (item, token) => await ProcessAsync(item, token));`,
          },
        ],
        pitfalls: [
          "Accepting a CancellationToken and then not passing it to the calls inside. It looks correct and does nothing.",
          "Catching OperationCanceledException and treating it as an error. A cancelled request is not a failure; log it at a lower level, if at all.",
        ],
        interview: [
          {
            q: "What is a CancellationToken for?",
            a: "It is the standard cooperative cancellation mechanism. A caller creates a CancellationTokenSource and passes its token down the call chain; anyone doing work checks it or hands it to APIs that honour it, so a long operation can be abandoned when the result is no longer needed — a cancelled HTTP request, a timeout, or a shutdown.",
          },
        ],
        practice:
          "Add a 3-second timeout to an HTTP call, then verify the behaviour twice: once against a fast endpoint and once against a deliberately slow one. Make sure a caller cancelling is distinguishable from your timeout firing.",
      },
      {
        id: "async-traps",
        title: "Deadlocks and the classic async mistakes",
        minutes: 35,
        summary:
          "The specific patterns that cause production hangs, and why they are still everywhere in legacy code.",
        why: "Being able to spot .Result in a code review and explain the risk is a genuinely senior-sounding contribution on day one.",
        points: [
          "Blocking on async code — .Result, .Wait(), GetAwaiter().GetResult() — is called sync-over-async. In older ASP.NET and in UI apps it deadlocks: the continuation needs the context that the blocked thread is holding.",
          "ASP.NET Core removed the synchronization context, so it usually does not deadlock there, but it still wastes a thread and hurts scalability under load. The rule stands: do not block on async.",
          "ConfigureAwait(false) tells the continuation it does not need the original context. It matters in libraries, and it is why library code is full of it. In ASP.NET Core application code it is generally unnecessary.",
          "Fire and forget (_ = DoWorkAsync()) loses exceptions and can be killed by shutdown. If you need background work, use a hosted service or a queue.",
          "Async lambdas passed to a method expecting Action become async void. Watch for this with older APIs and with Timer.",
          "Do not wrap synchronous work in Task.Run inside a web request to 'make it async'. You have moved the work to another pool thread and gained nothing.",
        ],
        code: [
          {
            caption: "The pattern to recognise and remove",
            language: "csharp",
            code: `// Wrong: blocks a thread, can deadlock in some contexts
public Order Get(Guid id) => repository.FindAsync(id).Result;

// Wrong: same problem in disguise
public void Save(Order order) => repository.SaveAsync(order).Wait();

// Right: async all the way up
public Task<Order?> GetAsync(Guid id, CancellationToken ct) =>
    repository.FindAsync(id, ct);

// Fire and forget swallows failures — do not do this
_ = SendEmailAsync(order);

// Instead: queue it to something that owns the work and logs failures
await backgroundQueue.EnqueueAsync(new SendEmailJob(order.Id), ct);`,
          },
        ],
        interview: [
          {
            q: "What causes a deadlock with async code?",
            a: "Blocking on a task (.Result or .Wait()) while its continuation is waiting to resume on the same synchronization context that your blocking call is occupying. Classic ASP.NET and WinForms/WPF have such a context, so the two wait on each other forever. The fixes are to be async all the way, or in library code to use ConfigureAwait(false) so the continuation does not need the captured context.",
          },
        ],
        practice:
          "Search a codebase you have written for .Result, .Wait(), and async void. For each, decide whether it is safe and rewrite the ones that are not.",
      },
      {
        id: "performance",
        title: "Performance: measuring instead of guessing",
        minutes: 40,
        summary:
          "How to find out what is actually slow, and the handful of allocation-level ideas worth knowing.",
        why: "'How would you find and fix a slow endpoint?' is a very common senior screening question, and the right answer starts with measurement, not with optimisation.",
        points: [
          "Order of investigation: measure first (logs, timing middleware, Application Insights), then find the dominant cost. It is almost always a database query or a network call, not your C#.",
          "The usual culprits in a web app: N+1 queries, missing indexes, fetching entire tables, loading full entities where a projection would do, and no caching on repeated reads.",
          "BenchmarkDotNet is the standard for micro-benchmarks. It handles warmup and statistics — never trust a Stopwatch around a single run.",
          "Allocations drive garbage collection pressure. Span<T> and Memory<T> let you slice arrays and strings without copying, and ArrayPool reuses buffers. This matters in libraries and hot loops.",
          "IAsyncEnumerable<T> with await foreach streams results instead of materialising a huge list — useful for large exports.",
          "Know the difference between latency (one request) and throughput (requests per second). Async improves throughput; it does not make a single request faster.",
        ],
        code: [
          {
            caption: "A benchmark you can trust",
            language: "csharp",
            code: `[MemoryDiagnoser]
public class ConcatBenchmarks
{
    private readonly string[] _lines = Enumerable.Range(0, 1000).Select(i => $"line {i}").ToArray();

    [Benchmark(Baseline = true)]
    public string Concatenation()
    {
        var result = "";
        foreach (var line in _lines) result += line;   // allocates every iteration
        return result;
    }

    [Benchmark]
    public string Builder()
    {
        var sb = new StringBuilder();
        foreach (var line in _lines) sb.Append(line);
        return sb.ToString();
    }
}`,
          },
          {
            caption: "Streaming a large result set",
            language: "csharp",
            code: `public async IAsyncEnumerable<OrderRow> ExportAsync(
    [EnumeratorCancellation] CancellationToken ct)
{
    await foreach (var order in db.Orders.AsNoTracking().AsAsyncEnumerable().WithCancellation(ct))
    {
        yield return new OrderRow(order.Id, order.Total);
    }
}`,
          },
        ],
        pitfalls: [
          "Optimising code you have not measured. The bottleneck is rarely where intuition says.",
          "Micro-optimising C# while an unindexed query scans a million rows next door.",
        ],
        interview: [
          {
            q: "An API endpoint is slow in production. Walk me through your approach.",
            a: "Reproduce and measure first: check logs and traces for where the time goes — application, database, or an external call. Look at the SQL the ORM generates and the query plan; check for N+1 patterns, missing indexes, and over-fetching. Only then look at application code and allocations. Fix the dominant cost, measure again, and add a test or an alert so a regression is visible.",
          },
        ],
        practice:
          "Add BenchmarkDotNet to a console project and benchmark string concatenation versus StringBuilder at 10, 100, and 10,000 items. Note where the crossover is — the answer is more nuanced than 'always use StringBuilder'.",
      },
    ],
  },
];
