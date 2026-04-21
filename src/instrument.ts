import "dotenv/config"
import * as Sentry from "@sentry/node"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

function getProfilingIntegrations(): unknown[] {
  const isWindows = process.platform === "win32"
  const profilingEnabled = process.env.SENTRY_ENABLE_PROFILING === "true"

  if (isWindows || !profilingEnabled) {
    return []
  }

  try {
    const { nodeProfilingIntegration } = require("@sentry/profiling-node") as typeof import("@sentry/profiling-node")
    return [nodeProfilingIntegration()]
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.warn("Sentry profiling disabled because native bindings could not be loaded.", errorMessage)
    return []
  }
}

try {
  const profilingIntegrations = getProfilingIntegrations()

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: profilingIntegrations as Sentry.NodeOptions["integrations"],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: profilingIntegrations.length > 0 ? 1.0 : 0,
  })
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.warn("Sentry initialization failed. Please check SENTRY_DSN in .env file.", errorMessage);
}
