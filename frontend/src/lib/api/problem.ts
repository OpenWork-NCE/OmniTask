import { z } from "zod";

type ApiFieldError = Readonly<{ field: string; message: string }>;

export class ApiProblem extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly correlationId?: string;
  readonly errors?: readonly ApiFieldError[];

  constructor(problem: {
    status: number;
    code: string;
    detail: string;
    correlationId?: string;
    errors?: readonly ApiFieldError[];
  }) {
    super(problem.detail);
    this.name = "ApiProblem";
    this.status = problem.status;
    this.code = problem.code;
    this.detail = problem.detail;
    if (problem.correlationId) this.correlationId = problem.correlationId;
    if (problem.errors) this.errors = problem.errors;
  }
}

const apiProblemSchema = z.object({
  status: z.number().int().min(400).max(599),
  code: z.string().min(1),
  detail: z.string().min(1),
  correlationId: z.string().min(1).optional(),
  errors: z
    .array(
      z.object({
        field: z.string().min(1),
        message: z.string().min(1)
      })
    )
    .optional()
});

const FALLBACK_DETAIL = "The service could not complete the request.";

export async function toApiProblem(response: Response): Promise<ApiProblem> {
  if (response.headers.get("content-type")?.includes("application/problem+json")) {
    const parsed = apiProblemSchema.safeParse(await response.json().catch(() => null));
    if (parsed.success) {
      const { status, code, detail, correlationId, errors } = parsed.data;
      return new ApiProblem({
        status,
        code,
        detail,
        ...(correlationId ? { correlationId } : {}),
        ...(errors ? { errors } : {})
      });
    }
  }

  return new ApiProblem({
    status: response.status,
    code: "HTTP_ERROR",
    detail: FALLBACK_DETAIL
  });
}

export function isApiProblem(error: unknown): error is ApiProblem {
  return error instanceof ApiProblem;
}
