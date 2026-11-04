import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Question,
  TestAttempt,
  UserMistake,
  UserAnalytics,
  SubjectMastery,
  ClusterMastery,
  OptionKey,
  Subject,
  Topic
} from '../types/edki';
import { INITIAL_QUESTIONS } from '../data/questions';
import { SUBJECTS_DATA } from '../data/subjects';
import { EDKI_CLUSTERS_DATA } from '../data/clusters';
import { RegulatorySourceItem, OFFICIAL_SOURCES } from '../data/sources';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface EdkiContextType {
  questions: Question[];
  subjects: Subject[];
  sources: RegulatorySourceItem[];
  clusters: typeof EDKI_CLUSTERS_DATA;
  attempts: TestAttempt[];
  mistakes: Record<string, UserMistake>;
  bookmarks: string[];
  analytics: UserAnalytics;

  // Actions
  recordQuestionResult: (questionId: string, isCorrect: boolean) => void;
  saveTestAttempt: (attempt: Omit<TestAttempt, 'id' | 'date'>) => TestAttempt;
  toggleBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;

  // Question CRUD & JSON
  createQuestion: (question: Omit<Question, 'id'>) => Question;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (questionId: string) => void;
  batchAddQuestions: (newQuestions: Question[]) => number;
  importQuestionsJson: (jsonString: string, targetOverrides?: { subjectId?: number; topicId?: string; subtopic?: string; clusterId?: number }) => { success: boolean; count: number; error?: string };
  exportBackupJson: () => string;
  resetAllProgress: (scope?: 'current' | 'all') => boolean;
  allMistakes: Record<string, UserMistake>;

  // Subject & Topic actions
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: number) => void;
  addTopic: (subjectId: number, topic: Topic) => void;
  updateTopic: (subjectId: number, topic: Topic) => void;
  deleteTopic: (subjectId: number, topicId: string) => void;

  // Sources actions
  addSource: (source: Omit<RegulatorySourceItem, 'id'>) => RegulatorySourceItem;
  updateSource: (source: RegulatorySourceItem) => void;
  deleteSource: (sourceId: string) => void;
  // Exam simulation builder by 7 clusters & anti-cheat
  generateBalancedExamQuestions: (totalCount?: number) => Question[];
  getSimulationAttemptForUser: (userId?: string) => TestAttempt | undefined;
  isSimulationLocked: (userId?: string) => boolean;
  deleteAttempt: (attemptId: string) => void;
}

const STORAGE_KEYS = {
  QUESTIONS: 'cyberedki_questions_v4',
  ATTEMPTS: 'cyberedki_attempts_v2',
  MISTAKES: 'cyberedki_mistakes_v2',
  BOOKMARKS: 'cyberedki_bookmarks_v2',
  SUBJECTS: 'cyberedki_subjects_v1',
  SOURCES: 'cyberedki_sources_v1'
};

const EdkiContext = createContext<EdkiContextType | undefined>(undefined);

export const EdkiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, addAuditLog } = useAuth();

  // 1. Questions State
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const initialMap = new Map(INITIAL_QUESTIONS.map(q => [q.id, q]));

    if (saved) {
      try {
        const parsed: Question[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(q => q && q.id && Array.isArray(q.options));
          if (valid.length >= INITIAL_QUESTIONS.length) {
            // Merge metadata corrections (subjectId, clusterId, topicId) from INITIAL_QUESTIONS
            return valid.map(q => {
              const official = initialMap.get(q.id);
              if (official) {
                return {
                  ...q,
                  subjectId: official.subjectId,
                  clusterId: official.clusterId,
                  topicId: official.topicId,
                  subtopic: official.subtopic || q.subtopic
                };
              }
              return q;
            });
          }
        }
      } catch (e) { }
    }
    // Check previous v2 storage for any custom questions created by user
    const oldSaved = localStorage.getItem('cyberedki_questions_v2');
    if (oldSaved) {
      try {
        const oldParsed: Question[] = JSON.parse(oldSaved);
        if (Array.isArray(oldParsed)) {
          const initialIds = new Set(INITIAL_QUESTIONS.map(q => q.id));
          const customQuestions = oldParsed.filter(q => q && q.id && !initialIds.has(q.id) && Array.isArray(q.options));
          return [...INITIAL_QUESTIONS, ...customQuestions];
        }
      } catch (e) { }
    }
    return INITIAL_QUESTIONS;
  });

  // 2. Attempts History
  const [attempts, setAttempts] = useState<TestAttempt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Drop leftover demo fixtures that used to be seeded into every browser
          return parsed.filter((a: TestAttempt) => !String(a?.id || '').startsWith('att-mock-'));
        }
      } catch (e) { }
    }
    return [];
  });

  // 3. User Mistakes Store (stores all mistakes partitioned by user ID)
  const [allMistakes, setAllMistakes] = useState<Record<string, UserMistake>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) { }
    }
    return {};
  });

  // User-scoped mistakes: mistakes made by the current logged-in user (with fallback for legacy/guest items)
  const mistakes = useMemo<Record<string, UserMistake>>(() => {
    const currentUid = currentUser?.id || 'guest';
    const result: Record<string, UserMistake> = {};
    Object.values(allMistakes).forEach(m => {
      if (m.userId === currentUid || (!m.userId && (currentUid === 'user-student-1' || currentUid === 'guest'))) {
        result[m.questionId] = m;
      }
    });
    return result;
  }, [allMistakes, currentUser?.id]);

  // 4. Bookmarks (isolated per user ID)
  const [allBookmarks, setAllBookmarks] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return { 'user-student-1': parsed };
        }
        return parsed || {};
      } catch (e) { }
    }
    return {};
  });

  const bookmarks = useMemo<string[]>(() => {
    const uid = currentUser?.id || 'guest';
    return allBookmarks[uid] || [];
  }, [allBookmarks, currentUser?.id]);

  // 5. Subjects Catalog State
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { }
    }
    return SUBJECTS_DATA;
  });

  // 6. Regulatory Sources State
  const [sources, setSources] = useState<RegulatorySourceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOURCES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { }
    }
    return OFFICIAL_SOURCES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(allMistakes));
  }, [allMistakes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(allBookmarks));
  }, [allBookmarks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  }, [sources]);

  // Initial sync with backend API if available
  useEffect(() => {
    api.fetchAttempts().then(serverAttempts => {
      if (serverAttempts && serverAttempts.length > 0) {
        setAttempts(prev => {
          const map = new Map<string, TestAttempt>();
          serverAttempts.forEach(a => map.set(a.id, a));
          prev.forEach(a => {
            if (!map.has(a.id)) map.set(a.id, a);
          });
          return Array.from(map.values());
        });
      }
    });

    api.fetchQuestions().then(serverQuestions => {
      if (serverQuestions && Array.isArray(serverQuestions) && serverQuestions.length > 0) {
        const valid = serverQuestions.filter(q => q && q.id && Array.isArray(q.options) && q.options.length >= 2);
        if (valid.length > 0) {
          setQuestions(valid);
        }
      }
    });
  }, []);

  // Record answer (partitioned per user ID)
  const recordQuestionResult = (questionId: string, isCorrect: boolean) => {
    const currentUid = currentUser?.id || 'guest';
    const storageKey = `${currentUid}_${questionId}`;
    const now = new Date().toISOString();

    setAllMistakes(prev => {
      const current = prev[storageKey];
      if (!isCorrect) {
        return {
          ...prev,
          [storageKey]: {
            questionId,
            userId: currentUid,
            firstFailedAt: current ? current.firstFailedAt : now,
            lastFailedAt: now,
            failCount: (current?.failCount || 0) + 1,
            consecutiveCorrect: 0,
            isMastered: false
          }
        };
      } else {
        if (current && !current.isMastered) {
          const nextConsecutive = current.consecutiveCorrect + 1;
          return {
            ...prev,
            [storageKey]: {
              ...current,
              consecutiveCorrect: nextConsecutive,
              isMastered: nextConsecutive >= 2
            }
          };
        }
        return prev;
      }
    });
  };

  // Save full attempt
  const saveTestAttempt = (attemptData: Omit<TestAttempt, 'id' | 'date'>): TestAttempt => {
    const newAttempt: TestAttempt = {
      ...attemptData,
      id: 'att-' + Date.now(),
      date: new Date().toISOString(),
      userId: currentUser?.id || 'guest',
      studentName: currentUser?.name || 'Гість',
      groupName: currentUser?.groupName,
      completedAt: attemptData.completedAt || new Date().toISOString()
    };

    // Update mistakes atomically across all test modes.
    // Every question where !ans.isCorrect (including unanswered questions at exam finish)
    // is recorded as a mistake for the student.
    const currentUid = currentUser?.id || 'guest';
    const now = new Date().toISOString();

    setAllMistakes(prev => {
      const updated = { ...prev };
      newAttempt.answers.forEach(ans => {
        const storageKey = `${currentUid}_${ans.questionId}`;
        const current = updated[storageKey];
        if (!ans.isCorrect) {
          updated[storageKey] = {
            questionId: ans.questionId,
            userId: currentUid,
            firstFailedAt: current ? current.firstFailedAt : now,
            lastFailedAt: now,
            failCount: (current?.failCount || 0) + 1,
            consecutiveCorrect: 0,
            isMastered: false
          };
        } else {
          if (current && !current.isMastered) {
            const nextConsecutive = current.consecutiveCorrect + 1;
            updated[storageKey] = {
              ...current,
              consecutiveCorrect: nextConsecutive,
              isMastered: nextConsecutive >= 2
            };
          }
        }
      });
      return updated;
    });

    setAttempts(prev => [newAttempt, ...prev]);
    // Asynchronously persist to PostgreSQL backend
    api.saveAttempt(newAttempt);

    if (newAttempt.disqualified) {
      addAuditLog(
        'Анулювання / Дискваліфікація ЄДКІ',
        `Студента ${newAttempt.studentName} (${newAttempt.groupName || '—'}) дискваліфіковано з тесту "${newAttempt.title}". Причина: ${newAttempt.terminationReason || 'Повторне порушення академічної доброчесності'}`
      );
    } else {
      addAuditLog(
        'Складання тесту',
        `${newAttempt.studentName} склав тест "${newAttempt.title}": ${newAttempt.scorePercentage}% (${newAttempt.passed ? 'Складено' : 'Не складено'})`
      );
    }
    return newAttempt;
  };

  const getSimulationAttemptForUser = (userId?: string): TestAttempt | undefined => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return undefined;
    return attempts.find(a => a.mode === 'simulation' && a.userId === targetId);
  };

  const isSimulationLocked = (userId?: string): boolean => {
    if (currentUser?.role === 'teacher' || currentUser?.role === 'admin') return false;
    const existing = getSimulationAttemptForUser(userId);
    return !!existing;
  };

  const deleteAttempt = (attemptId: string) => {
    setAttempts(prev => prev.filter(a => a.id !== attemptId));
    addAuditLog('Скидання спроби тесту', `Видалено спробу тестування ID: ${attemptId}`);
  };

  const toggleBookmark = (questionId: string) => {
    const uid = currentUser?.id || 'guest';
    setAllBookmarks(prev => {
      const userList = prev[uid] || [];
      const nextList = userList.includes(questionId)
        ? userList.filter(id => id !== questionId)
        : [...userList, questionId];
      return { ...prev, [uid]: nextList };
    });
  };

  const isBookmarked = (questionId: string) => bookmarks.includes(questionId);

  // Question CRUD
  const createQuestion = (data: Omit<Question, 'id'>): Question => {
    const id = 'EDKI-NEW-' + Date.now().toString().slice(-6);
    const newQ: Question = { ...data, id, createdById: currentUser?.id };
    setQuestions(prev => [newQ, ...prev]);
    addAuditLog('Створено тестове завдання', `ID: ${id}, Тема: ${newQ.subtopic}`);
    api.saveQuestion(newQ);
    return newQ;
  };

  const batchAddQuestions = (newQuestions: Question[]): number => {
    const existingIds = new Set(questions.map(q => q.id));
    const processed: Question[] = newQuestions.map((q, idx) => {
      let id = q.id;
      if (!id || existingIds.has(id)) {
        id = `EDKI-IMP-${Date.now()}-${idx + 1}`;
      }
      existingIds.add(id);
      return {
        ...q,
        id,
        status: q.status || 'Verified',
        type: q.type || 'Practice',
        difficulty: q.difficulty || 'Medium'
      };
    });

    if (processed.length > 0) {
      setQuestions(prev => [...processed, ...prev]);
      addAuditLog('Пакетне додавання питань', `Додано ${processed.length} нових тестових завдань`);
      processed.forEach(q => api.saveQuestion(q));
    }
    return processed.length;
  };

  const updateQuestion = (updated: Question) => {
    setQuestions(prev => prev.map(q => (q.id === updated.id ? updated : q)));
    addAuditLog('Оновлено тестове завдання', `ID: ${updated.id}`);
    api.updateQuestion(updated);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    addAuditLog('Видалено тестове завдання', `ID: ${id}`);
    api.deleteQuestion(id);
  };

  // Subject & Topic CRUD
  const updateSubject = (updated: Subject) => {
    setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s));
    addAuditLog('Оновлення предмету в каталозі', `Предмет: ${updated.name} (${updated.code})`);
  };

  const addSubject = (newSubjectData: Omit<Subject, 'id'>): Subject => {
    const newId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
    const newSub: Subject = {
      ...newSubjectData,
      id: newId,
      topics: newSubjectData.topics || []
    };
    setSubjects(prev => [...prev, newSub]);
    addAuditLog('Додавання нового предмету', `Створено предмет ID ${newId}: ${newSub.name}`);
    return newSub;
  };

  const deleteSubject = (subjectId: number) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    addAuditLog('Видалення предмету', `Видалено предмет ID: ${subjectId}`);
  };

  const addTopic = (subjectId: number, topic: Topic) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        topics: [...s.topics, topic]
      };
    }));
    addAuditLog('Додавання теми', `Предмет ID ${subjectId}, нова тема: ${topic.name} (${topic.id})`);
  };

  const updateTopic = (subjectId: number, updatedTopic: Topic) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        topics: s.topics.map(t => t.id === updatedTopic.id ? updatedTopic : t)
      };
    }));
    addAuditLog('Оновлення теми', `Тема ${updatedTopic.id}: ${updatedTopic.name}`);
  };

  const deleteTopic = (subjectId: number, topicId: string) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        topics: s.topics.filter(t => t.id !== topicId)
      };
    }));
    addAuditLog('Видалення теми', `Видалено тему ${topicId} з предмету ${subjectId}`);
  };

  // Sources CRUD
  const addSource = (sourceData: Omit<RegulatorySourceItem, 'id'>): RegulatorySourceItem => {
    const newId = `src-custom-${Date.now()}`;
    const newSrc: RegulatorySourceItem = {
      ...sourceData,
      id: newId
    };
    setSources(prev => [newSrc, ...prev]);
    addAuditLog('Додавання джерела', `Створено джерело: ${newSrc.title}`);
    return newSrc;
  };

  const updateSource = (updatedSource: RegulatorySourceItem) => {
    setSources(prev => prev.map(s => s.id === updatedSource.id ? updatedSource : s));
    addAuditLog('Оновлення джерела', `Оновлено: ${updatedSource.title}`);
  };

  const deleteSource = (sourceId: string) => {
    setSources(prev => prev.filter(s => s.id !== sourceId));
    addAuditLog('Видалення джерела', `Видалено джерело ID: ${sourceId}`);
  };

  // Generate balanced exam matching official 7 clusters (100 questions, 120 min)
  const generateBalancedExamQuestions = (totalCount: number = 100): Question[] => {
    const result: Question[] = [];
    const usedIds = new Set<string>();

    // Filter only valid questions with complete options
    const validQuestions = questions.filter(q => q && q.id && Array.isArray(q.options) && q.options.length >= 2);

    EDKI_CLUSTERS_DATA.forEach(cluster => {
      // Calculate target question count for this cluster based on weightPercent
      const clusterTarget = Math.max(1, Math.round((cluster.weightPercent / 100) * totalCount));
      const clusterPool = validQuestions.filter(q => {
        const sub = subjects.find(s => s.id === q.subjectId);
        return (q.clusterId === cluster.id || sub?.clusterId === cluster.id) && !usedIds.has(q.id);
      });

      const shuffled = [...clusterPool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, clusterTarget);
      selected.forEach(q => {
        result.push(q);
        usedIds.add(q.id);
      });
    });

    // If less than totalCount due to pool limits, fill with remaining random questions from any topics
    if (result.length < totalCount) {
      const remaining = validQuestions.filter(q => !usedIds.has(q.id)).sort(() => 0.5 - Math.random());
      result.push(...remaining.slice(0, totalCount - result.length));
    }

    // Safety fallback: if pool still has fewer than totalCount, fill to exact totalCount
    if (result.length < totalCount && validQuestions.length > 0) {
      let cycleIndex = 0;
      const allShuffled = [...validQuestions].sort(() => 0.5 - Math.random());
      while (result.length < totalCount) {
        const baseQ = allShuffled[cycleIndex % allShuffled.length];
        result.push({
          ...baseQ,
          id: `${baseQ.id}-dup-${result.length + 1}`
        });
        cycleIndex++;
      }
    }

    return result.slice(0, totalCount).sort(() => 0.5 - Math.random());
  };

  // Export / Import
  const exportBackupJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: '2.0-clusters-rbac',
      questions,
      attempts,
      mistakes,
      bookmarks
    };
    return JSON.stringify(payload, null, 2);
  };

  const importQuestionsJson = (
    jsonString: string,
    targetOverrides?: { subjectId?: number; topicId?: string; subtopic?: string; clusterId?: number }
  ) => {
    try {
      const data = JSON.parse(jsonString);
      let incoming: any[] = [];
      if (Array.isArray(data)) {
        incoming = data;
      } else if (data && Array.isArray(data.questions)) {
        incoming = data.questions;
      } else {
        return { success: false, count: 0, error: 'Очікується масив питань або об’єкт із полем "questions"' };
      }

      const valid: Question[] = incoming
        .filter(q => q && q.text && Array.isArray(q.options) && q.correctAnswer)
        .map(q => ({
          ...q,
          subjectId: targetOverrides?.subjectId !== undefined ? targetOverrides.subjectId : (q.subjectId || 1),
          topicId: targetOverrides?.topicId !== undefined ? targetOverrides.topicId : (q.topicId || '1.1'),
          subtopic: targetOverrides?.subtopic || q.subtopic || 'Загальне',
          clusterId: targetOverrides?.clusterId !== undefined ? targetOverrides.clusterId : q.clusterId,
          explanation: q.explanation || `Правильна відповідь — ${q.correctAnswer}.`,
          optionExplanations: q.optionExplanations || {
            A: q.correctAnswer === 'A' ? 'Правильно' : 'Не відповідає умові',
            B: q.correctAnswer === 'B' ? 'Правильно' : 'Не відповідає умові',
            C: q.correctAnswer === 'C' ? 'Правильно' : 'Не відповідає умові',
            D: q.correctAnswer === 'D' ? 'Правильно' : 'Не відповідає умові'
          },
          source: q.source || {
            title: 'Офіційна програма ЄДКІ з кібербезпеки',
            type: 'standard',
            articleOrSection: 'Стандартні вимоги'
          }
        }));

      if (valid.length === 0) {
        return { success: false, count: 0, error: 'Жодного валідного питання не знайдено (перевірте наявність text, options, correctAnswer)' };
      }

      const addedCount = batchAddQuestions(valid);
      return { success: true, count: addedCount };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Помилка JSON' };
    }
  };

  const resetAllProgress = (scope: 'current' | 'all' = 'current'): boolean => {
    const confirmed = window.confirm(
      scope === 'all'
        ? 'Скинути прогрес усіх користувачів? Банк питань залишиться.'
        : 'Ви впевнені, що бажаєте скинути історію тестувань та банк помилок?'
    );
    if (!confirmed) return false;

    if (scope === 'all') {
      setAttempts([]);
      setAllMistakes({});
      setAllBookmarks({});
      addAuditLog('Скидання прогресу', 'Очищено спроби, помилки та закладки всіх користувачів');
      return true;
    }

    const uid = currentUser?.id || 'guest';
    setAttempts(prev => prev.filter(a => a.userId !== uid));
    setAllMistakes(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (next[k].userId === uid) delete next[k];
      });
      return next;
    });
    setAllBookmarks(prev => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
    addAuditLog('Скидання прогресу', `Очищено спроби користувача ${currentUser?.name || uid}`);
    return true;
  };

  // Personal analytics for the signed-in user (teacher group stats use `attempts` directly)
  const analytics: UserAnalytics = useMemo(() => {
    const userAttempts = currentUser?.id
      ? attempts.filter(a => a.userId === currentUser.id)
      : [];

    const totalTestsCompleted = userAttempts.length;

    const questionResults: Record<string, { total: number; correct: number }> = {};
    userAttempts.forEach(att => {
      att.answers.forEach(ans => {
        if (!questionResults[ans.questionId]) {
          questionResults[ans.questionId] = { total: 0, correct: 0 };
        }
        questionResults[ans.questionId].total += 1;
        if (ans.isCorrect) {
          questionResults[ans.questionId].correct += 1;
        }
      });
    });

    const totalQuestionsAnswered = Object.values(questionResults).reduce((sum, q) => sum + q.total, 0);
    const totalCorrectAnswers = Object.values(questionResults).reduce((sum, q) => sum + q.correct, 0);
    const overallAccuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 0;

    // Subject mastery
    const subjectMap: Record<number, SubjectMastery> = {};
    subjects.forEach(sub => {
      const subjectQuestions = questions.filter(q => q.subjectId === sub.id);
      let answeredCount = 0;
      let correctCount = 0;
      let questionsSeen = 0;

      subjectQuestions.forEach(q => {
        const res = questionResults[q.id];
        if (res && res.total > 0) {
          questionsSeen += 1;
          answeredCount += res.total;
          correctCount += res.correct;
        }
      });

      const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
      const coverage = subjectQuestions.length > 0 ? Math.round((questionsSeen / subjectQuestions.length) * 100) : 0;

      subjectMap[sub.id] = {
        subjectId: sub.id,
        subjectName: sub.name,
        answered: answeredCount,
        correct: correctCount,
        accuracy,
        coverage
      };
    });

    // 7 Official Clusters Mastery
    const clusterMap: Record<number, ClusterMastery> = {};
    EDKI_CLUSTERS_DATA.forEach(cl => {
      let clAnswered = 0;
      let clCorrect = 0;

      questions.forEach(q => {
        const sub = subjects.find(s => s.id === q.subjectId);
        if (q.clusterId === cl.id || sub?.clusterId === cl.id) {
          const res = questionResults[q.id];
          if (res) {
            clAnswered += res.total;
            clCorrect += res.correct;
          }
        }
      });

      clusterMap[cl.id] = {
        clusterId: cl.id,
        clusterName: cl.name,
        weightPercent: cl.weightPercent,
        answered: clAnswered,
        correct: clCorrect,
        accuracy: clAnswered > 0 ? Math.round((clCorrect / clAnswered) * 100) : 0
      };
    });

    const activeMistakes = Object.values(mistakes).filter(m => !m.isMastered);
    const masteredMistakes = Object.values(mistakes).filter(m => m.isMastered);

    // Weak topics
    const topicMistakeMap: Record<string, { subjectId: number; topicName: string; total: number; wrong: number }> = {};
    Object.values(mistakes).forEach(m => {
      const q = questions.find(item => item.id === m.questionId);
      if (q) {
        const sub = subjects.find(s => s.id === q.subjectId);
        const top = sub?.topics.find(t => t.id === q.topicId);
        const key = q.topicId || 'unknown';
        if (!topicMistakeMap[key]) {
          topicMistakeMap[key] = {
            subjectId: q.subjectId,
            topicName: top?.name || q.subtopic || `Тема ${q.topicId}`,
            total: 0,
            wrong: 0
          };
        }
        topicMistakeMap[key].wrong += m.failCount;
        topicMistakeMap[key].total += (m.failCount + m.consecutiveCorrect);
      }
    });

    const weakTopics = Object.values(topicMistakeMap)
      .map(t => ({
        subjectId: t.subjectId,
        topicName: t.topicName,
        accuracy: t.total > 0 ? Math.round(((t.total - t.wrong) / t.total) * 100) : 0,
        mistakes: t.wrong
      }))
      .sort((a, b) => b.mistakes - a.mistakes)
      .slice(0, 5);

    // Weighted readiness calculation
    const simulations = userAttempts.filter(a => a.mode === 'simulation');
    const simulationPassRate = simulations.length > 0
      ? (simulations.filter(s => s.passed).length / simulations.length) * 100
      : 0;

    let calculatedReadiness = 0;
    if (totalQuestionsAnswered > 0) {
      calculatedReadiness = (overallAccuracy * 0.5) + (simulationPassRate * 0.3) + (Math.min(100, (totalQuestionsAnswered / 30) * 100) * 0.2);
      if (activeMistakes.length > 5) {
        calculatedReadiness = Math.max(0, calculatedReadiness - 5);
      }
    }
    const readinessScore = Math.min(100, Math.round(calculatedReadiness));

    return {
      readinessScore,
      totalTestsCompleted,
      totalQuestionsAnswered,
      overallAccuracy,
      activeMistakesCount: activeMistakes.length,
      masteredMistakesCount: masteredMistakes.length,
      subjectMastery: subjectMap,
      clusterMastery: clusterMap,
      weakTopics
    };
  }, [questions, attempts, mistakes, currentUser, subjects]);

  return (
    <EdkiContext.Provider
      value={{
        questions,
        subjects,
        sources,
        clusters: EDKI_CLUSTERS_DATA,
        attempts,
        mistakes,
        allMistakes,
        bookmarks,
        analytics,
        recordQuestionResult,
        saveTestAttempt,
        toggleBookmark,
        isBookmarked,
        createQuestion,
        updateQuestion,
        deleteQuestion,
        batchAddQuestions,
        importQuestionsJson,
        exportBackupJson,
        resetAllProgress,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        updateTopic,
        deleteTopic,
        addSource,
        updateSource,
        deleteSource,
        generateBalancedExamQuestions,
        getSimulationAttemptForUser,
        isSimulationLocked,
        deleteAttempt
      }}
    >
      {children}
    </EdkiContext.Provider>
  );
};

export const useEdki = () => {
  const context = useContext(EdkiContext);
  if (!context) {
    throw new Error('useEdki must be used within an EdkiProvider');
  }
  return context;
};