import type { NextRequest } from "next/server";
import { getWidgetStatus, NotConfiguredError, tokenMatches } from "@/lib/health/server-status";

/**
 * Today's check-in as JSON, for anything on the phone that can read a URL —
 * KWGT, Tasker, a shortcut, a second widget app.
 *
 *   GET /api/health/status?k=<HEALTH_WIDGET_TOKEN>
 *
 * A wrong or missing token gets a plain 404, not a 401: there is no reason to
 * confirm to a stranger that this endpoint exists.
 */

export async function GET(request: NextRequest) {
  if (!tokenMatches(request.nextUrl.searchParams.get("k"))) {
    return new Response("Not found", { status: 404 });
  }

  const headers = {
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow",
  };

  try {
    return Response.json(await getWidgetStatus(), { headers });
  } catch (cause) {
    const notConfigured = cause instanceof NotConfiguredError;
    return Response.json(
      {
        error: notConfigured ? "not-configured" : "unavailable",
        message: cause instanceof Error ? cause.message : "Unknown error",
      },
      { status: 503, headers }
    );
  }
}
