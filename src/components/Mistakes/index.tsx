import React, { useState } from 'react';
import {
  AlertOctagon,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { useEdki } from '../../context/EdkiContext';

interface MistakesBankProps {
  onStartMistakesDrill: () => void;
}

export const MistakesBank: React.FC<MistakesBankProps> = ({ onStartMistakesDrill }) => {
  const { mistakes, questions, subjects } = useEdki();
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'mastered'>('active');

  const allMistakeList = Object.values(mistakes).map(m => {
    const q = questions.find(item => item.id === m.questionId);
    return { mistake: m, question: q };
  }).filter(item => item.question !== undefined);

  const filteredMistakes = allMistakeList.filter(item => {
    if (activeTab === 'active' && item.mistake.isMastered) return false;
    if (activeTab === 'mastered' && !item.mistake.isMastered) return false;
    if (selectedSubjectFilter !== 'all' && item.question?.subjectId !== selectedSubjectFilter) return false;
    return true;
  });

  const activeCount = allMistakeList.filter(m => !m.mistake.isMastered).length;
  const masteredCount = allMistakeList.filter(m => m.mistake.isMastered).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header card */}
      <div className="glass-card" style={{
        padding: 'clamp(16px, 4vw, 28px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.8) 0%, rgba(35, 15, 25, 0.6) 100%)',
        border: '1px solid rgba(244, 63, 94, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <AlertOctagon size={24} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>Банк помилок: від прогалини до майстерності</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '650px', lineHeight: 1.5 }}>
            Кожна помилка фіксується у вашому персональному банку знань. Щоб остаточно засвоїти матеріал, дайте 2 поспіль правильні відповіді у тренувальному режимі.
          </p>
        </div>

        {activeCount > 0 && (
          <button 
            className="btn btn-primary"
            onClick={onStartMistakesDrill}
            style={{ fontSize: '0.95rem', padding: '12px 24px' }}
          >
            <RotateCcw size={18} />
            <span>Тренувати активні помилки ({activeCount})</span>
          </button>
        )}
      </div>

      {/* Tabs: Active vs Mastered */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'active' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            onClick={() => setActiveTab('active')}
          >
            <span>Потребують повторення ({activeCount})</span>
          </button>
          <button
            className={`btn ${activeTab === 'mastered' ? 'btn-success' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            onClick={() => setActiveTab('mastered')}
          >
            <span>Засвоєні ({masteredCount})</span>
          </button>
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubjectFilter}
          onChange={(e) => setSelectedSubjectFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          style={{
            background: 'rgba(14, 21, 38, 0.8)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.86rem',
            outline: 'none'
          }}
        >
          <option value="all">Всі предмети</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.id}. {s.name}</option>
          ))}
        </select>
      </div>

      {/* List of mistakes */}
      {filteredMistakes.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
            {activeTab === 'active' ? 'Чудова робота! Немає активних помилок' : 'Поки немає засвоєних помилок'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {activeTab === 'active' 
              ? 'Ви правильно відповіли на всі раніше зафіксовані складні питання або ще не проходили тести.' 
              : 'Правильно дайте відповідь двічі на будь-яке помилкове питання, щоб воно потрапило сюди.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMistakes.map(({ mistake, question }) => {
            if (!question) return null;
            const sub = subjects.find(s => s.id === question.subjectId);

            return (
              <div 
                key={question.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderLeft: `5px solid ${mistake.isMastered ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="mono-code" style={{ fontSize: '0.74rem' }}>{question.id}</span>
                    <span className="badge badge-indigo">{sub?.name}</span>
                    <span className="badge badge-cyan">{question.subtopic}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Помилок: <strong style={{ color: 'var(--accent-rose)' }}>{mistake.failCount}</strong>
                    </span>
                    <span className="badge" style={{
                      background: mistake.isMastered ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: mistake.isMastered ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                    }}>
                      {mistake.isMastered ? 'Засвоєно' : `Прогрес закріплення: ${mistake.consecutiveCorrect}/2`}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.08rem', lineHeight: 1.5, marginBottom: '16px', color: '#ffffff' }}>
                  {question.text}
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                  gap: '8px',
                  marginBottom: '18px',
                  width: '100%',
                  minWidth: 0
                }}>
                  {[...question.options].sort((a, b) => a.id.localeCompare(b.id)).map(opt => (
                    <div 
                      key={opt.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: opt.id === question.correctAnswer ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border: opt.id === question.correctAnswer ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                        fontSize: '0.86rem',
                        color: opt.id === question.correctAnswer ? '#34d399' : 'var(--text-secondary)'
                      }}
                    >
                      <strong>{opt.id}. </strong> {opt.text}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div style={{
                  padding: '16px',
                  background: 'rgba(6, 182, 212, 0.04)',
                  border: '1px solid rgba(6, 182, 212, 0.18)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--accent-cyan-light)', marginBottom: '4px' }}>
                    Обґрунтування правильної відповіді ({question.correctAnswer}):
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                    {question.explanation}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={14} color="var(--accent-cyan)" />
                    <span>Джерело: <strong style={{ color: '#ffffff' }}>{question.source.title}</strong> ({question.source.articleOrSection})</span>
                    {question.source.url && (
                      <a 
                        href={question.source.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: 'var(--accent-cyan)', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
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
      )}
    </div>
  );
};
