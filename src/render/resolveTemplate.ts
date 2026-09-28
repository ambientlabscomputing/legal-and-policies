import { interpolate } from "./interpolate.js";
import { validateResolvedPolicy } from "./validate.js";
import type { PolicyConfig, PolicySection, PolicyTemplateSet, ResolvedPolicy } from "../types.js";

const DEFAULT_LOCALE = "en";

export function resolveTemplate(templates: PolicyTemplateSet, config: PolicyConfig): ResolvedPolicy {
  const locale = config.locale ?? DEFAULT_LOCALE;
  const template = templates[locale] ?? templates[DEFAULT_LOCALE];
  if (!template) {
    throw new Error(
      `No template available for locale "${locale}" and no "${DEFAULT_LOCALE}" fallback was provided.`,
    );
  }

  const overrides = config.sectionOverrides ?? {};
  const variables = config.variables;
  const disabled = new Set(config.disabledSections ?? []);

  const sections: PolicySection[] = template.sections
    .filter((section) => !disabled.has(section.id))
    .map((section) => {
      const override = overrides[section.id];
      return interpolateSection(
        {
          id: section.id,
          heading: override?.heading ?? section.heading,
          body: override?.body ?? section.body,
        },
        variables,
      );
    });

  for (const custom of config.customSections ?? []) {
    sections.push(interpolateSection(custom, variables));
  }

  const resolved: ResolvedPolicy = {
    id: template.id,
    title: interpolate(template.title, variables),
    effectiveDate: config.effectiveDate,
    sections,
  };

  if (config.validate !== false) {
    validateResolvedPolicy(template, config, resolved);
  }

  return resolved;
}

function interpolateSection(section: PolicySection, variables: Record<string, string>): PolicySection {
  return {
    id: section.id,
    heading: interpolate(section.heading, variables),
    body: interpolate(section.body, variables),
  };
}
