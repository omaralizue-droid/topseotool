import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden action") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  public readonly details: unknown;
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

export function handleApiError(error: unknown, context = "API") {
  logger.error("API error caught", context, error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid input parameters",
        code: "VALIDATION_ERROR",
        details: error.issues,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "An unexpected error occurred",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );
}