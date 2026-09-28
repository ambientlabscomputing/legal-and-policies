import type { PolicySection } from "../types.js";

export interface TableOfContentsProps {
  sections: PolicySection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  return (
    <nav className="legal-policy-toc" aria-label="Table of contents">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.heading}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
