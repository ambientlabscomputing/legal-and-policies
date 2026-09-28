export type Locale = "en" | "es";

export interface PolicySection {
  id: string;
  heading: string;
  body: string;
}

export interface PolicyTemplate {
  id: string;
  title: string;
  sections: PolicySection[];
}

export type PolicyTemplateSet = Partial<Record<Locale, PolicyTemplate>>;

export interface PolicyConfig {
  locale?: Locale;
  effectiveDate: string;
  variables: Record<string, string>;
  sectionOverrides?: Record<string, Partial<Omit<PolicySection, "id">>>;
  customSections?: PolicySection[];
}

export interface ResolvedPolicy {
  id: string;
  title: string;
  effectiveDate: string;
  sections: PolicySection[];
}
