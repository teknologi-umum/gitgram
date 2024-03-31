import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import * as Sentry from "@sentry/node";

const getUserIP = (c: Context): string | undefined => {
  let ipAddress: string | undefined;
  const possibleHeaders = ["Forwarded", "Forwarded-For", "Client-IP", "X-Forwarded", "X-Forwarded-For", "X-Client-IP", "X-Real-IP", "True-Client-IP"];
  for (const possibleHeader of possibleHeaders) {
    const value = c.req.header(possibleHeader);
    if (value !== undefined && value !== "") {
      ipAddress = value;
    }
  }

  return ipAddress;
};

const convertOpenTelemetryHeaders = (headers: Iterable<[key: string, value: string | string[]]>, precedence: "request" | "response"): Record<string, string[]> => {
  const openTelemetryHeadersCollection: Record<string, string[]> = {};
  for (const [key, value] of headers) {
    if (Array.isArray(value)) {
      openTelemetryHeadersCollection[`http.${precedence}.header.${key.toLowerCase()}`] = value;
      continue;
    }

    openTelemetryHeadersCollection[`http.${precedence}.header.${key.toLowerCase()}`] = [value];
  }

  return openTelemetryHeadersCollection;
};

export const sentryMiddleware = () => {
  return createMiddleware(async (c: Context, next: Next) => {
    const scope = Sentry.getCurrentScope();
    const requestHeaders: Record<string, string | string[]> = c.req.header();
    const userIPAddress = getUserIP(c);
    if (userIPAddress) {
      scope.setUser({ ip_address: userIPAddress });
    }
    scope.setExtra("Headers", requestHeaders);
    return Sentry.continueTrace(
      {
        sentryTrace: c.req.header("sentry-trace"),
        baggage: c.req.header("baggage")
      },
      () => {
        return Sentry.startSpan({
          name: c.req.method + " " + c.req.path,
          op: "http.server",
          onlyIfParent: false,
          attributes: {
            source: "url",
            "http.request.method": c.req.method,
            "http.method": c.req.method,
            "http.url": c.req.url,
            "http.user_agent": c.req.header("User-Agent") || "unknown",
            "http.host": c.req.header("Host"),
            "http.client_ip": userIPAddress,
            ...convertOpenTelemetryHeaders(Object.entries(requestHeaders), "request")
          }
        },
        async (span) => {
          try {
            await next();
            if (c.error !== undefined && c.error !== null) {
              if (c.res.status >= 500) {
                scope.captureException(c.error);
              }
            }
          } catch (error) {
            scope.captureException(error);
            throw error;
          } finally {
            span?.setAttribute("http.response.status_code", c.res.status);
            span?.setAttribute("http.status_code", c.res.status);
            span?.setAttributes(convertOpenTelemetryHeaders(c.res.headers.entries(), "response"));
            span?.end();
          }
        });
      });
  });
};