import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { error } from "../utils/apiResponse";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload =
        source === "body" ? req.body : source === "query" ? req.query : req.params;

      const parsed = schema.parse(payload);

      if (source === "body") req.body = parsed;
      if (source === "query") req.query = parsed as Request["query"];
      if (source === "params") req.params = parsed as Request["params"];

      next();
    } catch (err: any) {
      return error(res, "Validation failed", 400, err?.issues ?? err);
    }
  };
