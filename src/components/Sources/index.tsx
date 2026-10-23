import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  FileText
} from 'lucide-react';
import { useEdki } from '../../context/EdkiContext';
import { useAuth } from '../../context/AuthContext';
import { RegulatorySourceItem } from '../../data/sources';

export const SourcesLibrary: React.FC = () => {
  const { sources, addSource, updateSource, deleteSource } = useEdki();
  const { isTeacher, isAdmin } = useAuth();
  const canEdit = isTeacher || isAdmin;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalData, setModalData] = useState<{ mode: 'add' | 'edit'; source?: RegulatorySourceItem } | null>(null);

  // Form fields
  const [formCategory, setFormCategory] = useState<RegulatorySourceItem['category']>('Закони України');
  const [formType, setFormType] = useState<RegulatorySourceItem['type']>('law');
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formArticle, setFormArticle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formRelevance, setFormRelevance] = useState('');

  const categories = ['all', 'Закони України', 'Міжнародні стандарти', 'NIST', 'RFC', 'Фреймворки та гайдлайни'];

  const openAddModal = () => {
    setFormCategory('Закони України');
    setFormType('law');
    setFormTitle('');
    setFormCode('');
    setFormUrl('');
    setFormArticle('');
    setFormDesc('');
    setFormRelevance('');
    setModalData({ mode: 'add' });
  };

  const openEditModal = (src: RegulatorySourceItem) => {
    setFormCategory(src.category);
    setFormType(src.type);
    setFormTitle(src.title);
    setFormCode(src.code || '');
    setFormUrl(src.url || '');
    setFormArticle(src.articleOrSection || '');
    setFormDesc(src.description);
    setFormRelevance(src.relevanceToEDKI);
    setModalData({ mode: 'edit', source: src });
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Будь ласка, вкажіть назву джерела');
      return;
    }

    if (modalData?.mode === 'add') {
      addSource({
        category: formCategory,
        type: formType,
        title: formTitle.trim(),
        code: formCode.trim() || undefined,
        url: formUrl.trim() || undefined,
        articleOrSection: formArticle.trim() || undefined,
        description: formDesc.trim(),
        relevanceToEDKI: formRelevance.trim()
      });
    } else if (modalData?.mode === 'edit' && modalData.source) {
      updateSource({
        ...modalData.source,
        category: formCategory,
        type: formType,
        title: formTitle.trim(),
        code: formCode.trim() || undefined,
        url: formUrl.trim() || undefined,
        articleOrSection: formArticle.trim() || undefined,
        description: formDesc.trim(),
        relevanceToEDKI: formRelevance.trim()
      });
    }
    setModalData(null);
  };

  const handleDeleteSource = (id: string, title: string) => {
    if (window.confirm(`Видалити нормативне джерело "${title}"?`)) {
      deleteSource(id);
    }
  };

  const filteredSources = sources.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) || 
        (s.code && s.code.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div className="glass-card" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.9) 0%, rgba(20, 35, 60, 0.7) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <BookOpen size={28} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.6rem' }}>Офіційні джерела та стандарти програми ЄДКІ</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', maxWidth: '750px' }}>
          Нормативно-правова база України, стандарти ISO/IEC, керівництва NIST, технічні специфікації RFC та галузеві фреймворки (OWASP, MITRE ATT&CK), на яких базуються тестові завдання ЄДКІ зі спеціальності 125 «Кібербезпека».
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'Усі джерела' : cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Пошук документа..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(14, 21, 38, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                padding: '8px 12px 8px 32px',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>

          {canEdit && (
            <button
              className="btn btn-primary"
              onClick={openAddModal}
              style={{ padding: '8px 16px', fontSize: '0.84rem', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Додати джерело</span>
            </button>
          )}
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid-2">
        {filteredSources.map(src => (
          <div 
            key={src.id}
            className="glass-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="badge badge-cyan">{src.category}</span>
                {src.code && (
                  <span className="mono-code" style={{ fontSize: '0.74rem' }}>{src.code}</span>
                )}
              </div>

              <h3 style={{ fontSize: '1.1rem', lineHeight: 1.4, marginBottom: '10px', color: '#ffffff' }}>
                {src.title}
              </h3>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.55 }}>
                {src.description}
              </p>

              {/* Relevance box */}
              {src.relevanceToEDKI && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '4px' }}>
                    Значення для ЄДКІ:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {src.relevanceToEDKI}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.8rem',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {src.articleOrSection}
              </span>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {canEdit && (
                  <>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px' }}
                      onClick={() => openEditModal(src)}
                      title="Редагувати джерело"
                    >
                      <Edit2 size={12} color="var(--accent-cyan)" />
                      <span>Редагувати</span>
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 8px', color: 'var(--accent-rose)' }}
                      onClick={() => handleDeleteSource(src.id, src.title)}
                      title="Видалити джерело"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}

                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
                  >
                    <span>Читати першоджерело</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT SOURCE */}
      {modalData && (
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
          <div className="glass-card modal-dialog-responsive" style={{
            width: '100%',
            maxWidth: '600px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(16px, 4vw, 28px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {modalData.mode === 'add' ? 'Додати нове нормативне джерело' : 'Редагувати джерело'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setModalData(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSource} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="responsive-two-col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Категорія:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.86rem'
                    }}
                  >
                    <option value="Закони України">Закони України</option>
                    <option value="Міжнародні стандарти">Міжнародні стандарти</option>
                    <option value="NIST">NIST</option>
                    <option value="RFC">RFC</option>
                    <option value="Фреймворки та гайдлайни">Фреймворки та гайдлайни</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Тип документу:
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.86rem'
                    }}
                  >
                    <option value="law">Закон (law)</option>
                    <option value="standard">Стандарт (standard)</option>
                    <option value="rfc">RFC специфікація (rfc)</option>
                    <option value="framework">Фреймворк (framework)</option>
                    <option value="guideline">Гайдлайн (guideline)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Повна назва документу / джерела:
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Закон України «Про основні засади забезпечення кібербезпеки України»"
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div className="responsive-two-col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Номер / код документу:
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="№ 2163-VIII або ISO/IEC 27001"
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Ключові статті / розділи:
                  </label>
                  <input
                    type="text"
                    value={formArticle}
                    onChange={(e) => setFormArticle(e.target.value)}
                    placeholder="Статті 1, 5, 8, 9"
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Посилання на першоджерело (URL):
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://zakon.rada.gov.ua/..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Опис джерела:
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Що регулює документ, головні положення та термінологія..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Значення для програми ЄДКІ:
                </label>
                <textarea
                  rows={2}
                  value={formRelevance}
                  onChange={(e) => setFormRelevance(e.target.value)}
                  placeholder="Які типи питань на екзамені базуються на цьому документі..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalData(null)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Check size={16} />
                  <span>Зберегти джерело</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
