import { apiErrorResponseSchema, ApiError } from './errors'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ApiOptions = {
  method?: HttpMethod
  body?: unknown
  accessToken?: string | null
  // signal?: AbortSignal; etc.
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, accessToken } = options

  const headers: HeadersInit = {}

  // On ne met Content-Type que si on envoie un body JSON
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json'
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include' // if you use cookies (httpOnly)
  })

  // Gestion des erreurs HTTP
  if (!res.ok) {
    let parsed: unknown = null

    try {
      const text = await res.text()

      if (text) {
        try {
          parsed = JSON.parse(text)
        } catch {
          // pas du JSON → on laisse parsed = text brut
          parsed = text
        }
      }
    } catch {
      // ignore : pas de body ou problème de lecture
    }

    // On essaie de faire matcher la forme standard d’erreur de ton backend
    const result = apiErrorResponseSchema.safeParse(parsed)

    if (result.success) {
      const { error, message, details } = result.data

      const finalMessage =
        typeof details === 'string' ? details : message || `HTTP error ${res.status}`
      throw new ApiError({
        status: res.status,
        code: error,
        message: finalMessage,
        details
      })
    }

    // Si ce n’est pas au bon format, on jette quand même un ApiError générique
    throw new ApiError({
      status: res.status,
      code: 'HTTP_ERROR',
      message: `HTTP error ${res.status}`,
      details: parsed
    })
  }

  // 204 No Content → pas de JSON
  if (res.status === 204) {
    return undefined as T
  }

  // Réponse JSON “normale”
  return (await res.json()) as T
}
