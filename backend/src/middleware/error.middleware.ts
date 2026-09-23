import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { isApiError } from "../shared/errors/api-error";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (isApiError(error)) {
    res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({
      success: false,
      error: { code: "CONFLICT", message: "A record with these values already exists" },
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
  });
}
