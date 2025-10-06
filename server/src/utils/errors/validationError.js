import { StatusCodes } from "http-status-codes";

function flattenErrorDetails(details) {
  // Return an array of strings no matter the input shape
  if (!details) return [];

  // If it's already an array of strings or objects
  if (Array.isArray(details)) {
    return details.flatMap(item =>
      typeof item === "string" ? item : JSON.stringify(item)
    );
  }

  // If it's an object (like Mongoose error.errors or keyValue)
  if (typeof details === "object") {
    return Object.keys(details).flatMap(k => {
      const val = details[k];
      if (typeof val === "string") return `${k}: ${val}`;
      // Mongoose validators often put an object with message property
      if (val && typeof val === "object" && "message" in val) return `${k}: ${val.message}`;
      // Fallback stringify
      return `${k}: ${JSON.stringify(val)}`;
    });
  }

  // If it's a plain string or other primitive
  return [String(details)];
}

export class ValidationError extends Error {
  constructor(errorDetails = {}, message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
    // Accept different shapes: { error: { ... } } or { error: [...] } or just { error: "..." }
    const raw = errorDetails.error ?? errorDetails; // be tolerant
    this.explanation = flattenErrorDetails(raw);
    this.message = message;
    this.statusCode = StatusCodes.BAD_REQUEST;
    // preserve stack (already set by Error)
  }
}
