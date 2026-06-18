type Level = "DEBUG" | "INFO" | "WARN" | "ERROR" | "AUDIT";

function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (process.env.NODE_ENV === "development") {
    console[level === "ERROR" ? "error" : level === "WARN" ? "warn" : "log"](JSON.stringify(entry));
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("DEBUG", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("INFO", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("WARN", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("ERROR", msg, meta),
  audit: (msg: string, meta?: Record<string, unknown>) => log("AUDIT", msg, meta),
};
