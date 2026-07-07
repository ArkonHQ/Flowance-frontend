// Client-side: read team slug from cookie (synchronous)
export const getClientTeamSlug = (): string => {
  if (typeof document === 'undefined') return 'personal'
  const nameEQ = "fcc_current_team_slug="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return 'personal'
}
