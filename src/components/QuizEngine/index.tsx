import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Flag,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Award,
  BarChart3,
  HelpCircle,
  X
} from 'lucide-react';
import { Question, OptionKey, TestMode, TestAttempt, QuestionAnswerRecord, ViolationType, ProctoringViolation } from '../../types/edki';
import { useEdki } from '../../context/EdkiContext';
import { SUBJECTS_DATA } from '../../data/subjects';

interface QuizEngineProps {
  questions: Question[];
  mode: TestMode;
  title: string;
  subjectId?: number;
  timeLimitSeconds?: number; // default e.g. 1200 (20 min)
  onExit: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  questions,
  mode,
  title,
  subjectId,
  timeLimitSeconds = 1200,
  onExit
}) => {
  const {
    saveTestAttempt,
    recordQuestionResult,
    toggleBookmark,
    isBookmarked
  } = useEdki();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, OptionKey>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showLearningFeedback, setShowLearningFeedback] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<TestAttempt | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'flagged'>('all');
  const [showFullGrid, setShowFullGrid] = useState(false);
  // Proctoring state — use refs to avoid stale closures in event listeners
  const proctoringViolationsRef = useRef<ProctoringViolation[]>([]);
  const [proctoringViolations, setProctoringViolations] = useState<ProctoringViolation[]>([]);
  const disqualifiedRef = useRef(false);
  const [terminationReason, setTerminationReason] = useState<string>('');

  // Ensure options for all test questions strictly start in alphabetical order A, B, C, D
  const shuffledQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    return questions
      .filter((q): q is Question => Boolean(q && typeof q === 'object' && Array.isArray(q.options) && q.options.length >= 2))
      .map((q, idx) => {
        const qId = q.id || `q-${idx}-${Date.now()}`;
        // Options must strictly start in order A, B, C, D
        const sortedOptions = [...q.options].sort((a, b) => a.id.localeCompare(b.id));
        return { ...q, id: qId, options: sortedOptions };
      });
  }, [questions]);

  const currentQ = shuffledQuestions[currentIndex];
  const isSimulation = mode === 'simulation';
  const timerRef = useRef<any>(null);
  const selectedAnswersRef = useRef(selectedAnswers);
  const flaggedQuestionsRef = useRef(flaggedQuestions);
  const timeRemainingRef = useRef(timeRemaining);

  // Keep refs in sync with state
  useEffect(() => { selectedAnswersRef.current = selectedAnswers; }, [selectedAnswers]);
  useEffect(() => { flaggedQuestionsRef.current = flaggedQuestions; }, [flaggedQuestions]);
  useEffect(() => { timeRemainingRef.current = timeRemaining; }, [timeRemaining]);

  // Countdown timer for simulation
  useEffect(() => {
    if (isSimulation && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulation, isCompleted]);

  // ------------------- Proctoring: Instant Disqualification -------------------
  // Any violation immediately terminates the simulation test

  const disqualifyTestImmediate = (reason: string, violation: ProctoringViolation) => {
    if (disqualifiedRef.current) return; // prevent double-fire
    disqualifiedRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);

    const allViolations = [...proctoringViolationsRef.current, violation];

    const answerRecords: QuestionAnswerRecord[] = shuffledQuestions.map(q => {
      const selected = selectedAnswersRef.current[q.id] || null;
      const isCorrect = selected === q.correctAnswer;
      return {
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
        flagged: !!flaggedQuestionsRef.current[q.id]
      };
    });
    const correctCount = answerRecords.filter(a => a.isCorrect).length;
    const scorePercentage = Math.round((correctCount / shuffledQuestions.length) * 100);
    const saved = saveTestAttempt({
      mode,
      title,
      subjectId,
      totalQuestions: shuffledQuestions.length,
      correctCount,
      scorePercentage,
      passed: false,
      durationSeconds: Math.max(timeLimitSeconds - timeRemainingRef.current, 1),
      answers: answerRecords,
      disqualified: true,
      terminationReason: reason,
      violations: allViolations,
    });

    setProctoringViolations(allViolations);
    setTerminationReason(reason);
    setCompletedAttempt(saved);
    setIsCompleted(true);
  };

  // Attach proctoring listeners for simulation mode only
  useEffect(() => {
    if (!isSimulation || isCompleted) return;

    const onVisibilityChange = () => {
      if (document.hidden && !disqualifiedRef.current) {
        const v: ProctoringViolation = {
          id: `${Date.now()}-tab_switch`,
          type: 'tab_switch',
          description: 'Перехід на іншу вкладку або згортання браузера',
          timestamp: new Date().toISOString(),
        };
        disqualifyTestImmediate(v.description, v);
      }
    };

    const onBlur = () => {
      if (!disqualifiedRef.current) {
        const v: ProctoringViolation = {
          id: `${Date.now()}-blur`,
          type: 'blur',
          description: 'Втрата фокуса вікна браузера',
          timestamp: new Date().toISOString(),
        };
        disqualifyTestImmediate(v.description, v);
      }
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !disqualifiedRef.current) {
        const v: ProctoringViolation = {
          id: `${Date.now()}-fullscreen_exit`,
          type: 'fullscreen_exit',
          description: 'Вихід з повноекранного режиму',
          timestamp: new Date().toISOString(),
        };
        disqualifyTestImmediate(v.description, v);
      }
    };

    const onResize = () => {
      if (disqualifiedRef.current) return;
      const threshold = 0.8;
      if (
        window.innerWidth < screen.availWidth * threshold ||
        window.innerHeight < screen.availHeight * threshold
      ) {
        const v: ProctoringViolation = {
          id: `${Date.now()}-split_screen`,
          type: 'split_screen',
          description: 'Виявлено розділення екрану або зменшення робочої області',
          timestamp: new Date().toISOString(),
        };
        disqualifyTestImmediate(v.description, v);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('resize', onResize);
    };
  }, [isSimulation, isCompleted]);


  // Reset learning feedback when navigating to a question (or restore if already answered)
  useEffect(() => {
    const qId = shuffledQuestions[currentIndex]?.id;
    if (qId && selectedAnswers[qId]) {
      setShowLearningFeedback(true);
    } else {
      setShowLearningFeedback(false);
    }
    setShowErrorPopup(false);
  }, [currentIndex, shuffledQuestions]);

  const handleSelectOption = (optionKey: OptionKey) => {
    if (isCompleted) return;
    
    // In learning mode, block re-answering once feedback is shown
    if (!isSimulation && showLearningFeedback) return;
    
    // In simulation mode, user can change answer until submit
    // In learning mode, record answer and show immediate explanation
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionKey
    }));

    if (!isSimulation) {
      setShowLearningFeedback(true);
      const isCorrect = optionKey === currentQ.correctAnswer;
      recordQuestionResult(currentQ.id, isCorrect);
      if (!isCorrect) {
        setShowErrorPopup(true);
      }
    }
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const answerRecords: QuestionAnswerRecord[] = shuffledQuestions.map(q => {
      const selected = selectedAnswers[q.id] || null;
      const isCorrect = selected === q.correctAnswer;
      return {
        questionId: q.id,
        selectedOption: selected,
        isCorrect,
        flagged: !!flaggedQuestions[q.id]
      };
    });

    const correctCount = answerRecords.filter(a => a.isCorrect).length;
    const scorePercentage = Math.round((correctCount / shuffledQuestions.length) * 100);
    const passed = scorePercentage >= 60; // Standard 60% passing mark for EDKI
    const durationSeconds = timeLimitSeconds - timeRemaining;

    const saved = saveTestAttempt({
      mode,
      title,
      subjectId,
      totalQuestions: shuffledQuestions.length,
      correctCount,
      scorePercentage,
      passed,
      durationSeconds: Math.max(durationSeconds, 1),
      answers: answerRecords,
      // Include proctoring data if simulation
      ...(isSimulation && { violations: proctoringViolations, disqualified: false, terminationReason })
    });



    setCompletedAttempt(saved);
    setIsCompleted(true);

    if (passed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  // Format timer HH:MM:SS or MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentQ && !isCompleted) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <HelpCircle size={48} color="var(--accent-cyan)" style={{ marginBottom: '16px' }} />
        <h2>Питань за обраними параметрами не знайдено</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Спробуйте змінити фільтри або додати нові питання в редакторі.
        </p>
        <button className="btn btn-primary" onClick={onExit}>
          Повернутися
        </button>
      </div>
    );
  }

  // =================== RESULTS / DEBRIEF VIEW ===================
  if (isCompleted && completedAttempt) {
    const filteredReviewQuestions = shuffledQuestions.filter(q => {
      const record = completedAttempt.answers.find(a => a.questionId === q.id);
      if (reviewFilter === 'incorrect') return record && !record.isCorrect;
      if (reviewFilter === 'flagged') return record && record.flagged;
      return true;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {/* Score Card */}
        <div className="glass-card" style={{
          padding: 'clamp(16px, 4vw, 32px)',
          textAlign: 'center',
          border: completedAttempt.passed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
          background: completedAttempt.passed ? 'rgba(16, 185, 129, 0.04)' : 'rgba(244, 63, 94, 0.04)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: 'clamp(64px, 15vw, 80px)',
            height: 'clamp(64px, 15vw, 80px)',
            borderRadius: '50%',
            background: completedAttempt.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}>
            {completedAttempt.passed ? (
              <Award size={38} color="var(--accent-emerald)" />
            ) : (
              <AlertCircle size={38} color="var(--accent-rose)" />
            )}
          </div>

          <h2 style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.8rem)', marginBottom: '8px', wordBreak: 'break-word' }}>
            {completedAttempt.passed ? 'ЄДКІ успішно складено!' : 'Тестування завершено'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: 'clamp(0.85rem, 2.8vw, 0.95rem)', lineHeight: 1.5 }}>
            {completedAttempt.passed 
              ? 'Вітаємо! Ваш бал перевищує встановлений прохідний поріг 60%.' 
              : 'Результат нижче прохідного порогу 60%. Рекомендуємо опрацювати помилки нижче.'}
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(16px, 4vw, 36px)',
            flexWrap: 'wrap',
            padding: '16px 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <div style={{ minWidth: '80px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>РЕЗУЛЬТАТ</div>
              <div style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
                fontWeight: 800,
                color: completedAttempt.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)'
              }}>
                {completedAttempt.scorePercentage}%
              </div>
            </div>
            <div style={{ minWidth: '80px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ПРАВИЛЬНО</div>
              <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 800, color: '#ffffff' }}>
                {completedAttempt.correctCount} / {completedAttempt.totalQuestions}
              </div>
            </div>
            <div style={{ minWidth: '80px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ЧАС</div>
              <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {formatTime(completedAttempt.durationSeconds)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onExit} style={{ minHeight: '40px', padding: '8px 20px' }}>
              До головного меню
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.3rem)' }}>
              Аналіз відповідей ({filteredReviewQuestions.length})
            </h3>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className={`btn ${reviewFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
                onClick={() => setReviewFilter('all')}
              >
                Всі питання
              </button>
              <button
                className={`btn ${reviewFilter === 'incorrect' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
                onClick={() => setReviewFilter('incorrect')}
              >
                Лише помилки
              </button>
              <button
                className={`btn ${reviewFilter === 'flagged' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
                onClick={() => setReviewFilter('flagged')}
              >
                Позначені
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', minWidth: 0 }}>
            {filteredReviewQuestions.map((q, idx) => {
              const record = completedAttempt.answers.find(a => a.questionId === q.id);
              const isCorrect = record?.isCorrect;
              const sub = SUBJECTS_DATA.find(s => s.id === q.subjectId);

              return (
                <div 
                  key={q.id}
                  className="glass-card"
                  style={{
                    padding: 'clamp(14px, 3.5vw, 22px)',
                    borderLeft: `5px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="mono-code" style={{ fontSize: '0.74rem' }}>{q.id}</span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {sub?.name}
                      </span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {q.subtopic}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {isCorrect ? (
                        <span className="badge badge-emerald">Вірно</span>
                      ) : (
                        <span className="badge badge-rose">Помилка</span>
                      )}
                    </div>
                  </div>

                  <h4 style={{
                    fontSize: 'clamp(0.95rem, 2.8vw, 1.05rem)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere'
                  }}>
                    {idx + 1}. {q.text}
                  </h4>

                  {/* Options with markers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', width: '100%', minWidth: 0 }}>
                    {q.options.map(opt => {
                      const isUserChoice = record?.selectedOption === opt.id;
                      const isRightChoice = q.correctAnswer === opt.id;

                      let optBg = 'rgba(255, 255, 255, 0.02)';
                      let optBorder = 'var(--border-subtle)';
                      let optColor = 'var(--text-primary)';

                      if (isRightChoice) {
                        optBg = 'rgba(16, 185, 129, 0.12)';
                        optBorder = 'rgba(16, 185, 129, 0.4)';
                        optColor = '#34d399';
                      } else if (isUserChoice && !isRightChoice) {
                        optBg = 'rgba(244, 63, 94, 0.12)';
                        optBorder = 'rgba(244, 63, 94, 0.4)';
                        optColor = '#fb7185';
                      }

                      return (
                        <div
                          key={opt.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            background: optBg,
                            border: `1px solid ${optBorder}`,
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            fontSize: '0.88rem',
                            flexWrap: 'wrap',
                            gap: '8px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: 'min(100%, 220px)' }}>
                            <strong style={{ minWidth: '18px', color: optColor, marginTop: '1px' }}>{opt.id}.</strong>
                            <span style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.45 }}>{opt.text}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', flexShrink: 0, marginLeft: 'auto' }}>
                            {isRightChoice && (
                              <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <CheckCircle2 size={15} /> Правильна відповідь
                              </span>
                            )}
                            {isUserChoice && !isRightChoice && (
                              <span style={{ color: 'var(--accent-rose)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                <XCircle size={15} /> Ваш вибір
                              </span>
                            )}
                            {isUserChoice && isRightChoice && (
                              <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', opacity: 0.9 }}>
                                (Ваш вибір)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Deep Pedagogical Explanation Block */}
                  <div style={{
                    padding: 'clamp(12px, 3vw, 16px)',
                    background: 'rgba(6, 182, 212, 0.04)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--accent-cyan-light)', marginBottom: '6px' }}>
                      Обґрунтування правильної відповіді:
                    </div>
                    <p style={{
                      fontSize: 'clamp(0.82rem, 2.6vw, 0.88rem)',
                      color: 'var(--text-secondary)',
                      marginBottom: '12px',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
                    }}>
                      {q.explanation}
                    </p>

                    {/* Option Analysis Breakdown */}
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Розбір дистракторів (чому інші варіанти не підходять):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      {(['A', 'B', 'C', 'D'] as OptionKey[]).map(key => (
                        <div key={key} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.5 }}>
                          <strong style={{ color: key === q.correctAnswer ? 'var(--accent-emerald)' : '#94a3b8' }}>{key}: </strong>
                          {q.optionExplanations[key]}
                        </div>
                      ))}
                    </div>

                    {/* Source reference */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      flexWrap: 'wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
                    }}>
                      <BookOpen size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                      <span style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        Джерело: <strong style={{ color: '#ffffff' }}>{q.source.title}</strong> ({q.source.articleOrSection})
                      </span>
                      {q.source.url && (
                        <a 
                          href={q.source.url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', marginLeft: 'auto', padding: '4px' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =================== ACTIVE TEST SCREEN ===================
  if (!currentQ) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <h3 style={{ marginBottom: '12px' }}>Питання не знайдено або тест порожній</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Не вдалося завантажити запитання для обраного режиму.
        </p>
        <button className="btn btn-primary" onClick={onExit}>
          Повернутися назад
        </button>
      </div>
    );
  }

  const isSelected = selectedAnswers[currentQ.id];
  const isCurrentFlagged = flaggedQuestions[currentQ.id];
  const sub = SUBJECTS_DATA.find(s => s.id === currentQ.subjectId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '960px', width: '100%', minWidth: 0, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header bar: Progress + Timer + Controls */}
      <div className="glass-card" style={{
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        {/* Top row: Exit button, Timer (centered), and Flag/Bookmark actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0
        }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px', gap: '4px' }}
            onClick={() => setShowExitConfirm(true)}
          >
            <ChevronLeft size={16} />
            <span>Вийти</span>
          </button>

          {isSimulation && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-md)',
              background: timeRemaining < 300 ? 'rgba(244, 63, 94, 0.16)' : 'rgba(6, 182, 212, 0.14)',
              border: `1px solid ${timeRemaining < 300 ? 'rgba(244, 63, 94, 0.45)' : 'rgba(6, 182, 212, 0.35)'}`,
              color: timeRemaining < 300 ? '#fb7185' : 'var(--accent-cyan-light)',
              fontWeight: 800,
              fontSize: '0.94rem',
              letterSpacing: '0.03em'
            }}>
              <Clock size={16} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleToggleFlag}
              title={isCurrentFlagged ? 'Зняти позначку' : 'Позначити для перегляду'}
              style={{
                background: isCurrentFlagged ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isCurrentFlagged ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                color: isCurrentFlagged ? '#fbbf24' : 'var(--text-muted)',
                padding: '6px 9px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                minHeight: '36px'
              }}
            >
              <Flag size={15} />
              <span className="desktop-only">{isCurrentFlagged ? 'Позначено' : 'Позначити'}</span>
            </button>

            <button
              onClick={() => toggleBookmark(currentQ.id)}
              title={isBookmarked(currentQ.id) ? 'Видалити із закладок' : 'Додати в закладки'}
              style={{
                background: isBookmarked(currentQ.id) ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isBookmarked(currentQ.id) ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                color: isBookmarked(currentQ.id) ? '#a5b4fc' : 'var(--text-muted)',
                padding: '6px 9px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                minHeight: '36px'
              }}
            >
              <Bookmark size={15} />
            </button>
          </div>
        </div>

        {/* Second row: Test title & Current question counter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          width: '100%',
          minWidth: 0
        }}>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#ffffff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
            minWidth: 0
          }} title={title}>
            {title}
          </div>
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--accent-cyan-light)',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            Питання {currentIndex + 1} з {questions.length}
          </div>
        </div>
      </div>

      {/* Interactive Question Grid Navigator */}
      <div className="glass-card" style={{ padding: '12px 14px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px', width: '100%', maxWidth: '100%', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>Відповідей: <strong style={{ color: 'var(--accent-emerald)' }}>{Object.keys(selectedAnswers).length}</strong> / {shuffledQuestions.length}</span>
            {Object.values(flaggedQuestions).filter(Boolean).length > 0 && (
              <span>Позначено: <strong style={{ color: 'var(--accent-amber)' }}>{Object.values(flaggedQuestions).filter(Boolean).length}</strong></span>
            )}
          </div>
          {shuffledQuestions.length > 20 && (
            <button
              onClick={() => setShowFullGrid(v => !v)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-cyan)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {showFullGrid ? 'Згорнути в рядок' : `Показати всі ${shuffledQuestions.length} питань`}
            </button>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: showFullGrid ? 'wrap' : 'nowrap',
          overflowX: showFullGrid ? 'visible' : 'auto',
          maxHeight: showFullGrid ? '190px' : 'auto',
          overflowY: showFullGrid ? 'auto' : 'visible',
          paddingBottom: '4px',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch'
        }}>
          {shuffledQuestions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isFlagged = !!flaggedQuestions[q.id];
            const isCurrent = idx === currentIndex;

            let bg = 'rgba(255, 255, 255, 0.04)';
            let borderColor = 'var(--border-subtle)';
            let color = 'var(--text-secondary)';

            if (isCurrent) {
              borderColor = 'var(--accent-cyan)';
              color = '#ffffff';
              bg = 'rgba(6, 182, 212, 0.25)';
            } else if (isFlagged) {
              borderColor = 'var(--accent-amber)';
              color = '#fbbf24';
              bg = 'rgba(245, 158, 11, 0.15)';
            } else if (isAnswered) {
              borderColor = 'rgba(16, 185, 129, 0.4)';
              color = 'var(--accent-emerald)';
              bg = 'rgba(16, 185, 129, 0.12)';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${borderColor}`,
                  background: bg,
                  color: color,
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  outline: 'none'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-card" style={{ padding: 'clamp(14px, 3.5vw, 28px)', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {/* Meta badges */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', width: '100%', maxWidth: '100%', minWidth: 0 }}>
          <span className="mono-code" style={{ fontSize: '0.74rem' }}>{currentQ.id}</span>
          <span className="badge badge-indigo" style={{ whiteSpace: 'normal', maxWidth: '100%', wordBreak: 'break-word' }}>{sub?.name}</span>
          <span className="badge badge-cyan" style={{ whiteSpace: 'normal', maxWidth: '100%', wordBreak: 'break-word' }}>{currentQ.subtopic}</span>
          <span className={`badge ${currentQ.difficulty === 'Easy' ? 'badge-emerald' : currentQ.difficulty === 'Medium' ? 'badge-amber' : 'badge-rose'}`}>
            {currentQ.difficulty === 'Easy' ? 'Легке' : currentQ.difficulty === 'Medium' ? 'Середнє' : 'Складне'}
          </span>
          {currentQ.year && (
            <span className="badge badge-indigo">ЄДКІ {currentQ.year}</span>
          )}
        </div>

        {/* Question Text */}
        <h2 style={{
          fontSize: 'clamp(1.02rem, 3.5vw, 1.25rem)',
          lineHeight: 1.45,
          fontWeight: 600,
          color: '#ffffff',
          marginBottom: '20px',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          width: '100%',
          maxWidth: '100%'
        }}>
          {currentIndex + 1}. {currentQ.text}
        </h2>

        {/* Option Selection List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', width: '100%', maxWidth: '100%', minWidth: 0 }}>
          {currentQ.options.map(option => {
            const isUserSelected = isSelected === option.id;
            const isCorrect = option.id === currentQ.correctAnswer;

            let border = 'var(--border-subtle)';
            let bg = 'rgba(255, 255, 255, 0.02)';
            let radioColor = 'var(--text-muted)';

            if (!isSimulation && showLearningFeedback) {
              if (isCorrect) {
                border = 'var(--accent-emerald)';
                bg = 'rgba(16, 185, 129, 0.12)';
                radioColor = 'var(--accent-emerald)';
              } else if (isUserSelected && !isCorrect) {
                border = 'var(--accent-rose)';
                bg = 'rgba(244, 63, 94, 0.12)';
                radioColor = 'var(--accent-rose)';
              }
            } else if (isUserSelected) {
              border = 'var(--accent-cyan)';
              bg = 'rgba(6, 182, 212, 0.12)';
              radioColor = 'var(--accent-cyan)';
            }

            return (
              <div
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${border}`,
                  background: bg,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${radioColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: radioColor,
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {option.id}
                </div>
                <div style={{
                  fontSize: 'clamp(0.86rem, 2.8vw, 0.95rem)',
                  lineHeight: 1.45,
                  color: 'var(--text-primary)',
                  flex: 1,
                  minWidth: 0,
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere'
                }}>
                  {option.text}
                </div>

                {!isSimulation && showLearningFeedback && (
                  <div style={{ flexShrink: 0 }}>
                    {isCorrect && (
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} />
                        <span>Правильно</span>
                      </span>
                    )}
                    {isUserSelected && !isCorrect && (
                      <span style={{ color: 'var(--accent-rose)', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={16} />
                        <span>Ваш вибір (невірно)</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Immediate Pedagogical Explanation Widget (in Cluster drill & Trainer / Learning mode) */}
        {!isSimulation && showLearningFeedback && isSelected && (() => {
          const isAnswerWrong = isSelected !== currentQ.correctAnswer;
          const userOption = currentQ.options.find(o => o.id === isSelected);
          const correctOption = currentQ.options.find(o => o.id === currentQ.correctAnswer);
          const wrongReason = currentQ.optionExplanations?.[isSelected] || 'Даний варіант не відповідає встановленим вимогам або нормам стандарту.';

          return (
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: isAnswerWrong ? '1px solid rgba(244, 63, 94, 0.45)' : '1px solid rgba(16, 185, 129, 0.45)',
              boxShadow: isAnswerWrong ? '0 10px 30px rgba(244, 63, 94, 0.15)' : '0 10px 30px rgba(16, 185, 129, 0.12)',
              background: isAnswerWrong
                ? 'linear-gradient(180deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : 'linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
              marginBottom: '26px'
            }}>
              {/* Widget Header */}
              <div style={{
                padding: '14px 20px',
                background: isAnswerWrong ? 'rgba(244, 63, 94, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                borderBottom: isAnswerWrong ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isAnswerWrong ? (
                    <XCircle size={22} color="var(--accent-rose)" />
                  ) : (
                    <CheckCircle2 size={22} color="var(--accent-emerald)" />
                  )}
                  <div>
                    <h4 style={{
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      color: isAnswerWrong ? '#fb7185' : '#34d399',
                      margin: 0
                    }}>
                      {isAnswerWrong ? 'Неправильна відповідь! Детальний аналіз та розбір помилки' : 'Чудово! Відповідь правильна'}
                    </h4>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {isAnswerWrong ? 'Ознайомтеся з обґрунтуванням чому відповідь помилкова перед переходом далі' : 'Відповідь повністю відповідає вимогам стандартів ЄДКІ'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isAnswerWrong && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowErrorPopup(true)}
                      style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '5px' }}
                    >
                      <HelpCircle size={14} color="var(--accent-cyan)" />
                      <span>Відкрити вікно розбору</span>
                    </button>
                  )}

                  {currentIndex < shuffledQuestions.length - 1 && (
                    <button
                      className={isAnswerWrong ? 'btn btn-secondary' : 'btn btn-primary'}
                      onClick={() => setCurrentIndex(prev => prev + 1)}
                      style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
                    >
                      <span>Наступне питання</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Widget Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Comparison block: User Choice vs Correct Answer */}
                <div style={{ display: 'grid', gridTemplateColumns: isAnswerWrong ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr', gap: '12px' }}>
                  {isAnswerWrong && (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)'
                    }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <XCircle size={14} />
                        <span>Ваш вибір: Варіант {isSelected} (Помилковий)</span>
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#fecdd3', lineHeight: 1.4 }}>
                        {userOption?.text}
                      </div>
                    </div>
                  )}

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} />
                      <span>Правильний варіант: {currentQ.correctAnswer}</span>
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#a7f3d0', lineHeight: 1.4 }}>
                      {correctOption?.text}
                    </div>
                  </div>
                </div>

                {/* WHY USER'S CHOICE IS WRONG */}
                {isAnswerWrong && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(244, 63, 94, 0.08)',
                    borderLeft: '4px solid var(--accent-rose)'
                  }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fb7185', marginBottom: '4px' }}>
                      ⚠️ Чому саме обраний вами варіант {isSelected} невірний:
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#fecdd3', margin: 0, lineHeight: 1.55 }}>
                      {wrongReason}
                    </p>
                  </div>
                )}

                {/* SCIENTIFIC EXPLANATION OF CORRECT ANSWER */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.06)',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan-light)', marginBottom: '6px' }}>
                    💡 Науково-технічне обґрунтування правильної відповіді ({currentQ.correctAnswer}):
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {currentQ.explanation}
                  </p>
                </div>

                {/* DISTRACTORS BREAKDOWN */}
                {currentQ.optionExplanations && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Аналіз усіх варіантів відповідей (дистракторів):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(['A', 'B', 'C', 'D'] as OptionKey[]).map(key => {
                        const isThisCorrect = key === currentQ.correctAnswer;
                        const isThisUserSelected = key === isSelected;
                        return (
                          <div key={key} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
                            <strong style={{
                              minWidth: '22px',
                              color: isThisCorrect ? 'var(--accent-emerald)' : isThisUserSelected ? 'var(--accent-rose)' : '#94a3b8'
                            }}>
                              {key}:
                            </strong>
                            <span style={{ color: isThisCorrect ? '#ffffff' : 'var(--text-muted)' }}>
                              {currentQ.optionExplanations[key] || (isThisCorrect ? 'Правильний варіант' : 'Невірне твердження')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SOURCE REFERENCE */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  flexWrap: 'wrap'
                }}>
                  <BookOpen size={14} color="var(--accent-cyan)" />
                  <span>Офіційне нормативне джерело: <strong style={{ color: '#ffffff' }}>{currentQ.source.title}</strong> {currentQ.source.articleOrSection ? `(${currentQ.source.articleOrSection})` : ''}</span>
                  {currentQ.source.url && (
                    <a
                      href={currentQ.source.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--accent-cyan)', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <span>Переглянути першоджерело</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Navigation bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button
            className="btn btn-secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            style={{ opacity: currentIndex === 0 ? 0.4 : 1, flex: 1, minHeight: '44px', justifyContent: 'center' }}
          >
            <ChevronLeft size={18} />
            <span>Попереднє</span>
          </button>

          <div style={{ display: 'flex', flex: 1 }}>
            {currentIndex < shuffledQuestions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                style={{ width: '100%', minHeight: '44px', justifyContent: 'center' }}
              >
                <span>Наступне</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={finishExam}
                style={{ width: '100%', minHeight: '44px', justifyContent: 'center' }}
              >
                <span>Завершити іспит</span>
                <CheckCircle2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', padding: '28px', textAlign: 'center' }}>
            <AlertCircle size={40} color="var(--accent-rose)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Завершити тестування?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '22px' }}>
              Якщо ви вийдете зараз, поточний прогрес цієї спроби не буде зараховано.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowExitConfirm(false)}>
                Продовжити
              </button>
              <button className="btn btn-danger" onClick={onExit}>
                Вийти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR ANALYSIS POPUP MODAL (When answering incorrectly in cluster / trainer modes) */}
      {!isSimulation && showErrorPopup && isSelected && isSelected !== currentQ.correctAnswer && (() => {
        const userOption = currentQ.options.find(o => o.id === isSelected);
        const correctOption = currentQ.options.find(o => o.id === currentQ.correctAnswer);
        const wrongReason = currentQ.optionExplanations?.[isSelected] || 'Даний варіант не відповідає встановленим вимогам або нормам стандарту.';

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
            padding: '20px'
          }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: '740px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(180deg, #111827 0%, #0b0f19 100%)',
              border: '2px solid rgba(244, 63, 94, 0.5)',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 45px rgba(244, 63, 94, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'rgba(244, 63, 94, 0.16)',
                    border: '1px solid rgba(244, 63, 94, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-rose)',
                    flexShrink: 0
                  }}>
                    <XCircle size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#fb7185', margin: 0 }}>
                      Неправильна відповідь! Розбір помилки
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                      Питання #{currentIndex + 1} ({currentQ.id}) • {sub?.name || 'ЄДКІ'}
                    </p>
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                  onClick={() => setShowErrorPopup(false)}
                  title="Закрити вікно"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Question text snippet */}
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.92rem',
                color: '#ffffff',
                lineHeight: 1.45,
                fontWeight: 500
              }}>
                {currentQ.text}
              </div>

              {/* Comparison cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.4)'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={15} />
                    <span>Ваш вибір: Варіант {isSelected} (Помилковий)</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#fecdd3', lineHeight: 1.45 }}>
                    {userOption?.text}
                  </div>
                </div>

                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} />
                    <span>Правильний варіант: {currentQ.correctAnswer}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#a7f3d0', lineHeight: 1.45 }}>
                    {correctOption?.text}
                  </div>
                </div>
              </div>

              {/* WHY IT IS WRONG */}
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.08)',
                borderLeft: '4px solid var(--accent-rose)'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fb7185', marginBottom: '6px' }}>
                  ⚠️ Чому саме обраний вами варіант {isSelected} невірний:
                </div>
                <p style={{ fontSize: '0.9rem', color: '#fecdd3', margin: 0, lineHeight: 1.55 }}>
                  {wrongReason}
                </p>
              </div>

              {/* WHY CORRECT ANSWER IS RIGHT */}
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                  💡 Науково-технічне обґрунтування правильної відповіді ({currentQ.correctAnswer}):
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {currentQ.explanation}
                </p>
              </div>

              {/* DISTRACTORS ANALYSIS */}
              {currentQ.optionExplanations && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Аналіз усіх 4-х варіантів відповідей:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(['A', 'B', 'C', 'D'] as OptionKey[]).map(key => {
                      const isThisCorrect = key === currentQ.correctAnswer;
                      const isThisUserSelected = key === isSelected;
                      return (
                        <div key={key} style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
                          <strong style={{
                            minWidth: '22px',
                            color: isThisCorrect ? 'var(--accent-emerald)' : isThisUserSelected ? 'var(--accent-rose)' : '#94a3b8'
                          }}>
                            {key}:
                          </strong>
                          <span style={{ color: isThisCorrect ? '#ffffff' : 'var(--text-muted)' }}>
                            {currentQ.optionExplanations[key] || (isThisCorrect ? 'Правильний варіант' : 'Невірне твердження')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SOURCE REFERENCE */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                paddingTop: '6px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                flexWrap: 'wrap'
              }}>
                <BookOpen size={15} color="var(--accent-cyan)" />
                <span>Нормативне джерело: <strong style={{ color: '#ffffff' }}>{currentQ.source.title}</strong> {currentQ.source.articleOrSection ? `(${currentQ.source.articleOrSection})` : ''}</span>
                {currentQ.source.url && (
                  <a
                    href={currentQ.source.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--accent-cyan)', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <span>Відкрити закон/стандарт</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowErrorPopup(false)}
                  style={{ padding: '9px 18px', fontSize: '0.86rem' }}
                >
                  Залишитися на питанні
                </button>

                {currentIndex < shuffledQuestions.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowErrorPopup(false);
                      setCurrentIndex(prev => prev + 1);
                    }}
                    style={{ padding: '9px 20px', fontSize: '0.86rem', gap: '6px' }}
                  >
                    <span>Наступне питання</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setShowErrorPopup(false);
                      finishExam();
                    }}
                    style={{ padding: '9px 20px', fontSize: '0.86rem', gap: '6px' }}
                  >
                    <span>Завершити тест</span>
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
