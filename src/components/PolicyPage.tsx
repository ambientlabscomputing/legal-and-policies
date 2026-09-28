import type { ResolvedPolicy } from "../types.js";
import { PolicySection } from "./PolicySection.js";
import { TableOfContents } from "./TableOfContents.js";

export interface PolicyPageProps {
  policy: ResolvedPolicy;
  className?: string;
}

export function PolicyPage({ policy, className }: PolicyPageProps) {
  return (
    <article className={className ? `legal-policy-page ${className}` : "legal-policy-page"}>
      <header className="legal-policy-header">
        <h1>{policy.title}</h1>
        <p className="legal-policy-effective-date">Effective {policy.effectiveDate}</p>
      </header>
      <TableOfContents sections={policy.sections} />
      {policy.sections.map((section) => (
        <PolicySection key={section.id} section={section} />
      ))}
    </article>
  );
}
