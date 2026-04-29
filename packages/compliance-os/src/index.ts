import { formatDate, RiskLevel } from "../../shared/src/index.js";

export interface ComplianceEvent {
  id: string;
  timestamp: string;
  appName: string;
  userIdHash: string;
  model: string;
  purpose: string;
  prompt: string;
  response: string;
  userConsent: boolean;
  safetyChecks: string[];
  riskLevel: RiskLevel;
  humanOversightRequired: boolean;
  dataCategories: string[];
}

export interface ComplianceReport {
  generatedAt: string;
  appName: string;
  totalEvents: number;
  highRiskEvents: number;
  missingConsentEvents: number;
  humanOversightQueue: ComplianceEvent[];
  modelCard: string;
  auditSummary: string[];
}

export class ComplianceLogger {
  private events: ComplianceEvent[] = [];

  /**
   * Wrap this around each AI call in a SaaS app. The event becomes the raw
   * evidence for audit trails, model cards, and human oversight workflows.
   */
  log(event: Omit<ComplianceEvent, "id" | "timestamp">): ComplianceEvent {
    const saved: ComplianceEvent = {
      id: `evt_${Date.now()}_${this.events.length + 1}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.events.push(saved);
    return saved;
  }

  list(): ComplianceEvent[] {
    return [...this.events];
  }

  /**
   * Generates a lightweight operational report. This is intentionally framed
   * as compliance support, not as a legal certification.
   */
  generateReport(appName: string): ComplianceReport {
    const events = this.events.filter((event) => event.appName === appName);
    const highRiskEvents = events.filter((event) => event.riskLevel === "high");
    const missingConsentEvents = events.filter((event) => !event.userConsent);
    const humanOversightQueue = events.filter((event) => event.humanOversightRequired);

    return {
      generatedAt: new Date().toISOString(),
      appName,
      totalEvents: events.length,
      highRiskEvents: highRiskEvents.length,
      missingConsentEvents: missingConsentEvents.length,
      humanOversightQueue,
      modelCard: this.buildModelCard(appName, events),
      auditSummary: [
        `${events.length} AI events recorded for ${appName}.`,
        `${highRiskEvents.length} high-risk events require review.`,
        `${missingConsentEvents.length} events are missing explicit consent.`,
        `${humanOversightQueue.length} events are queued for human oversight.`,
        `Report date: ${formatDate()}.`
      ]
    };
  }

  private buildModelCard(appName: string, events: ComplianceEvent[]): string {
    const models = [...new Set(events.map((event) => event.model))].join(", ") || "No model logged";
    const purposes = [...new Set(events.map((event) => event.purpose))].join(", ") || "No purpose logged";
    const dataCategories = [...new Set(events.flatMap((event) => event.dataCategories))].join(", ") || "No data categories logged";

    return [
      `Model card for ${appName}`,
      `Models used: ${models}`,
      `Purposes: ${purposes}`,
      `Data categories: ${dataCategories}`,
      "Human oversight: required for high-risk or policy-sensitive events.",
      "Limitations: this report is an operational aid, not a final legal compliance certification."
    ].join("\n");
  }
}

export function createSampleComplianceLogger(): ComplianceLogger {
  const logger = new ComplianceLogger();
  logger.log({
    appName: "demo-saas",
    userIdHash: "user_hash_123",
    model: "gpt-4.1-mini",
    purpose: "customer support answer",
    prompt: "User asks for refund policy.",
    response: "Here is the refund policy summary.",
    userConsent: true,
    safetyChecks: ["pii-redaction", "toxicity-check", "refund-policy-grounding"],
    riskLevel: "low",
    humanOversightRequired: false,
    dataCategories: ["support-ticket", "account-plan"]
  });
  logger.log({
    appName: "demo-saas",
    userIdHash: "user_hash_456",
    model: "gpt-4.1",
    purpose: "loan eligibility explanation",
    prompt: "Explain why the customer may not qualify.",
    response: "Eligibility depends on income, history, and region.",
    userConsent: true,
    safetyChecks: ["pii-redaction", "fairness-review-required"],
    riskLevel: "high",
    humanOversightRequired: true,
    dataCategories: ["financial", "profile"]
  });
  return logger;
}
