// Sentry dependencies
import Sentry from "@sentry/node";
import { getClient, setupGlobalHub, SentryPropagator, SentrySampler, SentrySpanProcessor, setupEventContextTrace, wrapContextManagerClass, setOpenTelemetryContextAsyncContextStrategy } from "@sentry/opentelemetry";

// OpenTelemetry dependencies
import opentelemetry from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

function setupSentry() {
  setupGlobalHub();

  // Make sure to call `Sentry.init` BEFORE initializing the OpenTelemetry SDK
  Sentry.init({
    dsn: "",
    sampleRate: 1.0,
    tracesSampleRate: 0.3,
    // set the instrumenter to use OpenTelemetry instead of Sentry
    instrumenter: "otel"
  });

  const client = getClient()!;
  setupEventContextTrace(client);

  // You can wrap whatever local storage context manager you want to use
  const SentryContextManager = wrapContextManagerClass(
    AsyncLocalStorageContextManager
  );

  const sdk = new opentelemetry.NodeSDK({
    // Existing config
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [new HttpInstrumentation()],

    // Sentry config
    spanProcessor: new SentrySpanProcessor(),
    textMapPropagator: new SentryPropagator(),
    contextManager: new SentryContextManager(),
    sampler: new SentrySampler(client)
  });

  // Ensure OpenTelemetry Context & Sentry Hub/Scope is synced
  setOpenTelemetryContextAsyncContextStrategy();

  sdk.start();
}

setupSentry();