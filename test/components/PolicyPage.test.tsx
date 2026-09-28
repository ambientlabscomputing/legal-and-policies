import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PolicyPage } from "../../src/components/PolicyPage.js";
import { resolveTemplate } from "../../src/render/resolveTemplate.js";
import { termsOfServiceTemplate } from "../../src/content/terms-of-service.js";

describe("PolicyPage", () => {
  it("renders the title, effective date, table of contents, and sections", () => {
    const policy = resolveTemplate(termsOfServiceTemplate, {
      effectiveDate: "2026-03-01",
      variables: {
        companyName: "Ambient Labs",
        productName: "Site RF",
        contactEmail: "hello@site-rf.example",
        jurisdiction: "the State of Delaware",
      },
    });

    render(<PolicyPage policy={policy} />);

    expect(screen.getByRole("heading", { level: 1, name: "Site RF Terms of Service" })).toBeDefined();
    expect(screen.getByText("Effective 2026-03-01")).toBeDefined();
    expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeDefined();
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBe(policy.sections.length);
    expect(screen.getByText(/the State of Delaware/)).toBeDefined();
  });
});
