import type { PolicyConfig, PolicyTemplate, ResolvedPolicy } from "../types.js";

const TOKEN_PATTERN = /\{\{\s*[\w.]+\s*\}\}/;

/**
 * Validates a resolved policy against the template it came from and the config
 * used to resolve it. Throws with a message naming the specific problem so a
 * publish step fails loudly instead of shipping incomplete or unverified copy.
 */
export function validateResolvedPolicy(
  template: PolicyTemplate,
  config: PolicyConfig,
  resolved: ResolvedPolicy,
): void {
  const disabled = new Set(config.disabledSections ?? []);
  const overrides = config.sectionOverrides ?? {};

  for (const name of template.requiredVariables ?? []) {
    const value = config.variables[name];
    if (!value) {
      throw new Error(
        `Policy "${template.id}" requires variable "${name}" to be set to a non-empty value.`,
      );
    }
  }

  if (Number.isNaN(Date.parse(config.effectiveDate))) {
    throw new Error(
      `Policy "${template.id}" has an invalid effectiveDate: "${config.effectiveDate}".`,
    );
  }

  const seenIds = new Set<string>();
  for (const section of resolved.sections) {
    if (seenIds.has(section.id)) {
      throw new Error(`Policy "${template.id}" has duplicate section id "${section.id}".`);
    }
    seenIds.add(section.id);
  }

  if (TOKEN_PATTERN.test(resolved.title)) {
    throw new Error(`Policy "${template.id}" title contains an unresolved token: "${resolved.title}".`);
  }
  for (const section of resolved.sections) {
    if (TOKEN_PATTERN.test(section.heading) || TOKEN_PATTERN.test(section.body)) {
      throw new Error(
        `Policy "${template.id}" section "${section.id}" contains an unresolved token.`,
      );
    }
  }

  for (const section of template.sections) {
    if (!section.requiresProductInput) continue;
    if (disabled.has(section.id)) continue;
    if (overrides[section.id]?.body) continue;
    throw new Error(
      `Policy "${template.id}" section "${section.id}" uses unverified placeholder content. ` +
        `Provide a sectionOverrides["${section.id}"].body with this app's actual practices, ` +
        `or add "${section.id}" to disabledSections if it does not apply.`,
    );
  }
}
