"use client";

import { useEffect, type ReactNode } from "react";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { Resource } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

let isInitialized = false;

function initializeTelemetry() {
  if (isInitialized || typeof window === "undefined") {
    return;
  }
  isInitialized = true;

  const provider = new WebTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: "delivery-web",
    }),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: "/api/observability/v1/traces" }),
      ),
    ],
  });
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        clearTimingResources: true,
        ignoreUrls: [/\/api\/observability\//],
      }),
    ],
  });

  const navigation = performance.getEntriesByType("navigation")[0];
  if (navigation instanceof PerformanceNavigationTiming) {
    const span = trace.getTracer("delivery-web.navigation").startSpan("document.load");
    span.setAttribute("url.path", window.location.pathname);
    span.setAttribute("page.load.duration_ms", navigation.duration);
    span.end();
  }

  const reportError = (error: unknown, type: "error" | "unhandledrejection") => {
    const span = trace.getTracer("delivery-web.errors").startSpan(type);
    span.recordException(error instanceof Error ? error : String(error));
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.end();
  };
  window.addEventListener("error", (event) => reportError(event.error ?? event.message, "error"));
  window.addEventListener("unhandledrejection", (event) => reportError(event.reason, "unhandledrejection"));
}

export function OpenTelemetryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializeTelemetry();
  }, []);

  return children;
}
