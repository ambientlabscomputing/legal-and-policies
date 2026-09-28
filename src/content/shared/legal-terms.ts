/**
 * Boilerplate clause bodies reused across more than one template.
 *
 * The `*Placeholder` clauses below intentionally describe missing information
 * rather than guessing an answer (no collection, no tracking, or a made-up
 * retention period). `resolveTemplate` refuses to resolve a policy that still
 * contains one of these unless the consumer overrides it or disables the
 * section, so a real answer must replace the placeholder before publishing.
 */
export const sharedClauses = {
  childrensPrivacy:
    "{{productName}} is not directed to children under 13, and we do not knowingly collect personal " +
    "information from children under 13. If you believe a child has provided us with personal " +
    "information, contact us at {{contactEmail}} so we can remove it.",
  accountDeletionPlaceholder:
    "[This section has not been completed. Describe the in-app account-deletion entry point, any " +
    "external request route, verification steps, completion timing, what data is deleted versus " +
    "retained and why, and any subscription consequences, before publishing this policy.]",
  securityPlaceholder:
    "[This section has not been completed. Describe the actual safeguards in place, such as transport " +
    "security and access restrictions, without claiming certifications or absolute security, before " +
    "publishing this policy.]",
  subscriptionTermsPlaceholder:
    "[This section has not been completed. Describe verified billing, trial conversion, renewal, " +
    "cancellation, refund, and post-cancellation access terms for each billing channel this app uses, " +
    "before publishing this policy.]",
};
