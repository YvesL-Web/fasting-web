type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ApiOptions = {
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}
