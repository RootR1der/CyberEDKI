import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EdkiProvider, useEdki } from './context/EdkiContext';
import { Navbar, TabType } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { QuizEngine } from './components/QuizEngine';
import { SubjectCatalog } from './components/Catalog';
import { MistakesBank } from './components/Mistakes';
import { SourcesLibrary } from './components/Sources';
import { AdminPanel } from './components/Admin';
import { TrainingSetup } from './components/Training';
import { TeacherDashboard } from './components/Teacher';
import { ClustersView } from './components/Clusters';
import { LoginPage } from './components/Login';
import { Question, TestMode } from './types/edki';
import { EDKI_CLUSTERS_DATA } from './data/clusters';

function shuffleQuestions(list: Question[]): Question[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

const MainAppContent: React.FC = () => {
  const { questions, subjects, mistakes, generateBalancedExamQuestions, isSimulationLocked } = useEdki();
  const { isTeacher, isAdmin, isLoggedIn, currentUser } = useAuth();
  const simulationLocked = isSimulationLocked();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<{
    isActive: boolean;
    questions: Question[];
    mode: TestMode;
    title: string;
    subjectId?: number;
    clusterId?: number;
    timeLimitSeconds?: number;
  }>({
    isActive: false,
    questions: [],
    mode: 'learning',
    title: ''
  });

  const handleExitQuiz = () => {
    setActiveQuiz({
      isActive: false,
      questions: [],
      mode: 'learning',
      title: ''
    });
  };

  const handleLoginSuccess = () => {
    setActiveTab('dashboard');
    handleExitQuiz();
  };

  // Reset to dashboard and exit any active quiz whenever user logs in or switches
  useEffect(() => {
    if (isLoggedIn) {
      setActiveTab('dashboard');
      handleExitQuiz();
    }
  }, [isLoggedIn, currentUser?.id]);

  // Validate tab permissions and fallback to dashboard if unauthorized
  const isTabAllowed = (tab: TabType): boolean => {
    if (tab === 'admin_panel') return Boolean(isAdmin);
    if (tab === 'teacher') return Boolean(isTeacher || isAdmin);
    return ['dashboard', 'clusters', 'training', 'simulation', 'catalog', 'mistakes', 'sources'].includes(tab);
  };

  const effectiveTab: TabType = isTabAllowed(activeTab) ? activeTab : 'dashboard';

  useEffect(() => {
    if (!isTabAllowed(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isAdmin, isTeacher]);

  // Standard login / registration screen when not logged in
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }


  // Launch Official Exam Simulation (100 questions, 80 min, balanced by 7 clusters / all topics)
  const handleStartExam = () => {
    if (simulationLocked) {
      alert('Офіційну симуляцію ЄДКІ вже пройдено. Повторне складання доступне після скидання спроби викладачем.');
      return;
    }
    const examQuestions = generateBalancedExamQuestions(100);

    setActiveQuiz({
      isActive: true,
      questions: examQuestions,
      mode: 'simulation',
      title: 'Офіційна симуляція ЄДКІ: 125 «Кібербезпека» (100 завдань / 1 год 20 хв)',
      timeLimitSeconds: 4800 // 80 minutes (1 hour 20 minutes) = 4800 seconds
    });
  };

  // Launch Cluster Drill (by specific cluster 1..7)
  const handleStartClusterDrill = (clusterId: number) => {
    const cluster = EDKI_CLUSTERS_DATA.find(c => c.id === clusterId);
    const clusterQuestions = questions.filter(q => {
      const sub = subjects.find(s => s.id === q.subjectId);
      return q.clusterId === clusterId || sub?.clusterId === clusterId;
    });

    if (clusterQuestions.length === 0) {
      alert(`Наразі немає додаткових завдань для кластеру ${clusterId}`);
      return;
    }

    setActiveQuiz({
      isActive: true,
      questions: shuffleQuestions(clusterQuestions),
      mode: 'cluster',
      clusterId,
      title: `Кластер ${clusterId}: ${cluster?.name || ''}`,
      timeLimitSeconds: 1200
    });
  };

  // Launch Topic Drill
  const handleStartTopicDrill = (subjectId: number) => {
    const sub = subjects.find(s => s.id === subjectId);
    const subQuestions = questions.filter(q => q.subjectId === subjectId);

    if (subQuestions.length === 0) {
      setSelectedSubjectId(subjectId);
      setActiveTab('training');
      return;
    }

    setActiveQuiz({
      isActive: true,
      questions: shuffleQuestions(subQuestions),
      mode: 'topic',
      title: `Тематичний тренажер: ${sub?.name || 'Предмет'}`,
      subjectId,
      timeLimitSeconds: 900
    });
  };

  // Launch Mistakes Workout
  const handleStartMistakesDrill = () => {
    const mistakeQuestions = shuffleQuestions(
      Object.values(mistakes)
        .filter(m => !m.isMastered)
        .map(m => questions.find(q => q.id === m.questionId))
        .filter((q): q is Question => q !== undefined)
    );

    if (mistakeQuestions.length === 0) {
      alert('У вас немає активних помилок для повторення! Чудова робота.');
      return;
    }

    setActiveQuiz({
      isActive: true,
      questions: mistakeQuestions,
      mode: 'mistakes',
      title: `Робота над помилками (${mistakeQuestions.length} завдань)`,
      timeLimitSeconds: 1200
    });
  };

  // Launch Blitz Quiz
  const handleStartBlitz = () => {
    const blitzQuestions = shuffleQuestions(questions).slice(0, Math.min(10, questions.length));

    setActiveQuiz({
      isActive: true,
      questions: blitzQuestions,
      mode: 'blitz',
      title: 'Швидкий бліц-тест (10 питань)',
      timeLimitSeconds: 600
    });
  };

  // Launch Custom Quiz
  const handleStartCustomQuiz = (quizQuestions: Question[], title: string, mode: TestMode = 'learning', subjectId?: number) => {
    setActiveQuiz({
      isActive: true,
      questions: shuffleQuestions(quizQuestions),
      mode,
      title,
      subjectId,
      timeLimitSeconds: 1200
    });
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Navbar
        activeTab={effectiveTab}
        setActiveTab={(tab) => {
          if (activeQuiz.isActive) {
            const leave = window.confirm('Вийти з тесту? Поточна спроба не буде збережена.');
            if (!leave) return;
            handleExitQuiz();
          }
          setActiveTab(tab);
        }}
        onStartExam={handleStartExam}
        isQuizActive={activeQuiz.isActive}
      />

      <main className="app-container" style={{ flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {activeQuiz.isActive ? (
          <QuizEngine
            questions={activeQuiz.questions}
            mode={activeQuiz.mode}
            title={activeQuiz.title}
            subjectId={activeQuiz.subjectId}
            timeLimitSeconds={activeQuiz.timeLimitSeconds}
            onExit={handleExitQuiz}
          />
        ) : (
          <>
            {effectiveTab === 'dashboard' && (
              <Dashboard
                onStartExam={handleStartExam}
                onStartTopicDrill={handleStartTopicDrill}
                onStartClusterDrill={handleStartClusterDrill}
                onStartMistakesDrill={handleStartMistakesDrill}
                onStartBlitz={handleStartBlitz}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {effectiveTab === 'clusters' && (
              <ClustersView onStartClusterDrill={handleStartClusterDrill} />
            )}

            {effectiveTab === 'training' && (
              <TrainingSetup
                preselectedSubjectId={selectedSubjectId}
                onStartQuiz={(qs, mode, title, subId) => handleStartCustomQuiz(qs, title, mode, subId)}
              />
            )}

            {effectiveTab === 'simulation' && (
              <div className="glass-card" style={{ padding: 'clamp(18px, 4vw, 36px)', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
                <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.8rem)', marginBottom: '12px' }}>
                  Офіційна симуляція ЄДКІ: 125 «Кібербезпека»
                </h2>
                <div style={{ display: 'inline-flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>⏱ Тривалість: 1 год 20 хв (80 хв)</span>
                  <span className="badge badge-indigo" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>📝 100 тестових завдань</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>🎯 Прохідний бал: 60%</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  Повноцінний екзаменаційний тест із <strong>100 запитань</strong> з усіх тем та <strong>7 офіційних кластерів компетенцій</strong>:
                  Нормативна база (8-12%), ІТ в кібербезпеці (14-18%), Безпека ІКС (15-25%), КСЗІ (8-10%), Управління безпекою (16-20%), Криптографія (11-15%), ТЗІ (12-16%).
                </p>
                {simulationLocked && (
                  <p style={{ color: 'var(--accent-amber)', marginBottom: '16px', fontSize: '0.88rem' }}>
                    Цю симуляцію вже складено. Повторне проходження можливе після скидання спроби викладачем.
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleStartExam}
                    disabled={simulationLocked}
                    style={{ fontSize: '0.94rem', padding: '12px 22px', opacity: simulationLocked ? 0.55 : 1 }}
                  >
                    {simulationLocked ? 'Симуляцію вже складено' : 'Розпочати симуляцію (100 питань, 1 год 20 хв)'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('dashboard')} style={{ fontSize: '0.94rem' }}>
                    Повернутися назад
                  </button>
                </div>
              </div>
            )}

            {effectiveTab === 'catalog' && (
              <SubjectCatalog onStartSubjectDrill={handleStartTopicDrill} />
            )}

            {effectiveTab === 'mistakes' && (
              <MistakesBank onStartMistakesDrill={handleStartMistakesDrill} />
            )}



            {effectiveTab === 'sources' && (
              <SourcesLibrary />
            )}

            {/* TEACHER DASHBOARD */}
            {effectiveTab === 'teacher' && (isTeacher || isAdmin) && (
              <TeacherDashboard
                onNavigateTab={(t) => setActiveTab(t)}
              />
            )}

            {/* ADMIN PANEL */}
            {effectiveTab === 'admin_panel' && isAdmin && (
              <AdminPanel />
            )}
          </>
        )}
      </main>



      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 21, 0.95)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>CyberEDKI</strong> — Комплексна навчальна система підготовки та контролю якості до ЄДКІ з кібербезпеки (Спеціальність 125)
          </div>
          <div>
            7 офіційних кластерів МОН України • ДСТУ 3396 • Постанова КМУ №518 • Common Criteria
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <EdkiProvider>
        <MainAppContent />
      </EdkiProvider>
    </AuthProvider>
  );
}

export default App;