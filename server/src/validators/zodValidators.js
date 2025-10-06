// src/validators/zodValidators.js
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { customErrorResponse } from "../utils/common/responseObject.js";

function mergeInto(target, src) {
  if (!target || !src) return;
  for (const [k, v] of Object.entries(src)) target[k] = v; // mutate keys (no reassignment)
}

/**
 * Validates { body, params, query, headers } if present in the schema.
 * - Works with Express 5 (no reassigning req.query/req.params).
 * - Coerced/defaulted values flow into req.* so controllers use them normally.
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body ?? {},
        params: req.params ?? {},
        query: req.query ?? {},
        headers: req.headers ?? {},
      });

      // Put parsed values back (without reassigning getters)
      if (parsed.body != null) {
        if (req.body == null) req.body = {};
        mergeInto(req.body, parsed.body);
      }
      if (parsed.params != null) mergeInto(req.params, parsed.params);
      if (parsed.query != null) mergeInto(req.query, parsed.query);

      // Optional: full parsed payload
      req.validated = parsed;

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const explanation = (err.issues || []).map((i) => {
          const path = i.path?.length ? i.path.join(".") : "";
          return path ? `${i.message} (${path})` : i.message;
        });
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(customErrorResponse({ message: "Validation error", explanation }));
      }
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(customErrorResponse({ message: err?.message || "Invalid request", explanation: [err?.message || "Invalid request"] }));
    }
  };
};
