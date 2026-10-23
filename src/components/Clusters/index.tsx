import React from 'react';
import {
  Layers,
  Scale,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Radio,
  Play,
  CheckCircle2
} from 'lucide-react';
import { EDKI_CLUSTERS_DATA } from '../../data/clusters';
import { useEdki } from '../../context/EdkiContext';

interface ClustersViewProps {
  onStartClusterDrill: (clusterId: number) => void;
}

export const ClustersView: React.FC<ClustersViewProps> = ({ onStartClusterDrill }) => {
  const { questions, analytics } = useEdki();

  const getClusterIcon = (id: number) => {
    switch (id) {
      case 1: return <Scale size={24} color="var(--accent-cyan)" />;
      case 2: return <Cpu size={24} color="var(--accent-indigo)" />;
      case 3: return <ShieldCheck size={24} color="var(--accent-emerald)" />;
      case 4: return <ShieldAlert size={24} color="var(--accent-amber)" />;
      case 5: return <Layers size={24} color="#38bdf8" />;
      case 6: return <KeyRound size={24} color="#ec4899" />;
      case 7: return <Radio size={24} color="#f43f5e" />;
      default: return <Layers size={24} color="var(--accent-cyan)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-card" style={{
        padding: 'clamp(16px, 4vw, 28px)',
        background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.9) 0%, rgba(20, 30, 55, 0.8) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Layers size={26} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>Офіційна структура 7 тематичних кластерів ЄДКІ (125 «Кібербезпека»)</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '850px', lineHeight: 1.5 }}>
          Відповідно до чинної програми ЄДКІ, екзаменаційний білет формується строго за 7 кластерами знань із встановленими відсотковими частками. Тренуйтеся за окремими кластерами для точкового закриття прогалин.
        </p>
      </div>

      {/* Cluster Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {EDKI_CLUSTERS_DATA.map(cluster => {
          const clusterQuestions = questions.filter(q => q.clusterId === cluster.id);
          const mastery = analytics.clusterMastery[cluster.id] || { answered: 0, accuracy: 0 };

          return (
            <div
              key={cluster.id}
              className="glass-card glass-card-interactive"
              style={{
                padding: 'clamp(16px, 4vw, 24px)',
                borderLeft: `5px solid ${cluster.id === 1 ? 'var(--accent-cyan)' : cluster.id === 2 ? 'var(--accent-indigo)' : cluster.id === 3 ? 'var(--accent-emerald)' : cluster.id === 4 ? 'var(--accent-amber)' : cluster.id === 6 ? '#ec4899' : '#f43f5e'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getClusterIcon(cluster.id)}
                  </div>

                  <div style={{ minWidth: 0, maxWidth: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span className="mono-code" style={{ fontSize: '0.74rem' }}>{cluster.code}</span>
                      <span className="badge badge-cyan" style={{ fontWeight: 800 }}>
                        Вага в ЄДКІ: {cluster.weightMin}–{cluster.weightMax}% (номінал {cluster.weightPercent}%)
                      </span>
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.22rem)', color: '#ffffff', fontWeight: 700, wordBreak: 'break-word' }}>
                      {cluster.id}. {cluster.name}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', width: '100%', marginTop: '6px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: mastery.answered > 0 ? (mastery.accuracy >= 60 ? 'var(--accent-emerald)' : 'var(--accent-amber)') : 'var(--text-muted)'
                    }}>
                      {mastery.answered > 0 ? `${mastery.accuracy}% точність` : 'Не складався'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {clusterQuestions.length} тестових завдань
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => onStartClusterDrill(cluster.id)}
                    style={{ padding: '8px 16px', fontSize: '0.86rem' }}
                  >
                    <Play size={15} />
                    <span>Тренувати кластер</span>
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.55 }}>
                {cluster.description}
              </p>

              {/* Topics Pills */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  ОСНОВНІ ТЕМИ ТА НОРМАТИВНІ ДЖЕРЕЛА КЛАСТЕРУ:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {cluster.topicsList.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.76rem',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      • {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
