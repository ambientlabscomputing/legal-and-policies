export type {
  Locale,
  PolicyConfig,
  PolicySection,
  PolicyTemplate,
  PolicyTemplateSection,
  PolicyTemplateSet,
  ResolvedPolicy,
} from "./types.js";

export { interpolate } from "./render/interpolate.js";
export { resolveTemplate } from "./render/resolveTemplate.js";

export { privacyPolicyTemplate } from "./content/privacy-policy.js";
export { termsOfServiceTemplate } from "./content/terms-of-service.js";
export { cookiePolicyTemplate } from "./content/cookie-policy.js";
export { sharedClauses, baseRequiredVariables } from "./content/shared/legal-terms.js";

export { PolicyPage } from "./components/PolicyPage.js";
export type { PolicyPageProps } from "./components/PolicyPage.js";
export { PolicySection as PolicySectionComponent } from "./components/PolicySection.js";
export type { PolicySectionProps } from "./components/PolicySection.js";
export { TableOfContents } from "./components/TableOfContents.js";
export type { TableOfContentsProps } from "./components/TableOfContents.js";
