import assert from "node:assert/strict";
import { createSampleComplianceLogger } from "../packages/compliance-os/src/index.js";
import { createSampleGenAiReport } from "../packages/genai-lab/src/index.js";
import { createSampleLegalAnalysis } from "../packages/legal-agent/src/index.js";
import { createSampleTutor } from "../packages/sat-tutor/src/index.js";

const tutor = createSampleTutor();
const plan = tutor.createPlan("student-001");
assert.equal(plan.studentId, "student-001");
assert.equal(plan.nextSevenDays.length, 7);
assert.ok(plan.weakestSkills.length > 0);

const compliance = createSampleComplianceLogger().generateReport("demo-saas");
assert.equal(compliance.totalEvents, 2);
assert.equal(compliance.highRiskEvents, 1);
assert.equal(compliance.humanOversightQueue.length, 1);

const legal = createSampleLegalAnalysis();
assert.equal(legal.documentType, "rental");
assert.ok(legal.risks.length >= 1);
assert.ok(legal.actionLetter.includes("Subject:"));

const genai = createSampleGenAiReport();
assert.ok(genai.rag.citations.length >= 1);
assert.equal(genai.evals[0]?.passed, true);
assert.ok(genai.agentPlan.steps.length >= 5);

console.log("Smoke tests passed.");
