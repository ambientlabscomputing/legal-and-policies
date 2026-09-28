import { describe, expect, it } from "vitest";
import { resolveTemplate } from "../src/render/resolveTemplate.js";
import { privacyPolicyTemplate } from "../src/content/privacy-policy.js";
import type { PolicyTemplateSet } from "../src/types.js";

const baseConfig = {
  effectiveDate: "2026-01-01",
  variables: {
    companyName: "Ambient Labs",
    productName: "FieldCAD",
    contactEmail: "hello@fieldcadapp.com",
  },
};

describe("resolveTemplate", () => {
  it("interpolates variables into the title and every section", () => {
    const resolved = resolveTemplate(privacyPolicyTemplate, baseConfig);

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
      customSections: [
        { id: "field-verification", heading: "Field Verification", body: "Always verify with {{productName}}." },
      ],
    });

    expect(resolved.sections.at(-1)?.id).toBe("field-verification");
    expect(resolved.sections.at(-1)?.body).toBe("Always verify with FieldCAD.");
  });

  it("falls back to the default locale when the requested locale is missing", () => {
    const enOnly: PolicyTemplateSet = { en: privacyPolicyTemplate.en! };
    const resolved = resolveTemplate(enOnly, { ...baseConfig, locale: "es" });
    expect(resolved.id).toBe("privacy-policy");
  });

  it("throws when no template exists for the locale or the default fallback", () => {
    expect(() => resolveTemplate({}, baseConfig)).toThrow(/No template available/);
  });
});
