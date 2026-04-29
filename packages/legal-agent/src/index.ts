import { RiskLevel, unique } from "../../shared/src/index.js";

export interface LegalRisk {
  title: string;
  riskLevel: RiskLevel;
  evidence: string;
  suggestedAction: string;
}

export interface LegalDocumentAnalysis {
  documentType: "rental" | "employment" | "insurance" | "unknown";
  plainEnglishSummary: string;
  risks: LegalRisk[];
  deadlines: string[];
  actionLetter: string;
  disclaimer: string;
}

const patterns = {
  rental: ["rent", "tenant", "landlord", "deposit", "lease"],
  employment: ["employment", "salary", "termination", "non-compete", "notice period"],
  insurance: ["claim", "denied", "coverage", "policy", "insurer"]
};

export class PersonalLegalAgent {
  /**
   * Analyzes pasted document text and returns a consumer-friendly summary,
   * risk list, deadline list, and draft action letter.
   */
  analyze(documentText: string, userGoal = "protect my rights"): LegalDocumentAnalysis {
    const documentType = this.detectType(documentText);
    const risks = this.findRisks(documentText, documentType);
    const deadlines = this.findDeadlines(documentText);

    return {
      documentType,
      plainEnglishSummary: this.summarize(documentText, documentType, userGoal),
      risks,
      deadlines,
      actionLetter: this.createLetter(documentType, userGoal, risks, deadlines),
      disclaimer:
        "This is general information and drafting support, not legal advice. Contact a qualified lawyer for advice about your jurisdiction and facts."
    };
  }

  private detectType(text: string): LegalDocumentAnalysis["documentType"] {
    const lower = text.toLowerCase();
    const scores = Object.entries(patterns).map(([type, terms]) => ({
      type: type as LegalDocumentAnalysis["documentType"],
      score: terms.filter((term) => lower.includes(term)).length
    }));
    const best = scores.sort((a, b) => b.score - a.score)[0];
    return best.score > 0 ? best.type : "unknown";
  }

  private summarize(text: string, documentType: LegalDocumentAnalysis["documentType"], userGoal: string): string {
    const firstSentence = text.split(/[.!?]/).find((part) => part.trim().length > 20)?.trim() ?? "The document needs a closer review.";
    return `This appears to be a ${documentType} document. Your goal is to ${userGoal}. Key starting point: ${firstSentence}.`;
  }

  private findRisks(text: string, documentType: LegalDocumentAnalysis["documentType"]): LegalRisk[] {
    const lower = text.toLowerCase();
    const risks: LegalRisk[] = [];

    if (lower.includes("non-refundable") || lower.includes("no refund")) {
      risks.push({
        title: "Refund restriction",
        riskLevel: "medium",
        evidence: "The document mentions non-refundable or no-refund language.",
        suggestedAction: "Ask for the legal basis and request an exception in writing."
      });
    }

    if (lower.includes("terminate") || lower.includes("termination")) {
      risks.push({
        title: "Termination clause",
        riskLevel: documentType === "employment" ? "high" : "medium",
        evidence: "The document includes termination language.",
        suggestedAction: "Check notice periods, cure rights, and whether termination is one-sided."
      });
    }

    if (lower.includes("deposit") && (lower.includes("forfeit") || lower.includes("deduct"))) {
      risks.push({
        title: "Deposit deduction risk",
        riskLevel: "medium",
        evidence: "The document discusses deposit forfeiture or deductions.",
        suggestedAction: "Request an itemized list, photos, receipts, and the deadline for deposit return."
      });
    }

    if (lower.includes("denied") || lower.includes("denial")) {
      risks.push({
        title: "Claim denial",
        riskLevel: "high",
        evidence: "The document appears to deny a claim or request.",
        suggestedAction: "Request the specific policy clause, evidence relied on, and appeal process."
      });
    }

    if (risks.length === 0) {
      risks.push({
        title: "No obvious red flag found",
        riskLevel: "low",
        evidence: "The simple rule scan did not find major trigger phrases.",
        suggestedAction: "Still review payment, deadline, liability, and cancellation clauses carefully."
      });
    }

    return risks;
  }

  private findDeadlines(text: string): string[] {
    const matches = text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,3}\s+days?|within\s+\d{1,3}\s+days?)\b/gi);
    return unique(matches ?? []);
  }

  private createLetter(
    documentType: LegalDocumentAnalysis["documentType"],
    userGoal: string,
    risks: LegalRisk[],
    deadlines: string[]
  ): string {
    const issues = risks.map((risk) => `- ${risk.title}: ${risk.suggestedAction}`).join("\n");
    const deadlineText = deadlines.length > 0 ? `\nRelevant deadlines I found: ${deadlines.join(", ")}.\n` : "\nPlease confirm all applicable deadlines in writing.\n";

    return [
      "Subject: Request for clarification and written resolution",
      "",
      "Hello,",
      "",
      `I am writing about the ${documentType} document and my goal is to ${userGoal}.`,
      deadlineText,
      "Please respond in writing to the following issues:",
      issues,
      "",
      "Please preserve all related records and provide the policy, contract clause, or evidence you are relying on.",
      "",
      "Sincerely,"
    ].join("\n");
  }
}

export function createSampleLegalAnalysis(): LegalDocumentAnalysis {
  const agent = new PersonalLegalAgent();
  return agent.analyze(
    "This lease says the landlord may deduct from the deposit and terminate the agreement within 30 days if rent is late. The deposit is non-refundable after move-in.",
    "recover my deposit and understand termination risk"
  );
}
