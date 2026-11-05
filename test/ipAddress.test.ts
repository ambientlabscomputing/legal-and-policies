import { describe, expect, it } from "vitest";
import { ipAddressDisclosure, privacyPolicyTemplate, resolveTemplate, sharedClauses } from "../src/index.js";
import type { IpAddressDisclosureOptions } from "../src/index.js";

const base = {
  effectiveDate: "2026-01-01",
  variables: { companyName: "Ambient Labs", productName: "SiteRF", contactEmail: "hello@example.com" },
};

// Everything else the privacy template requires, so these tests isolate the ip-address section.
const others = Object.fromEntries(
  [
    "information-we-collect",
    "analytics",
    "data-sharing",
    "data-retention",
    "your-rights",
    "account-deletion",
    "security",
    "childrens-privacy",
  ].map((id) => [id, { body: "Test copy." }]),
);

const recorded: IpAddressDisclosureOptions = {
  handling: "recorded",
  purposes: ["operation", "security", "analytics", "error-diagnostics"],
  recordedIn: ["our server logs", "product-analytics events", "error reports"],
  linkedToAccount: true,
  derivesApproximateLocation: true,
  retention: "90 days",
  recipients: ["our cloud hosting provider", "Cloudflare"],
};

describe("ipAddressDisclosure", () => {
  it("describes recorded addresses completely, and only what was declared", () => {
    expect(ipAddressDisclosure(recorded)).toBe(
      "{{productName}} receives your device's IP address whenever you connect. We record it in our server " +
        "logs, product-analytics events, and error reports and use it for operating and delivering the " +
        "service, securing accounts and the service and detecting abuse, understanding aggregate usage of " +
        "{{productName}}, and diagnosing errors. Recorded IP addresses may be associated with your account. " +
        "We also use your IP address to derive your approximate location, such as country, region, or city. " +
        "We keep recorded IP addresses for 90 days. IP addresses are processed on our behalf by our cloud " +
        "hosting provider and Cloudflare.",
    );
  });

  it("states non-linkage and no sharing when that is the declared fact", () => {
    const text = ipAddressDisclosure({
      handling: "recorded",
      purposes: ["security"],
      recordedIn: ["server logs"],
      linkedToAccount: false,
      retention: "30 days.",
      recipients: [],
    });
    expect(text).toContain("We record it in server logs and use it for securing accounts");
    expect(text).toContain("We do not associate recorded IP addresses with your account.");
    expect(text).toContain("We keep recorded IP addresses for 30 days.");
    expect(text).toContain("We do not share IP addresses with third parties, other than where required by law.");
    expect(text).not.toContain("approximate location");
  });

  it("describes addresses used in passing without claiming anything is stored elsewhere", () => {
    const text = ipAddressDisclosure({ handling: "transient", purposes: ["operation", "rate-limiting"], recipients: ["Cloudflare"] });
    expect(text).toContain("we do not record or store it");
    expect(text).toContain("operating and delivering the service and rate limiting");
    expect(text).not.toContain("We keep");
    expect(text).not.toContain("associate");
  });

  it("ignores duplicates and blanks", () => {
    const text = ipAddressDisclosure({ ...recorded, purposes: ["security", "security"], recordedIn: [" logs ", "logs", " "], recipients: ["", "  "] });
    expect(text).toContain("We record it in logs and use it for securing accounts and the service and detecting abuse.");
    expect(text).toContain("We do not share IP addresses with third parties");
  });

  it.each<[string, Partial<IpAddressDisclosureOptions>, RegExp]>([
    ["no purposes", { purposes: [] }, /at least one purpose/],
    ["unknown purpose", { purposes: ["advertising" as never] }, /unknown purpose "advertising"/],
    ["recorded without places", { recordedIn: [] }, /"recordedIn" is required/],
    ["recorded without retention", { retention: " " }, /"retention" is required/],
    ["recorded without saying whether it is linked", { linkedToAccount: undefined }, /"linkedToAccount" is required/],
    ["missing recipients", { recipients: undefined as never }, /"recipients" is required/],
    ["bad handling", { handling: "sometimes" as never }, /"handling" must be/],
  ])("rejects %s", (_name, patch, message) => {
    expect(() => ipAddressDisclosure({ ...recorded, ...patch })).toThrow(message);
  });

  it("rejects recorded-only facts on transient handling", () => {
    expect(() =>
      ipAddressDisclosure({ handling: "transient", purposes: ["operation"], recipients: [], retention: "30 days" }),
    ).toThrow(/only apply when handling is "recorded"/);
    expect(() =>
      ipAddressDisclosure({ handling: "transient", purposes: ["operation"], recipients: [], linkedToAccount: false }),
    ).toThrow(/only apply when handling is "recorded"/);
  });
});

describe("privacy policy ip-address section", () => {
  it("refuses to resolve until the product states its IP practice", () => {
    expect(() => resolveTemplate(privacyPolicyTemplate, { ...base, sectionOverrides: others })).toThrow(
      /section "ip-address" uses unverified placeholder content/,
    );
  });

  it("ships a placeholder that says it is incomplete", () => {
    expect(sharedClauses.ipAddressPlaceholder).toMatch(/has not been completed/);
  });

  it("resolves with the generated disclosure, interpolated, in place after information-we-collect", () => {
    const policy = resolveTemplate(privacyPolicyTemplate, {
      ...base,
      sectionOverrides: { ...others, "ip-address": { body: ipAddressDisclosure(recorded) } },
    });
    const ids = policy.sections.map((s) => s.id);
    expect(ids.indexOf("ip-address")).toBe(ids.indexOf("information-we-collect") + 1);
    const section = policy.sections.find((s) => s.id === "ip-address")!;
    expect(section.heading).toBe("IP Addresses");
    expect(section.body).toContain("SiteRF receives your device's IP address");
    expect(section.body).not.toContain("{{");
  });

  it("can be disabled for a product that never receives IP addresses", () => {
    const policy = resolveTemplate(privacyPolicyTemplate, { ...base, sectionOverrides: others, disabledSections: ["ip-address"] });
    expect(policy.sections.find((s) => s.id === "ip-address")).toBeUndefined();
  });
});
