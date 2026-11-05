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
    "@ambient-labs/legal-and-policies": "github:ambientlabscomputing/legal-and-policies#v0.2.0"
  }
}
```

`react` and `react-dom` (>=19) are peer dependencies and must already be present in the consumer.

## Usage

```tsx
import { PolicyPage, ipAddressDisclosure, privacyPolicyTemplate, resolveTemplate } from "@ambient-labs/legal-and-policies";

const policy = resolveTemplate(privacyPolicyTemplate, {
  effectiveDate: "2026-01-01",
  variables: {
    companyName: "Ambient Labs",
    productName: "FieldCAD",
    contactEmail: "hello@fieldcadapp.com",
  },
  // Required: the privacy policy has several sections whose default body is an
  // unverified placeholder (see "Extending a template" below). resolveTemplate
  // throws until each one is overridden with real product facts or disabled.
  sectionOverrides: {
    "information-we-collect": { body: "..." },
    "ip-address": { body: ipAddressDisclosure({ /* see "Disclosing IP addresses" */ }) },
    analytics: { body: "..." },
    "data-sharing": { body: "..." },
    "data-retention": { body: "Custom retention text for FieldCAD." },
    "your-rights": { body: "..." },
    "account-deletion": { body: "..." },
    security: { body: "..." },
    "childrens-privacy": { body: "..." },
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

The terms-of-service template additionally requires a `jurisdiction` variable:

```tsx
import { termsOfServiceTemplate, resolveTemplate } from "@ambient-labs/legal-and-policies";

const terms = resolveTemplate(termsOfServiceTemplate, {
  effectiveDate: "2026-01-01",
  variables: {
    companyName: "Ambient Labs",
    productName: "FieldCAD",
    contactEmail: "hello@fieldcadapp.com",
    jurisdiction: "the State of Delaware",
  },
});
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

// See "Usage" above for the full sectionOverrides this template requires.
const policy = resolveTemplate(privacyPolicyTemplate, {
  effectiveDate: "2026-01-01",
  variables: { companyName: "Ambient Labs", productName: "FieldCAD", contactEmail: "hello@fieldcadapp.com" },
  sectionOverrides: { /* ... */ },
});
---

<PolicyPage policy={policy} client:load />
```

## Extending a template

- `effectiveDate`: a real calendar date as `YYYY-MM-DD` (e.g. `"2026-03-15"`). Dates that don't
  round-trip as a calendar date — `"2026-02-30"`, `"2023-02-29"` — are rejected; leap-day dates
  like `"2024-02-29"` are accepted.
- `variables`: fills `{{placeholder}}` tokens used throughout the template copy. All templates
  require non-blank `companyName`, `productName`, and `contactEmail`; a template may declare
  additional `requiredVariables` (the terms-of-service template also requires `jurisdiction`).
  Resolving with a missing or whitespace-only required variable throws.
- `sectionOverrides`: keyed by section `id`, replaces `heading` and/or `body` for that section —
  applies to both the template's standard sections and to `customSections`.
- `customSections`: appended after the template's own sections, interpolated the same way as
  standard sections, and can be overridden via `sectionOverrides` by `id` just like they can.
  Optionally mark one `requiresProductInput: true` (see below).
- `disabledSections`: an array of section ids to omit entirely from the resolved policy (works
  for both standard and custom sections). Use this for a section that doesn't apply to a given
  product (e.g. `childrens-privacy` for an app with no consumer-facing audience), rather than
  overriding it with empty text.
- `validate` (default `true`): after resolving, checks for unresolved `{{placeholder}}` tokens,
  missing or blank required variables, an invalid `effectiveDate`, duplicate section ids, and any
  section flagged `requiresProductInput` that hasn't been overridden with real (non-blank, even
  after interpolation) content or disabled — and throws naming the specific problem. Several
  sections across all three templates (data collection, sharing, retention, rights, account
  deletion, security, children's privacy, and cookie usage) ship with placeholder bodies that
  state they haven't been completed; `resolveTemplate` will not resolve them silently. Only pass
  `validate: false` for local preview of an incomplete draft — never for a policy that will be
  published.
- `sharedClauses.subscriptionTermsPlaceholder` (exported from the package root) is for apps with
  paid plans. Add it as a `customSections` entry marked `requiresProductInput: true`, then supply
  the app's actual billing, trial, renewal, cancellation, and refund terms via
  `sectionOverrides`; `resolveTemplate` throws until you do. Decide separately whether the app
  uses Apple's standard EULA or a custom one — that isn't something this library can encode.

  ```tsx
  import {
    resolveTemplate,
    termsOfServiceTemplate,
    sharedClauses,
  } from "@ambient-labs/legal-and-policies";

  const terms = resolveTemplate(termsOfServiceTemplate, {
    effectiveDate: "2026-01-01",
    variables: { companyName: "Ambient Labs", productName: "FieldCAD", contactEmail: "hello@fieldcadapp.com", jurisdiction: "the State of Delaware" },
    customSections: [
      {
        id: "subscription-terms",
        heading: "Subscription Terms",
        body: sharedClauses.subscriptionTermsPlaceholder,
        requiresProductInput: true,
      },
    ],
    sectionOverrides: {
      "subscription-terms": { body: "Monthly billing renews automatically; cancel anytime from Settings > Subscription." },
    },
  });
  ```

Policy bodies render as plain text, so Markdown or HTML links in `body` do not create clickable
links; implement links in the consuming page or extend rendering separately if needed.

## Disclosing IP addresses

Any service reached over the internet sees its callers' IP addresses, so the privacy template has
an `ip-address` section that every product must answer: write your own text, state the facts with
`ipAddressDisclosure`, or add `"ip-address"` to `disabledSections` if the product genuinely never
receives IP addresses (for example an on-device app that makes no network calls). Like the other
product-input sections, `resolveTemplate` throws until you do.

`ipAddressDisclosure` builds the paragraph from facts you declare, and throws if they are incomplete
or contradict each other (for example recording addresses without saying for how long), so the policy
cannot say more or less than you declared:

```ts
import { ipAddressDisclosure } from "@ambient-labs/legal-and-policies";

sectionOverrides: {
  "ip-address": {
    body: ipAddressDisclosure({
      handling: "recorded",            // or "transient": used while handling a request, never stored
      purposes: ["operation", "security", "rate-limiting", "analytics", "error-diagnostics"],
      recordedIn: ["our server logs", "product-analytics events", "error reports"], // recorded only
      linkedToAccount: true,           // recorded only: is a stored address tied to a user/account?
      derivesApproximateLocation: true, // e.g. an analytics tool turns it into country/region/city
      retention: "90 days",            // recorded only
      recipients: ["our cloud hosting provider", "Cloudflare"], // third parties; [] if none
    }),
  },
},
```

Purposes: `operation`, `security`, `rate-limiting`, `fraud-prevention`, `analytics`, `error-diagnostics`,
`support`, `legal`. Software you run yourself (a self-hosted analytics server) is not a recipient. Make
sure the declared facts are true of the deployed product, including your telemetry and logging
configuration; this library cannot check that. If your analytics or error-reporting tool records IPs
(for example `ambient-telemetry` with `captureIp`), the `analytics` and `information-we-collect`
sections should agree with this one.

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

## Release Log

| Version | Date | Summary |
| --- | --- | --- |
| v0.1.0 | 9/27/26 | First usable release |
| v0.1.1 | 9/27/26 | Add a `prepare` script so `tsup` runs on install; without it, `dist` (which is gitignored) never existed in a git-dependency checkout and consumers installed an empty package. Fixes the `github:...#<tag>` install flow described above. |
| v0.2.0 | 11/5/26 | Add the privacy template's `ip-address` section and the `ipAddressDisclosure` helper. **Breaking for existing consumers:** the new section requires product input, so `resolveTemplate(privacyPolicyTemplate, ...)` throws until you override it (see "Disclosing IP addresses") or add `"ip-address"` to `disabledSections`. Also fixes the install snippet's GitHub org. |
