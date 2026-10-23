export type QuestionType = 'Official' | 'Previous year' | 'Practice' | 'AI-generated';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionStatus = 'Draft' | 'Review' | 'Verified' | 'Needs correction';
export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  groupName?: string; // e.g. 'КБ-41', 'КБ-42' (for students)
  email: string;
  username: string; // login identifier
  password: string; // stored as plain text (frontend-only app, no backend)
  isActive: boolean; // access granted by teacher/admin
  department?: string; // for teachers (e.g. 'Кафедра систем інформаційного та кіберзахисту')
  avatar?: string;
  createdAt: string;
}

export interface AcademicGroup {
  id: string;
  name: string; // e.g. 'КБ-41'
  course: number; // e.g. 4
  specialty: string; // '125 Кібербезпека'
  studentCount?: number;
  inviteToken?: string;
  inviteEnabled?: boolean;
}

export interface EDKICluster7 {
  id: number; // 1 to 7
  code: string;
  name: string;
  weightMin: number; // %
  weightMax: number; // %
  weightPercent: number; // Target average percentage
  description: string;
  topicsList: string[];
}

export interface AnswerOption {
  id: OptionKey;
  text: string;
}

export interface SourceReference {
  title: string;
  code?: string;
  type: 'law' | 'standard' | 'rfc' | 'framework' | 'guideline';
  url?: string;
  articleOrSection?: string;
  quote?: string;
}

export interface Question {
  id: string;
  text: string;
  options: AnswerOption[];
  correctAnswer: OptionKey;
  clusterId?: number; // 1 to 7 corresponding to official EDKI clusters
  subjectId: number;
  topicId: string;
  subtopic: string;
  year?: number;
  type: QuestionType;
  difficulty: Difficulty;
  explanation: string;
  optionExplanations: Record<OptionKey, string>;
  source: SourceReference;
  status: QuestionStatus;
  createdById?: string;
}

export interface Topic {
  id: string;
  subjectId: number;
  name: string;
  subtopics: string[];
  isOfficial: boolean;
  clusterId?: number;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  description: string;
  iconName: string;
  isOfficial: boolean;
  clusterId: number; // Link to 7 official clusters
  topics: Topic[];
}

export type TestMode = 'learning' | 'simulation' | 'topic' | 'mistakes' | 'blitz' | 'cluster';

export interface QuestionAnswerRecord {
  questionId: string;
  selectedOption: OptionKey | null;
  isCorrect: boolean;
  flagged?: boolean;
}

export type ViolationType = 'tab_switch' | 'blur' | 'fullscreen_exit' | 'split_screen' | 'window_resize';

export interface ProctoringViolation {
  id: string;
  type: ViolationType;
  description: string;
  timestamp: string; // ISO string
}

export interface TestAttempt {
  id: string;
  userId?: string;
  studentName?: string;
  groupName?: string;
  date: string;
  mode: TestMode;
  title: string;
  subjectId?: number;
  clusterId?: number;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  passed: boolean;
  durationSeconds: number;
  answers: QuestionAnswerRecord[];
  violations?: ProctoringViolation[];
  disqualified?: boolean;
  terminationReason?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface UserMistake {
  questionId: string;
  userId?: string;
  firstFailedAt: string;
  lastFailedAt: string;
  failCount: number;
  consecutiveCorrect: number; // 2 consecutive correct answers marks it mastered
  isMastered: boolean;
}

export interface SubjectMastery {
  subjectId: number;
  subjectName: string;
  answered: number;
  correct: number;
  accuracy: number;
  coverage: number;
}

export interface ClusterMastery {
  clusterId: number;
  clusterName: string;
  weightPercent: number;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface UserAnalytics {
  readinessScore: number; // 0-100%
  totalTestsCompleted: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  activeMistakesCount: number;
  masteredMistakesCount: number;
  subjectMastery: Record<number, SubjectMastery>;
  clusterMastery: Record<number, ClusterMastery>;
  weakTopics: { subjectId: number; topicName: string; accuracy: number; mistakes: number }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}
