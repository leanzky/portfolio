import type { ChecklistItem, Phase, ProjectIdea, QA, Resource } from "./types";

/* ------------------------------------------------------------------
   Projects. Ordered so each one adds exactly one layer of difficulty,
   and every one is something you could defend in an interview.
------------------------------------------------------------------ */

export const projects: ProjectIdea[] = [
  {
    id: "expense-cli",
    name: "Expense Tracker CLI",
    level: "Warm-up",
    duration: "3–5 days",
    pitch:
      "A command-line tool that records expenses, categorises them, and prints monthly summaries. No web framework, no database — just C#, files, and your own design decisions.",
    proves:
      "That you can write clean C# and structure a program before any framework is doing the structuring for you.",
    stack: ["C#", "System.Text.Json", "Spectre.Console (optional)", "xUnit"],
    requirements: [
      "Add, list, edit, and delete expenses with amount, category, date, and note.",
      "Persist to a JSON file, handling a missing or corrupt file without crashing.",
      "Monthly and per-category summaries computed with LINQ.",
      "decimal for money and DateOnly for dates — no doubles, no local-time bugs.",
      "Unit tests for the summary calculations, including empty and single-item months.",
    ],
    stretch: [
      "CSV export and import with correct escaping.",
      "A budget per category with a warning when a month exceeds it.",
      "Swap the JSON store for SQLite behind the same interface — proving the abstraction was real.",
    ],
    talkingPoint:
      "Explain how you separated storage from logic so the SQLite version required no changes to the calculation code. That is dependency inversion demonstrated rather than recited.",
  },
  {
    id: "task-api",
    name: "Task Management API",
    level: "Core",
    duration: "1–2 weeks",
    pitch:
      "The canonical first web API: projects, tasks, and comments with full CRUD — but built to the standard of module 04 through 07 rather than a tutorial.",
    proves:
      "That you can build, document, test, and containerise a working ASP.NET Core API on your own.",
    stack: ["ASP.NET Core", "EF Core", "PostgreSQL", "xUnit", "Docker", "Swagger"],
    requirements: [
      "REST endpoints with correct verbs and status codes, request/response DTOs, and no entities on the wire.",
      "EF Core with migrations, proper relationships, and indexes on what you filter by.",
      "FluentValidation plus a global exception handler returning ProblemDetails.",
      "Pagination, filtering, and sorting on every list endpoint.",
      "Unit tests for the logic, integration tests with WebApplicationFactory for the endpoints.",
      "docker compose up brings up the API and the database with migrations applied.",
      "A README a stranger can follow, and OpenAPI docs that are actually accurate.",
    ],
    stretch: [
      "Soft delete with a global query filter.",
      "Audit fields set automatically in SaveChanges.",
      "A GitHub Actions pipeline that runs the tests on every push.",
    ],
    talkingPoint:
      "Be ready to walk through one request from the endpoint to the database and back, naming each layer it passes through and what it does there.",
  },
  {
    id: "inventory-saas",
    name: "Multi-tenant Inventory System",
    level: "Standout",
    duration: "3–4 weeks",
    pitch:
      "A B2B inventory system where several companies share one deployment and must never see each other's data: authentication, roles, stock movements, and low-stock alerts.",
    proves:
      "That you can handle authentication, authorization, and data isolation — the concerns that make business software genuinely hard.",
    stack: [
      "ASP.NET Core",
      "ASP.NET Core Identity",
      "JWT",
      "EF Core",
      "PostgreSQL",
      "Redis",
      "Docker",
    ],
    requirements: [
      "Registration, login, refresh, and logout with hashed passwords and short-lived access tokens.",
      "Roles (Owner, Manager, Staff) enforced with policies, not scattered if statements.",
      "Tenant isolation enforced at the data layer with a global query filter — plus a test that proves tenant A cannot read tenant B's rows even by guessing an id.",
      "Stock movements as an append-only ledger; current stock is derived, never overwritten.",
      "Optimistic concurrency on stock so two simultaneous sales cannot oversell.",
      "Background service that emails low-stock alerts on a schedule.",
      "Structured logging with correlation ids, and health checks.",
    ],
    stretch: [
      "Per-tenant rate limiting.",
      "CSV bulk import with row-level error reporting.",
      "An audit log of who changed what, queryable by admins.",
    ],
    talkingPoint:
      "Lead with the isolation test. 'I wrote a test that logs in as tenant A and requests tenant B's resource by id, and asserts 404' is a sentence that makes interviewers sit up — broken access control is the top OWASP risk.",
  },
  {
    id: "booking-realtime",
    name: "Real-time Booking Platform",
    level: "Standout",
    duration: "3–4 weeks",
    pitch:
      "Performers or venues publish availability, clients book slots, and both sides see status change live. Double-booking must be impossible.",
    proves:
      "Concurrency handling, real-time delivery, and background processing — and it maps directly onto product work you have already shipped.",
    stack: ["ASP.NET Core", "SignalR", "EF Core", "PostgreSQL", "Hangfire or a hosted service", "React"],
    requirements: [
      "Availability slots with a database-level constraint that makes double-booking impossible, not just an application check.",
      "SignalR pushes booking state changes to everyone watching that resource.",
      "Booking lifecycle — requested, confirmed, cancelled, completed — with the legal transitions enforced in one place.",
      "Background jobs for reminder notifications and for expiring unconfirmed requests.",
      "A React frontend consuming the API with types generated from OpenAPI.",
      "Integration tests covering the concurrent-booking race, using two simultaneous requests.",
    ],
    stretch: [
      "Calendar (.ics) export and time-zone-correct display.",
      "Payment provider integration in sandbox with an idempotency key on charges.",
      "Presence: show who else is viewing a slot.",
    ],
    talkingPoint:
      "The race-condition test is the story. Explain how you proved two concurrent requests for the same slot produce exactly one booking, and why you enforced it in the database rather than in C#.",
  },
  {
    id: "procurement-automation",
    name: "Procurement Bid Monitor",
    level: "Standout",
    duration: "3–4 weeks",
    pitch:
      "A service that ingests public procurement notices, normalises them, matches them against a company's capability profile, and alerts on relevant opportunities with a dashboard and a digest email.",
    proves:
      "Domain expertise plus engineering. Enterprise .NET is overwhelmingly line-of-business software, and you already understand this business.",
    stack: [
      "ASP.NET Core",
      "BackgroundService",
      "EF Core",
      "PostgreSQL",
      "Polly resilience",
      "Serilog",
    ],
    requirements: [
      "Scheduled ingestion worker with retry, backoff, and a circuit breaker for the source being down.",
      "Deduplication and change detection — a re-published notice must update, not duplicate.",
      "Matching rules (category, budget range, keywords, deadline) that a user can configure.",
      "Full-text search over notices.",
      "Digest email on a schedule, plus a dashboard with filters and saved searches.",
      "Observability: ingestion metrics, last-run status, and a health endpoint that reflects whether ingestion is current.",
    ],
    stretch: [
      "Deadline reminders with time-zone-aware scheduling.",
      "An admin view for reprocessing a failed ingestion run.",
      "Simple relevance scoring, tuned against real notices.",
    ],
    talkingPoint:
      "This is the project that separates you from other candidates. You are not demonstrating CRUD; you are demonstrating that you understand a real business process and automated it. Lead your portfolio with it.",
  },
  {
    id: "capstone",
    name: "Capstone: production-grade service",
    level: "Capstone",
    duration: "4–6 weeks",
    pitch:
      "Take your strongest project and finish it to a standard you would be comfortable handing to a team: architecture, observability, performance, deployment, and documentation.",
    proves:
      "That you can operate software, not just write it — the difference between a junior and a mid-level engineer.",
    stack: [
      "Clean or vertical-slice architecture",
      "OpenTelemetry",
      "Redis cache",
      "Testcontainers",
      "GitHub Actions",
      "A cloud host",
    ],
    requirements: [
      "A deliberate architecture you can defend, with a diagram in the README.",
      "Meaningful test coverage across unit and integration levels, running in CI on every pull request.",
      "Structured logging, metrics, and traces, with a dashboard screenshot in the README.",
      "Caching on the expensive paths, with a measured before-and-after.",
      "A load test (k6, NBomber, or bombardier) with the numbers written down.",
      "Deployed publicly, with migrations run as a deployment step and rollback documented.",
      "Three short architecture decision records: the choice, the alternatives, and why.",
    ],
    stretch: [
      "Blue/green or staged rollout.",
      "An alert that fires to you when the error rate crosses a threshold.",
      "A performance budget enforced in CI.",
    ],
    talkingPoint:
      "The load-test numbers and the before-and-after of your caching work are the most senior-sounding things a self-taught candidate can bring to an interview. Know them by heart.",
  },
];

/* ------------------------------------------------------------------
   A 16-week plan. Aggressive but achievable at 2–3 focused hours on
   weekdays and a longer weekend session.
------------------------------------------------------------------ */

export const plan: Phase[] = [
  {
    weeks: "Weeks 1–2",
    focus: "Platform and language fundamentals",
    modules: "00, 01",
    deliverable: "Expense Tracker CLI, with tests on the summary logic.",
  },
  {
    weeks: "Weeks 3–4",
    focus: "Object design and async",
    modules: "02, 03",
    deliverable:
      "Refactor the CLI behind interfaces, add a second storage implementation, and make all I/O async.",
  },
  {
    weeks: "Weeks 5–7",
    focus: "ASP.NET Core and EF Core",
    modules: "04, 05",
    deliverable: "Task Management API: CRUD, migrations, validation, Swagger.",
  },
  {
    weeks: "Weeks 8–9",
    focus: "Security and testing",
    modules: "06, 07",
    deliverable:
      "JWT auth, policies, and a real test suite — unit plus integration — on the Task API.",
  },
  {
    weeks: "Weeks 10–12",
    focus: "Architecture and shipping",
    modules: "08, 09",
    deliverable:
      "Multi-tenant Inventory System, containerised, in CI, deployed to a public URL.",
  },
  {
    weeks: "Weeks 13–14",
    focus: "Full-stack and the standout project",
    modules: "10",
    deliverable:
      "React frontend on generated types, and the Procurement Bid Monitor started.",
  },
  {
    weeks: "Weeks 15–16",
    focus: "Career: polish, positioning, and applying",
    modules: "11",
    deliverable:
      "Two projects finished to portfolio standard, resume and LinkedIn rewritten, and the first fifteen applications sent.",
  },
];

/* ------------------------------------------------------------------
   Interview bank — questions grouped by the round they show up in.
------------------------------------------------------------------ */

export const interviewBank: { category: string; questions: QA[] }[] = [
  {
    category: "C# language",
    questions: [
      {
        q: "What is the difference between a value type and a reference type?",
        a: "A value type holds its data directly and is copied on assignment; a reference type holds a reference, so assignment copies the reference and both names see the same object. Structs, enums and primitives are value types; classes, strings, arrays and delegates are reference types. The practical consequence is that passing a reference type to a method lets that method mutate your object, while passing a value type does not.",
      },
      {
        q: "What is boxing?",
        a: "Wrapping a value type in an object so it can be used where a reference type is expected. It allocates on the heap and copies the value, adding GC pressure. Generics were introduced largely to avoid it.",
      },
      {
        q: "const versus readonly?",
        a: "const is a compile-time constant, baked into the calling assembly — which means changing it requires recompiling every consumer. readonly is set at runtime, in the constructor or at declaration, so it can vary per instance and can hold a computed value.",
      },
      {
        q: "What does the static keyword mean?",
        a: "The member belongs to the type rather than to an instance. Static state is shared process-wide, which makes it a common source of concurrency bugs and untestable code, so I keep it to genuinely stateless helpers.",
      },
      {
        q: "IEnumerable versus ICollection versus IList?",
        a: "IEnumerable gives forward iteration only. ICollection adds Count, Add, Remove and Contains. IList adds indexing and insertion at a position. I accept the least specific one my method actually needs, so callers have the most freedom.",
      },
      {
        q: "What is the difference between == and Equals?",
        a: "For reference types == compares references by default, while Equals can be overridden for value semantics. string overrides both to compare content, and records generate value-based equality for you. When overriding Equals you must also override GetHashCode, or dictionaries and sets misbehave.",
      },
      {
        q: "What is a delegate, and what are Func and Action?",
        a: "A delegate is a type-safe reference to a method — the basis of events and callbacks. Func<T, TResult> is a built-in delegate returning a value; Action<T> returns void. Lambdas are the usual way to create them, and LINQ is built on them.",
      },
      {
        q: "How does garbage collection work in .NET?",
        a: "The GC manages heap memory automatically using generations: new objects start in gen 0, survivors are promoted, and higher generations are collected less often because most objects die young. Large objects go on a separate heap. You do not free memory manually, but you do release unmanaged resources deterministically via IDisposable and using, because finalisers are non-deterministic.",
      },
    ],
  },
  {
    category: "Async and concurrency",
    questions: [
      {
        q: "What does await actually do?",
        a: "It suspends the method and returns control to the caller, registering the remainder as a continuation to run when the awaited task completes. No thread is blocked or created for I/O — the thread returns to the pool and picks up other work.",
      },
      {
        q: "Task versus Thread?",
        a: "A Thread is an OS-level execution resource. A Task is a promise of future work that usually runs on the thread pool, and for I/O may use no thread at all while waiting. Application code should work with Tasks and let the runtime schedule.",
      },
      {
        q: "Why should you not use .Result?",
        a: "It blocks the calling thread until completion. In contexts with a synchronization context it can deadlock, and everywhere it wastes a pool thread and hurts scalability. It also wraps exceptions in an AggregateException, which obscures the real error.",
      },
      {
        q: "How do you run several async operations concurrently?",
        a: "Start the tasks without awaiting, then await Task.WhenAll. This only helps when the operations are independent, and it must not be done against a single EF Core DbContext, which is not thread-safe.",
      },
      {
        q: "What is a race condition and how do you prevent one?",
        a: "Two operations touching shared state where the outcome depends on timing. Prevention options in order of preference: avoid shared mutable state; use immutable data; use concurrent collections or Interlocked for simple cases; use a lock for short critical sections; and for data in a database, use optimistic concurrency tokens or a unique constraint so the database is the arbiter.",
      },
    ],
  },
  {
    category: "ASP.NET Core",
    questions: [
      {
        q: "Walk me through the request pipeline.",
        a: "The request enters the ordered middleware chain; each component may inspect, modify, short-circuit, or pass to the next, then act on the response on the way back out. Typical order is exception handling, HTTPS redirection, static files, routing, CORS, authentication, authorization, then endpoint execution — where the endpoint resolves its dependencies from the scoped DI container.",
      },
      {
        q: "Explain the DI lifetimes.",
        a: "Transient is a new instance per resolution, scoped is one per request, and singleton is one per application. DbContext is scoped. Injecting a scoped service into a singleton is a captive dependency and a bug — resolve it from an IServiceScopeFactory instead.",
      },
      {
        q: "How do you handle exceptions globally?",
        a: "A global exception handler or middleware maps known exception types to status codes and returns a consistent ProblemDetails body containing a trace id, while logging the full exception. Nothing internal is returned to the caller, and expected failures like validation return 400 without throwing.",
      },
      {
        q: "What is middleware, and when would you write your own?",
        a: "A component in the request pipeline with access to HttpContext and the next delegate. I write custom middleware for genuinely cross-cutting concerns — correlation ids, request timing, tenant resolution — and keep anything endpoint-specific in filters or the endpoint itself.",
      },
      {
        q: "How do you version an API?",
        a: "URL segment versioning (/api/v1/) is the most visible and cache-friendly; header or media-type versioning keeps URLs stable. The important part is deciding before the first external consumer exists, and keeping the previous version working through a documented deprecation window.",
      },
    ],
  },
  {
    category: "Data and EF Core",
    questions: [
      {
        q: "What is the N+1 problem?",
        a: "One query returns N rows, then accessing a navigation property per row issues N more queries. Fix it with Include for eager loading or, better on read paths, a projection that fetches exactly the needed columns in one query. You detect it by logging generated SQL and counting queries.",
      },
      {
        q: "When do you use AsNoTracking?",
        a: "On read-only queries. It skips change-tracking snapshots, so it uses less memory and CPU. Not for entities you intend to modify and save.",
      },
      {
        q: "How do you handle two users editing the same record?",
        a: "Optimistic concurrency: a rowversion token is checked on update, and EF throws DbUpdateConcurrencyException if the row changed since it was read. The application then reloads and either merges automatically or tells the user what changed. Pessimistic locking is available but harms throughput and is rarely the first choice in a web app.",
      },
      {
        q: "Give me an example of a database index decision.",
        a: "Answer from your own project: the column you filter or join on most, why a composite index was ordered the way it was, and the measured before-and-after. Mention that indexes cost write performance and storage, so they are not free.",
      },
      {
        q: "Have you written SQL directly?",
        a: "Yes — for reporting queries where LINQ becomes unreadable, and for database-specific features. Always parameterised. I read the SQL EF Core generates as a habit, because an ORM does not remove the need to understand the query being run.",
      },
    ],
  },
  {
    category: "Design and architecture",
    questions: [
      {
        q: "How would you design a URL shortener / booking system / notification service?",
        a: "Clarify requirements and scale first, then outline the data model, the endpoints, and where state lives. Talk through the hard part explicitly — uniqueness, concurrency, or delivery guarantees — and name the failure modes and how you would observe them. Interviewers are scoring the reasoning and the questions, not a diagram.",
      },
      {
        q: "What is SOLID? Give an example.",
        a: "Name the five briefly, then spend your time on one concrete refactor from your own code — ideally replacing a growing switch statement with an interface and implementations resolved from DI. Specific beats comprehensive.",
      },
      {
        q: "When would you use a message queue?",
        a: "When work can be done after the response, when the producer and consumer should scale or fail independently, or when you need to smooth a spike. The trade-offs are eventual consistency, at-least-once delivery requiring idempotent handlers, and the operational cost of another component.",
      },
      {
        q: "How do you decide between a monolith and microservices?",
        a: "Start with a well-structured monolith. Microservices buy independent deployment and scaling at the cost of network failure modes, distributed data, and much heavier operations. I would split when there is a concrete reason — a component with wildly different scaling needs, or separate teams needing independent release cycles — not by default.",
      },
    ],
  },
  {
    category: "Behavioural",
    questions: [
      {
        q: "Tell me about a difficult bug you fixed.",
        a: "Use STAR and pick something with a real diagnostic story: what the symptom was, how you narrowed it down, what the cause turned out to be, and what you changed so it could not recur. The 'what changed afterwards' part is what separates a good answer from a war story.",
      },
      {
        q: "Tell me about a time you disagreed with a teammate.",
        a: "Choose a technical disagreement resolved with evidence — a benchmark, a prototype, a rollback plan. Show that you can hold a position, change it when the data says so, and keep the relationship intact.",
      },
      {
        q: "Why are you moving to .NET?",
        a: "Answer positively and concretely: the kind of systems you want to build, what you have already built in C#, and what you find well-designed about the platform. Never frame it as your previous stack being inadequate.",
      },
      {
        q: "Where do you see yourself in three years?",
        a: "Show direction without sounding like you will leave in six months: deeper ownership of systems end to end, more responsibility for architecture and mentoring. Tie it to what the company actually does.",
      },
    ],
  },
];

/* ------------------------------------------------------------------
   Job-readiness checklist — tick every one before you consider the
   search "properly started".
------------------------------------------------------------------ */

export const readiness: ChecklistItem[] = [
  {
    id: "fundamentals",
    label: "I can explain value vs reference types, async/await, and DI lifetimes without notes",
    detail:
      "These three come up in almost every technical screen. Practise saying them out loud, not just recognising them.",
  },
  {
    id: "build-from-empty",
    label: "I can build a working API from an empty folder without a tutorial",
    detail:
      "Endpoints, EF Core with migrations, validation, auth, and Swagger. Time yourself; aim for under an hour.",
  },
  {
    id: "tests",
    label: "Every portfolio project has tests that actually run in CI",
    detail:
      "Unit tests on the logic, integration tests on the endpoints, and a green badge on the README.",
  },
  {
    id: "deployed",
    label: "At least two projects are deployed at public URLs",
    detail: "Free tiers are fine. A reviewer clicking a link that works is worth more than a repo.",
  },
  {
    id: "docker",
    label: "Anyone can run my projects with docker compose up",
    detail: "Test it on a clean machine or a fresh clone. It almost never works the first time.",
  },
  {
    id: "readme",
    label: "Each README explains what, why, how to run, and two design decisions",
    detail:
      "The design decisions section is what turns a code review into a conversation about your judgement.",
  },
  {
    id: "sql",
    label: "I can write joins, group-bys, and read an execution plan",
    detail: "Many .NET interviews have a SQL round. An ORM does not exempt you from it.",
  },
  {
    id: "git",
    label: "My commit history looks like professional work",
    detail:
      "Small, focused commits with meaningful messages, and branches with pull requests even when working alone.",
  },
  {
    id: "story",
    label: "I have a two-minute introduction and four STAR stories rehearsed",
    detail: "A hard bug, a disagreement, a failure, and something shipped end to end.",
  },
  {
    id: "resume",
    label: "Resume and LinkedIn present me as a .NET developer, with evidence linked",
    detail:
      "Outcomes first, matching vocabulary from the postings, and every claim one click from proof.",
  },
  {
    id: "pipeline",
    label: "I am applying to five well-matched roles a week and tracking the results",
    detail:
      "Track the stage each application reaches. Patterns tell you whether to fix the resume, the projects, or the interview performance.",
  },
];

/* ------------------------------------------------------------------
   Resources. Deliberately short — a curated ten beats a list of fifty.
------------------------------------------------------------------ */

export const resources: Resource[] = [
  {
    name: "Microsoft Learn — .NET",
    kind: "Docs",
    url: "https://learn.microsoft.com/dotnet/",
    note: "The canonical source. The C# language reference and the ASP.NET Core docs are genuinely excellent — check the version selector matches your target framework.",
  },
  {
    name: "ASP.NET Core fundamentals",
    kind: "Docs",
    url: "https://learn.microsoft.com/aspnet/core/fundamentals/",
    note: "Read the middleware, DI, and configuration pages properly once. They answer most 'why does it do that?' questions.",
  },
  {
    name: "EF Core documentation",
    kind: "Docs",
    url: "https://learn.microsoft.com/ef/core/",
    note: "The performance and querying sections are the ones that change how you write code.",
  },
  {
    name: "Nick Chapsas",
    kind: "Video",
    url: "https://www.youtube.com/@nickchapsas",
    note: "Short, current, opinionated videos on modern .NET. Best single channel for keeping up after the fundamentals.",
  },
  {
    name: "Milan Jovanović",
    kind: "Video",
    url: "https://www.youtube.com/@MilanJovanovicTech",
    note: "Architecture-focused: clean architecture, CQRS, DDD in practical .NET terms.",
  },
  {
    name: "Tim Corey",
    kind: "Video",
    url: "https://www.youtube.com/@IAmTimCorey",
    note: "Longer, slower, beginner-friendly walkthroughs. Good when a concept has not clicked yet.",
  },
  {
    name: "Exercism — C# track",
    kind: "Practice",
    url: "https://exercism.org/tracks/csharp",
    note: "Small exercises with mentor feedback. The fastest way to make syntax automatic.",
  },
  {
    name: "roadmap.sh — ASP.NET Core",
    kind: "Practice",
    url: "https://roadmap.sh/aspnet-core",
    note: "A visual checklist to audit yourself against once you have finished this course.",
  },
  {
    name: "C# in Depth — Jon Skeet",
    kind: "Book",
    url: "https://csharpindepth.com/",
    note: "How and why the language works the way it does. Read it once you are comfortable, not before.",
  },
  {
    name: "Dependency Injection Principles, Practices, and Patterns",
    kind: "Book",
    url: "https://www.manning.com/books/dependency-injection-principles-practices-patterns",
    note: "The definitive treatment of DI and composition, with .NET examples. It will change how you structure applications.",
  },
  {
    name: "The .NET runtime source",
    kind: "Community",
    url: "https://github.com/dotnet/runtime",
    note: "Reading how the framework implements something is a legitimate way to answer a question. Also where good first issues live if you want open-source contributions on your profile.",
  },
  {
    name: "r/dotnet and the .NET Discord",
    kind: "Community",
    url: "https://www.reddit.com/r/dotnet/",
    note: "Useful for reading what practitioners argue about — MediatR licensing, minimal APIs versus controllers — which is exactly the current-events awareness interviews reward.",
  },
];
