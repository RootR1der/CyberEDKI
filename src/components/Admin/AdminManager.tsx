import React, { useState } from 'react';
import {
  PlusCircle,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  FileJson,
  Layers,
  Save,
  Trash2
} from 'lucide-react';
import { useEdki } from '../../context/EdkiContext';
import { Question, OptionKey, Difficulty, QuestionType } from '../../types/edki';

export const AdminManager: React.FC = () => {
  const {
    questions,
    subjects,
    createQuestion,
    deleteQuestion,
    exportBackupJson,
    importQuestionsJson,
    resetAllProgress
  } = useEdki();

  const [activeTab, setActiveTab] = useState<'create' | 'json' | 'list'>('create');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Question Form State
  const [text, setText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<OptionKey>('A');
  const [subjectId, setSubjectId] = useState<number>(1);
  const [topicId, setTopicId] = useState<string>('1.1');
  const [subtopic, setSubtopic] = useState('');
  const [year, setYear] = useState<number>(2024);
  const [type, setType] = useState<QuestionType>('Practice');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [explanation, setExplanation] = useState('');
  const [expA, setExpA] = useState('');
  const [expB, setExpB] = useState('');
  const [expC, setExpC] = useState('');
  const [expD, setExpD] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceSection, setSourceSection] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [jsonText, setJsonText] = useState('');

  const selectedSubject = subjects.find(s => s.id === subjectId) || subjects[0];

  const handleSubjectChange = (newSubId: number) => {
    setSubjectId(newSubId);
    const sub = subjects.find(s => s.id === newSubId);
    if (sub && sub.topics.length > 0) {
      setTopicId(sub.topics[0].id);
      setSubtopic(sub.topics[0].subtopics[0] || '');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert('Будь ласка, заповніть текст питання та всі 4 варіанти відповідей');
      return;
    }

    createQuestion({
      text,
      options: [
        { id: 'A', text: optA },
        { id: 'B', text: optB },
        { id: 'C', text: optC },
        { id: 'D', text: optD }
      ],
      correctAnswer,
      subjectId,
      topicId,
      subtopic: subtopic || 'Загальне',
      year,
      type,
      difficulty,
      explanation: explanation || `Правильний варіант — ${correctAnswer}.`,
      optionExplanations: {
        A: expA || (correctAnswer === 'A' ? 'Правильно' : 'Не відповідає умові'),
        B: expB || (correctAnswer === 'B' ? 'Правильно' : 'Не відповідає умові'),
        C: expC || (correctAnswer === 'C' ? 'Правильно' : 'Не відповідає умові'),
        D: expD || (correctAnswer === 'D' ? 'Правильно' : 'Не відповідає умові')
      },
      source: {
        title: sourceTitle || 'Офіційна програма ЄДКІ з кібербезпеки',
        type: 'standard',
        articleOrSection: sourceSection || 'Стандартні вимоги',
        url: sourceUrl || undefined
      },
      status: 'Verified'
    });

    alert('Питання успішно додано до бази знань!');
    // Reset form
    setText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
    setExpA('');
    setExpB('');
    setExpC('');
    setExpD('');
    setSourceTitle('');
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyberedki_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    if (!jsonText.trim()) return;
    const res = importQuestionsJson(jsonText);
    if (res.success) {
      setImportStatus({ success: true, message: `Успішно імпортовано ${res.count} питань!` });
      setJsonText('');
    } else {
      setImportStatus({ success: false, message: `Помилка імпорту: ${res.error}` });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
          Адміністрування та керування базою знань
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Додавання нових завдань, імпорт/експорт у форматі JSON та контроль наповнення
        </p>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
          <button
            className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.86rem' }}
            onClick={() => setActiveTab('create')}
          >
            <PlusCircle size={16} />
            <span>Додати питання</span>
          </button>
          <button
            className={`btn ${activeTab === 'json' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.86rem' }}
            onClick={() => setActiveTab('json')}
          >
            <FileJson size={16} />
            <span>Імпорт / Експорт JSON</span>
          </button>
          <button
            className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.86rem' }}
            onClick={() => setActiveTab('list')}
          >
            <Layers size={16} />
            <span>Керування базою ({questions.length})</span>
          </button>
        </div>
      </div>

      {/* CREATE QUESTION TAB */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '18px' }}>Нове тестове завдання ЄДКІ</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Subject */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Предметна область (із 20 предметів)
              </label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(14, 21, 38, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  padding: '10px 12px',
                  outline: 'none'
                }}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.id}. {s.name}</option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Тема в межах предмета
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(14, 21, 38, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  padding: '10px 12px',
                  outline: 'none'
                }}
              >
                {selectedSubject.topics.map(t => (
                  <option key={t.id} value={t.id}>{t.id} {t.name}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Складність
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'rgba(14, 21, 38, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  padding: '10px 12px',
                  outline: 'none'
                }}
              >
                <option value="Easy">Easy (Легка)</option>
                <option value="Medium">Medium (Середня)</option>
                <option value="Hard">Hard (Складна)</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Тип походження
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'rgba(14, 21, 38, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  padding: '10px 12px',
                  outline: 'none'
                }}
              >
                <option value="Official">Official (Офіційне)</option>
                <option value="Previous year">Previous year (Попередніх років)</option>
                <option value="Practice">Practice (Тренувальне)</option>
                <option value="AI-generated">AI-generated</option>
              </select>
            </div>
          </div>

          {/* Subtopic */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Підтема або навчальний блок
            </label>
            <input
              type="text"
              placeholder="наприклад: Тріада CIA, Симетричні алгоритми, тощо"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(14, 21, 38, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                padding: '10px 14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Текст тестового завдання *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Введіть повний текст питання..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(14, 21, 38, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                padding: '12px 14px',
                fontSize: '0.94rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* 4 Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Варіанти відповідей (4 варіанти) та вибір правильного:
            </label>

            {[
              { id: 'A' as OptionKey, val: optA, setVal: setOptA, exp: expA, setExp: setExpA },
              { id: 'B' as OptionKey, val: optB, setVal: setOptB, exp: expB, setExp: setExpB },
              { id: 'C' as OptionKey, val: optC, setVal: setOptC, exp: expC, setExp: setExpC },
              { id: 'D' as OptionKey, val: optD, setVal: setOptD, exp: expD, setExp: setExpD }
            ].map(item => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${correctAnswer === item.id ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswer === item.id}
                    onChange={() => setCorrectAnswer(item.id)}
                    style={{ accentColor: 'var(--accent-emerald)', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <strong style={{ color: correctAnswer === item.id ? 'var(--accent-emerald)' : '#ffffff' }}>
                    Варіант {item.id} {correctAnswer === item.id && '(Правильний)'}:
                  </strong>
                  <input
                    type="text"
                    required
                    placeholder={`Текст варіанта ${item.id}...`}
                    value={item.val}
                    onChange={(e) => item.setVal(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(14, 21, 38, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ paddingLeft: '30px' }}>
                  <input
                    type="text"
                    placeholder={`Пояснення для варіанта ${item.id} (чому правильний/чому хибний)...`}
                    value={item.exp}
                    onChange={(e) => item.setExp(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Загальне обґрунтування правильної відповіді *
            </label>
            <textarea
              rows={2}
              placeholder="Детальне науково-технічне пояснення, чому відповідь вірна..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(14, 21, 38, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                padding: '10px 14px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Source info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Офіційний документ / Стандарт
              </label>
              <input
                type="text"
                placeholder="наприклад: ISO/IEC 27001 або ЗУ «Про кібербезпеку»"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(14, 21, 38, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  padding: '8px 12px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Стаття / Розділ / Пункт
              </label>
              <input
                type="text"
                placeholder="наприклад: Стаття 8 або Розділ A.9"
                value={sourceSection}
                onChange={(e) => setSourceSection(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(14, 21, 38, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  padding: '8px 12px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Посилання на джерело (URL)
              </label>
              <input
                type="url"
                placeholder="https://zakon.rada.gov.ua/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(14, 21, 38, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#ffffff',
                  padding: '8px 12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <Save size={18} />
            <span>Зберегти питання в базу</span>
          </button>
        </form>
      )}

      {/* JSON IMPORT / EXPORT TAB */}
      {activeTab === 'json' && (
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Резервне копіювання та імпорт JSON</h3>

          <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleDownloadBackup}>
              <Download size={18} />
              <span>Завантажити повну резервну копію (JSON)</span>
            </button>

            <button className="btn btn-danger" onClick={() => resetAllProgress()}>
              <RotateCcw size={18} />
              <span>Скинути статистику та банк помилок</span>
            </button>
          </div>

          {/* Import section */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Імпортувати питання з JSON</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Вставте масив питань у JSON форматі або об'єкт із полем "questions".
            </p>

            <textarea
              rows={8}
              placeholder={`[\n  {\n    "text": "Текст питання",\n    "options": [\n      {"id": "A", "text": "Варіант 1"},\n      {"id": "B", "text": "Варіант 2"},\n      {"id": "C", "text": "Варіант 3"},\n      {"id": "D", "text": "Варіант 4"}\n    ],\n    "correctAnswer": "A",\n    "subjectId": 1,\n    "topicId": "1.1",\n    "subtopic": "Тема",\n    "explanation": "Обґрунтування",\n    ...\n  }\n]`}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(14, 21, 38, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-code)',
                fontFamily: 'var(--font-mono)',
                padding: '12px 14px',
                fontSize: '0.82rem',
                outline: 'none',
                marginBottom: '12px'
              }}
            />

            {importStatus && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: importStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: importStatus.success ? '#34d399' : '#fb7185',
                border: `1px solid ${importStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                fontSize: '0.88rem',
                marginBottom: '12px'
              }}>
                {importStatus.message}
              </div>
            )}

            <button className="btn btn-secondary" onClick={handleImportJson}>
              <Upload size={16} />
              <span>Імпортувати дані</span>
            </button>
          </div>
        </div>
      )}

      {/* QUESTION MANAGEMENT LIST TAB */}
      {activeTab === 'list' && (
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>
            Усі питання в базі ({questions.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questions.map((q, idx) => {
              const sub = subjects.find(s => s.id === q.subjectId);

              return (
                <div
                  key={q.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="mono-code" style={{ fontSize: '0.72rem' }}>{q.id}</span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.66rem' }}>{sub?.name}</span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.66rem' }}>{q.difficulty}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                      {idx + 1}. {q.text}
                    </div>
                  </div>

                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                    onClick={() => {
                      if (window.confirm(`Видалити питання ${q.id}?`)) {
                        deleteQuestion(q.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};