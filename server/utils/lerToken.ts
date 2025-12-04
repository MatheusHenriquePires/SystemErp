export function lerToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    return JSON.parse(decoded)
  } catch (error) {
    return null
  }
}
