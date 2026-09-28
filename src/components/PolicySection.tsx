import type { PolicySection as PolicySectionData } from "../types.js";

export interface PolicySectionProps {
  section: PolicySectionData;
}

export function PolicySection({ section }: PolicySectionProps) {
  return (
    <section id={section.id} className="legal-policy-section">
      <h2>{section.heading}</h2>
      <p>{section.body}</p>
    </section>
  );
}
