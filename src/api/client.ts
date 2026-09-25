const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? ""

type ErrorPayload = { error?: { code?: string; message?: string } }

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message)
  }
}

async function send(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: init?.body instanceof FormData
      ? init.headers
      : { "Content-Type": "application/json", ...init?.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as ErrorPayload
    throw new ApiError(payload.error?.message ?? "The request could not be completed.", response.status, payload.error?.code)
  }
  return response
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await send(path, init)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <TInput, TResponse>(path: string, body?: TInput) => request<TResponse>(path, {
    method: "POST",
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  }),
  put: <TInput, TResponse>(path: string, body: TInput) => request<TResponse>(path, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  delete: <TResponse>(path: string) => request<TResponse>(path, { method: "DELETE" }),
  // Authenticated binary fetch: a plain <img src> cannot send credentials to a cross-site API.
  blob: async (path: string) => (await send(path)).blob(),
}
