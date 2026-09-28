import type { PolicyTemplateSet } from "../types.js";

export const cookiePolicyTemplate: PolicyTemplateSet = {
  en: {
    id: "cookie-policy",
    title: "{{productName}} Cookie Policy",
    sections: [
      {
        id: "what-are-cookies",
        heading: "What Are Cookies",
        body:
          "Cookies are small text files placed on your device when you visit {{productName}}. They help " +
          "us remember your preferences and understand how the service is used.",
      },
      {
        id: "how-we-use-cookies",
        heading: "How We Use Cookies",
        requiresProductInput: true,
        body:
          "{{companyName}} uses cookies to keep you signed in, remember your settings, and gather " +
          "aggregate analytics about how {{productName}} is used so we can improve it.",
      },
      {
        id: "managing-cookies",
        heading: "Managing Cookies",
        body:
          "Most browsers let you control cookies through their settings. Disabling cookies may affect the " +
          "functionality of {{productName}}.",
      },
      {
        id: "contact",
        heading: "Contact Us",
        body: "If you have questions about this Cookie Policy, contact us at {{contactEmail}}.",
      },
    ],
  },
};
