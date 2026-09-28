import { describe, expect, it } from "vitest";
import { resolveTemplate } from "../src/render/resolveTemplate.js";
import { privacyPolicyTemplate } from "../src/content/privacy-policy.js";
import { termsOfServiceTemplate } from "../src/content/terms-of-service.js";
import { cookiePolicyTemplate } from "../src/content/cookie-policy.js";
import type { PolicyTemplateSet } from "../src/types.js";

const baseConfig = {
  effectiveDate: "2026-01-01",
  variables: {
    companyName: "Ambient Labs",
    productName: "FieldCAD",
    contactEmail: "hello@fieldcadapp.com",
  },
};

// The privacy policy has several sections that require product-specific
// content before they'll resolve; this satisfies all of them for tests that
// aren't specifically exercising that requirement.
const privacyOverrides = {
  "information-we-collect": { body: "Test data collection copy." },
  analytics: { body: "Test analytics copy." },
  "data-sharing": { body: "Test data sharing copy." },
  "data-retention": { body: "Test retention copy." },
  "your-rights": { body: "Test rights copy." },
  "account-deletion": { body: "Test deletion copy." },
  security: { body: "Test security copy." },
  "childrens-privacy": { body: "Test children's privacy copy." },
};

describe("resolveTemplate", () => {
  it("interpolates variables into the title and every section", () => {
    const resolved = resolveTemplate(privacyPolicyTemplate, {
      ...baseConfig,
      sectionOverrides: privacyOverrides,
    });

    expect(resolved.title).toBe("FieldCAD Privacy Policy");
    expect(resolved.effectiveDate).toBe("2026-01-01");
    const intro = resolved.sections.find((s) => s.id === "introduction");
    expect(intro?.body).toContain("Ambient Labs");
    expect(intro?.body).toContain("FieldCAD");
    expect(resolved.sections.every((s) => !s.body.includes("{{"))).toBe(true);
  });

  it("applies section overrides by id without affecting other sections", () => {
    const resolved = resolveTemplate(privacyPolicyTemplate, {
      ...baseConfig,
      sectionOverrides: {
        ...privacyOverrides,
        "data-retention": { body: "Custom retention text for {{productName}}." },
      },
    });

    const retention = resolved.sections.find((s) => s.id === "data-retention");
    const contact = resolved.sections.find((s) => s.id === "contact");
    expect(retention?.body).toBe("Custom retention text for FieldCAD.");
    expect(contact?.body).toContain("hello@fieldcadapp.com");
  });

  it("appends custom sections after the template sections", () => {
    const resolved = resolveTemplate(privacyPolicyTemplate, {
      ...baseConfig,
      sectionOverrides: privacyOverrides,
      customSections: [
        { id: "field-verification", heading: "Field Verification", body: "Always verify with {{productName}}." },
      ],
    });

    expect(resolved.sections.at(-1)?.id).toBe("field-verification");
    expect(resolved.sections.at(-1)?.body).toBe("Always verify with FieldCAD.");
  });

  it("falls back to the default locale when the requested locale is missing", () => {
    const enOnly: PolicyTemplateSet = { en: privacyPolicyTemplate.en! };
    const resolved = resolveTemplate(enOnly, {
      ...baseConfig,
      locale: "es",
      sectionOverrides: privacyOverrides,
    });
    expect(resolved.id).toBe("privacy-policy");
  });

  it("throws when no template exists for the locale or the default fallback", () => {
    expect(() => resolveTemplate({}, baseConfig)).toThrow(/No template available/);
  });

  it("omits a section listed in disabledSections and satisfies its requiresProductInput check", () => {
    const resolved = resolveTemplate(privacyPolicyTemplate, {
      ...baseConfig,
      sectionOverrides: privacyOverrides,
      disabledSections: ["childrens-privacy"],
    });

    expect(resolved.sections.find((s) => s.id === "childrens-privacy")).toBeUndefined();
  });

  it("throws when a requiresProductInput section has no override or disable", () => {
    expect(() => resolveTemplate(privacyPolicyTemplate, baseConfig)).toThrow(
      /unverified placeholder content/,
    );
  });

  describe("terms-of-service template", () => {
    const termsConfig = {
      ...baseConfig,
      variables: { ...baseConfig.variables, jurisdiction: "the State of Delaware" },
    };

    it("resolves when jurisdiction is supplied", () => {
      const resolved = resolveTemplate(termsOfServiceTemplate, termsConfig);
      const governingLaw = resolved.sections.find((s) => s.id === "governing-law");
      expect(governingLaw?.body).toContain("the State of Delaware");
    });

    it("throws when jurisdiction is missing", () => {
      expect(() => resolveTemplate(termsOfServiceTemplate, baseConfig)).toThrow(
        /requires variable "jurisdiction"/,
      );
    });

    it("skips the jurisdiction check when validate is false", () => {
      const resolved = resolveTemplate(termsOfServiceTemplate, { ...baseConfig, validate: false });
      const governingLaw = resolved.sections.find((s) => s.id === "governing-law");
      expect(governingLaw?.body).toContain("{{jurisdiction}}");
    });
  });

  describe("cookie-policy template", () => {
    it("throws when how-we-use-cookies has no override", () => {
      expect(() => resolveTemplate(cookiePolicyTemplate, baseConfig)).toThrow(
        /unverified placeholder content/,
      );
    });

    it("resolves when how-we-use-cookies is overridden", () => {
      const resolved = resolveTemplate(cookiePolicyTemplate, {
        ...baseConfig,
        sectionOverrides: { "how-we-use-cookies": { body: "Test cookie copy." } },
      });
      expect(resolved.sections.find((s) => s.id === "how-we-use-cookies")?.body).toBe(
        "Test cookie copy.",
      );
    });
  });
});
