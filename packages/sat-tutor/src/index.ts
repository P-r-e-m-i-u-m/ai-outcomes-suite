import { clamp } from "../../shared/src/index.js";

export type SatSkill =
  | "linear_equations"
  | "systems"
  | "quadratics"
  | "functions"
  | "geometry"
  | "probability"
  | "data_analysis";

export interface QuestionAttempt {
  studentId: string;
  skill: SatSkill;
  correct: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5;
  secondsSpent: number;
  timestamp: string;
}

export interface SkillMastery {
  skill: SatSkill;
  score: number;
  attempts: number;
  correct: number;
  status: "urgent" | "practice" | "mastered";
}

export interface TutorPlan {
  studentId: string;
  examGoal: string;
  readinessScore: number;
  weakestSkills: SkillMastery[];
  nextSevenDays: string[];
  guaranteePolicy: string;
}

const skillLabels: Record<SatSkill, string> = {
  linear_equations: "Linear equations",
  systems: "Systems of equations",
  quadratics: "Quadratics",
  functions: "Functions",
  geometry: "Geometry",
  probability: "Probability",
  data_analysis: "Data analysis"
};

export class SatOutcomeTutor {
  private attempts: QuestionAttempt[] = [];

  /**
   * Records one student answer. Production apps can call this after every
   * quiz question, mock test item, or imported practice session.
   */
  recordAttempt(attempt: QuestionAttempt): void {
    this.attempts.push(attempt);
  }

  /**
   * Returns mastery for every tracked SAT Math skill, including skills the
   * student has not attempted yet.
   */
  getMastery(studentId: string): SkillMastery[] {
    const skills = Object.keys(skillLabels) as SatSkill[];
    return skills.map((skill) => this.calculateSkill(studentId, skill));
  }

  /**
   * Creates the core outcome artifact: a readiness score, weak skills, and
   * a concrete seven-day plan that can later power a parent or tutor dashboard.
   */
  createPlan(studentId: string, examGoal = "Improve SAT Math score by 100+ points"): TutorPlan {
    const mastery = this.getMastery(studentId);
    const weakestSkills = [...mastery]
      .filter((item) => item.status !== "mastered")
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    const readinessScore = Math.round(
      mastery.reduce((sum, item) => sum + item.score, 0) / mastery.length
    );

    return {
      studentId,
      examGoal,
      readinessScore,
      weakestSkills,
      nextSevenDays: this.buildSevenDayPlan(weakestSkills),
      guaranteePolicy:
        "Outcome promise: if the student completes the assigned plan and does not improve in tracked mocks, the platform extends coaching at no extra cost."
    };
  }

  private calculateSkill(studentId: string, skill: SatSkill): SkillMastery {
    const attempts = this.attempts.filter(
      (attempt) => attempt.studentId === studentId && attempt.skill === skill
    );

    if (attempts.length === 0) {
      return { skill, score: 0, attempts: 0, correct: 0, status: "urgent" };
    }

    const correct = attempts.filter((attempt) => attempt.correct).length;
    const accuracy = correct / attempts.length;
    const difficultyWeight =
      attempts.reduce((sum, attempt) => sum + attempt.difficulty, 0) / attempts.length / 5;
    const paceScore =
      attempts.reduce((sum, attempt) => sum + (attempt.secondsSpent <= 90 ? 1 : 0.65), 0) /
      attempts.length;

    const score = Math.round(clamp((accuracy * 0.7 + difficultyWeight * 0.2 + paceScore * 0.1) * 100, 0, 100));
    const status = score >= 80 ? "mastered" : score >= 50 ? "practice" : "urgent";

    return { skill, score, attempts: attempts.length, correct, status };
  }

  private buildSevenDayPlan(weakestSkills: SkillMastery[]): string[] {
    const focus = weakestSkills.length > 0 ? weakestSkills : [{ skill: "linear_equations" as SatSkill, score: 0, attempts: 0, correct: 0, status: "urgent" as const }];
    return Array.from({ length: 7 }, (_, index) => {
      const item = focus[index % focus.length];
      const label = skillLabels[item.skill];
      return `Day ${index + 1}: ${label} - 20 targeted questions, 2 worked examples, 1 timed mini-test.`;
    });
  }
}

export function createSampleTutor(): SatOutcomeTutor {
  const tutor = new SatOutcomeTutor();
  const now = new Date().toISOString();
  const attempts: QuestionAttempt[] = [
    { studentId: "student-001", skill: "linear_equations", correct: true, difficulty: 3, secondsSpent: 75, timestamp: now },
    { studentId: "student-001", skill: "quadratics", correct: false, difficulty: 4, secondsSpent: 140, timestamp: now },
    { studentId: "student-001", skill: "geometry", correct: false, difficulty: 3, secondsSpent: 160, timestamp: now },
    { studentId: "student-001", skill: "data_analysis", correct: true, difficulty: 2, secondsSpent: 80, timestamp: now },
    { studentId: "student-001", skill: "quadratics", correct: false, difficulty: 3, secondsSpent: 110, timestamp: now },
    { studentId: "student-001", skill: "functions", correct: true, difficulty: 3, secondsSpent: 95, timestamp: now }
  ];
  attempts.forEach((attempt) => tutor.recordAttempt(attempt));
  return tutor;
}
