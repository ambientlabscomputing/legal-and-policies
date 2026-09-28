/**
 * Replaces `{{key}}` placeholders with values from `variables`. Unknown
 * placeholders are left untouched so missing variables are easy to spot
 * when rendered.
 */
export function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
    const value = variables[key];
    return value !== undefined ? value : match;
  });
}
