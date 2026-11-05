/** Why a product uses IP addresses. Each maps to a fixed, plain-language phrase. */
export type IpAddressPurpose =
  | "operation"
  | "security"
  | "rate-limiting"
  | "fraud-prevention"
  | "analytics"
  | "error-diagnostics"
  | "support"
  | "legal";

export interface IpAddressDisclosureOptions {
  /**
   * `"transient"`: the address is used while a request is handled and is not written anywhere.
   * `"recorded"`: it is stored (server logs, analytics events, error reports, a database...).
   * Be honest about this: any server that is reached over the internet sees the address, so
   * "we never see your IP" is not an option here.
   */
  handling: "transient" | "recorded";
  /** Why the address is used. At least one. */
  purposes: IpAddressPurpose[];
  /** Required when `handling` is `"recorded"`: where it is stored, e.g. `["server logs", "error reports"]`. */
  recordedIn?: string[];
  /** Required when `handling` is `"recorded"`: whether a recorded address is tied to a user's account or identifier. */
  linkedToAccount?: boolean;
  /** The address is turned into approximate location (country, region, city), e.g. by an analytics tool. */
  derivesApproximateLocation?: boolean;
  /** Required when `handling` is `"recorded"`: how long, as a phrase, e.g. `"90 days"`. */
  retention?: string;
  /**
   * Required (use `[]` for none): third parties that receive or process the address on your
   * behalf, e.g. your CDN or hosting provider. Software you run yourself is not a recipient.
   */
  recipients: string[];
}

const PURPOSE_PHRASES: Record<IpAddressPurpose, string> = {
  operation: "operating and delivering the service",
  security: "securing accounts and the service and detecting abuse",
  "rate-limiting": "rate limiting",
  "fraud-prevention": "preventing fraud",
  analytics: "understanding aggregate usage of {{productName}}",
  "error-diagnostics": "diagnosing errors",
  support: "responding to support requests",
  legal: "complying with legal obligations",
};

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function clean(items: string[] | undefined): string[] {
  return [...new Set((items ?? []).map((item) => item.trim()).filter(Boolean))];
}

/**
 * Builds the body for the privacy policy's `ip-address` section from structured, checked facts, so
 * the policy cannot say more or less than what was declared. Pass the result as
 * `sectionOverrides["ip-address"].body`. It contains `{{productName}}`, which `resolveTemplate` fills.
 *
 * Throws on missing or contradictory facts (for example recording addresses without saying for how
 * long), rather than producing a policy that quietly leaves them out.
 */
export function ipAddressDisclosure(options: IpAddressDisclosureOptions): string {
  const { handling, derivesApproximateLocation, linkedToAccount } = options;
  const fail = (why: string): never => {
    throw new Error(`ipAddressDisclosure: ${why}`);
  };

  if (handling !== "transient" && handling !== "recorded") {
    fail(`"handling" must be "transient" or "recorded".`);
  }
  if (!Array.isArray(options.recipients)) {
    fail(`"recipients" is required (use [] if no third party receives IP addresses).`);
  }

  const purposes = [...new Set(options.purposes ?? [])];
  if (purposes.length === 0) fail(`at least one purpose is required.`);
  for (const purpose of purposes) {
    if (!(purpose in PURPOSE_PHRASES)) fail(`unknown purpose "${String(purpose)}".`);
  }

  const recordedIn = clean(options.recordedIn);
  const retention = options.retention?.trim().replace(/[.\s]+$/, "") ?? "";
  if (handling === "transient") {
    if (recordedIn.length || retention || linkedToAccount !== undefined) {
      fail(`"recordedIn", "retention" and "linkedToAccount" only apply when handling is "recorded".`);
    }
  } else {
    if (recordedIn.length === 0) fail(`"recordedIn" is required when handling is "recorded".`);
    if (!retention) fail(`"retention" is required when handling is "recorded".`);
    if (typeof linkedToAccount !== "boolean") {
      fail(`"linkedToAccount" is required when handling is "recorded" (true or false).`);
    }
  }

  const purposeText = list(purposes.map((purpose) => PURPOSE_PHRASES[purpose]));
  const parts: string[] = [];

  if (handling === "transient") {
    parts.push(
      `{{productName}} receives your device's IP address whenever you connect, as any internet service does. ` +
        `We use it only while handling your request, for ${purposeText}, and we do not record or store it.`,
    );
  } else {
    parts.push(
      `{{productName}} receives your device's IP address whenever you connect. We record it in ` +
        `${list(recordedIn)} and use it for ${purposeText}.`,
    );
    parts.push(
      linkedToAccount
        ? `Recorded IP addresses may be associated with your account.`
        : `We do not associate recorded IP addresses with your account.`,
    );
  }

  if (derivesApproximateLocation) {
    parts.push(`We also use your IP address to derive your approximate location, such as country, region, or city.`);
  }
  if (handling === "recorded") parts.push(`We keep recorded IP addresses for ${retention}.`);

  const recipients = clean(options.recipients);
  parts.push(
    recipients.length === 0
      ? `We do not share IP addresses with third parties, other than where required by law.`
      : `IP addresses are processed on our behalf by ${list(recipients)}.`,
  );

  return parts.join(" ");
}
