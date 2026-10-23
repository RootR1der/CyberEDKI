import { TestAttempt, Question, Subject, AuditLogEntry, AppUser } from '../types/edki';

const API_BASE = '/api';

function isJsonResponse(res: Response): boolean {
  const contentType = res.headers.get('content-type');
  return !!contentType && contentType.includes('application/json');
}

export const api = {
  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok && isJsonResponse(res);
    } catch {
      return false;
    }
  },

  // Attempts & Proctoring
  async saveAttempt(attempt: TestAttempt): Promise<TestAttempt | null> {
    try {
      const res = await fetch(`${API_BASE}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok || !isJsonResponse(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async fetchAttempts(userId?: string): Promise<TestAttempt[] | null> {
    try {
      const url = userId ? `${API_BASE}/attempts?userId=${encodeURIComponent(userId)}` : `${API_BASE}/attempts`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok || !isJsonResponse(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async checkSimulationLocked(userId: string): Promise<{ locked: boolean; attempt?: any }> {
    try {
      const res = await fetch(`${API_BASE}/attempts/check-simulation/${encodeURIComponent(userId)}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok || !isJsonResponse(res)) return { locked: false };
      return await res.json();
    } catch {
      return { locked: false };
    }
  },

  // Questions
  async fetchQuestions(): Promise<Question[] | null> {
    try {
      const res = await fetch(`${API_BASE}/questions`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok || !isJsonResponse(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveQuestion(question: Question): Promise<Question | null> {
    try {
      const res = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question)
      });
      if (!res.ok || !isJsonResponse(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateQuestion(question: Question): Promise<Question | null> {
    try {
      const res = await fetch(`${API_BASE}/questions/${encodeURIComponent(question.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question)
      });
      if (!res.ok || !isJsonResponse(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async deleteQuestion(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/questions/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Subjects
  async fetchSubjects(): Promise<Subject[] | null> {
    try {
      const res = await fetch(`${API_BASE}/subjects`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok || !isJsonResponse(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Audit Logs
  async logAudit(entry: Omit<AuditLogEntry, 'id'>): Promise<void> {
    try {
      await fetch(`${API_BASE}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch {
      // Ignore background audit fail
    }
  }
};
