import type { Module } from "./types";

/** Modules 04–07: ASP.NET Core, data access, security, and testing. */
export const webModules: Module[] = [
  {
    id: "aspnet-core",
    number: "04",
    title: "ASP.NET Core fundamentals",
    blurb:
      "The framework itself: how a request travels through your application, how dependencies get injected, and the two styles of writing endpoints you will meet in the wild.",
    outcome:
      "You can build a well-structured web API from an empty folder, and explain what every line of Program.cs does.",
    lessons: [
      {
        id: "pipeline",
        title: "The host, Program.cs, and the middleware pipeline",
        minutes: 55,
        summary:
          "Every ASP.NET Core app is a host that builds a pipeline of middleware. A request goes down the pipeline and the response comes back up.",
        why: "Middleware order causes real bugs — authentication after authorization, CORS in the wrong place — and 'explain the request pipeline' is asked in nearly every ASP.NET interview.",
        points: [
          "WebApplication.CreateBuilder(args) sets up configuration, logging, and the DI container. Everything before builder.Build() registers services; everything after configures the pipeline.",
          "Middleware are components with access to the HttpContext that call the next one — or do not, which is how short-circuiting works (a 401 from authentication never reaches your endpoint).",
          "Order matters and is top to bottom: exception handling first (so it wraps everything), then HTTPS redirection, static files, routing, CORS, authentication, authorization, then endpoints.",
          "app.Use registers middleware, app.Run terminates the pipeline, app.Map branches on a path.",
          "The older Startup.cs with ConfigureServices and Configure methods does the same two jobs in two methods. You will see it in any project predating .NET 6 — recognise it.",
          "HttpContext carries the request, the response, the authenticated user, and per-request services. Avoid passing it deep into your business logic; extract what you need at the boundary.",
        ],
        code: [
          {
            caption: "Program.cs, annotated",
            language: "csharp",
            code: `var builder = WebApplication.CreateBuilder(args);

// --- 1. Register services in the DI container ---
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

var app = builder.Build();

// --- 2. Build the pipeline. Order is the behaviour. ---
app.UseExceptionHandler();      // outermost: catches everything below
if (app.Environment.IsDevelopment()) app.MapOpenApi();
app.UseHttpsRedirection();
app.UseCors("frontend");
app.UseAuthentication();        // who are you?  MUST come before...
app.UseAuthorization();         // ...are you allowed?

app.MapGet("/health", () => Results.Ok("healthy"));
app.MapOrderEndpoints();

app.Run();`,
          },
          {
            caption: "Custom middleware: request timing",
            language: "csharp",
            code: `public class TimingMiddleware(RequestDelegate next, ILogger<TimingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var started = Stopwatch.GetTimestamp();
        await next(context);            // hand off to the rest of the pipeline
        var elapsed = Stopwatch.GetElapsedTime(started);

        logger.LogInformation("{Method} {Path} responded {Status} in {Ms}ms",
            context.Request.Method, context.Request.Path,
            context.Response.StatusCode, elapsed.TotalMilliseconds);
    }
}

// Registered where you want it to sit in the order:
app.UseMiddleware<TimingMiddleware>();`,
          },
        ],
        pitfalls: [
          "Calling UseAuthorization before UseAuthentication. Authorization then sees an unauthenticated user and rejects valid requests.",
          "Writing to the response after the next middleware has already started sending it — you get 'headers are read-only' at runtime.",
        ],
        interview: [
          {
            q: "Explain the ASP.NET Core middleware pipeline.",
            a: "A request passes through an ordered chain of middleware components, each able to inspect or modify the request, pass control to the next component, and then act on the response on the way back. Any component can short-circuit by not calling next — how static files or an auth failure return immediately. Order is significant: exception handling outermost, authentication before authorization, routing before endpoints.",
          },
        ],
        practice:
          "Create an empty web API and write two middleware components: one that logs timings, one that adds a correlation id header. Deliberately put them in the wrong order and observe what changes.",
      },
      {
        id: "di-lifetimes",
        title: "Dependency injection and service lifetimes",
        minutes: 50,
        summary:
          "The built-in container, the three lifetimes, and the bug that lifetimes cause when you mix them incorrectly.",
        why: "Lifetime questions are asked constantly, and captive dependencies cause data corruption bugs that are very hard to trace.",
        points: [
          "Transient — a new instance every time it is requested. Cheap, stateless helpers.",
          "Scoped — one instance per request in a web app. This is where DbContext and most services belong.",
          "Singleton — one instance for the whole application lifetime. Configuration, caches, and anything expensive to create. Must be thread-safe.",
          "The captive dependency bug: injecting a Scoped service into a Singleton captures the first request's instance forever. A DbContext captured this way will be disposed, shared across requests, and eventually corrupt data. The container can detect it if you enable validation on scopes.",
          "To use a scoped service from a singleton (a background service, for example), inject IServiceScopeFactory and create a scope per unit of work.",
          "Registration reads AddScoped<IInterface, Implementation>(). Registering the same interface twice means the last wins for a single resolve, but injecting IEnumerable<IInterface> gives you all of them — the strategy pattern from module 02.",
          "The built-in container is deliberately minimal. Autofac and others add features like property injection and decorators, but most teams never need them.",
        ],
        code: [
          {
            caption: "Lifetimes, and escaping the captive dependency",
            language: "csharp",
            code: `builder.Services.AddSingleton<IClock, SystemClock>();          // stateless, thread-safe
builder.Services.AddScoped<IOrderService, OrderService>();      // per request
builder.Services.AddTransient<IEmailBuilder, EmailBuilder>();   // per resolve

// Catch lifetime mistakes at startup rather than in production
builder.Host.UseDefaultServiceProvider(o =>
{
    o.ValidateScopes = true;
    o.ValidateOnBuild = true;
});

// A singleton that needs a scoped service does it per unit of work:
public class OrderCleanupService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            // ...use db, then the scope disposes it
            await Task.Delay(TimeSpan.FromMinutes(5), ct);
        }
    }
}`,
          },
        ],
        pitfalls: [
          "Registering DbContext as a singleton to 'avoid overhead'. It is not thread-safe and tracks entities per unit of work — this breaks concurrent requests.",
          "Service locator style: injecting IServiceProvider everywhere and resolving manually. It hides dependencies and defeats the point.",
        ],
        interview: [
          {
            q: "Explain transient, scoped, and singleton.",
            a: "Transient gives a new instance on every resolution; scoped gives one per scope, which in ASP.NET Core is one per HTTP request; singleton gives one for the application's lifetime. The rule of thumb is scoped for anything holding per-request state such as a DbContext, singleton for stateless or expensive shared things, transient for lightweight helpers. Injecting a shorter-lived service into a longer-lived one is a captive dependency and a bug.",
          },
        ],
        practice:
          "Register the same interface with all three lifetimes in a test app, inject it into an endpoint twice per request, and log the instance hash codes across two requests. Seeing the numbers makes the concept permanent.",
      },
      {
        id: "endpoints",
        title: "Minimal APIs and controllers — both, because jobs use both",
        minutes: 55,
        summary:
          "The same endpoint written two ways, with a clear view of when each style is the right choice.",
        why: "New projects lean towards minimal APIs; the enormous existing base of MVC controllers is what most jobs actually maintain. You need to be fluent in both.",
        points: [
          "Minimal APIs map a route straight to a handler. Less ceremony, excellent performance, ideal for focused services. Organise them into extension methods per feature rather than piling everything into Program.cs.",
          "Controllers group actions in a class with attribute routing, model binding, filters, and model state validation. Better when you want cross-cutting filters and conventional structure.",
          "Both use the same DI, the same middleware, the same routing, and the same results — the choice is style, not capability.",
          "Return typed results: Results.Ok(dto), Results.NotFound(), Results.Created(uri, dto), Results.NoContent(). TypedResults gives compile-time checking and better OpenAPI output.",
          "Never return your database entity from an endpoint. Map to a DTO/response record — otherwise you leak internal fields, create accidental API contracts, and risk circular references in serialisation.",
          "Route conventions: plural nouns for collections (/orders), the id in the path for a single item (/orders/{id}), query strings for filtering and paging.",
        ],
        code: [
          {
            caption: "Minimal API, organised by feature",
            language: "csharp",
            code: `public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders")
                       .WithTags("Orders")
                       .RequireAuthorization();

        group.MapGet("/", async (IOrderService svc, int page, int size, CancellationToken ct) =>
            TypedResults.Ok(await svc.ListAsync(page, size, ct)));

        group.MapGet("/{id:guid}", async Task<Results<Ok<OrderResponse>, NotFound>> (
            Guid id, IOrderService svc, CancellationToken ct) =>
        {
            var order = await svc.GetAsync(id, ct);
            return order is null ? TypedResults.NotFound() : TypedResults.Ok(order);
        });

        group.MapPost("/", async (CreateOrderRequest request, IOrderService svc, CancellationToken ct) =>
        {
            var created = await svc.CreateAsync(request, ct);
            return TypedResults.Created($"/api/orders/{created.Id}", created);
        });
    }
}`,
          },
          {
            caption: "The same thing as a controller",
            language: "csharp",
            code: `[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController(IOrderService service) : ControllerBase
{
    [HttpGet("{id:guid}")]
    [ProducesResponseType<OrderResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponse>> Get(Guid id, CancellationToken ct)
    {
        var order = await service.GetAsync(id, ct);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        // [ApiController] auto-returns 400 with validation details if the model is invalid
        var created = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }
}`,
          },
        ],
        pitfalls: [
          "Putting business logic in the endpoint. Handlers should validate input, call a service, and shape a response. Anything else belongs in a service you can test without HTTP.",
          "Returning 200 for everything. Status codes are part of your API's contract — 201 with a Location header on create, 204 on delete, 404 when absent, 400 for bad input.",
        ],
        interview: [
          {
            q: "Minimal APIs or controllers?",
            a: "Both are first-class. Minimal APIs suit smaller focused services and microservices, with less ceremony and slightly better throughput. Controllers suit larger applications that benefit from filters, conventions, and grouped structure, and are what most existing codebases use. The decision is usually team consistency rather than capability.",
          },
        ],
        practice:
          "Build a Products API with full CRUD as minimal APIs, then port one endpoint to a controller. Confirm both appear correctly in Swagger and return the right status codes.",
      },
      {
        id: "configuration",
        title: "Configuration, options, and environments",
        minutes: 40,
        summary:
          "How settings flow from files, environment variables, and secret stores into strongly typed objects — and how to keep secrets out of git.",
        why: "Leaking a connection string into a public repository is a career-damaging mistake, and 'how do you manage secrets?' is a standard question.",
        points: [
          "Configuration is layered, with later sources overriding earlier: appsettings.json, then appsettings.{Environment}.json, then user secrets in development, then environment variables, then command line.",
          "ASPNETCORE_ENVIRONMENT selects the environment — Development, Staging, Production. app.Environment.IsDevelopment() gates development-only behaviour like detailed errors.",
          "The options pattern binds a configuration section to a class, which you then inject as IOptions<T>. Strongly typed settings beat magic strings scattered through the code.",
          "IOptionsSnapshot<T> re-reads per request (useful when configuration can change); IOptionsMonitor<T> pushes changes and works in singletons.",
          "Never commit secrets. In development use dotnet user-secrets (stored outside the repo); in production use environment variables or a managed secret store (Azure Key Vault, AWS Secrets Manager).",
          "Validate configuration at startup with ValidateDataAnnotations().ValidateOnStart() so a missing setting fails immediately rather than at 3am on first use.",
        ],
        code: [
          {
            caption: "Typed settings, validated at startup",
            language: "csharp",
            code: `public class PaymentOptions
{
    public const string Section = "Payment";

    [Required] public required string ApiKey { get; init; }
    [Range(1, 120)] public int TimeoutSeconds { get; init; } = 30;
}

builder.Services
    .AddOptions<PaymentOptions>()
    .Bind(builder.Configuration.GetSection(PaymentOptions.Section))
    .ValidateDataAnnotations()
    .ValidateOnStart();   // wrong config = the app refuses to start

public class PaymentClient(IOptions<PaymentOptions> options)
{
    private readonly PaymentOptions _options = options.Value;
}`,
          },
          {
            caption: "Keeping secrets out of the repository",
            language: "bash",
            code: `dotnet user-secrets init
dotnet user-secrets set "Payment:ApiKey" "sk_live_not_in_git"
dotnet user-secrets list

# In production, the same setting as an environment variable
# (double underscore is the separator for nesting)
export Payment__ApiKey="sk_live_not_in_git"`,
          },
        ],
        pitfalls: [
          "Committing appsettings.Development.json with real credentials. Use user secrets from day one.",
          "Reading configuration with string keys throughout the codebase. One typo becomes a null at runtime; bind to a class instead.",
        ],
        interview: [
          {
            q: "How do you manage configuration and secrets across environments?",
            a: "Layered configuration providers: appsettings.json for defaults, environment-specific files for overrides, user secrets locally, and environment variables or a managed vault in deployed environments. Settings bind to typed options classes validated at startup, so a bad or missing value fails the deployment rather than a request. Secrets never enter source control.",
          },
        ],
        practice:
          "Move every hard-coded value in a project into configuration, bind it to an options class, add validation, and prove it by deleting a required setting and watching startup fail with a clear message.",
      },
      {
        id: "validation-errors",
        title: "Model binding, validation, and error responses",
        minutes: 45,
        summary:
          "Getting data in safely and telling the client what went wrong in a consistent, standard format.",
        why: "Consistent error handling is a hallmark of a considered API, and take-home tests are frequently marked on exactly this.",
        points: [
          "Model binding maps route values, query strings, headers, and the JSON body onto your parameters. [FromBody], [FromQuery], [FromRoute] make it explicit when inference is ambiguous.",
          "DataAnnotations ([Required], [StringLength], [Range], [EmailAddress]) cover simple rules. With [ApiController] a failed model state automatically returns a 400 with details.",
          "FluentValidation is the common choice for anything conditional or cross-field, keeping rules out of the DTO and in a testable class.",
          "ProblemDetails (RFC 7807) is the standard error shape for HTTP APIs, and ASP.NET Core produces it natively. Use it so every client sees one error format.",
          "Use a global exception handler (IExceptionHandler or UseExceptionHandler) to map exception types to status codes in one place — NotFound to 404, validation to 400, everything else to 500 with a correlation id and no internal detail.",
          "Never return exception messages or stack traces to clients in production. Log the detail, return an opaque reference.",
        ],
        code: [
          {
            caption: "One place that turns exceptions into responses",
            language: "csharp",
            code: `public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, title) = exception switch
        {
            OrderNotFoundException => (StatusCodes.Status404NotFound, "Order not found"),
            ValidationException    => (StatusCodes.Status400BadRequest, "Validation failed"),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Forbidden"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        // Full detail to the logs, safe detail to the caller
        logger.LogError(exception, "Unhandled {Type} on {Path}", exception.GetType().Name, context.Request.Path);

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Instance = context.Request.Path,
            Extensions = { ["traceId"] = context.TraceIdentifier }
        };

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(problem, ct);
        return true;
    }
}

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();`,
          },
          {
            caption: "FluentValidation for real rules",
            language: "csharp",
            code: `public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator(IProductRepository products)
    {
        RuleFor(x => x.CustomerEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Items).NotEmpty().WithMessage("An order needs at least one item.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
        RuleFor(x => x.CouponCode)
            .MustAsync(async (code, ct) => code is null || await products.CouponExistsAsync(code, ct))
            .WithMessage("Unknown coupon code.");
    }
}`,
          },
        ],
        pitfalls: [
          "Validating in the controller with a pile of if statements. It is untestable in isolation and gets duplicated across endpoints.",
          "Returning 500 for a client mistake. If the caller sent bad data, that is a 400 — a 500 says the fault is yours and will page someone.",
        ],
        interview: [
          {
            q: "How do you handle errors in a web API?",
            a: "Centrally. A global exception handler maps known exception types to appropriate status codes and returns a consistent ProblemDetails body with a trace id, while logging the full exception server-side. Expected failures like validation return 400 with field-level detail rather than throwing. Clients get one predictable error shape, and internal details never leak.",
          },
        ],
        practice:
          "Add FluentValidation and a global exception handler to your Products API. Confirm that a bad payload returns a 400 with field errors, an unknown id returns a 404, and a deliberate crash returns a 500 with a trace id but no stack trace.",
      },
    ],
  },

  {
    id: "data",
    number: "05",
    title: "Data access with Entity Framework Core",
    blurb:
      "Almost every .NET job involves a relational database through EF Core. This module is about using it without producing queries that fall over in production.",
    outcome:
      "You can model a schema, evolve it with migrations, write efficient queries, and explain the SQL your code generates.",
    lessons: [
      {
        id: "dbcontext",
        title: "DbContext, entities, and mapping",
        minutes: 50,
        summary:
          "The unit of work at the centre of EF Core, and the two ways to tell it about your schema.",
        why: "Every data bug starts here. Understanding change tracking explains most of EF Core's surprising behaviour.",
        points: [
          "DbContext represents a session with the database — it tracks the entities you load and writes changes when you call SaveChangesAsync. It is scoped per request and is not thread-safe.",
          "DbSet<T> is a table. Navigation properties express relationships and are how you traverse them in code.",
          "Conventions do a lot for free: a property named Id or {Type}Id becomes the primary key, and a navigation plus a matching {Nav}Id becomes a foreign key.",
          "Fluent API in OnModelCreating is where you configure the rest — required, max lengths, indexes, decimal precision, delete behaviour, and composite keys. It is preferable to attributes because it keeps persistence concerns out of your domain classes.",
          "Split configuration into IEntityTypeConfiguration<T> classes once you have more than a handful of entities; OnModelCreating stays a single ApplyConfigurationsFromAssembly call.",
          "Change tracking: loaded entities are watched, and SaveChangesAsync generates the INSERT/UPDATE/DELETE for whatever differs. You do not call Update for an entity you loaded and modified.",
        ],
        code: [
          {
            caption: "Context and configuration",
            language: "csharp",
            code: `public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Total).HasPrecision(18, 2);        // money, not float
        builder.Property(o => o.Reference).HasMaxLength(32).IsRequired();
        builder.HasIndex(o => o.Reference).IsUnique();

        builder.HasOne(o => o.Customer)
               .WithMany(c => c.Orders)
               .HasForeignKey(o => o.CustomerId)
               .OnDelete(DeleteBehavior.Restrict);   // do not silently delete orders
    }
}`,
          },
          {
            caption: "Change tracking in action",
            language: "csharp",
            code: `var order = await db.Orders.FirstAsync(o => o.Id == id, ct);
order.Status = OrderStatus.Shipped;      // tracked — no Update() call needed
await db.SaveChangesAsync(ct);           // emits a single UPDATE for the changed column

// A detached entity (e.g. deserialised from a request) is different:
db.Orders.Update(incoming);              // marks every property modified
await db.SaveChangesAsync(ct);`,
          },
        ],
        pitfalls: [
          "Using decimal without configuring precision. Some providers silently truncate, and you lose centavos.",
          "Cascade delete left at the default on relationships where it is dangerous. Deleting a customer should not silently erase their order history.",
        ],
        interview: [
          {
            q: "What is change tracking?",
            a: "The DbContext keeps a snapshot of every entity it loads. When SaveChanges runs it compares current values to the snapshot and generates the minimum SQL needed. It is why modifying a loaded entity is enough to persist it, why AsNoTracking is faster for read-only queries, and why a long-lived context leaks memory.",
          },
        ],
        practice:
          "Model Customer, Order, OrderItem, and Product with correct relationships and constraints, configured with the Fluent API in separate configuration classes.",
      },
      {
        id: "migrations",
        title: "Migrations and evolving a schema safely",
        minutes: 45,
        summary:
          "How schema changes get versioned, reviewed, applied, and rolled back — and why generated SQL belongs in code review.",
        why: "Every team has a migration story that went wrong. Knowing how to inspect and control what runs against production is a differentiator.",
        points: [
          "dotnet ef migrations add <Name> compares your model to the last migration and generates Up and Down methods. The migration is C# and is meant to be read before you commit it.",
          "dotnet ef database update applies pending migrations; a __EFMigrationsHistory table records what has run.",
          "Always read the generated migration. A renamed property looks like drop-column plus add-column, which silently destroys data — you fix that by hand with RenameColumn.",
          "For production, generate a SQL script (dotnet ef migrations script --idempotent) and have it reviewed and applied by your deployment process. Calling Database.Migrate() at startup is convenient for small apps and risky with multiple instances.",
          "Seeding: HasData for reference data that belongs to the schema, or a seeding routine at startup for development data.",
          "Additive changes are safe to deploy alongside running code; destructive ones need the expand-and-contract pattern — add the new column, deploy code writing both, backfill, then drop the old column in a later release.",
        ],
        code: [
          {
            caption: "The commands you will use daily",
            language: "bash",
            code: `dotnet tool install --global dotnet-ef

dotnet ef migrations add AddOrderReference --project ShopApi.Infrastructure --startup-project ShopApi.Api
dotnet ef database update
dotnet ef migrations list

# Undo the last migration (only if it has not been applied anywhere else)
dotnet ef migrations remove

# Roll the database back to a named migration
dotnet ef database update AddCustomerTable

# What production should actually run
dotnet ef migrations script --idempotent --output migrate.sql`,
          },
        ],
        pitfalls: [
          "Editing an already-applied migration. Other environments have recorded it as run and will never re-apply it. Add a new migration instead.",
          "Deleting the migrations folder to 'start clean' against a database that already has data. That is how you lose a staging environment.",
        ],
        interview: [
          {
            q: "How do you apply database changes to production?",
            a: "Migrations are generated and reviewed in the pull request like any code. For deployment I prefer generating an idempotent SQL script that runs as an explicit, auditable step, rather than migrating at application startup, which races when several instances start together. Destructive changes are split across releases using expand-and-contract so a rollback never loses data.",
          },
        ],
        practice:
          "Create three migrations: add a table, add an index, and rename a column. Inspect each generated file, fix the rename so it does not drop data, and roll back to the first migration to confirm Down works.",
      },
      {
        id: "querying",
        title: "Querying efficiently: tracking, projections, and N+1",
        minutes: 55,
        summary:
          "Where EF Core performance is won and lost. This is the most practically valuable lesson in the module.",
        why: "The N+1 query problem is the single most common performance bug in ORM-based applications, and a very common interview question.",
        points: [
          "AsNoTracking on read-only queries skips snapshotting and is measurably faster. Anything feeding a response DTO should use it.",
          "Project with Select into a DTO so the SQL fetches only the columns you need. Loading full entities to read two fields is waste that compounds.",
          "N+1: loading a list, then touching a navigation property inside a loop, issues one query per row. Fix with Include for eager loading, or better, project the related data in the same query.",
          "Include/ThenInclude load related entities; too many Includes in one query produce a huge cartesian join. AsSplitQuery issues one query per collection instead, which is often faster.",
          "Lazy loading (proxies) silently causes N+1 and is best left off. Explicit is better.",
          "Filter before you materialise. Where before ToList runs in SQL; Where after ToList runs in memory over every row you already fetched.",
          "Paginate every list endpoint. Skip/Take with a stable OrderBy — an unordered paged query returns arbitrary rows.",
          "Log the generated SQL in development. If you cannot see the SQL, you cannot reason about the performance.",
        ],
        code: [
          {
            caption: "The N+1 problem and three fixes",
            language: "csharp",
            code: `// 1 query for orders + 1 per order for the customer = N+1
var orders = await db.Orders.ToListAsync(ct);
foreach (var order in orders)
    Console.WriteLine(order.Customer.Name);   // lazy load per row

// Fix A: eager load in one query
var withCustomers = await db.Orders.Include(o => o.Customer).ToListAsync(ct);

// Fix B (better for read APIs): project exactly what you need
var summaries = await db.Orders
    .AsNoTracking()
    .Where(o => o.PlacedAt >= from)
    .OrderByDescending(o => o.PlacedAt)
    .Skip((page - 1) * size).Take(size)
    .Select(o => new OrderSummary(o.Id, o.Customer.Name, o.Total))  // SELECT of 3 columns
    .ToListAsync(ct);

// Fix C: collections that would explode into a cartesian product
var detailed = await db.Orders
    .Include(o => o.Items)
    .Include(o => o.Payments)
    .AsSplitQuery()
    .ToListAsync(ct);`,
          },
          {
            caption: "See the SQL while you develop",
            language: "csharp",
            code: `builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging()   // shows parameter values — dev only
               .LogTo(Console.WriteLine, LogLevel.Information);
    }
});`,
          },
        ],
        pitfalls: [
          "Calling ToList() then filtering. You have downloaded the table and filtered it in memory.",
          "Client-side evaluation surprises: a method EF cannot translate throws, or in older versions silently ran in memory. Keep query expressions translatable.",
          "EnableSensitiveDataLogging in production. It writes parameter values — including personal data and credentials — to your logs.",
        ],
        interview: [
          {
            q: "What is the N+1 problem and how do you fix it?",
            a: "One query fetches N rows, then accessing a navigation property on each row issues another query — N+1 round trips. Fix it by eager loading the relationship with Include, or better for read paths, projecting the needed fields with Select so one query returns everything. Detect it by logging the generated SQL or watching the query count in a profiler.",
          },
          {
            q: "When would you use AsNoTracking?",
            a: "For read-only queries, which is most GET endpoints. It skips creating change-tracking snapshots, reducing memory and CPU. You must not use it if you intend to modify and save the entities.",
          },
        ],
        practice:
          "Write an endpoint that returns orders with customer names. Implement it naively first, log the SQL, count the queries, then fix it with a projection and count again. Record both numbers — that is an interview story.",
      },
      {
        id: "transactions-repos",
        title: "Transactions, concurrency, and the repository debate",
        minutes: 45,
        summary:
          "Keeping multi-step writes consistent, handling two users editing the same row, and an honest look at whether you need a repository layer.",
        why: "Money-touching code needs transactional thinking, and 'do you use the repository pattern?' is a question where a thoughtful answer beats a dogmatic one.",
        points: [
          "SaveChangesAsync is already a transaction — everything tracked is committed atomically. You only need an explicit transaction when you span multiple SaveChanges calls or mix in other operations.",
          "BeginTransactionAsync with commit and rollback covers that case. Keep transactions short; a long one holds locks and blocks other users.",
          "Optimistic concurrency: add a rowversion/xmin concurrency token, and EF throws DbUpdateConcurrencyException when someone else changed the row since you read it. Handle it by reloading and either merging or telling the user.",
          "Pessimistic locking (SELECT ... FOR UPDATE) exists but is rarely the right first answer in a web app.",
          "The repository debate: DbContext is already a unit of work and DbSet is already a repository, so wrapping them adds a layer that often just forwards calls. The honest argument for one is a stable domain-facing interface and easier substitution in tests.",
          "A pragmatic middle ground many teams use: no generic repository, but a focused service or query class per feature that owns its EF queries — testable, no leaked IQueryable, no ceremony.",
        ],
        code: [
          {
            caption: "An explicit transaction across two operations",
            language: "csharp",
            code: `await using var transaction = await db.Database.BeginTransactionAsync(ct);
try
{
    var order = new Order { /* ... */ };
    db.Orders.Add(order);
    await db.SaveChangesAsync(ct);

    await inventory.ReserveAsync(order.Items, ct);   // must not happen without the order
    await db.SaveChangesAsync(ct);

    await transaction.CommitAsync(ct);
}
catch
{
    await transaction.RollbackAsync(ct);
    throw;
}`,
          },
          {
            caption: "Optimistic concurrency",
            language: "csharp",
            code: `public class Product
{
    public Guid Id { get; set; }
    public int Stock { get; set; }
    [Timestamp] public byte[]? RowVersion { get; set; }   // concurrency token
}

try
{
    product.Stock -= quantity;
    await db.SaveChangesAsync(ct);
}
catch (DbUpdateConcurrencyException)
{
    // Someone else changed this row first — reload and decide
    throw new StockChangedException("Stock changed while you were ordering. Please retry.");
}`,
          },
        ],
        interview: [
          {
            q: "Do you use the repository pattern with EF Core?",
            a: "Not reflexively. DbContext is a unit of work and DbSet is a repository, so a generic repository over them usually adds indirection without value and often blocks useful features. I do isolate data access behind feature-level services or query classes so business logic never holds an IQueryable and tests can substitute it. Where a project genuinely needs to keep the domain free of EF, a hand-written repository per aggregate is worth it.",
          },
        ],
        practice:
          "Implement an order-placement flow that decrements stock and creates an order atomically. Then write a test proving that a failure in the second step leaves no order behind.",
      },
      {
        id: "raw-sql",
        title: "Raw SQL, Dapper, and knowing when to drop the ORM",
        minutes: 30,
        summary:
          "EF Core is not always the right tool. Knowing the alternative and its trade-offs signals maturity.",
        why: "Many teams run EF Core for writes and Dapper for reporting queries. Being comfortable with both means you fit either codebase.",
        points: [
          "Dapper is a micro-ORM: you write the SQL, it maps the result to objects. Minimal overhead, complete control, no change tracking.",
          "Reach for raw SQL when a query is complex enough that the LINQ version is unreadable, when you need database-specific features, or when a hot report needs hand-tuning.",
          "EF Core itself supports raw SQL via FromSql and ExecuteSql — with interpolated-string overloads that parameterise automatically.",
          "Parameterise. Always. String-concatenating user input into SQL is the classic SQL injection vulnerability, and it will be looked for in a code review.",
          "You still need to read execution plans and understand indexes. An ORM does not exempt you from knowing SQL — and interviews increasingly include a SQL round.",
        ],
        code: [
          {
            caption: "Safe raw SQL, both ways",
            language: "csharp",
            code: `// EF Core: the interpolated overload parameterises for you
var recent = await db.Orders
    .FromSql($"SELECT * FROM orders WHERE placed_at >= {from}")
    .AsNoTracking()
    .ToListAsync(ct);

// Dapper: explicit parameters, explicit shape
const string sql = """
    SELECT c.name AS CustomerName, SUM(o.total) AS Revenue
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE o.placed_at >= @from
    GROUP BY c.name
    ORDER BY Revenue DESC
    LIMIT 10
    """;

var rows = await connection.QueryAsync<RevenueRow>(sql, new { from });`,
          },
        ],
        pitfalls: [
          "Building SQL with string concatenation of user input. This is SQL injection, and it is an instant fail in a technical assessment.",
          "Mixing Dapper writes and EF Core writes in the same transaction without sharing the connection. It works, but you must pass the EF connection and transaction to Dapper explicitly.",
        ],
        interview: [
          {
            q: "How do you prevent SQL injection?",
            a: "Never concatenate user input into SQL. Use parameterised queries — which EF Core's LINQ and interpolated FromSql overloads produce automatically, and which Dapper does through anonymous parameter objects. Validate input as defence in depth, and give the application database account only the permissions it needs.",
          },
        ],
        practice:
          "Rewrite your heaviest LINQ report query in Dapper. Compare readability and measure both. Then write the injectable version and prove to yourself, on a local database, that it is exploitable.",
      },
    ],
  },

  {
    id: "security",
    number: "06",
    title: "Authentication, authorization, and API design",
    blurb:
      "Who the caller is, what they may do, and how to shape an API that another team can consume without asking you questions.",
    outcome:
      "You can secure an API with JWT or cookies, express permission rules as policies, and design endpoints that pass a design review.",
    lessons: [
      {
        id: "auth-concepts",
        title: "Authentication vs authorization, cookies vs tokens",
        minutes: 45,
        summary:
          "Two words people use interchangeably and should not, plus the two mechanisms that carry identity in web applications.",
        why: "Getting the terminology exactly right is a cheap way to sound senior, and choosing the wrong mechanism creates security problems that are painful to unwind.",
        points: [
          "Authentication establishes who you are. Authorization decides what you may do. 401 means 'I do not know who you are'; 403 means 'I know, and no'.",
          "Cookie authentication: the server sets an HttpOnly cookie, the browser sends it automatically. Simple, good for server-rendered apps and same-site SPAs, needs CSRF protection.",
          "Token (JWT) authentication: the client stores a signed token and sends it in the Authorization header. Stateless, works across domains and mobile clients, but tokens cannot be revoked before expiry — so keep them short-lived and pair them with refresh tokens.",
          "A JWT is three base64 parts — header, payload, signature. The payload is readable by anyone; signing prevents tampering, not disclosure. Never put secrets in a JWT.",
          "ASP.NET Core Identity is the built-in membership system: user store, password hashing, lockout, email confirmation, two-factor, external logins. Use it rather than hand-rolling password storage.",
          "For anything larger, delegate to an identity provider — Entra ID, Auth0, Keycloak, Duende IdentityServer — via OpenID Connect. Knowing when not to build auth yourself is part of the skill.",
          "Claims are the currency: the authenticated user is a ClaimsPrincipal carrying claims (sub, email, role, tenant). Authorization rules read claims.",
        ],
        interview: [
          {
            q: "What is the difference between authentication and authorization?",
            a: "Authentication verifies identity — proving you are who you claim. Authorization decides what that identity is permitted to do. In HTTP terms, failing authentication is 401 Unauthorized, and failing authorization is 403 Forbidden. In ASP.NET Core they are separate middleware, and authentication must run first.",
          },
          {
            q: "Is a JWT encrypted?",
            a: "No, it is signed by default. Anyone holding it can decode and read the payload; the signature only guarantees it has not been altered. So never put sensitive data in claims, always transmit over HTTPS, and keep lifetimes short since a leaked token is valid until it expires.",
          },
        ],
        practice:
          "Take a JWT from any tutorial app, paste it into jwt.io, and read the payload. Seeing your own claims in plain text permanently fixes what signing does and does not do.",
      },
      {
        id: "jwt-flow",
        title: "JWT end to end, with roles and policies",
        minutes: 60,
        summary:
          "Issuing a token on login, validating it on every request, refreshing it, and expressing rules more precisely than [Authorize].",
        why: "A JWT-secured API is the single most common take-home assignment for .NET roles. Being able to write one from memory is a direct advantage.",
        points: [
          "On successful login, build claims, sign a token with a key from configuration, and return it with a short expiry (15–60 minutes) plus a longer-lived refresh token stored server-side.",
          "AddAuthentication().AddJwtBearer() configures validation: issuer, audience, lifetime, and signing key. Turn every validation flag on — disabling issuer validation to make something work is how APIs get compromised.",
          "Role-based authorization ([Authorize(Roles = \"Admin\")]) is coarse. Policy-based authorization is the modern approach: name the rule, define it once, apply it everywhere.",
          "Requirements and handlers cover rules that need data — 'can edit only their own order' — by inspecting the resource and the user together.",
          "Refresh tokens must be stored, rotated on use, and revocable. This is what lets you actually log someone out of a stateless API.",
          "Hash passwords with a modern algorithm and per-user salt. Identity's PasswordHasher does this correctly; never write your own.",
        ],
        code: [
          {
            caption: "Issuing a token",
            language: "csharp",
            code: `public string CreateAccessToken(User user)
{
    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new(JwtRegisteredClaimNames.Email, user.Email),
        new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new(ClaimTypes.Role, user.Role)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
    var token = new JwtSecurityToken(
        issuer: _options.Issuer,
        audience: _options.Audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(30),
        signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

    return new JwtSecurityTokenHandler().WriteToken(token);
}`,
          },
          {
            caption: "Validating it, and policies with teeth",
            language: "csharp",
            code: `builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
            ClockSkew = TimeSpan.FromSeconds(30)   // default 5 minutes is generous
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CanManageOrders", p => p.RequireRole("Admin", "Manager"))
    .AddPolicy("VerifiedEmail", p => p.RequireClaim("email_verified", "true"));

app.MapDelete("/api/orders/{id}", Handler).RequireAuthorization("CanManageOrders");`,
          },
          {
            caption: "A resource-based rule",
            language: "csharp",
            code: `public class OwnerRequirement : IAuthorizationRequirement;

public class OwnerHandler : AuthorizationHandler<OwnerRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, OwnerRequirement requirement, Order order)
    {
        var userId = context.User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (userId == order.CustomerId.ToString() || context.User.IsInRole("Admin"))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}

// At the point of use, where the resource is known:
var result = await authorizationService.AuthorizeAsync(User, order, new OwnerRequirement());
if (!result.Succeeded) return Results.Forbid();`,
          },
        ],
        pitfalls: [
          "Hard-coding the signing key in appsettings.json and committing it. Anyone with the key can mint valid tokens for any user.",
          "Long-lived access tokens 'for convenience'. A stolen token is valid until expiry and cannot be revoked — that is the trade you are making.",
          "Checking roles inside business logic with if statements. Use policies so the rules live in one auditable place.",
        ],
        interview: [
          {
            q: "How do you log a user out of a stateless JWT API?",
            a: "You cannot invalidate a signed token directly, so you design around it: short access-token lifetimes plus refresh tokens held server-side. Logout revokes the refresh token so no new access tokens can be issued, and the current one expires in minutes. If immediate revocation is required, keep a denylist of token ids checked on each request — which trades away some statelessness.",
          },
        ],
        practice:
          "Build register, login, refresh, and logout endpoints with hashed passwords and a protected endpoint. Then verify with an expired token, a tampered token, and a valid one, and confirm you get 401, 401, and 200.",
      },
      {
        id: "api-design",
        title: "API design that passes review",
        minutes: 45,
        summary:
          "Resources, status codes, DTOs, paging, versioning, and documentation — the conventions that make an API predictable.",
        why: "Take-home assessments are graded heavily on this, and it is what makes the difference between an API a frontend team enjoys and one they complain about.",
        points: [
          "Model resources as nouns, use HTTP verbs for actions: GET /orders, POST /orders, GET /orders/{id}, PATCH /orders/{id}, DELETE /orders/{id}. Avoid /getOrders.",
          "Status codes carry meaning: 200 OK, 201 Created with a Location header, 204 No Content on delete, 400 bad input, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict, 422 semantically invalid, 500 our fault.",
          "Separate request and response DTOs from entities. It stops internal fields leaking, prevents mass-assignment vulnerabilities, and lets the database evolve without breaking clients.",
          "Paginate every collection, and return the metadata: page, size, total. Cursor pagination is better for large or fast-moving datasets.",
          "Version from day one — /api/v1/... or a header. It costs nothing now and prevents an impossible migration later.",
          "Idempotency: PUT and DELETE should be safe to repeat. For POST operations that must not double-charge, accept an idempotency key.",
          "Document with OpenAPI. .NET 9+ ships AddOpenApi; Swashbuckle and Scalar/Swagger UI give you an interactive page. Working docs are a deliverable, not a nicety.",
        ],
        code: [
          {
            caption: "A paged, versioned, documented endpoint",
            language: "csharp",
            code: `public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int Size, int Total)
{
    public int TotalPages => (int)Math.Ceiling(Total / (double)Size);
}

group.MapGet("/", async (
    [AsParameters] OrderQuery query,
    IOrderService service,
    CancellationToken ct) =>
{
    var result = await service.ListAsync(query, ct);
    return TypedResults.Ok(result);
})
.WithName("ListOrders")
.WithSummary("Lists orders, newest first.")
.Produces<PagedResult<OrderResponse>>();

public record OrderQuery(int Page = 1, int Size = 20, string? Status = null)
{
    // Never let a client request 100,000 rows
    public int Size { get; init; } = Math.Clamp(Size, 1, 100);
}`,
          },
        ],
        pitfalls: [
          "Returning EF entities directly. Navigation properties serialise into cycles or dump your whole object graph, and any new column instantly becomes public API.",
          "Unbounded list endpoints. They work with your 50 test rows and fall over with a customer's 500,000.",
        ],
        interview: [
          {
            q: "Why not return your entity directly from an API?",
            a: "It couples the public contract to the database schema, so any internal change breaks clients. It leaks fields that should be private, invites mass-assignment on the input side, and causes serialisation cycles through navigation properties. A DTO makes the contract explicit and independently versionable.",
          },
        ],
        practice:
          "Review your Products API against this list and fix every gap: verbs, status codes, DTOs, paging with metadata, a version prefix, and a Swagger page that a stranger could use without asking you anything.",
      },
      {
        id: "security-checklist",
        title: "The security checklist you run before shipping",
        minutes: 40,
        summary:
          "The concrete controls that separate a demo from something you would put on the public internet.",
        why: "Being able to talk through a security checklist is rare in junior candidates and immediately raises how you are perceived.",
        points: [
          "Injection: parameterise all SQL. Validate and constrain everything from the client, including ids.",
          "Mass assignment / over-posting: bind to explicit DTOs, never to entities, so a caller cannot set IsAdmin by adding a field to the JSON.",
          "Broken access control is the number one OWASP risk: check ownership on every resource access, not just authentication. Never trust an id in the URL to belong to the caller.",
          "Secrets: nothing in source control, everything from environment or vault, rotate on exposure. Scan the repo history — a deleted secret is still in the history.",
          "Transport: HTTPS everywhere, HSTS, secure and HttpOnly and SameSite cookies.",
          "CORS: name the exact origins. AllowAnyOrigin combined with credentials is both invalid and a common mistake.",
          "Rate limiting is built in — AddRateLimiter with a fixed or sliding window protects login endpoints from credential stuffing.",
          "Dependencies: dotnet list package --vulnerable in CI, and keep the SDK patched.",
          "Logging: never log passwords, tokens, or full card numbers. Redact at the source, not in the log viewer.",
        ],
        code: [
          {
            caption: "CORS and rate limiting configured properly",
            language: "csharp",
            code: `builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy => policy
        .WithOrigins("https://app.example.com", "http://localhost:3000")  // explicit
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", limiter =>
    {
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.PermitLimit = 5;             // 5 attempts per minute per partition
        limiter.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

app.UseRateLimiter();
app.MapPost("/api/v1/auth/login", LoginHandler).RequireRateLimiting("login");`,
          },
        ],
        interview: [
          {
            q: "How would you secure a public API?",
            a: "Authentication with short-lived tokens over HTTPS only; authorization checked per resource, including ownership, not just per endpoint; explicit DTOs to prevent over-posting; parameterised queries; rate limiting on authentication and expensive endpoints; strict CORS; secrets from a vault rather than source control; dependency vulnerability scanning in CI; and logging that captures enough to investigate without recording credentials or personal data.",
          },
        ],
        practice:
          "Run this checklist against a project you have already deployed. Fix at least three findings, and write down what you found — it is excellent interview material.",
      },
    ],
  },

  {
    id: "testing",
    number: "07",
    title: "Testing like a professional",
    blurb:
      "Tests are how you prove your code works and how you keep it working. A portfolio project with real tests stands out immediately.",
    outcome:
      "You can write unit and integration tests for an API, and explain what you choose to test and why.",
    lessons: [
      {
        id: "xunit",
        title: "xUnit fundamentals and what is worth testing",
        minutes: 50,
        summary:
          "The standard test framework in .NET, and the judgement about what deserves a test at all.",
        why: "Every professional codebase has tests. Delivering a take-home without them, or with tests of trivial getters, both send the wrong signal.",
        points: [
          "xUnit is the de facto standard (MSTest and NUnit exist and are similar). [Fact] is a test with no parameters; [Theory] with [InlineData] runs the same test over multiple inputs.",
          "Structure every test as Arrange, Act, Assert. Name it so a failure is self-explanatory: MethodName_Scenario_ExpectedResult.",
          "Test behaviour, not implementation. A test that breaks when you rename a private method is a liability.",
          "Worth testing: business rules, edge cases, bug regressions, anything with branching logic, anything involving money or dates. Not worth testing: auto-properties, framework behaviour, and mocks asserting on mocks.",
          "FluentAssertions makes failures readable — result.Should().BeEquivalentTo(expected) reports exactly which field differs.",
          "Each test must be independent and order-agnostic. Shared mutable state between tests produces failures that only appear in CI.",
          "Write the failing test first for bug fixes. It proves you reproduced the bug and stops it coming back.",
        ],
        code: [
          {
            caption: "Facts, theories, and readable assertions",
            language: "csharp",
            code: `public class DiscountCalculatorTests
{
    private readonly DiscountCalculator _sut = new();   // sut = system under test

    [Fact]
    public void Calculate_OrderBelowThreshold_AppliesNoDiscount()
    {
        var order = new Order { Total = 500m };

        var result = _sut.Calculate(order);

        result.Should().Be(0m);
    }

    [Theory]
    [InlineData(1000, 50)]
    [InlineData(5000, 500)]
    [InlineData(10000, 1500)]
    public void Calculate_AtEachTier_AppliesCorrectDiscount(decimal total, decimal expected)
    {
        _sut.Calculate(new Order { Total = total }).Should().Be(expected);
    }

    [Fact]
    public void Calculate_NegativeTotal_Throws()
    {
        var act = () => _sut.Calculate(new Order { Total = -1m });

        act.Should().Throw<ArgumentOutOfRangeException>()
           .WithMessage("*total*");
    }
}`,
          },
        ],
        pitfalls: [
          "Chasing a coverage percentage. 100% coverage of trivial code with no assertions on behaviour proves nothing.",
          "Tests that depend on DateTime.Now or Guid.NewGuid. Inject an IClock and an id generator so results are deterministic.",
        ],
        interview: [
          {
            q: "What do you test, and what do you not?",
            a: "I test behaviour that can break in ways users would notice: business rules, boundaries, error paths, and every bug I fix. I do not test the framework, auto-properties, or implementation details, because those tests break on refactors without catching real defects. Coverage is a diagnostic for finding untested logic, not a target.",
          },
        ],
        practice:
          "Take the discount or fee logic from module 02 and write tests covering every branch, including boundaries and invalid input. Then refactor the implementation and confirm the tests still pass — that is the value.",
      },
      {
        id: "mocking",
        title: "Test doubles and designing for testability",
        minutes: 45,
        summary:
          "Replacing real dependencies so a unit test stays fast and deterministic, without over-mocking into meaninglessness.",
        why: "Mocking is where DI pays off. It is also where inexperienced test suites go wrong, so having an opinion here is valuable.",
        points: [
          "A stub returns canned data; a mock also verifies interactions; a fake is a working lightweight implementation. NSubstitute and Moq are the common libraries.",
          "Mock at architectural boundaries — the database, HTTP calls, email, the clock, the file system. Do not mock the type you are testing or simple value objects.",
          "Verify interactions only when the interaction is the point (an email must be sent, a payment must be charged once). Otherwise assert on outcomes.",
          "If something is hard to test, that is design feedback: usually a hidden dependency (static, new inside a method, DateTime.Now) that should be injected.",
          "Time is a dependency. TimeProvider is now built in and is the standard way to make time testable.",
          "A hand-written fake is often clearer than three lines of mock setup, especially for repositories — an in-memory list implementing the interface is easy to read and reuse.",
        ],
        code: [
          {
            caption: "Substituting dependencies with NSubstitute",
            language: "csharp",
            code: `[Fact]
public async Task PlaceAsync_ValidOrder_SavesAndNotifiesCustomer()
{
    // Arrange
    var repository = Substitute.For<IOrderRepository>();
    var email = Substitute.For<IEmailSender>();
    var sut = new OrderService(repository, email);
    var order = new Order { CustomerEmail = "ana@example.com", Total = 250m };

    // Act
    await sut.PlaceAsync(order, CancellationToken.None);

    // Assert: the outcome, and the one interaction that is the point
    await repository.Received(1).AddAsync(order, Arg.Any<CancellationToken>());
    await email.Received(1).SendAsync("ana@example.com",
        Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
}

[Fact]
public async Task PlaceAsync_RepositoryFails_DoesNotSendEmail()
{
    var repository = Substitute.For<IOrderRepository>();
    repository.AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>())
              .Returns<Task>(_ => throw new DbUpdateException());
    var email = Substitute.For<IEmailSender>();
    var sut = new OrderService(repository, email);

    await Assert.ThrowsAsync<DbUpdateException>(
        () => sut.PlaceAsync(new Order(), CancellationToken.None));

    await email.DidNotReceive().SendAsync(default!, default!, default!, default);
}`,
          },
          {
            caption: "Making time testable",
            language: "csharp",
            code: `public class SubscriptionService(TimeProvider time)
{
    public bool IsExpired(Subscription s) => s.ExpiresAt < time.GetUtcNow();
}

// In a test, control the clock exactly:
var clock = new FakeTimeProvider(new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero));
var sut = new SubscriptionService(clock);
clock.Advance(TimeSpan.FromDays(31));`,
          },
        ],
        pitfalls: [
          "Mocking everything, including the thing you are testing. The test then asserts that your mocks were configured, which is worthless.",
          "Over-specifying mock arguments so any harmless refactor breaks a hundred tests.",
        ],
        interview: [
          {
            q: "What is the difference between a mock and a stub?",
            a: "A stub supplies data to get the test through its path; you assert on the result. A mock additionally records and verifies interactions, so the assertion is that a call happened with certain arguments. Use stubs by default and mocks only when the interaction itself is the behaviour you are specifying.",
          },
        ],
        practice:
          "Write tests for a service with three dependencies using substitutes, then replace one with a hand-written fake. Decide which version you would rather maintain and why.",
      },
      {
        id: "integration-tests",
        title: "Integration testing an API for real",
        minutes: 55,
        summary:
          "Spinning up your whole application in a test and calling it over HTTP, including the database.",
        why: "Integration tests catch what unit tests cannot — wiring, serialisation, routing, auth, migrations — and having them in a portfolio project is genuinely uncommon.",
        points: [
          "WebApplicationFactory<Program> boots your real application in memory and gives you an HttpClient that calls it without a network port.",
          "Override registrations in the factory to swap the real database for a test one, or to stub an external payment gateway.",
          "Database options, worst to best: EF Core InMemory (not a real database, no constraints, misleading), SQLite in-memory (real SQL, fast, mostly compatible), Testcontainers (a real PostgreSQL or SQL Server in Docker — highest fidelity, and what serious teams use).",
          "Reset state between tests: a transaction rolled back per test, Respawn to wipe tables, or a fresh container per class. Tests that leak state fail intermittently, which is worse than failing.",
          "Test the paths that matter end to end: create then fetch, unauthorised access, validation failure, and pagination.",
          "Keep them separate from unit tests so the fast suite stays fast — a separate project, or a trait you can filter on.",
        ],
        code: [
          {
            caption: "A real request against your real app",
            language: "csharp",
            code: `public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(o => o.UseNpgsql(_db.GetConnectionString()));

            // External services get stubbed, not called
            services.RemoveAll<IPaymentGateway>();
            services.AddSingleton<IPaymentGateway, AlwaysSucceedsGateway>();
        });
    }

    public async Task InitializeAsync()
    {
        await _db.StartAsync();
        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
    }

    public new async Task DisposeAsync() => await _db.DisposeAsync();
}

public class OrderApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Post_ThenGet_ReturnsTheCreatedOrder()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new("Bearer", TestTokens.ForCustomer());

        var create = await client.PostAsJsonAsync("/api/v1/orders",
            new CreateOrderRequest("ana@example.com", [new ItemRequest(productId, 2)]));

        create.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await create.Content.ReadFromJsonAsync<OrderResponse>();

        var fetched = await client.GetFromJsonAsync<OrderResponse>($"/api/v1/orders/{created!.Id}");
        fetched.Should().BeEquivalentTo(created);
    }

    [Fact]
    public async Task Get_WithoutToken_Returns401()
    {
        var response = await factory.CreateClient().GetAsync("/api/v1/orders");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}`,
          },
        ],
        pitfalls: [
          "Using the EF InMemory provider and believing the results. It ignores foreign keys, unique constraints, and SQL translation, so tests pass while production fails.",
          "Tests sharing one database without cleanup. They pass alone and fail in CI, which destroys trust in the suite.",
        ],
        interview: [
          {
            q: "How do you test an API endpoint?",
            a: "Unit tests cover the service logic with substituted dependencies. Integration tests use WebApplicationFactory to host the real application, with the database pointed at a disposable instance — ideally a real one via Testcontainers — and exercise it over HTTP: happy path, validation failure, unauthorised, and not-found. That catches routing, model binding, serialisation, auth, and migrations, which unit tests cannot see.",
          },
        ],
        practice:
          "Add an integration test project to your API. Cover create-then-fetch, 401 without a token, 400 on invalid input, and 404 for a missing id. Make it run on a clean database every time.",
      },
      {
        id: "test-strategy",
        title: "Strategy: what a good suite looks like",
        minutes: 30,
        summary:
          "How much to test, at which level, and how tests fit into a pull request and a pipeline.",
        why: "Interviewers ask about testing philosophy to see whether you have worked in a real team. The answer that lands is pragmatic, not dogmatic.",
        points: [
          "The pyramid: many fast unit tests, fewer integration tests, very few end-to-end tests. Inverting it gives a slow, flaky suite nobody trusts.",
          "A test suite has one job: let you change code confidently. Anything that does not serve that is overhead.",
          "Run tests in CI on every pull request and block the merge on failure. A red main branch that everyone ignores is worse than no tests.",
          "Flaky tests must be fixed or deleted, immediately. One test that fails randomly teaches the whole team to ignore red builds.",
          "Coverage is a map of what is untested, not a score. 60% with the business rules covered beats 95% of getters.",
          "TDD is a useful tool, especially for well-specified logic and bug fixes. You do not have to claim you always do it — claiming that and then not doing it in a pairing session is worse than saying you apply it where it helps.",
        ],
        interview: [
          {
            q: "What is your testing philosophy?",
            a: "Tests exist so I can change code without fear. I put most detail in fast unit tests around business logic, add integration tests over the critical paths of an API including auth and persistence, and keep end-to-end tests few and focused on the flows that would cost real money if broken. Everything runs in CI on every pull request, and flaky tests get fixed the day they appear because a suite people ignore has negative value.",
          },
        ],
        practice:
          "Look at your best project and write down, honestly, what would break if you changed the pricing logic and nobody noticed. Then write exactly those tests — that is the suite that earns its keep.",
      },
    ],
  },
];
