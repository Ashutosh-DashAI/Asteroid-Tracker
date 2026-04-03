import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { sendError } from "../utils/sendResponse";

export const validateRequest =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data =
        source === "body" ? req.body : source === "query" ? req.query : req.params;
      const validated = schema.parse(data);

      if (source === "body") {
        req.body = validated as any;
      } else if (source === "query") {
        req.query = validated as any;
      } else {
        req.params = validated as any;
      }

      next();
    } catch (error: any) {
      return sendError(res, 400, "Validation error", error.errors);
    }
  };

// Overload for both old and new calling styles
export const validate = (
  sourceOrSchema: "body" | "query" | "params" | ZodSchema,
  schemaOrSource?: ZodSchema | "body" | "query" | "params"
) => {
  // New style: validate("body", schema)
  if (typeof sourceOrSchema === "string") {
    return validateRequest(schemaOrSource as ZodSchema, sourceOrSchema as "body" | "query" | "params");
  }
  // Old style: validate(schema, "body")
  return validateRequest(sourceOrSchema as ZodSchema, (schemaOrSource as "body" | "query" | "params") || "body");
};
