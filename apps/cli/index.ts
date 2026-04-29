import { createSampleTutor } from "../../packages/sat-tutor/src/index.js";
import { createSampleComplianceLogger } from "../../packages/compliance-os/src/index.js";
import { createSampleLegalAnalysis } from "../../packages/legal-agent/src/index.js";

type DemoName = "tutor" | "compliance" | "legal" | "all";

const demo = (process.argv[2] ?? "all") as DemoName;

function print(title: string, payload: unknown): void {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(payload, null, 2));
}

function runTutor(): void {
  const tutor = createSampleTutor();
  print("SAT Tutor Outcome Plan", tutor.createPlan("student-001"));
}

function runCompliance(): void {
  const logger = createSampleComplianceLogger();
  print("AI Compliance OS Report", logger.generateReport("demo-saas"));
}

function runLegal(): void {
  print("Personal Legal Agent Analysis", createSampleLegalAnalysis());
}

switch (demo) {
  case "tutor":
    runTutor();
    break;
  case "compliance":
    runCompliance();
    break;
  case "legal":
    runLegal();
    break;
  case "all":
    runTutor();
    runCompliance();
    runLegal();
    break;
  default:
    console.error("Unknown demo. Use tutor, compliance, legal, or all.");
    process.exitCode = 1;
}

