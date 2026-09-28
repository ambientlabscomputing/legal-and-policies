import { describe, expect, it } from "vitest";
import { resolveTemplate } from "../src/render/resolveTemplate.js";
import { cookiePolicyTemplate } from "../src/content/cookie-policy.js";
import { termsOfServiceTemplate } from "../src/content/terms-of-service.js";
import { sharedClauses } from "../src/content/shared/legal-terms.js";
import type { PolicyTemplateSet } from "../src/types.js";

const baseConfig = {
  effectiveDate: "2026-01-01",
  variables: {
    companyName: "Ambient Labs",
    productName: "FieldCAD",
    contactEmail: "hello@fieldcadapp.com",
  },
  sectionOverrides: {
    "how-we-use-cookies": { body: "Test cookie copy." },
  },
};

describe("validateResolvedPolicy (via resolveTemplate)", () => {
  it("throws when the effectiveDate is invalid", () => {
    expect(() =>
      resolveTemplate(cookiePolicyTemplate, { ...baseConfig, effectiveDate: "not-a-date" }),
    ).toThrow(/invalid effectiveDate/);
  });

  it("throws when a custom section id duplicates a standard section id", () => {
    expect(() =>
      resolveTemplate(cookiePolicyTemplate, {
        ...baseConfig,
        customSections: [{ id: "contact", heading: "Contact Us Again", body: "Duplicate." }],
      }),
    ).toThrow(/duplicate section id "contact"/);
  });

  it("throws when a custom section leaves an unresolved token", () => {
    expect(() =>
      resolveTemplate(cookiePolicyTemplate, {
        ...baseConfig,
        customSections: [
          { id: "extra", heading: "Extra", body: "Unresolved {{missingVariable}} token." },
        ],
      }),
    ).toThrow(/unresolved token/);
  });

  it("skips all validation when validate is false", () => {
    const enOnly: PolicyTemplateSet = { en: cookiePolicyTemplate.en! };
    const resolved = resolveTemplate(enOnly, {
      effectiveDate: "not-a-date",
      variables: {},
      validate: false,
    });
    expect(resolved.sections.find((s) => s.id === "how-we-use-cookies")).toBeDefined();
  });

  describe("impossible calendar dates", () => {
    it("rejects February 30", () => {
      expect(() =>
        resolveTemplate(cookiePolicyTemplate, { ...baseConfig, effectiveDate: "2026-02-30" }),
      ).toThrow(/invalid effectiveDate/);
    });

    it("rejects February 29 in a non-leap year", () => {
      expect(() =>
        resolveTemplate(cookiePolicyTemplate, { ...baseConfig, effectiveDate: "2023-02-29" }),
      ).toThrow(/invalid effectiveDate/);
    });

    it("accepts February 29 in a leap year", () => {
      const resolved = resolveTemplate(cookiePolicyTemplate, {
        ...baseConfig,
        effectiveDate: "2024-02-29",
      });
      expect(resolved.effectiveDate).toBe("2024-02-29");
    });

    it("accepts an ordinary valid date", () => {
      const resolved = resolveTemplate(cookiePolicyTemplate, {
        ...baseConfig,
        effectiveDate: "2026-03-15",
      });
      expect(resolved.effectiveDate).toBe("2026-03-15");
    });
  });

  describe("blank required values", () => {
    const termsConfig = {
      effectiveDate: "2026-01-01",
      variables: {
        companyName: "Ambient Labs",
        productName: "FieldCAD",
        contactEmail: "hello@fieldcadapp.com",
        jurisdiction: "the State of Delaware",
      },
    };

    it("rejects an empty required identity variable", () => {
      expect(() =>
        resolveTemplate(termsOfServiceTemplate, {
          ...termsConfig,
          variables: { ...termsConfig.variables, companyName: "" },
        }),
      ).toThrow(/requires variable "companyName".*non-blank/);
    });

    it("rejects a whitespace-only required variable", () => {
      expect(() =>
        resolveTemplate(termsOfServiceTemplate, {
          ...termsConfig,
          variables: { ...termsConfig.variables, jurisdiction: "   " },
        }),
      ).toThrow(/requires variable "jurisdiction".*non-blank/);
    });

    it("rejects a whitespace-only sectionOverrides body on a requiresProductInput section", () => {
      expect(() =>
        resolveTemplate(cookiePolicyTemplate, {
          effectiveDate: "2026-01-01",
          variables: {
            companyName: "Ambient Labs",
            productName: "FieldCAD",
            contactEmail: "hello@fieldcadapp.com",
          },
          sectionOverrides: { "how-we-use-cookies": { body: "   " } },
        }),
      ).toThrow(/unverified placeholder content/);
    });

    it("rejects a sectionOverrides body that resolves to blank after interpolation", () => {
      expect(() =>
        resolveTemplate(cookiePolicyTemplate, {
          effectiveDate: "2026-01-01",
          variables: {
            companyName: "Ambient Labs",
            productName: "FieldCAD",
            contactEmail: "hello@fieldcadapp.com",
            cookieCopy: "",
          },
          sectionOverrides: { "how-we-use-cookies": { body: "{{cookieCopy}}" } },
        }),
      ).toThrow(/unverified placeholder content/);
    });

    it("still allows disabledSections to satisfy a requiresProductInput section with no override", () => {
      const resolved = resolveTemplate(cookiePolicyTemplate, {
        effectiveDate: "2026-01-01",
        variables: {
          companyName: "Ambient Labs",
          productName: "FieldCAD",
          contactEmail: "hello@fieldcadapp.com",
        },
        disabledSections: ["how-we-use-cookies"],
      });
      expect(resolved.sections.find((s) => s.id === "how-we-use-cookies")).toBeUndefined();
    });
  });

  describe("subscription terms via customSections", () => {
    const baseTermsConfig = {
      effectiveDate: "2026-01-01",
      variables: {
        companyName: "Ambient Labs",
        productName: "FieldCAD",
        contactEmail: "hello@fieldcadapp.com",
        jurisdiction: "the State of Delaware",
      },
    };

    it("applies a sectionOverrides entry to a custom section's body", () => {
      const resolved = resolveTemplate(termsOfServiceTemplate, {
        ...baseTermsConfig,
        customSections: [
          {
            id: "subscription-terms",
            heading: "Subscription Terms",
            body: sharedClauses.subscriptionTermsPlaceholder,
            requiresProductInput: true,
          },
        ],
        sectionOverrides: {
          "subscription-terms": {
            body: "Monthly billing renews automatically; cancel anytime from Settings > Subscription.",
          },
        },
      });

      const subscription = resolved.sections.find((s) => s.id === "subscription-terms");
      expect(subscription?.body).toBe(
        "Monthly billing renews automatically; cancel anytime from Settings > Subscription.",
      );
    });

    it("throws when the subscription placeholder custom section is not overridden", () => {
      expect(() =>
        resolveTemplate(termsOfServiceTemplate, {
          ...baseTermsConfig,
          customSections: [
            {
              id: "subscription-terms",
              heading: "Subscription Terms",
              body: sharedClauses.subscriptionTermsPlaceholder,
              requiresProductInput: true,
            },
          ],
        }),
      ).toThrow(/unverified placeholder content/);
    });
  });
});
