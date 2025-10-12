export function validatePasswordPolicy(password: string): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 12) errors.push('Password must be at least 12 characters.')
  if (!/[A-Z]/.test(password)) errors.push('Include at least one uppercase letter.')
  if (!/[a-z]/.test(password)) errors.push('Include at least one lowercase letter.')
  if (!/[0-9]/.test(password)) errors.push('Include at least one digit.')
  if (!/[\W_]/.test(password)) errors.push('Include at least one symbol.')
  return { ok: errors.length === 0, errors }
}


