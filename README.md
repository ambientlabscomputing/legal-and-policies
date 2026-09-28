# Legal and Policies

Centralized legal policy templates (Privacy Policy, Terms of Service, Cookie Policy) and React
components for rendering them, shared across Ambient Labs frontends.

These are starting templates, not submission-ready policies. SiteRF, Jog Actuators, and
Tilly need separate configurations based on their actual data practices and features.
Before publishing, complete the [policy readiness review and checklist](docs/policy-readiness-review.md).
In particular, verify collection/sharing, security, retention/deletion, and any applicable
subscriptions, AI processing, device permissions, and cookie controls. Policies must match
the app, its SDKs, and the store privacy declarations.

## Install

Not published to a registry — consume it as a git dependency pinned to a tag:

```jsonc
// package.json
{
  "dependencies": {
    "@ambient-labs/legal-and-policies": "github:ambient-labs/legal-and-policies#v0.1.0"
  }
}
```

`react` and `react-dom` (>=19) are peer dependencies and must already be present in the consumer.

## Usage

```tsx
import { PolicyPage, privacyPolicyTemplate, resolveTemplate } from "@ambient-labs/legal-and-policies";

const policy = resolveTemplate(privacyPolicyTemplate, {
  effectiveDate: "2026-01-01",
  variables: {
    companyName: "Ambient Labs",
    productName: "FieldCAD",
    contactEmail: "hello@fieldcadapp.com",
  },
  // Optional: replace a specific section's copy.
  sectionOverrides: {
    "data-retention": { body: "Custom retention text for FieldCAD." },
  },
  // Optional: append product-specific clauses after the standard sections.
  customSections: [
    {
      id: "field-verification",
      heading: "Field Verification",
      body: "Verify critical dimensions in the field before fabrication or installation.",
    },
  ],
});

export function PrivacyPage() {
  return <PolicyPage policy={policy} />;
}
```

Available templates: `privacyPolicyTemplate`, `termsOfServiceTemplate`, `cookiePolicyTemplate`.

### In a Vite/React `web/` app (site-rf, fieldcad)

Import and render `PolicyPage` directly, as above, inside a route component.

### In an Astro `site/` app

Requires `@astrojs/react` and `react`/`react-dom` to be configured (already true for site-rf's
`site/`; fieldcad's `site/` needs these added before it can use this library):

```astro
---
import { PolicyPage, privacyPolicyTemplate, resolveTemplate } from "@ambient-labs/legal-and-policies";

const policy = resolveTemplate(privacyPolicyTemplate, {
  effectiveDate: "2026-01-01",
  variables: { companyName: "Ambient Labs", productName: "FieldCAD", contactEmail: "hello@fieldcadapp.com" },
});
---

<PolicyPage policy={policy} client:load />
```

## Extending a template

- `variables`: fills `{{placeholder}}` tokens used throughout the template copy.
- `sectionOverrides`: keyed by section `id`, replaces `heading` and/or `body` for that section only.
- `customSections`: appended after the template's own sections, interpolated the same way.

The terms template also requires `jurisdiction` in `variables`. The resolver leaves unknown
`{{placeholder}}` tokens unchanged; check every resolved policy before publishing. Policy
bodies render as plain text, so Markdown or HTML links in `body` do not create clickable links.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

## Versioning

Releases are tagged on `main` (`v0.1.0`, `v0.2.0`, ...). Consumers should pin to a tag or commit SHA
in their `package.json` git dependency rather than a branch, so upgrades are explicit.
