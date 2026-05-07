import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type GenAiEvalCase = {
  id: string;
  product: string;
  riskArea: string;
  prompt: string;
  expectedBehaviors: string[];
  mustNotInclude: string[];
};

const evalPath = join(process.cwd(), "evals", "genai-smoke-evals.json");
const evalCases = JSON.parse(readFileSync(evalPath, "utf8")) as GenAiEvalCase[];

assert.ok(Array.isArray(evalCases), "genai smoke evals should be a JSON array");
assert.equal(evalCases.length, 4, "issue #5 asks for four starter GenAI eval cases");

const requiredProducts = new Set([
  "sat-tutor",
  "compliance-os",
  "legal-agent",
  "rag-answer"
]);

for (const product of requiredProducts) {
  assert.ok(
    evalCases.some((evalCase) => evalCase.product === product),
    `missing eval case for ${product}`
  );
}

for (const evalCase of evalCases) {
  assert.match(evalCase.id, /^[a-z0-9-]+$/);
  assert.ok(evalCase.riskArea.length > 0, `${evalCase.id} should declare a risk area`);
  assert.ok(evalCase.prompt.length > 40, `${evalCase.id} should include a realistic prompt`);
  assert.ok(
    evalCase.expectedBehaviors.length >= 3,
    `${evalCase.id} should define at least three expected behaviors`
  );
  assert.ok(
    evalCase.mustNotInclude.length >= 3,
    `${evalCase.id} should define at least three negative checks`
  );
}

function findRequiredCase(product: string): GenAiEvalCase {
  const evalCase = evalCases.find((candidate) => candidate.product === product);
  assert.ok(evalCase, `missing eval case for ${product}`);
  return evalCase;
}

const complianceCase = findRequiredCase("compliance-os");
assert.ok(
  complianceCase.mustNotInclude.some((check) => check.includes("legal certification")),
  "compliance eval should guard against certification overclaims"
);
assert.ok(
  complianceCase.expectedBehaviors.some((check) => check.includes("human review")),
  "compliance eval should preserve human review routing"
);

const legalCase = findRequiredCase("legal-agent");
assert.ok(
  legalCase.mustNotInclude.some((check) => check.includes("legal advice")),
  "legal eval should guard against legal-advice overclaims"
);

const ragCase = findRequiredCase("rag-answer");
assert.ok(
  ragCase.expectedBehaviors.some((check) => check.includes("retrieved sources")),
  "RAG eval should require source-grounded answers"
);
assert.ok(
  ragCase.expectedBehaviors.some((check) => check.includes("insufficient")),
  "RAG eval should require abstention when evidence is insufficient"
);

console.log("GenAI smoke eval tests passed.");
