type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: string, data?: unknown): LogPayload {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
    };
  }

  info(message: string, context?: string, data?: unknown) {
    const payload = this.formatLog("info", message, context, data);
    const ctx = payload.context ? payload.context : "APP";
    console.log(`[INFO] [${ctx}] ${payload.message}`, data ?? "");
  }

  warn(message: string, context?: string, data?: unknown) {
    const payload = this.formatLog("warn", message, context, data);
    const ctx = payload.context ? payload.context : "APP";
    console.warn(`[WARN] [${ctx}] ${payload.message}`, data ?? "");
  }

  error(message: string, context?: string, error?: unknown) {
    const payload = this.formatLog("error", message, context, error);
    const ctx = payload.context ? payload.context : "APP";
    console.error(`[ERROR] [${ctx}] ${payload.message}`, error ?? "");
  }

  debug(message: string, context?: string, data?: unknown) {
    if (process.env.NODE_ENV === "development") {
      const payload = this.formatLog("debug", message, context, data);
      const ctx = payload.context ? payload.context : "APP";
      console.debug(`[DEBUG] [${ctx}] ${payload.message}`, data ?? "");
    }
  }
}

export const logger = new Logger();