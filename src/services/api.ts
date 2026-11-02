import { TestAttempt, Question, Subject, AuditLogEntry, AppUser, AcademicGroup } from '../types/edki';

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
  },

  // Auth & User Management (PostgreSQL backend synchronization)
  async login(username: string, password: string): Promise<{ success: boolean; user?: AppUser; message?: string; isOffline?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(3000)
      });
      const isJson = isJsonResponse(res);
      const data = isJson ? await res.json() : null;
      if (res.ok && data?.user) {
        return { success: true, user: data.user, message: 'Успішний вхід' };
      }
      // If server explicitly returned 401 or 403 or 400 with a JSON message, it's an explicit rejection
      if (isJson && (res.status === 401 || res.status === 403 || res.status === 400)) {
        return { success: false, isOffline: false, message: data?.error || 'Невірний логін або пароль' };
      }
      // Any proxy failure, 5xx error, 404, or non-JSON response indicates backend server is unavailable
      return { success: false, isOffline: true, message: 'Сервер недоступний (офлайн режим)' };
    } catch {
      return { success: false, isOffline: true, message: 'Сервер недоступний (офлайн режим)' };
    }
  },

  async registerUser(userData: Partial<AppUser>): Promise<{ success: boolean; user?: AppUser; message?: string; isOffline?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(3000)
      });
      const isJson = isJsonResponse(res);
      const data = isJson ? await res.json() : null;
      if (res.ok && data?.id) {
        return { success: true, user: data, message: 'Успішна реєстрація' };
      }
      // If server explicitly returned 409 Conflict (e.g. login already exists) or 400 Bad Request
      if (isJson && (res.status === 409 || res.status === 400)) {
        return { success: false, isOffline: false, message: data?.error || 'Помилка валідації даних на сервері' };
      }
      // Any proxy failure, 5xx error, 404, or non-JSON response indicates backend server is unavailable
      return { success: false, isOffline: true, message: 'Сервер недоступний (офлайн режим)' };
    } catch {
      return { success: false, isOffline: true, message: 'Сервер недоступний (офлайн режим)' };
    }
  },

  async fetchUsers(): Promise<AppUser[] | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/users`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok || !isJsonResponse(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async fetchGroups(): Promise<AcademicGroup[] | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/groups`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok || !isJsonResponse(res)) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async resetPassword(id: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(id)}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};
