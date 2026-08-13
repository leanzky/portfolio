import type { Module } from "./types";

/** Modules 08–11: architecture, shipping, full-stack, and the job hunt itself. */
export const productionModules: Module[] = [
  {
    id: "architecture",
    number: "08",
    title: "Architecture and real-world structure",
    blurb:
      "How applications are organised once they outgrow a single folder, and the patterns whose names appear in job descriptions.",
    outcome:
      "You can lay out a multi-project solution, defend the structure, and recognise when a pattern is being used past its usefulness.",
    lessons: [
      {
        id: "layers",
        title: "Layers, clean architecture, and vertical slices",
        minutes: 55,
        summary:
          "Three ways teams organise a codebase, and the dependency rule that all of them are really about.",
        why: "'Clean architecture' appears in a large share of .NET job ads. Being able to draw it and say honestly when it is overkill is a strong signal.",
        points: [
          "The rule underneath every version: dependencies point inwards. Business rules must not depend on the database, the web framework, or any external service.",
          "A typical solution: Domain (entities, value objects, no dependencies), Application (use cases, interfaces for infrastructure), Infrastructure (EF Core, HTTP clients, implementations), Api (endpoints, DI wiring). Api and Infrastructure reference inwards; Domain references nothing.",
          "Inversion is what makes it work: Application declares IOrderRepository, Infrastructure implements it, and Program.cs wires them. The compiler enforces the direction.",
          "Vertical slice architecture organises by feature instead of by layer — a Features/Orders/CreateOrder folder containing the request, handler, validator, and endpoint together. Changing a feature touches one folder rather than five projects.",
          "For most applications vertical slices are easier to navigate. Clean architecture pays off with complex domain rules and long-lived systems.",
          "The real failure is neither: a Services folder holding twenty classes of unrelated logic that all touch the DbContext. Anything with a defensible shape beats that.",
          "Do not start a CRUD app with four projects and MediatR. Start simple; extract when the seams become obvious.",
        ],
        code: [
          {
            caption: "Two layouts of the same feature",
            language: "text",
            code: `Clean architecture (by layer)          Vertical slices (by feature)
-----------------------------          ----------------------------
ShopApi.Domain/                        ShopApi/
  Order.cs                               Features/
  Customer.cs                              Orders/
ShopApi.Application/                         CreateOrder.cs   (request+handler+validator)
  Orders/CreateOrderHandler.cs               GetOrder.cs
  Abstractions/IOrderRepository.cs           ListOrders.cs
ShopApi.Infrastructure/                      Order.cs
  Persistence/AppDbContext.cs                OrderEndpoints.cs
  Persistence/OrderRepository.cs           Customers/
ShopApi.Api/                                 ...
  Endpoints/OrderEndpoints.cs            Shared/
  Program.cs                               AppDbContext.cs
                                         Program.cs`,
          },
        ],
        pitfalls: [
          "Architecture astronautics: four projects and an interface per class for an app with six endpoints. Reviewers read that as inexperience, not sophistication.",
          "A Domain project that references EF Core. The moment it does, the dependency rule is broken and the structure is decoration.",
        ],
        interview: [
          {
            q: "How would you structure a new .NET API?",
            a: "It depends on the complexity. For a straightforward service I use vertical slices — a folder per feature holding the endpoint, handler, validator, and DTOs — with shared infrastructure in one place, because that keeps related code together. For a system with real domain rules and a long life I use a layered clean architecture where the domain and application layers have no dependency on the database or the web framework, and infrastructure implements interfaces the application defines. Either way the rule is that business logic never depends on infrastructure.",
          },
        ],
        practice:
          "Take your existing API and restructure it into vertical slices. Then write down which files you touched to add one new field end to end — before and after.",
      },
      {
        id: "cqrs",
        title: "CQRS, MediatR, and when patterns stop helping",
        minutes: 40,
        summary:
          "Separating reads from writes, the library nearly every .NET team has an opinion about, and the maturity to say 'not here'.",
        why: "MediatR appears in a huge number of .NET codebases. You need to be able to work in one and to explain the trade-off rather than cargo-culting it.",
        points: [
          "CQRS at its simplest: commands change state and return little; queries read and change nothing. Handling them with different models means a read can be a fast projection while a write goes through domain rules.",
          "The full version — separate read and write databases kept in sync by events — is a distributed-systems commitment. Very few applications need it, and the name is often used for the simple version.",
          "MediatR routes a request object to its handler, giving one class per use case and a natural place for cross-cutting behaviours (validation, logging, transactions) via a pipeline.",
          "The cost is indirection: 'go to definition' on Send() lands you in the library, not the handler. On a small team with a small app, calling the service directly is clearer.",
          "Pipeline behaviours are the genuine win — validation and logging applied uniformly to every use case without a base class.",
          "Note that MediatR moved to a commercial licence for larger organisations, which is why some teams now use alternatives or a small hand-rolled dispatcher. Knowing that is a current-events point in your favour.",
        ],
        code: [
          {
            caption: "A command, its handler, and a cross-cutting behaviour",
            language: "csharp",
            code: `public record CreateOrder(string CustomerEmail, IReadOnlyList<ItemRequest> Items)
    : IRequest<OrderResponse>;

public class CreateOrderHandler(AppDbContext db, IEmailSender email)
    : IRequestHandler<CreateOrder, OrderResponse>
{
    public async Task<OrderResponse> Handle(CreateOrder request, CancellationToken ct)
    {
        var order = Order.Create(request.CustomerEmail, request.Items);
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        await email.SendAsync(order.CustomerEmail, "Order received", order.Reference, ct);
        return OrderResponse.From(order);
    }
}

// Validation applied to every request, defined once
public class ValidationBehaviour<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request,
        RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var failures = validators
            .Select(v => v.Validate(request))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count > 0) throw new ValidationException(failures);
        return await next();
    }
}`,
          },
        ],
        interview: [
          {
            q: "What is CQRS and would you use it?",
            a: "Command Query Responsibility Segregation: model the write path and the read path separately, so writes enforce domain rules while reads are shaped for the screen that needs them. I use the lightweight form — separate command and query handlers over one database — because it keeps use cases small and testable. Separate read and write stores with eventual consistency solves a scaling problem most applications do not have, and it introduces sync and consistency work I would only take on with a concrete reason.",
          },
        ],
        practice:
          "Convert two endpoints to command and query handlers with a validation pipeline behaviour. Then honestly assess whether the code got clearer or just longer, and be ready to say which.",
      },
      {
        id: "background-work",
        title: "Background work, scheduling, and queues",
        minutes: 45,
        summary:
          "Getting work off the request thread: hosted services, schedulers, message queues, and the outbox pattern.",
        why: "Real systems send emails, generate reports, and sync data. 'How would you handle a task that takes two minutes?' is a very common design question.",
        points: [
          "BackgroundService (an IHostedService) runs alongside your web app for the process lifetime. Perfect for polling, cleanup, and consuming a queue.",
          "It shares the process with your API: a crash or a deployment stops it, and it scales with your web instances. Beyond a certain point, run workers as their own deployment.",
          "Scheduling: Quartz.NET or Hangfire for cron-style jobs with persistence and retries. Hangfire's dashboard is a genuine operational benefit.",
          "For work triggered by a request but not needed in the response, enqueue rather than fire-and-forget — Channel<T> in-process, or RabbitMQ / Azure Service Bus / AWS SQS across processes.",
          "Any handler that consumes from a queue must be idempotent: at-least-once delivery means it will occasionally run twice.",
          "The outbox pattern solves the dual-write problem: write the message into a table inside the same transaction as your data, and have a background process publish it. Otherwise a crash between the database commit and the publish loses the event silently.",
          "Multiple instances need coordination — a distributed lock or a database-level claim — or every instance runs the same job.",
        ],
        code: [
          {
            caption: "A worker with a scope per unit of work",
            language: "csharp",
            code: `public class OutboxPublisher(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxPublisher> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var bus = scope.ServiceProvider.GetRequiredService<IMessageBus>();

                var pending = await db.OutboxMessages
                    .Where(m => m.PublishedAt == null)
                    .OrderBy(m => m.OccurredAt)
                    .Take(50)
                    .ToListAsync(ct);

                foreach (var message in pending)
                {
                    await bus.PublishAsync(message.Type, message.Payload, ct);
                    message.PublishedAt = DateTimeOffset.UtcNow;
                }

                await db.SaveChangesAsync(ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // A worker that throws is a worker that stops. Log and keep going.
                logger.LogError(ex, "Outbox publish loop failed");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), ct);
        }
    }
}

builder.Services.AddHostedService<OutboxPublisher>();`,
          },
        ],
        pitfalls: [
          "Letting an unhandled exception escape ExecuteAsync. The service stops silently and nothing tells you until someone notices missing emails.",
          "Doing slow work inside the request and hoping the client waits. Return 202 Accepted with a status endpoint instead.",
        ],
        interview: [
          {
            q: "A user action triggers a two-minute report. How do you design it?",
            a: "Accept the request, persist a job record, return 202 with an id the client can poll or a channel to notify on. A background worker picks the job up, does the work, and updates the record; the result is stored and downloadable. That keeps the request fast, survives a browser closing, and lets the job retry on failure. If the trigger must not be lost when the transaction rolls back, the job goes in through an outbox table written in the same transaction.",
          },
        ],
        practice:
          "Add a BackgroundService that processes a queue of email jobs with retry and logging. Kill the process mid-job and confirm nothing is lost when it restarts.",
      },
      {
        id: "signalr-caching",
        title: "Real-time with SignalR, and caching",
        minutes: 45,
        summary:
          "Pushing updates to clients instead of polling, and not recomputing what has not changed.",
        why: "Real-time features and a sensible caching story are both concrete talking points, and both map directly onto product work you have already done.",
        points: [
          "SignalR abstracts WebSockets with fallbacks. A Hub is a server class clients call and that can call clients back — by connection, by user, or by group.",
          "Groups model rooms — a booking, a game, a document. Clients join and leave; you broadcast to the group.",
          "Scaling past one server needs a backplane (Redis) or Azure SignalR Service, because connections live on a single instance.",
          "Authentication flows through the same pipeline; the hub sees Context.User, so authorization works as it does elsewhere.",
          "Caching layers: IMemoryCache is per-instance and fast; IDistributedCache over Redis is shared and survives restarts; HTTP response caching and a CDN sit in front of everything.",
          "Cache what is expensive and read far more often than written — reference data, computed dashboards, expensive third-party responses.",
          "Invalidation is the hard part. Prefer short TTLs plus explicit eviction on write. Include a version or tenant in the key so you never serve one customer another's data.",
          "The stampede problem: when a hot key expires, every request recomputes at once. Guard with a lock or a library like HybridCache (built into .NET 9).",
        ],
        code: [
          {
            caption: "A hub with groups",
            language: "csharp",
            code: `[Authorize]
public class BookingHub : Hub
{
    public async Task JoinBooking(string bookingId) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, $"booking-{bookingId}");

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Clean up presence, notify others, etc.
        await base.OnDisconnectedAsync(exception);
    }
}

// From anywhere in the app, push to that group:
public class BookingService(IHubContext<BookingHub> hub)
{
    public async Task ConfirmAsync(Booking booking, CancellationToken ct)
    {
        // ...persist...
        await hub.Clients.Group($"booking-{booking.Id}")
                 .SendAsync("BookingConfirmed", new { booking.Id, booking.Status }, ct);
    }
}`,
          },
          {
            caption: "Cache-aside, done carefully",
            language: "csharp",
            code: `public async Task<IReadOnlyList<Category>> GetCategoriesAsync(CancellationToken ct)
{
    const string key = "categories:v2";   // version in the key: deploys invalidate cleanly

    if (cache.TryGetValue(key, out IReadOnlyList<Category>? cached) && cached is not null)
        return cached;

    var categories = await db.Categories.AsNoTracking().ToListAsync(ct);

    cache.Set(key, categories, new MemoryCacheEntryOptions
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
        Size = 1
    });

    return categories;
}`,
          },
        ],
        pitfalls: [
          "Caching per-user data under a global key. That is a data leak, and a serious one.",
          "Using IMemoryCache across multiple instances and wondering why users see stale data on some requests — each instance has its own copy.",
        ],
        interview: [
          {
            q: "How would you add live updates to a dashboard?",
            a: "SignalR over WebSockets, with clients joining a group per dashboard or tenant so broadcasts are scoped. The server pushes on state change rather than clients polling. Across multiple instances I would add a Redis backplane or use a managed SignalR service, since connections are bound to one server. I would also keep a plain polling fallback for clients where sockets are blocked.",
          },
        ],
        practice:
          "Add a SignalR hub to your API that pushes new orders to a connected dashboard, then add a 60-second cache to your most expensive query and prove the hit rate with logging.",
      },
    ],
  },

  {
    id: "shipping",
    number: "09",
    title: "Shipping: observability, containers, and CI/CD",
    blurb:
      "Code that only runs on your machine is not finished. This module is what turns a repository into something running on the internet with the lights on.",
    outcome:
      "You can containerise a .NET API, deploy it through a pipeline, and diagnose it in production from its logs and health checks.",
    lessons: [
      {
        id: "logging",
        title: "Logging and observability",
        minutes: 45,
        summary:
          "Structured logs, correlation, metrics, and traces — how you answer 'what happened at 3am?' without a debugger.",
        why: "Production debugging skill is what distinguishes someone who can be on call from someone who cannot. It comes up in almost every senior interview.",
        points: [
          "ILogger<T> is built in and injected. Use message templates with named placeholders, not interpolation: the values become searchable fields rather than being baked into a string.",
          "Levels have meaning: Trace and Debug for development, Information for business events worth seeing, Warning for recoverable problems, Error for failed operations, Critical for the app being unusable.",
          "Serilog is the common production choice, writing structured JSON to a sink like Seq, Elasticsearch, or a cloud provider. Structured means you can query 'all errors for customer X'.",
          "Scopes attach context to everything logged inside them — a correlation id, a tenant, a user. Without correlation, tracing one request across services is guesswork.",
          "The three pillars: logs (what happened), metrics (how much and how fast), traces (where the time went across services). OpenTelemetry is the vendor-neutral standard and .NET supports it natively.",
          "Never log secrets, tokens, passwords, or full personal data. Redact at the source — logs get copied to places you did not anticipate.",
          "Log the decision, not just the fact: 'Rejected order {OrderId} because stock was {Stock}' is useful at 3am; 'Order failed' is not.",
        ],
        code: [
          {
            caption: "Structured logging with scope",
            language: "csharp",
            code: `// Good: named fields, queryable later
logger.LogInformation("Order {OrderId} placed by {CustomerId} for {Total:C}",
    order.Id, order.CustomerId, order.Total);

// Bad: one opaque string, nothing to filter on
logger.LogInformation($"Order {order.Id} placed by {order.CustomerId}");

// Scope: every log inside carries the correlation id
using (logger.BeginScope(new Dictionary<string, object>
{
    ["CorrelationId"] = correlationId,
    ["TenantId"] = tenantId
}))
{
    await ProcessAsync(ct);
}

// OpenTelemetry wiring
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddAspNetCoreInstrumentation()
                       .AddHttpClientInstrumentation()
                       .AddEntityFrameworkCoreInstrumentation()
                       .AddOtlpExporter())
    .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddOtlpExporter());`,
          },
        ],
        pitfalls: [
          "Logging inside a tight loop at Information level. You will generate gigabytes and hide the real signal.",
          "catch (Exception ex) { logger.LogError(ex.Message); } — passing only the message drops the stack trace. Pass the exception object as the first argument.",
        ],
        interview: [
          {
            q: "How do you debug an issue in production that you cannot reproduce locally?",
            a: "Start from the telemetry: find the failing requests by correlation id, read the structured logs around them, and check traces to see which component consumed the time or threw. Compare against metrics to see whether it is isolated or systemic, and check what changed — a deploy, a configuration change, a data volume. If the information is not there, the first fix is adding the logging that would have answered the question, because it will happen again.",
          },
        ],
        practice:
          "Add Serilog with JSON output and a correlation-id middleware to your API. Make one request, then find every log line for it by that id alone.",
      },
      {
        id: "resilience",
        title: "Health checks, resilience, and graceful shutdown",
        minutes: 40,
        summary:
          "Behaving well when a dependency is slow or down, and telling your orchestrator honestly whether you are ready.",
        why: "Containers and load balancers make decisions from health endpoints. Getting them wrong causes restart loops and dropped requests during deploys.",
        points: [
          "Liveness answers 'is the process alive?' and should be trivial. Readiness answers 'can I serve traffic?' and checks dependencies. Confusing them makes the orchestrator kill a healthy app because the database blipped.",
          "AddHealthChecks with tags lets one endpoint be liveness and another readiness, and there are ready-made checks for databases, Redis, and HTTP dependencies.",
          "Use IHttpClientFactory rather than newing HttpClient. It pools handlers, avoids socket exhaustion, respects DNS changes, and is where you attach resilience.",
          "Retry only what is safe to retry, with exponential backoff and jitter. Retrying a non-idempotent POST can double-charge someone.",
          "A circuit breaker stops hammering a service that is already failing, giving it room to recover and failing fast for your users. Microsoft.Extensions.Http.Resilience wraps Polly with sensible defaults.",
          "Graceful shutdown: on SIGTERM the host stops accepting new requests and lets in-flight ones finish. Long-running work should honour the stopping token so a deploy does not sever it.",
        ],
        code: [
          {
            caption: "Health endpoints and a resilient client",
            language: "csharp",
            code: `builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, tags: ["ready"])
    .AddUrlGroup(new Uri(paymentApiUrl), name: "payments", tags: ["ready"]);

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false            // process is up; check nothing
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

builder.Services.AddHttpClient<IPaymentGateway, PaymentGateway>(client =>
{
    client.BaseAddress = new Uri(options.BaseUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
})
.AddStandardResilienceHandler();   // retry + circuit breaker + timeout, sane defaults`,
          },
        ],
        pitfalls: [
          "A readiness check that queries the database on every call from a load balancer polling every second. Cache the result briefly.",
          "Retrying a payment charge without an idempotency key. The second attempt succeeds and the customer pays twice.",
        ],
        interview: [
          {
            q: "How do you handle a third-party API that is intermittently down?",
            a: "Time out quickly rather than hanging, retry idempotent calls with exponential backoff and jitter, and wrap the client in a circuit breaker so repeated failures fail fast instead of piling up threads. Degrade gracefully where the feature is not essential — serve cached or partial data — and surface the state in health checks and alerts. Anything that must not be lost goes onto a queue for later processing rather than failing the user's request.",
          },
        ],
        practice:
          "Add liveness and readiness endpoints and a resilience handler to an HTTP client. Point the client at a URL that does not exist and watch the retries and the breaker open in the logs.",
      },
      {
        id: "docker",
        title: "Docker for .NET",
        minutes: 50,
        summary:
          "A multi-stage Dockerfile, a compose file with a real database, and why the image should not be 900MB.",
        why: "Containers are the default deployment unit. A Dockerfile plus docker compose up in your README makes a portfolio project immediately runnable by a reviewer — a bigger advantage than it sounds.",
        points: [
          "Multi-stage build: compile in the SDK image, then copy only the published output into the much smaller ASP.NET runtime image. The final image ships no compiler and no source.",
          "Copy the .csproj and restore before copying the source. Docker caches that layer, so code changes do not re-download every package.",
          "Alpine or chiseled base images cut size further; the chiseled Ubuntu images are Microsoft's hardened, distroless-style option.",
          "Run as a non-root user. The modern images support USER app and it is a standard security review item.",
          "Configuration comes from environment variables, so the same image runs in every environment. Never bake secrets into the image — they live in every layer forever.",
          "docker compose brings up the API plus PostgreSQL, Redis, and Seq together, with depends_on and a healthcheck so the API waits for the database.",
          ".dockerignore matters: excluding bin, obj, and .git makes builds faster and images smaller.",
        ],
        code: [
          {
            caption: "Dockerfile",
            language: "text",
            code: `# ---- build ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore first: this layer is cached until the csproj changes
COPY ["ShopApi.Api/ShopApi.Api.csproj", "ShopApi.Api/"]
COPY ["ShopApi.Core/ShopApi.Core.csproj", "ShopApi.Core/"]
RUN dotnet restore "ShopApi.Api/ShopApi.Api.csproj"

COPY . .
RUN dotnet publish "ShopApi.Api/ShopApi.Api.csproj" -c Release -o /app/publish --no-restore

# ---- runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

USER app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "ShopApi.Api.dll"]`,
          },
          {
            caption: "docker-compose.yml",
            language: "text",
            code: `services:
  api:
    build: .
    ports: ["8080:8080"]
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__Default: "Host=db;Database=shop;Username=postgres;Password=devonly"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: devonly
      POSTGRES_DB: shop
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10

volumes:
  pgdata:`,
          },
        ],
        pitfalls: [
          "Using the SDK image as the runtime image. It works, and it is roughly seven times larger with a compiler in production.",
          "Hard-coding localhost in a connection string inside a container. Inside compose, the host is the service name (db), not localhost.",
        ],
        interview: [
          {
            q: "Why a multi-stage Dockerfile?",
            a: "The build needs the SDK, compilers, and source; the runtime needs none of that. Building in one stage and copying only the published output into a runtime image gives a much smaller image, a smaller attack surface, and no source code in production. It also keeps layer caching effective, so restores are skipped when only code changed.",
          },
        ],
        practice:
          "Containerise your API and get docker compose up to bring the API and Postgres up together, migrations applied, Swagger reachable. Then check the image size and shrink it.",
      },
      {
        id: "cicd",
        title: "CI/CD and getting it onto the internet",
        minutes: 45,
        summary:
          "A pipeline that builds, tests, and deploys on every push, and the hosting options that suit a portfolio budget.",
        why: "A live URL and a green build badge on your GitHub README does more for your credibility than another half-finished project.",
        points: [
          "The minimum useful pipeline: restore, build with warnings as errors, run tests, publish. Anything merged to main should have passed it.",
          "GitHub Actions is free for public repositories and is where your portfolio should live. Cache the NuGet directory to keep runs fast.",
          "Add value incrementally: code coverage reporting, dotnet format --verify-no-changes for style, dotnet list package --vulnerable for security.",
          "Deployment targets: Azure App Service (the default in .NET shops), Azure Container Apps, AWS ECS, Google Cloud Run, and cheaper options like Railway, Render, or Fly.io that suit a portfolio.",
          "Configuration and secrets come from the platform's settings or a vault, injected as environment variables. The pipeline references secrets, never contains them.",
          "Run migrations as an explicit deployment step, not at application startup, so a failure stops the deploy instead of a running instance.",
          "Deploy on merge to main, keep the pipeline under ten minutes, and make rollback a one-click redeploy of the previous image tag.",
        ],
        code: [
          {
            caption: ".github/workflows/ci.yml",
            language: "text",
            code: `name: CI

on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 8.0.x
          cache: true
          cache-dependency-path: '**/packages.lock.json'

      - run: dotnet restore
      - run: dotnet build --no-restore --configuration Release
      - run: dotnet test --no-build --configuration Release --logger trx --collect:"XPlat Code Coverage"

      - name: Check for vulnerable packages
        run: dotnet list package --vulnerable --include-transitive

      - name: Publish
        if: github.ref == 'refs/heads/main'
        run: dotnet publish ShopApi.Api -c Release -o ./publish`,
          },
        ],
        pitfalls: [
          "A pipeline that builds but does not run tests. It gives the appearance of rigour without the substance, and reviewers check.",
          "Secrets in workflow files or in appsettings committed to the repo. Use the platform's secret store and rotate anything that has ever been pushed.",
        ],
        interview: [
          {
            q: "Describe your deployment process.",
            a: "Trunk-based: pull requests run the pipeline — restore, build with warnings as errors, unit and integration tests, and a vulnerability check — and cannot merge red. Merging to main builds a container image tagged with the commit, runs migrations as an explicit step, and deploys. Configuration and secrets come from the platform, so the same image runs everywhere. Rollback is redeploying the previous tag, and health checks gate whether the new revision receives traffic.",
          },
        ],
        practice:
          "Add the workflow above to a project, get the badge green, and deploy it somewhere with a public URL. Put both in the README.",
      },
    ],
  },

  {
    id: "fullstack",
    number: "10",
    title: "Full-stack: .NET with the frontend you already know",
    blurb:
      "You already ship React and TypeScript. This module is about joining that to a .NET backend, plus a tour of the Microsoft-native UI options you will be asked about.",
    outcome:
      "You can wire a React frontend to a .NET API with typed contracts and working auth, and speak credibly about Blazor and MVC.",
    lessons: [
      {
        id: "spa-integration",
        title: "React and ASP.NET Core together",
        minutes: 45,
        summary:
          "Two deployment shapes, and the cross-origin details that decide which one is less painful.",
        why: "It is your strongest existing skill applied to a new backend. A full-stack candidate who genuinely owns both sides is rarer and better paid than either half.",
        points: [
          "Option A — separate deployments: React on Vercel or a CDN, the API on its own host. Clean separation, independent scaling, and you must handle CORS and cross-site cookies deliberately.",
          "Option B — served together: the API serves the built SPA as static files with a fallback route to index.html. One origin, no CORS, one deployment, and one thing to scale.",
          "Auth across origins: HttpOnly cookies need SameSite=None with Secure and exact CORS origins with credentials allowed. Bearer tokens in memory avoid cookie complexity but must never be kept in localStorage where any script can read them.",
          "The refresh flow belongs in one place — an interceptor on your fetch wrapper that retries once on a 401 after refreshing.",
          "Return ProblemDetails consistently so the frontend has one error shape to handle instead of guessing per endpoint.",
          "Keep pagination, filtering, and sorting server-side. A frontend that downloads everything and filters in the browser stops working at real data volumes.",
        ],
        code: [
          {
            caption: "Serving a built SPA from the API",
            language: "csharp",
            code: `// wwwroot contains the output of "npm run build"
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
// Anything not matched by an API route is handled by the SPA router
app.MapFallbackToFile("index.html");`,
          },
        ],
        interview: [
          {
            q: "How do you handle authentication between a React app and a .NET API?",
            a: "For a same-site deployment I prefer HttpOnly, Secure, SameSite cookies, because the token is never reachable from JavaScript, with antiforgery protection for state-changing requests. Across origins I use short-lived bearer tokens held in memory with a refresh token in an HttpOnly cookie, and a single interceptor that refreshes and retries on a 401. Either way CORS names exact origins, everything is HTTPS, and authorization is enforced server-side on every request rather than by hiding UI.",
          },
        ],
        practice:
          "Point a small React page at your API: login, store the token in memory, call a protected endpoint, and handle a 401 by refreshing once. Then deploy both and fix the CORS errors you get — you will get some.",
      },
      {
        id: "typed-contracts",
        title: "Typed contracts from OpenAPI",
        minutes: 30,
        summary:
          "Generating a TypeScript client from your API's OpenAPI document so the two sides cannot drift.",
        why: "It removes an entire category of bug and demonstrates the kind of tooling thinking teams value.",
        points: [
          ".NET 9+ has AddOpenApi/MapOpenApi built in; Swashbuckle and NSwag remain widely used and generate the same document.",
          "Feed that document to a generator — NSwag, openapi-typescript, or Kiota — to produce TypeScript types and a client.",
          "Generate in CI and fail the build when the checked-in client is out of date. A backend change that breaks the frontend then fails at build time rather than in production.",
          "Annotate endpoints properly (Produces, response types, nullability) or the generated types will be full of any and optional fields.",
          "The same document drives Swagger UI or Scalar for human readers, and Postman collections for manual testing.",
        ],
        code: [
          {
            caption: "Document in, types out",
            language: "bash",
            code: `# .NET 9+: the document is served at /openapi/v1.json
dotnet run &

# Generate TypeScript types for the frontend
npx openapi-typescript http://localhost:5000/openapi/v1.json -o src/api/schema.d.ts

# Or a full typed client
npx @openapitools/openapi-generator-cli generate \\
  -i http://localhost:5000/openapi/v1.json -g typescript-fetch -o src/api/client`,
          },
        ],
        practice:
          "Generate types from your API into a React app, then change a field name on the server and watch the frontend fail to compile. That failure is the entire point.",
      },
      {
        id: "blazor-mvc",
        title: "Blazor and MVC — the tour you need for interviews",
        minutes: 40,
        summary:
          "Two Microsoft-native UI stacks you may not choose, but will be asked about and may have to maintain.",
        why: "A large share of .NET jobs are maintaining MVC applications, and Blazor turns up in job ads constantly. Being unable to say anything about either is a needless weakness.",
        points: [
          "Blazor writes interactive UI in C# instead of JavaScript, as components with .razor markup.",
          "Render modes: Server keeps the component on the server with a SignalR connection carrying UI diffs — small download, needs constant connectivity, state lives on the server. WebAssembly downloads a .NET runtime and runs in the browser — works offline, larger initial download. .NET 8+ lets you mix per component and prerender.",
          "Blazor suits internal tools and line-of-business apps, especially with a C#-only team. It is not a reason to abandon React, and interviewers do not expect you to claim otherwise.",
          "MVC: controllers select data and pass a model to a Razor view that renders HTML server-side. Razor Pages is the simpler page-per-file variant for form-driven sites.",
          "Razor syntax (@model, @foreach, tag helpers, partials, layouts) is worth an hour of your time — it appears in Blazor, MVC, and Razor Pages alike.",
          "Server-rendered views still need antiforgery tokens on forms and encoding of user content; the framework provides both by default and people disable them by accident.",
        ],
        code: [
          {
            caption: "A Blazor component",
            language: "csharp",
            code: `@page "/orders"
@inject IOrderService Orders
@rendermode InteractiveServer

<h1>Orders</h1>

@if (_orders is null)
{
    <p>Loading...</p>
}
else
{
    <ul>
        @foreach (var order in _orders)
        {
            <li>@order.Reference - @order.Total.ToString("C")</li>
        }
    </ul>
}

<button @onclick="Refresh">Refresh</button>

@code {
    private IReadOnlyList<OrderResponse>? _orders;

    protected override async Task OnInitializedAsync() => await Refresh();

    private async Task Refresh() => _orders = await Orders.ListAsync(CancellationToken.None);
}`,
          },
        ],
        interview: [
          {
            q: "What is Blazor and when would you use it?",
            a: "A framework for building interactive web UI with C# components instead of JavaScript. Blazor Server runs components on the server and streams UI updates over SignalR, so the download is tiny but every interaction needs a live connection. Blazor WebAssembly runs .NET in the browser, so it works offline at the cost of a larger initial payload; .NET 8 allows mixing modes per component. It is a strong fit for internal and line-of-business applications with a C# team, while I would still reach for React on a public product with heavy UI requirements and an existing JavaScript ecosystem need.",
          },
        ],
        practice:
          "Build one page twice — as a Blazor Server component and as an MVC controller with a Razor view — both listing data from your API. An hour here makes those interview questions comfortable.",
      },
    ],
  },

  {
    id: "career",
    number: "11",
    title: "From studying to hired",
    blurb:
      "The part most courses leave out. Skills do not get you hired on their own — evidence, positioning, and interview performance do.",
    outcome:
      "You have a portfolio, a resume, and interview answers that present you as a .NET developer rather than someone learning .NET.",
    lessons: [
      {
        id: "portfolio-standard",
        title: "What a hireable portfolio project looks like",
        minutes: 40,
        summary:
          "The gap between a tutorial repository and a project that convinces a reviewer, which is smaller and more specific than people think.",
        why: "Most applicants link three unfinished CRUD apps. Two finished, documented, deployed projects beat ten repositories with a default README.",
        points: [
          "A README that opens with what the project does, a screenshot or a live link, and how to run it in one command. A reviewer spends about ninety seconds — earn the next five minutes.",
          "It must run. docker compose up, or clear steps that actually work on a clean machine. Reviewers do try.",
          "Tests that mean something, and a CI badge that is green. This is the fastest credibility signal in a repository.",
          "Commit history that reads like work: small, focused commits with real messages. One commit called 'initial commit' containing the entire app suggests it was copied.",
          "A short 'Decisions' or 'Architecture' section explaining two or three trade-offs you made and why. This is what turns a code review into a conversation about your judgement.",
          "Deployed, with a URL. Even on a free tier. 'It runs on my machine' is not evidence.",
          "Depth over breadth: one project with auth, tests, CI, Docker, and observability beats five that stop at CRUD.",
        ],
        practice:
          "Take your strongest project and bring it to this standard completely before starting another. Then ask someone to clone and run it from the README alone, and fix everything they stumble on.",
      },
      {
        id: "resume",
        title: "Positioning a Python and TypeScript background for .NET roles",
        minutes: 35,
        summary:
          "How to present a switch so it reads as breadth and transferable engineering skill rather than as inexperience.",
        why: "Your existing experience is an asset if framed correctly and a liability if framed apologetically. Framing is a skill you can practise.",
        points: [
          "Lead with engineering outcomes, not technologies: systems shipped, workflows automated, users served, time saved. Languages are how you did it.",
          "Mirror the posting's vocabulary honestly — if it says ASP.NET Core, EF Core, SQL Server, and Azure, those words should appear where they are true. Screening filters are literal.",
          "Frame the transition as accumulation: 'full-stack engineer with production experience in Python and TypeScript, now building in C# and ASP.NET Core' — never 'trying to learn .NET'.",
          "Every claim needs evidence one click away: a repository, a live URL, a specific number.",
          "Domain experience is a genuine differentiator. Procurement and bidding workflow knowledge is directly relevant to enterprise .NET work, which is overwhelmingly line-of-business software. Say so explicitly.",
          "Keep it to one page with links. Reviewers skim; the links are where the depth lives.",
          "Update LinkedIn with the same positioning — recruiters search it by keyword, and inbound beats applying.",
        ],
        practice:
          "Rewrite your resume summary and three bullet points in this frame, then read them aloud. If any sentence sounds like an apology for not having .NET years, rewrite it around what you did build.",
      },
      {
        id: "interview-process",
        title: "The interview process, stage by stage",
        minutes: 45,
        summary:
          "What each round is actually testing, so you prepare for the right thing.",
        why: "Most rejections are preparation mismatches rather than skill gaps. Knowing what a stage is for is half of passing it.",
        points: [
          "Recruiter screen — communication, salary alignment, and whether your background matches the requisition. Have a crisp two-minute story and a researched salary range ready.",
          "Technical screen — usually language fundamentals and a small live problem. This is where value versus reference types, async, and LINQ come up. Talk while you think; silence is scored badly.",
          "Take-home — the highest-signal stage and the one most people underuse. Submit with a README, tests, sensible commits, and a short note on trade-offs and what you would do with more time. That note frequently gets you the interview on its own.",
          "System design — even at junior level: 'design a booking system'. Ask about scale and requirements, sketch data model, endpoints, and where state lives, then discuss failure modes. Nobody expects a perfect answer; they want to hear you reason.",
          "Behavioural — STAR format (Situation, Task, Action, Result), and prepare four real stories: a hard bug, a disagreement, a failure and what changed, and something you shipped end to end.",
          "Always ask questions: how work reaches production, how the team tests, what the codebase's biggest pain is. It signals you evaluate teams too.",
          "After a rejection, ask for one piece of specific feedback. Some give it, and it is worth more than another tutorial.",
        ],
        practice:
          "Write out your two-minute introduction and four STAR stories in full, then say them out loud until they are natural rather than memorised.",
      },
      {
        id: "job-market",
        title: "Finding the roles, and negotiating",
        minutes: 35,
        summary:
          "Where .NET jobs actually are, how to apply in a way that gets replies, and how to handle money.",
        why: "Application strategy has a bigger effect on outcomes than the last 10% of technical polish.",
        points: [
          ".NET concentrates in enterprise: banking, insurance, healthcare, logistics, government contractors, ERP vendors, and outsourcing firms. That means stable work and less fashion-driven churn than the JavaScript market.",
          "From the Philippines there are three routes: local companies and BPO/IT firms with substantial .NET practices, remote roles with Australian, Singaporean, US and European employers, and contract work. The remote path pays better and expects stronger English and asynchronous communication — both of which you can demonstrate in writing.",
          "Twenty targeted applications with a tailored first line beat two hundred generic ones. Reference something specific about the company or the role.",
          "Referrals convert far better than cold applications. Being visible — writing about what you build, contributing small fixes to .NET open source, answering questions — creates them over months, so start early.",
          "Do not filter yourself out on years of experience. Apply if you meet most of the technical requirements; those numbers are aspirations, not gates.",
          "Research bands before talking numbers: local job boards, Glassdoor, Levels.fyi for multinationals, and asking people in the same market. Ranges vary enormously between local and remote roles, so use current sources rather than any figure quoted in a course.",
          "When asked for expectations, give a researched range with a reason, and let them make the first concrete offer where you can. Negotiate on the total package, and get everything in writing.",
          "Expect a long search. Rejections are the process working, not a verdict. Track applications so you can see patterns rather than only feeling them.",
        ],
        practice:
          "Build a tracking sheet, find fifteen genuinely matching roles, and apply to five this week with a tailored opening line for each. Then note which stages you reach, so you can fix the right thing.",
      },
    ],
  },
];
