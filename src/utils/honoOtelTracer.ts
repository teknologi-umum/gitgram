import { trace } from "@opentelemetry/api";
import type { Span } from "@opentelemetry/api";
import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import * as Sentry from "@sentry/node";

const recordError = (span: Span, error: unknown) => {
  if (error instanceof Error) {
    span.recordException({
      name: error.name,
      message: error.message
    });
    span.setStatus({ code: 2, message: error.message });
  } else {
    const errorMessage = String(error);
    span.recordException({ message: errorMessage });
    span.setStatus({ code: 2, message: errorMessage });
  }
};

export const otelTracer = (
  tracerName: string,
  customAttributes?: (context: Context) => Record<string, unknown>
) => {
  const tracer = trace.getTracer(tracerName);
  return createMiddleware(async (c: Context, next: Next) => {
    const span = tracer.startSpan("http.server", {
      attributes: {
        "http.request.method": c.req.method,
        "http.request.url": c.req.url,
        ...customAttributes
      }
    });
    const startTime = Date.now();

    try {
      await next();
      span.setAttribute("http.response.status_code", c.res.status);
    } catch (error) {
      recordError(span, error);
      if (c.req.header("User-Agent")) {
        const userAgent = c.req.header("User-Agent") || "Unknown";
        span.setAttribute("http.user_agent", userAgent);
      }
      Sentry.captureException(error);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      span.setAttribute("http.request_duration", duration);
      span.end();
    }
  });
};