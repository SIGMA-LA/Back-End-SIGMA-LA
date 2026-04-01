import "dotenv/config"
import * as Sentry from "@sentry/node"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

try {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  })
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.warn("Sentry initialization failed. Please check SENTRY_DSN in .env file.", errorMessage);
}
