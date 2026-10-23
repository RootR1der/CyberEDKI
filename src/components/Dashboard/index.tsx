import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Zap,
  GraduationCap,
  RotateCcw,
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  BookMarked,
  CheckCircle,
  XCircle,
  Layers,
  Award
} from 'lucide-react';
import { useEdki } from '../../context/EdkiContext';
import { useAuth } from '../../context/AuthContext';
import { SUBJECTS_DATA } from '../../data/subjects';
import { EDKI_CLUSTERS_DATA } from '../../data/clusters';

interface DashboardProps {
  onStartExam: () => void;
  onStartTopicDrill: (subjectId: number) => void;
  onStartClusterDrill: (clusterId: number) => void;
  onStartMistakesDrill: () => void;
  onStartBlitz: () => void;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartExam,
  onStartTopicDrill,
  onStartClusterDrill,
  onStartMistakesDrill,
  onStartBlitz,
  onNavigateTab
}) => {
  const { analytics, attempts, mistakes, questions } = useEdki();
  const { currentUser, isStudent, isTeacher, isAdmin } = useAuth();
  const activeMistakesCount = Object.values(mistakes).filter(m => !m.isMastered).length;

  const getReadinessLevel = (score: number) => {
    if (score >= 85) return { text: 'Висока готовність до ЄДКІ', color: 'var(--accent-emerald)', badge: 'Готовий' };
    if (score >= 60) return { text: 'Впевнений рівень (прохідний)', color: 'var(--accent-cyan)', badge: 'Прохідний' };
    if (score >= 35) return { text: 'Базова підготовка (потрібно підтягнути)', color: 'var(--accent-amber)', badge: 'В процесі' };
    return { text: 'Початковий рівень (рекомендовано регулярне тренування)', color: 'var(--accent-rose)', badge: 'Початківець' };
  };

  const levelInfo = getReadinessLevel(analytics.readinessScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Banner */}
      <div className="glass-card" style={{
        padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.95) 0%, rgba(10, 30, 55, 0.8) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '880px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-cyan">Офіційна програма ЄДКІ 2024</span>
            <span className="badge badge-indigo">Спеціальність 125 «Кібербезпека»</span>
            {isStudent && currentUser?.groupName && (
              <span className="badge badge-amber">Група: {currentUser.groupName}</span>
            )}
            {isTeacher && (
              <span className="badge badge-indigo">Викладач кафедри</span>
            )}
            {isAdmin && (
              <span className="badge badge-rose">Головний Адміністратор</span>
            )}
          </div>

          <h1 style={{
            fontSize: 'clamp(1.35rem, 4.5vw, 2.1rem)',
            lineHeight: 1.25,
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #ffffff 60%, #a5f3fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Вітаємо, {currentUser?.name || 'Користувачу'}! Комплексна підготовка та контроль знань ЄДКІ
          </h1>

          <p style={{
            fontSize: 'clamp(0.85rem, 2.5vw, 0.98rem)',
            color: 'var(--text-secondary)',
            marginBottom: '22px',
            lineHeight: 1.55
          }}>
            Платформа охоплює <strong>7 офіційних кластерів компетенцій ЄДКІ 125</strong> з точними відсотковими частками, науково-технічні розбори кожного дистрактора та нормативну базу України (Постанова КМУ №518, ДСТУ 3396, ISO 15408, НД ТЗІ).
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button 
              className="btn btn-primary"
              onClick={onStartExam}
              style={{ fontSize: '0.96rem', padding: '12px 22px' }}
            >
              <GraduationCap size={19} />
              <span>Офіційна симуляція ЄДКІ</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => onNavigateTab('clusters')}
              style={{ fontSize: '0.96rem', padding: '12px 18px' }}
            >
              <Layers size={18} color="var(--accent-cyan)" />
              <span>7 Кластерів ЄДКІ</span>
            </button>

            {activeMistakesCount > 0 && (
              <button 
                className="btn btn-danger"
                onClick={onStartMistakesDrill}
                style={{ fontSize: '0.96rem', padding: '12px 18px' }}
              >
                <RotateCcw size={18} />
                <span>Опрацювати помилки ({activeMistakesCount})</span>
              </button>
            )}

            <button 
              className="btn btn-secondary"
              onClick={onStartBlitz}
              style={{ fontSize: '0.96rem', padding: '12px 18px' }}
            >
              <Zap size={18} color="var(--accent-amber)" />
              <span>Швидкий бліц</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid-4">
        {/* Readiness Index */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Індекс готовності
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: levelInfo.color }}>
              {levelInfo.badge}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: levelInfo.color }}>
              {analytics.readinessScore}%
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>поріг 60%</span>
          </div>
          <div style={{
            height: '6px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              height: '100%',
              width: `${analytics.readinessScore}%`,
              background: `linear-gradient(90deg, var(--accent-cyan), ${levelInfo.color})`,
              borderRadius: '999px',
              transition: 'width 0.6s ease'
            }} />
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {levelInfo.text}
          </p>
        </div>

        {/* Accuracy */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Точність відповідей
            </span>
            <Target size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff' }}>
              {analytics.overallAccuracy}%
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {analytics.totalQuestionsAnswered} відповідей у персональному профілі
          </p>
        </div>

        {/* Tests Completed */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Пройдено тестувань
            </span>
            <TrendingUp size={18} color="var(--accent-indigo)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff' }}>
              {analytics.totalTestsCompleted}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>сесій</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Симуляцій ЄДКІ: {attempts.filter(a => a.mode === 'simulation' && (isStudent ? a.userId === currentUser?.id : true)).length}
          </p>
        </div>

        {/* Mistakes Bank */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Банк помилок
            </span>
            <AlertTriangle size={18} color={activeMistakesCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: activeMistakesCount > 0 ? '#fb7185' : 'var(--accent-emerald)'
            }}>
              {activeMistakesCount}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              активних
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Засвоєно після повторень: {analytics.masteredMistakesCount}
          </p>
        </div>
      </div>

      {/* 7 Official EDKI Clusters Snapshot */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Офіційні 7 кластерів програми ЄДКІ</h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Пропорційний розподіл завдань в офіційному екзаменаційному білеті
            </p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigateTab('clusters')}
            style={{ fontSize: '0.82rem' }}
          >
            <span>Всі кластери</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {EDKI_CLUSTERS_DATA.map(cl => {
            const mastery = analytics.clusterMastery[cl.id] || { answered: 0, accuracy: 0 };
            const qCount = questions.filter(q => q.clusterId === cl.id).length;

            return (
              <div
                key={cl.id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
                onClick={() => onStartClusterDrill(cl.id)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                      {cl.weightMin}–{cl.weightMax}% білета
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: mastery.answered > 0 ? (mastery.accuracy >= 60 ? 'var(--accent-emerald)' : 'var(--accent-amber)') : 'var(--text-muted)'
                    }}>
                      {mastery.answered > 0 ? `${mastery.accuracy}%` : '—'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.94rem', lineHeight: 1.35, marginBottom: '8px', color: '#ffffff' }}>
                    {cl.id}. {cl.name}
                  </h4>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>{qCount} завдань у базі</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>Тренувати →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Topics Section if any */}
      {analytics.weakTopics.length > 0 && (
        <div className="glass-card" style={{
          padding: '24px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          background: 'rgba(245, 158, 11, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={22} color="var(--accent-amber)" />
              <h2 style={{ fontSize: '1.2rem' }}>Теми, які потребують повторення</h2>
            </div>
            <button 
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              onClick={onStartMistakesDrill}
            >
              Опрацювати всі слабкі теми
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {analytics.weakTopics.map((wt, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(14, 21, 38, 0.7)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                    {wt.topicName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Помилок: <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>{wt.mistakes}</span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  onClick={() => onStartTopicDrill(wt.subjectId)}
                >
                  Вчити
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attempts History */}
      {attempts.length > 0 && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.25rem' }}>Останні сесії тестування</h2>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Всього спроб: {attempts.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attempts.slice(0, 5).map(att => (
              <div 
                key={att.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {att.passed ? (
                    <CheckCircle size={22} color="var(--accent-emerald)" />
                  ) : (
                    <XCircle size={22} color="var(--accent-rose)" />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>
                      {att.title}
                      {att.studentName && !isStudent && (
                        <span style={{ color: 'var(--accent-indigo)', fontSize: '0.8rem', marginLeft: '8px' }}>
                          [{att.studentName}, {att.groupName}]
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {new Date(att.date).toLocaleDateString('uk-UA', { 
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                      })} • Тривалість: {Math.round(att.durationSeconds / 60)} хв
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: att.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                    }}>
                      {att.scorePercentage}%
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {att.correctCount} з {att.totalQuestions} правильно
                    </div>
                  </div>
                  <span className={`badge ${att.passed ? 'badge-emerald' : 'badge-rose'}`}>
                    {att.passed ? 'Складено' : 'Не складено'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
