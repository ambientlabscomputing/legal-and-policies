export type Locale = "en" | "es";

export interface PolicySection {
  id: string;
  heading: string;
  body: string;
}

export interface PolicyTemplateSection extends PolicySection {
  /**
   * When true, this section's default body is a generic placeholder that has
   * not been verified against an actual product's practices. `resolveTemplate`
   * refuses to resolve it unless the consumer supplies a `sectionOverrides`
   * entry for this id or lists it in `disabledSections`.
   */
  requiresProductInput?: boolean;
}

export interface PolicyTemplate {
  id: string;
  title: string;
  sections: PolicyTemplateSection[];
  /** Variable names that must be present and non-empty for this template to resolve. */
  requiredVariables?: string[];
}

export type PolicyTemplateSet = Partial<Record<Locale, PolicyTemplate>>;

export interface PolicyConfig {
  locale?: Locale;
  effectiveDate: string;
  variables: Record<string, string>;
  sectionOverrides?: Record<string, Partial<Omit<PolicySection, "id">>>;
  customSections?: PolicySection[];
  /** Standard section ids to omit entirely from the resolved policy. */
  disabledSections?: string[];
  /**
   * Whether to validate the resolved policy for unresolved tokens, missing
   * required variables/overrides, invalid dates, and duplicate section ids.
   * Defaults to true. Only disable for local preview, never for a published policy.
   */
  validate?: boolean;
}

export interface ResolvedPolicy {
  id: string;
  title: string;
  effectiveDate: string;
  sections: PolicySection[];
}
