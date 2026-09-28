import type { PolicyConfig, PolicyTemplate, PolicyTemplateSection, ResolvedPolicy } from "../types.js";

const TOKEN_PATTERN = /\{\{\s*[\w.]+\s*\}\}/;

/** Matches the documented effective-date contract: a calendar date as YYYY-MM-DD. */
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidCalendarDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Date normalizes out-of-range components (e.g. Feb 30 -> Mar 2); a mismatch
  // after round-tripping means the input wasn't a real calendar date.
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

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
    if (!value || !value.trim()) {
      throw new Error(
        `Policy "${template.id}" requires variable "${name}" to be set to a non-blank value.`,
      );
    }
  }

  if (!isValidCalendarDate(config.effectiveDate)) {
    throw new Error(
      `Policy "${template.id}" has an invalid effectiveDate: "${config.effectiveDate}". ` +
        `Use a real calendar date in YYYY-MM-DD format.`,
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

  const resolvedById = new Map(resolved.sections.map((section) => [section.id, section]));
  const productInputSections: PolicyTemplateSection[] = [
    ...template.sections,
    ...(config.customSections ?? []),
  ];

  for (const section of productInputSections) {
    if (!section.requiresProductInput) continue;
    if (disabled.has(section.id)) continue;

    const overrideBody = overrides[section.id]?.body;
    const resolvedBody = resolvedById.get(section.id)?.body;

    if (overrideBody?.trim() && resolvedBody?.trim()) continue;

    throw new Error(
      `Policy "${template.id}" section "${section.id}" uses unverified placeholder content. ` +
        `Provide a non-blank sectionOverrides["${section.id}"].body with this app's actual practices, ` +
        `or add "${section.id}" to disabledSections if it does not apply.`,
    );
  }
}
