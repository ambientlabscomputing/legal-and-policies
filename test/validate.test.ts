import { describe, expect, it } from "vitest";
import { resolveTemplate } from "../src/render/resolveTemplate.js";
import { cookiePolicyTemplate } from "../src/content/cookie-policy.js";
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
});
