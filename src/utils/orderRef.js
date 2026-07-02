// Generates a short, human-readable order reference, e.g. "ECL-7F3K9Q".
export function generateOrderRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous 0/O/1/I
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `ECL-${code}`
}
