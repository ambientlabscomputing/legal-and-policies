import type { PolicyTemplateSet } from "../types.js";

export const termsOfServiceTemplate: PolicyTemplateSet = {
  en: {
    id: "terms-of-service",
    title: "{{productName}} Terms of Service",
    requiredVariables: ["jurisdiction"],
    sections: [
      {
        id: "acceptance",
        heading: "Acceptance of Terms",
        body:
          "By accessing or using {{productName}}, you agree to be bound by these Terms of Service. If you " +
          "do not agree, do not use {{productName}}.",
      },
      {
        id: "using-the-service",
        heading: "Using the Service",
        body:
          "You must use {{productName}} in compliance with all applicable laws and only for its intended " +
          "purpose. {{companyName}} may suspend or terminate access for use that violates these terms.",
      },
      {
        id: "accounts",
        heading: "Accounts",
        body:
          "You are responsible for maintaining the confidentiality of your account credentials and for all " +
          "activity that occurs under your account.",
      },
      {
        id: "acceptable-use",
        heading: "Acceptable Use",
        body:
          "You agree not to misuse {{productName}}, including attempting to access it using a method other " +
          "than the interface and instructions we provide, or interfering with its normal operation.",
      },
      {
        id: "intellectual-property",
        heading: "Intellectual Property",
        body:
          "{{productName}} and its original content, features, and functionality are owned by " +
          "{{companyName}} and are protected by applicable intellectual property laws.",
      },
      {
        id: "disclaimer",
        heading: "Disclaimer",
        body:
          "{{productName}} is provided \"as is\" without warranties of any kind, express or implied, to the " +
          "fullest extent permitted by law.",
      },
      {
        id: "limitation-of-liability",
        heading: "Limitation of Liability",
        body:
          "To the fullest extent permitted by law, {{companyName}} shall not be liable for any indirect, " +
          "incidental, special, or consequential damages arising from your use of {{productName}}.",
      },
      {
        id: "governing-law",
        heading: "Governing Law",
        body: "These Terms are governed by the laws of {{jurisdiction}}, without regard to conflict of law principles.",
      },
      {
        id: "changes",
        heading: "Changes to These Terms",
        body:
          "We may update these Terms from time to time. Continued use of {{productName}} after changes " +
          "take effect constitutes acceptance of the updated Terms.",
      },
      {
        id: "contact",
        heading: "Contact Us",
        body: "If you have questions about these Terms, contact us at {{contactEmail}}.",
      },
    ],
  },
};
