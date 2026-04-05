export type ApiSuccess<T> = {
  code: number;
  status: "success";
  body: T;
};

export type ApiErrorBody = {
  message: string | Record<string, unknown> | unknown;
  status: string;
};

export type ApiErrorEnvelope = {
  code: number;
  status: "error" | string;
  body: ApiErrorBody;
  request_code?: string;
};

export type ApiWarningEnvelope = {
  code: number;
  status: "warning";
  body?: ApiErrorBody;
};

export function isApiSuccess<T = unknown>(payload: unknown): payload is ApiSuccess<T> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    "status" in payload &&
    "body" in payload &&
    (payload as ApiSuccess<T>).status === "success" &&
    typeof (payload as ApiSuccess<T>).code === "number"
  );
}

export function isApiErrorEnvelope(payload: unknown): payload is ApiErrorEnvelope {
  if (typeof payload !== "object" || payload === null) return false;
  const o = payload as Record<string, unknown>;
  if (typeof o.code !== "number" || typeof o.status !== "string" || typeof o.body !== "object" || o.body === null) {
    return false;
  }
  const body = o.body as Record<string, unknown>;
  return "message" in body || "status" in body;
}

export function isApiWarningEnvelope(payload: unknown): payload is ApiWarningEnvelope {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "status" in payload &&
    (payload as ApiWarningEnvelope).status === "warning" &&
    typeof (payload as ApiWarningEnvelope).code === "number"
  );
}

export function formatApiErrorBodyMessage(message: unknown): string {
  if (message == null || message === "") {
    return "Ocorreu um erro desconhecido ao realizar a operação.";
  }
  if (typeof message === "string") return message;
  try {
    return JSON.stringify(message);
  } catch {
    return "Ocorreu um erro desconhecido ao realizar a operação.";
  }
}

/** Mensagem curta para formulário / estado local */
export function getApiErrorMessage(error: unknown): string {
  if (isApiErrorEnvelope(error)) {
    return formatApiErrorBodyMessage(error.body?.message);
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  return "Não foi possível completar a operação.";
}
