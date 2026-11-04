import React, { useState } from 'react';
import {
  BookOpen,
  Zap,
  Target,
  Sliders,
  Play,
  Layers,
  Award
} from 'lucide-react';
import { useEdki } from '../../context/EdkiContext';
import { Question, Difficulty, TestMode } from '../../types/edki';

interface TrainingSetupProps {
  onStartQuiz: (questions: Question[], mode: TestMode, title: string, subjectId?: number) => void;
  preselectedSubjectId?: number;
}

export const TrainingSetup: React.FC<TrainingSetupProps> = ({ onStartQuiz, preselectedSubjectId }) => {
  const { questions, subjects } = useEdki();

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | 'all'>(preselectedSubjectId || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [trainingMode, setTrainingMode] = useState<TestMode>('learning');

  const handleLaunch = () => {
    let pool = questions.filter(q => {
      if (selectedSubjectId !== 'all' && q.subjectId !== selectedSubjectId) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      return true;
    });

    if (pool.length === 0) {
      alert('За обраними параметрами немає доступних питань. Спробуйте розширити фільтри.');
      return;
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, pool.length));

    let modeTitle = 'Навчальне тренування';
    if (selectedSubjectId !== 'all') {
      const sub = subjects.find(s => s.id === selectedSubjectId);
      modeTitle = `Тематичний тест: ${sub?.name}`;
    } else if (trainingMode === 'blitz') {
      modeTitle = 'Швидкий бліц-тест';
    }

    onStartQuiz(
      selected,
      trainingMode,
      modeTitle,
      selectedSubjectId !== 'all' ? selectedSubjectId : undefined
    );
  };

  const poolCount = questions.filter(q => {
    if (selectedSubjectId !== 'all' && q.subjectId !== selectedSubjectId) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  }).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Sliders size={26} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>Налаштування тренувальної сесії</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
          Оберіть формат підготовки: детальний навчальний режим з миттєвим розбором або контрольне тематичне тестування.
        </p>

        {/* 1. Mode selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
            РЕЖИМ НАВЧАННЯ
          </label>
          <div className="responsive-two-col" style={{ gap: '12px' }}>
            <div
              onClick={() => setTrainingMode('learning')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: trainingMode === 'learning' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${trainingMode === 'learning' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: trainingMode === 'learning' ? 'var(--accent-cyan-light)' : '#ffffff', fontWeight: 700 }}>
                <BookOpen size={18} />
                <span>Навчальний режим</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Миттєва перевірка після кожної відповіді, повне обґрунтування правильного варіанта та розбір дистракторів.
              </p>
            </div>

            <div
              onClick={() => setTrainingMode('blitz')}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: trainingMode === 'blitz' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${trainingMode === 'blitz' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: trainingMode === 'blitz' ? 'var(--accent-amber)' : '#ffffff', fontWeight: 700 }}>
                <Zap size={18} />
                <span>Швидкий бліц</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                10-15 змішаних питань із різних тем для швидкої перевірки та підтримки тонусу.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Subject Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            ПРЕДМЕТНА ОБЛАСТЬ
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{
              width: '100%',
              background: 'rgba(14, 21, 38, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              padding: '12px 14px',
              fontSize: '0.92rem',
              outline: 'none'
            }}
          >
            <option value="all">Усі 20 предметних областей (Комплексне тренування)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.id}. {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Difficulty & Count in 2 cols */}
        <div className="responsive-two-col" style={{ gap: '16px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              РІВЕНЬ СКЛАДНОСТІ
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              style={{
                width: '100%',
                background: 'rgba(14, 21, 38, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                padding: '10px 14px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="all">Усі рівні складності</option>
              <option value="Easy">Легкий (Easy)</option>
              <option value="Medium">Середній (Medium)</option>
              <option value="Hard">Складний (Hard)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              КІЛЬКІСТЬ ПИТАНЬ У СЕСІЇ
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(14, 21, 38, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                padding: '10px 14px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value={5}>5 питань (Експрес)</option>
              <option value={10}>10 питань (Стандартне тренування)</option>
              <option value={20}>20 питань (Поглиблене)</option>
              <option value={50}>50 питань (Повний пул)</option>
            </select>
          </div>
        </div>

        {/* Start button & pool counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Знайдено у базі: <strong style={{ color: 'var(--accent-cyan)' }}>{poolCount}</strong> питань за цими параметрами
          </div>

          <button
            className="btn btn-primary"
            onClick={handleLaunch}
            style={{ padding: '12px 28px', fontSize: '1rem', flex: '1 1 min(100%, 240px)', justifyContent: 'center' }}
          >
            <Play size={18} />
            <span>Розпочати тестування</span>
          </button>
        </div>
      </div>
    </div>
  );
};
