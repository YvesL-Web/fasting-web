import { z } from 'zod'

/**
 * Forme standard des erreurs renvoyées par le backend :
 * {
 *   error: "INVALID_INPUT" | "UNAUTHORIZED" | ...,
 *   message: "Invalid request input.",
 *   details: {...} | null
 * }
 */
export const apiErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.unknown().optional()
})

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(args: { status: number; code: string; message?: string; details?: unknown }) {
    super(args.message ?? args.code)
    this.name = 'ApiError'
    this.status = args.status
    this.code = args.code
    this.details = args.details
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

/**
 * Messages par défaut pour certains codes d'erreur backend
 * (tu peux adapter en FR/EN / par page).
 */
export const DEFAULT_ERROR_MESSAGES: Partial<Record<string, string>> = {
  UNAUTHORIZED: 'Tu dois être connecté pour faire ça.',
  FORBIDDEN: "Tu n'as pas les droits pour faire ça.",
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  EMAIL_TAKEN: 'Cet email est déjà utilisé.',
  INVALID_INPUT: 'Certaines informations sont invalides.',
  NOT_FOUND: 'Ressource introuvable.',
  SERVER_ERROR: 'Un problème est survenu. Réessaie plus tard.'
}

/**
 * Utilitaire pour afficher un message "user-friendly"
 * dans un toast / message d'erreur générique.
 */
export function getUserFriendlyMessage(err: unknown): string {
  if (isApiError(err)) {
    return DEFAULT_ERROR_MESSAGES[err.code] ?? err.message ?? 'Une erreur est survenue. Réessaie.'
  }

  if (err instanceof Error) {
    return err.message || 'Une erreur est survenue. Réessaie.'
  }

  return 'Une erreur est survenue. Réessaie.'
}

/**
 * exploiter les erreurs Zod du backend pour des formulaires :
 * le backend renvoie un "ZodTree" (via treeifyErrorSafe).
 */
export type ZodTree = { _errors: string[]; [key: string]: ZodTree | string[] }

/**
 * Récupère le premier message d’erreur pour un champ donné
 * dans le ZodTree renvoyé par le backend.
 *
 * Exemple :
 *   const msg = getFieldError(apiError.details, 'email')
 */
export function getFieldError(details: unknown, path: string): string | null {
  if (!details || typeof details !== 'object') return null

  const tree = details as ZodTree
  const segments = path.split('.')

  let node: ZodTree | undefined = tree
  for (const seg of segments) {
    const next = node[seg]
    if (!next || Array.isArray(next)) {
      // soit pas trouvé, soit ce n'est plus un sous-arbre
      return null
    }
    node = next as ZodTree
  }

  const errors = node._errors
  if (!errors || errors.length === 0) return null
  return errors[0]
}
