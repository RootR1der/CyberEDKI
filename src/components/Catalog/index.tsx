import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Play,
  Plus,
  Edit2,
  Edit3,
  Trash2,
  X,
  Check,
  Layers,
  BookOpen,
  FileJson,
  Download,
  Upload,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  RotateCcw,
  FileText,
  Copy,
  Info
} from 'lucide-react';
import { useEdki } from '../../context/EdkiContext';
import { Question, OptionKey, Difficulty, QuestionType, Subject, Topic } from '../../types/edki';
import { useAuth } from '../../context/AuthContext';

interface SubjectCatalogProps {
  onStartSubjectDrill: (subjectId: number) => void;
}

export const SubjectCatalog: React.FC<SubjectCatalogProps> = ({ onStartSubjectDrill }) => {
  const {
    subjects,
    questions,
    analytics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    exportBackupJson,
    importQuestionsJson,
    resetAllProgress
  } = useEdki();

  const { isTeacher, isAdmin } = useAuth();
  const canEdit = isTeacher || isAdmin;

  // Expanded subjects (by subject.id)
  const [expandedSubjects, setExpandedSubjects] = useState<Record<number, boolean>>({ 1: true, 3: true });
  // Expanded questions per topic (by topic.id)
  const [expandedTopicQuestions, setExpandedTopicQuestions] = useState<Record<string, boolean>>({});
  // Selected subtopic filter per topic (by topic.id -> subtopic name or 'all')
  const [topicSubtopicFilter, setTopicSubtopicFilter] = useState<Record<string, string>>({});
  const [filterOfficialOnly, setFilterOfficialOnly] = useState(false);

  // Subject Modal state
  const [subjectModalData, setSubjectModalData] = useState<{ mode: 'add' | 'edit'; subject?: Subject } | null>(null);
  const [subFormCode, setSubFormCode] = useState('');
  const [subFormName, setSubFormName] = useState('');
  const [subFormDesc, setSubFormDesc] = useState('');
  const [subFormCluster, setSubFormCluster] = useState<number>(1);
  const [subFormOfficial, setSubFormOfficial] = useState(true);

  // Topic Modal state
  const [topicModalData, setTopicModalData] = useState<{ mode: 'add' | 'edit'; subjectId: number; topic?: Topic } | null>(null);
  const [topicFormId, setTopicFormId] = useState('');
  const [topicFormName, setTopicFormName] = useState('');
  const [topicFormSubtopicsText, setTopicFormSubtopicsText] = useState('');
  const [topicFormOfficial, setTopicFormOfficial] = useState(true);

  // Question Modal state
  const [questionModalData, setQuestionModalData] = useState<{
    mode: 'add' | 'edit';
    subjectId: number;
    topicId: string;
    defaultSubtopic?: string;
    question?: Question;
  } | null>(null);

  // Question Form fields
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<OptionKey>('A');
  const [qSubtopic, setQSubtopic] = useState('');
  const [qYear, setQYear] = useState<number>(2024);
  const [qType, setQType] = useState<QuestionType>('Practice');
  const [qDifficulty, setQDifficulty] = useState<Difficulty>('Medium');
  const [explanation, setExplanation] = useState('');
  const [expA, setExpA] = useState('');
  const [expB, setExpB] = useState('');
  const [expC, setExpC] = useState('');
  const [expD, setExpD] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceSection, setSourceSection] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  // Import Modal state
  const [importModalData, setImportModalData] = useState<{
    isOpen: boolean;
    targetSubjectId?: number;
    targetTopicId?: string;
    targetSubtopic?: string;
  } | null>(null);

  const [importJsonText, setImportJsonText] = useState('');
  const [importTargetMode, setImportTargetMode] = useState<'selected' | 'auto'>('selected');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // JSON Full Backup Modal state
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Active Subject & Topic for question modal
  const activeSubject = questionModalData ? subjects.find(s => s.id === questionModalData.subjectId) : undefined;
  const activeModalTopic = questionModalData && activeSubject
    ? activeSubject.topics.find(t => t.id === questionModalData.topicId)
    : undefined;

  // Active Subject & Topic for import modal
  const activeImportSubject = importModalData?.targetSubjectId
    ? subjects.find(s => s.id === importModalData.targetSubjectId)
    : undefined;
  const activeImportTopic = activeImportSubject && importModalData?.targetTopicId
    ? activeImportSubject.topics.find(t => t.id === importModalData.targetTopicId)
    : undefined;

  // ------------------ SUBJECT ACTIONS ------------------
  const openAddSubjectModal = () => {
    setSubFormCode(`SEC-${Date.now().toString().slice(-4)}`);
    setSubFormName('');
    setSubFormDesc('');
    setSubFormCluster(1);
    setSubFormOfficial(true);
    setSubjectModalData({ mode: 'add' });
  };

  const openEditSubjectModal = (sub: Subject) => {
    setSubFormCode(sub.code);
    setSubFormName(sub.name);
    setSubFormDesc(sub.description);
    setSubFormCluster(sub.clusterId);
    setSubFormOfficial(sub.isOfficial);
    setSubjectModalData({ mode: 'edit', subject: sub });
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormName.trim()) {
      alert('Будь ласка, вкажіть назву предмету');
      return;
    }

    if (subjectModalData?.mode === 'add') {
      addSubject({
        code: subFormCode.trim() || 'SEC-NEW',
        name: subFormName.trim(),
        description: subFormDesc.trim(),
        iconName: 'Shield',
        isOfficial: subFormOfficial,
        clusterId: subFormCluster,
        topics: []
      });
    } else if (subjectModalData?.mode === 'edit' && subjectModalData.subject) {
      updateSubject({
        ...subjectModalData.subject,
        code: subFormCode.trim(),
        name: subFormName.trim(),
        description: subFormDesc.trim(),
        clusterId: subFormCluster,
        isOfficial: subFormOfficial
      });
    }
    setSubjectModalData(null);
  };

  const handleDeleteSubject = (subjectId: number, name: string) => {
    if (window.confirm(`Ви впевнені, що бажаєте видалити предмет "${name}" та всі його теми?`)) {
      deleteSubject(subjectId);
    }
  };

  // ------------------ TOPIC ACTIONS ------------------
  const openAddTopicModal = (subjectId: number) => {
    const sub = subjects.find(s => s.id === subjectId);
    const nextTopicNum = (sub?.topics.length || 0) + 1;
    setTopicFormId(`${subjectId}.${nextTopicNum}`);
    setTopicFormName('');
    setTopicFormSubtopicsText('');
    setTopicFormOfficial(true);
    setTopicModalData({ mode: 'add', subjectId });
  };

  const openEditTopicModal = (subjectId: number, topic: Topic) => {
    setTopicFormId(topic.id);
    setTopicFormName(topic.name);
    setTopicFormSubtopicsText(topic.subtopics.join('\n'));
    setTopicFormOfficial(topic.isOfficial);
    setTopicModalData({ mode: 'edit', subjectId, topic });
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicModalData || !topicFormName.trim()) {
      alert('Будь ласка, вкажіть назву теми');
      return;
    }

    const subtopics = topicFormSubtopicsText
      .split('\n')
      .map(s => s.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);

    if (topicModalData.mode === 'add') {
      addTopic(topicModalData.subjectId, {
        id: topicFormId.trim() || `${topicModalData.subjectId}.${Date.now().toString().slice(-3)}`,
        subjectId: topicModalData.subjectId,
        name: topicFormName.trim(),
        subtopics: subtopics.length > 0 ? subtopics : ['Загальні положення'],
        isOfficial: topicFormOfficial
      });
    } else if (topicModalData.mode === 'edit' && topicModalData.topic) {
      updateTopic(topicModalData.subjectId, {
        ...topicModalData.topic,
        id: topicFormId.trim() || topicModalData.topic.id,
        name: topicFormName.trim(),
        subtopics: subtopics.length > 0 ? subtopics : topicModalData.topic.subtopics,
        isOfficial: topicFormOfficial
      });
    }
    setTopicModalData(null);
  };

  const handleDeleteTopic = (subjectId: number, topicId: string, name: string) => {
    if (window.confirm(`Видалити тему "${name}" (${topicId})?`)) {
      deleteTopic(subjectId, topicId);
    }
  };

  // ------------------ QUESTION ACTIONS ------------------
  const openAddQuestionModal = (subjectId: number, topicId: string, defaultSubtopic?: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    const top = sub?.topics.find(t => t.id === topicId);
    const initialSubtopic = defaultSubtopic || (top?.subtopics && top.subtopics.length > 0 ? top.subtopics[0] : '');

    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAnswer('A');
    setQSubtopic(initialSubtopic);
    setQYear(new Date().getFullYear());
    setQType('Practice');
    setQDifficulty('Medium');
    setExplanation('');
    setExpA('');
    setExpB('');
    setExpC('');
    setExpD('');
    setSourceTitle('');
    setSourceSection('');
    setSourceUrl('');
    setQuestionModalData({ mode: 'add', subjectId, topicId, defaultSubtopic: initialSubtopic });
  };

  const openEditQuestionModal = (q: Question) => {
    setQText(q.text);
    setOptA(q.options.find(o => o.id === 'A')?.text || '');
    setOptB(q.options.find(o => o.id === 'B')?.text || '');
    setOptC(q.options.find(o => o.id === 'C')?.text || '');
    setOptD(q.options.find(o => o.id === 'D')?.text || '');
    setCorrectAnswer(q.correctAnswer);
    setQSubtopic(q.subtopic || '');
    setQYear(q.year || new Date().getFullYear());
    setQType(q.type || 'Practice');
    setQDifficulty(q.difficulty || 'Medium');
    setExplanation(q.explanation || '');
    setExpA(q.optionExplanations?.A || '');
    setExpB(q.optionExplanations?.B || '');
    setExpC(q.optionExplanations?.C || '');
    setExpD(q.optionExplanations?.D || '');
    setSourceTitle(q.source?.title || '');
    setSourceSection(q.source?.articleOrSection || '');
    setSourceUrl(q.source?.url || '');
    setQuestionModalData({ mode: 'edit', subjectId: q.subjectId, topicId: q.topicId, question: q });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionModalData) return;
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert('Будь ласка, заповніть текст питання та всі 4 варіанти відповідей');
      return;
    }

    const sub = subjects.find(s => s.id === questionModalData.subjectId);
    const clusterId = sub?.clusterId || 1;

    if (questionModalData.mode === 'add') {
      createQuestion({
        text: qText.trim(),
        options: [
          { id: 'A', text: optA.trim() },
          { id: 'B', text: optB.trim() },
          { id: 'C', text: optC.trim() },
          { id: 'D', text: optD.trim() }
        ],
        correctAnswer,
        subjectId: questionModalData.subjectId,
        clusterId,
        topicId: questionModalData.topicId,
        subtopic: qSubtopic.trim() || 'Загальне',
        year: qYear,
        type: qType,
        difficulty: qDifficulty,
        explanation: explanation.trim() || `Правильний варіант — ${correctAnswer}.`,
        optionExplanations: {
          A: expA.trim() || (correctAnswer === 'A' ? 'Правильно' : 'Не відповідає умові'),
          B: expB.trim() || (correctAnswer === 'B' ? 'Правильно' : 'Не відповідає умові'),
          C: expC.trim() || (correctAnswer === 'C' ? 'Правильно' : 'Не відповідає умові'),
          D: expD.trim() || (correctAnswer === 'D' ? 'Правильно' : 'Не відповідає умові')
        },
        source: {
          title: sourceTitle.trim() || 'Офіційна програма ЄДКІ з кібербезпеки',
          type: 'standard',
          articleOrSection: sourceSection.trim() || 'Вимоги стандарту',
          url: sourceUrl.trim() || undefined
        },
        status: 'Verified'
      });
      // Automatically expand this topic so user sees the newly added question
      setExpandedTopicQuestions(prev => ({ ...prev, [questionModalData.topicId]: true }));
    } else if (questionModalData.mode === 'edit' && questionModalData.question) {
      updateQuestion({
        ...questionModalData.question,
        text: qText.trim(),
        options: [
          { id: 'A', text: optA.trim() },
          { id: 'B', text: optB.trim() },
          { id: 'C', text: optC.trim() },
          { id: 'D', text: optD.trim() }
        ],
        correctAnswer,
        subtopic: qSubtopic.trim() || questionModalData.question.subtopic || 'Загальне',
        year: qYear,
        type: qType,
        difficulty: qDifficulty,
        explanation: explanation.trim() || questionModalData.question.explanation,
        optionExplanations: {
          A: expA.trim() || (correctAnswer === 'A' ? 'Правильно' : 'Не відповідає умові'),
          B: expB.trim() || (correctAnswer === 'B' ? 'Правильно' : 'Не відповідає умові'),
          C: expC.trim() || (correctAnswer === 'C' ? 'Правильно' : 'Не відповідає умові'),
          D: expD.trim() || (correctAnswer === 'D' ? 'Правильно' : 'Не відповідає умові')
        },
        source: {
          title: sourceTitle.trim() || questionModalData.question.source?.title || 'Офіційна програма ЄДКІ з кібербезпеки',
          type: 'standard',
          articleOrSection: sourceSection.trim() || questionModalData.question.source?.articleOrSection || 'Вимоги стандарту',
          url: sourceUrl.trim() || undefined
        }
      });
    }

    setQuestionModalData(null);
  };

  const handleDeleteQuestion = (qId: string, qTextSnippet: string) => {
    if (window.confirm(`Видалити запитання "${qTextSnippet.slice(0, 60)}..." з бази?`)) {
      deleteQuestion(qId);
    }
  };

  // ------------------ IMPORT ACTIONS ------------------
  const openImportModal = (targetSubjectId?: number, targetTopicId?: string, targetSubtopic?: string) => {
    setImportModalData({
      isOpen: true,
      targetSubjectId,
      targetTopicId,
      targetSubtopic
    });
    setImportTargetMode(targetSubjectId ? 'selected' : 'auto');
    setImportJsonText('');
    setImportStatus(null);
    setPreviewCount(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      try {
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        setPreviewCount(list.length);
        setImportStatus(null);
      } catch {
        setPreviewCount(null);
        setImportStatus({ success: false, message: 'Файл містить некоректний JSON' });
      }
    };
    reader.readAsText(file);
  };

  const handleJsonTextChange = (text: string) => {
    setImportJsonText(text);
    if (!text.trim()) {
      setPreviewCount(null);
      setImportStatus(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      setPreviewCount(list.length);
      setImportStatus(null);
    } catch {
      setPreviewCount(null);
    }
  };

  const handleDownloadSampleJson = () => {
    const sample = [
      {
        text: "Яка основна мета стандарту ISO/IEC 27001 у сфері кібербезпеки?",
        options: [
          { id: "A", text: "Створення та підтримка системи управління інформаційною безпекою (СУІБ)" },
          { id: "B", text: "Виключно захист мережі від DDoS-атак" },
          { id: "C", text: "Ліцензування антивірусного програмного забезпечення" },
          { id: "D", text: "Аудит вихідного коду мобільних додатків" }
        ],
        correctAnswer: "A",
        difficulty: "Medium",
        type: "Official",
        subjectId: importModalData?.targetSubjectId || 1,
        topicId: importModalData?.targetTopicId || "1.1",
        subtopic: importModalData?.targetSubtopic || "Стандарти інформаційної безпеки",
        explanation: "ISO/IEC 27001 встановлює вимоги до створення, впровадження, підтримки та постійного вдосконалення СУІБ.",
        source: {
          title: "ISO/IEC 27001:2022",
          articleOrSection: "Розділ 4.1"
        }
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_cyberedki_questions.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = () => {
    if (!importJsonText.trim()) {
      alert('Будь ласка, завантажте файл .json або вставте JSON у поле вводу');
      return;
    }

    const overrides = (importModalData && importTargetMode === 'selected' && importModalData.targetSubjectId)
      ? {
          subjectId: importModalData.targetSubjectId,
          topicId: importModalData.targetTopicId,
          subtopic: importModalData.targetSubtopic,
          clusterId: subjects.find(s => s.id === importModalData.targetSubjectId)?.clusterId
        }
      : undefined;

    const result = importQuestionsJson(importJsonText, overrides);
    if (result.success) {
      setImportStatus({ success: true, message: `Успішно імпортовано ${result.count} тестових завдань!` });
      if (importModalData?.targetTopicId) {
        setExpandedTopicQuestions(prev => ({ ...prev, [importModalData.targetTopicId!]: true }));
      }
      setTimeout(() => {
        setImportModalData(null);
        setImportJsonText('');
        setPreviewCount(null);
        setImportStatus(null);
      }, 1500);
    } else {
      setImportStatus({ success: false, message: `Помилка імпорту: ${result.error}` });
    }
  };

  // ------------------ BACKUP ACTIONS ------------------
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

  const toggleSubject = (id: number) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleTopicQuestions = (topicId: string) => {
    setExpandedTopicQuestions(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const filteredSubjects = filterOfficialOnly 
    ? subjects.filter(s => s.isOfficial) 
    : subjects;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div className="glass-card" style={{ padding: 'clamp(14px, 3.5vw, 24px) clamp(12px, 3.5vw, 28px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', marginBottom: '6px' }}>
            Каталог навчальної програми ЄДКІ
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Повна структура {subjects.length} предметів, тем, підтем та {questions.length} тестових питань за спеціальністю 125 «Кібербезпека»
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <input 
              type="checkbox"
              checked={filterOfficialOnly}
              onChange={(e) => setFilterOfficialOnly(e.target.checked)}
              style={{ accentColor: 'var(--accent-cyan)' }}
            />
            <span>Лише офіційні теми ЄДКІ</span>
          </label>

          {canEdit && (
            <>
              {/* Prominent Import Button */}
              <button
                className="btn btn-secondary"
                onClick={() => openImportModal()}
                title="Імпортувати тестові запитання з файлу JSON"
                style={{ padding: '8px 14px', fontSize: '0.86rem', gap: '7px' }}
              >
                <Upload size={16} color="var(--accent-cyan)" />
                <span>Імпортувати питання</span>
              </button>

              {/* Full Backup */}
              <button
                className="btn btn-secondary"
                onClick={() => setShowBackupModal(true)}
                title="Повне резервне копіювання"
                style={{ padding: '8px 12px', fontSize: '0.86rem', gap: '6px' }}
              >
                <FileJson size={16} />
                <span>Бекап</span>
              </button>

              {/* Add Subject */}
              <button
                className="btn btn-primary"
                onClick={openAddSubjectModal}
                style={{ padding: '8px 16px', fontSize: '0.86rem', gap: '8px' }}
              >
                <Plus size={16} />
                <span>Додати предмет</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* List of Subjects */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredSubjects.map(sub => {
          const isExpanded = !!expandedSubjects[sub.id];
          const subQuestions = questions.filter(q => q.subjectId === sub.id);
          const mastery = analytics.subjectMastery[sub.id] || { answered: 0, accuracy: 0 };

          return (
            <div 
              key={sub.id}
              className="glass-card"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: isExpanded ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                transition: 'border-color 0.2s ease'
              }}
            >
              {/* Subject Header */}
              <div 
                style={{
                  padding: 'clamp(12px, 3vw, 18px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onClick={() => toggleSubject(sub.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 'min(100%, 260px)' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {sub.id}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span className="mono-code" style={{ fontSize: '0.72rem' }}>{sub.code}</span>
                      <h3 style={{ fontSize: 'clamp(0.96rem, 3.2vw, 1.1rem)', fontWeight: 600, wordBreak: 'break-word' }}>{sub.name}</h3>
                      {sub.isOfficial ? (
                        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Офіційна програма</span>
                      ) : (
                        <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>Поглиблено</span>
                      )}
                      <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>Кластер {sub.clusterId}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {sub.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
                  <div style={{ textAlign: 'right', marginRight: '4px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: mastery.answered > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {mastery.answered > 0 ? `${mastery.accuracy}%` : '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {subQuestions.length} питань
                    </div>
                  </div>

                  {canEdit && (
                    <>
                      <button
                        className="btn btn-secondary"
                        title="Імпортувати питання у цей предмет"
                        style={{ padding: '6px 9px', fontSize: '0.76rem', gap: '4px' }}
                        onClick={() => openImportModal(sub.id)}
                      >
                        <Upload size={13} color="var(--accent-cyan)" />
                        <span className="desktop-only">Імпорт</span>
                      </button>

                      <button
                        className="btn btn-secondary"
                        title="Редагувати предмет"
                        style={{ padding: '6px 9px', fontSize: '0.76rem', gap: '4px' }}
                        onClick={() => openEditSubjectModal(sub)}
                      >
                        <Edit2 size={13} color="var(--accent-cyan)" />
                        <span className="desktop-only">Редагувати</span>
                      </button>
                      <button
                        className="btn btn-secondary"
                        title="Видалити предмет"
                        style={{ padding: '6px 8px', color: 'var(--accent-rose)' }}
                        onClick={() => handleDeleteSubject(sub.id, sub.name)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}

                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => onStartSubjectDrill(sub.id)}
                  >
                    <Play size={14} />
                    <span>Тренувати</span>
                  </button>

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => toggleSubject(sub.id)}
                  >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Topics & Subtopics Tree */}
              {isExpanded && (
                <div style={{
                  padding: 'clamp(10px, 2.5vw, 16px) clamp(10px, 2.5vw, 18px) clamp(14px, 3vw, 20px) clamp(10px, 2.5vw, 18px)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sub.topics.map(topic => {
                      const topicQuestions = subQuestions.filter(q => q.topicId === topic.id);
                      const isQuestionsExpanded = !!expandedTopicQuestions[topic.id];
                      const activeSubFilter = topicSubtopicFilter[topic.id] || 'all';

                      const displayedQuestions = activeSubFilter === 'all'
                        ? topicQuestions
                        : topicQuestions.filter(q => q.subtopic === activeSubFilter);

                      return (
                        <div 
                          key={topic.id}
                          style={{
                            padding: '16px 18px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: isQuestionsExpanded ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid var(--border-subtle)',
                            boxShadow: isQuestionsExpanded ? '0 4px 20px rgba(0,0,0,0.25)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Topic Top Row */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="mono-code" style={{ fontSize: '0.74rem' }}>{topic.id}</span>
                              <strong style={{ fontSize: '0.96rem', color: '#ffffff' }}>{topic.name}</strong>
                              {!topic.isOfficial && (
                                <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>Додатково</span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {/* Toggle Questions Expand Button */}
                              <button
                                className="btn btn-secondary"
                                onClick={() => toggleTopicQuestions(topic.id)}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.76rem',
                                  gap: '5px',
                                  background: isQuestionsExpanded ? 'rgba(6, 182, 212, 0.15)' : undefined,
                                  borderColor: isQuestionsExpanded ? 'rgba(6, 182, 212, 0.4)' : undefined,
                                  color: isQuestionsExpanded ? 'var(--accent-cyan)' : undefined
                                }}
                              >
                                {isQuestionsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                <span>Питання ({topicQuestions.length})</span>
                              </button>

                              {canEdit && (
                                <>
                                  <button
                                    className="btn btn-primary"
                                    style={{ padding: '5px 10px', fontSize: '0.76rem', gap: '4px' }}
                                    onClick={() => openAddQuestionModal(sub.id, topic.id)}
                                    title={`Додати нове тестове питання до теми «${topic.name}»`}
                                  >
                                    <Plus size={13} />
                                    <span>Додати питання</span>
                                  </button>

                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '5px 9px', fontSize: '0.74rem', gap: '4px' }}
                                    onClick={() => openImportModal(sub.id, topic.id)}
                                    title={`Імпортувати запитання безпосередньо у тему «${topic.name}»`}
                                  >
                                    <Upload size={12} color="var(--accent-cyan)" />
                                    <span>Імпорт</span>
                                  </button>

                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '5px 8px', fontSize: '0.74rem', gap: '4px' }}
                                    onClick={() => openEditTopicModal(sub.id, topic)}
                                    title="Редагувати тему та підтеми"
                                  >
                                    <Edit3 size={12} color="var(--accent-cyan)" />
                                    <span>Редагувати</span>
                                  </button>

                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '5px 7px', color: 'var(--accent-rose)' }}
                                    onClick={() => handleDeleteTopic(sub.id, topic.id, topic.name)}
                                    title="Видалити тему"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Subtopics tags bar */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '2px' }}>
                              Підтеми:
                            </span>
                            {topic.subtopics.map((subtop, stIdx) => {
                              const subtopCount = topicQuestions.filter(q => q.subtopic === subtop).length;
                              const isSubFilterActive = activeSubFilter === subtop;

                              return (
                                <div
                                  key={stIdx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    borderRadius: '6px',
                                    background: isSubFilterActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                    border: isSubFilterActive ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    color: isSubFilterActive ? '#ffffff' : 'var(--text-secondary)',
                                    fontSize: '0.74rem',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      setTopicSubtopicFilter(prev => ({
                                        ...prev,
                                        [topic.id]: prev[topic.id] === subtop ? 'all' : subtop
                                      }));
                                      setExpandedTopicQuestions(prev => ({ ...prev, [topic.id]: true }));
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'inherit',
                                      padding: '3px 8px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      fontSize: 'inherit'
                                    }}
                                    title={`Фільтрувати питання за підтемою: ${subtop}`}
                                  >
                                    <span>• {subtop}</span>
                                    <span style={{
                                      fontSize: '0.65rem',
                                      background: 'rgba(255,255,255,0.1)',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      color: subtopCount > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)'
                                    }}>
                                      {subtopCount}
                                    </span>
                                  </button>

                                  {canEdit && (
                                    <button
                                      onClick={() => openAddQuestionModal(sub.id, topic.id, subtop)}
                                      title={`Додати запитання до підтеми «${subtop}» (Тема: ${topic.name})`}
                                      style={{
                                        background: 'rgba(6, 182, 212, 0.15)',
                                        border: 'none',
                                        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: 'var(--accent-cyan)',
                                        padding: '3px 7px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '2px'
                                      }}
                                    >
                                      <Plus size={11} />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* EXPANDED QUESTIONS LIST UNDER TOPIC */}
                          {isQuestionsExpanded && (
                            <div style={{
                              marginTop: '16px',
                              paddingTop: '16px',
                              borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                                    Банк тестових питань теми:
                                  </span>
                                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                    Показано {displayedQuestions.length} з {topicQuestions.length}
                                  </span>
                                  {activeSubFilter !== 'all' && (
                                    <button
                                      onClick={() => setTopicSubtopicFilter(prev => ({ ...prev, [topic.id]: 'all' }))}
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'var(--accent-cyan)',
                                        fontSize: '0.72rem',
                                        padding: '2px 6px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Скинути фільтр ({activeSubFilter} ✕)
                                    </button>
                                  )}
                                </div>

                                {canEdit && (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.74rem', gap: '4px' }}
                                      onClick={() => openImportModal(sub.id, topic.id, activeSubFilter !== 'all' ? activeSubFilter : undefined)}
                                      title="Імпортувати питання в цю тему/підтему"
                                    >
                                      <Upload size={12} color="var(--accent-cyan)" />
                                      <span>Імпортувати</span>
                                    </button>

                                    <button
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.74rem', gap: '4px', border: '1px dashed var(--accent-cyan)' }}
                                      onClick={() => openAddQuestionModal(sub.id, topic.id, activeSubFilter !== 'all' ? activeSubFilter : undefined)}
                                    >
                                      <Plus size={12} color="var(--accent-cyan)" />
                                      <span>Додати питання {activeSubFilter !== 'all' ? `у «${activeSubFilter}»` : ''}</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {displayedQuestions.length === 0 ? (
                                <div style={{
                                  padding: '20px',
                                  textAlign: 'center',
                                  background: 'rgba(0, 0, 0, 0.25)',
                                  borderRadius: 'var(--radius-md)',
                                  color: 'var(--text-muted)',
                                  fontSize: '0.84rem'
                                }}>
                                  Питань за цими критеріями ще немає. 
                                  {canEdit && (
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                      <button 
                                        className="btn btn-primary" 
                                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                                        onClick={() => openAddQuestionModal(sub.id, topic.id, activeSubFilter !== 'all' ? activeSubFilter : undefined)}
                                      >
                                        <Plus size={13} />
                                        <span>Створити перше запитання</span>
                                      </button>
                                      <button 
                                        className="btn btn-secondary" 
                                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                                        onClick={() => openImportModal(sub.id, topic.id, activeSubFilter !== 'all' ? activeSubFilter : undefined)}
                                      >
                                        <Upload size={13} />
                                        <span>Імпортувати з JSON</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                displayedQuestions.map((q, qIdx) => (
                                  <div
                                    key={q.id}
                                    style={{
                                      padding: '14px 16px',
                                      borderRadius: 'var(--radius-md)',
                                      background: 'rgba(15, 23, 42, 0.65)',
                                      border: '1px solid rgba(255, 255, 255, 0.06)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '10px'
                                    }}
                                  >
                                    {/* Question header row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span className="mono-code" style={{ fontSize: '0.7rem' }}>
                                          #{qIdx + 1} ({q.id})
                                        </span>
                                        <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>
                                          {q.subtopic || 'Загальне'}
                                        </span>
                                        <span
                                          className={`badge ${
                                            q.difficulty === 'Easy' ? 'badge-emerald' : q.difficulty === 'Hard' ? 'badge-rose' : 'badge-amber'
                                          }`}
                                          style={{ fontSize: '0.62rem' }}
                                        >
                                          {q.difficulty === 'Easy' ? 'Легке' : q.difficulty === 'Hard' ? 'Складне' : 'Середнє'}
                                        </span>
                                        <span className="badge badge-indigo" style={{ fontSize: '0.62rem' }}>
                                          {q.type}
                                        </span>
                                      </div>

                                      {canEdit && (
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                          <button
                                            className="btn btn-secondary"
                                            style={{ padding: '3px 8px', fontSize: '0.72rem', gap: '4px' }}
                                            onClick={() => openEditQuestionModal(q)}
                                            title="Редагувати це питання"
                                          >
                                            <Edit3 size={11} color="var(--accent-cyan)" />
                                            <span>Редагувати</span>
                                          </button>
                                          <button
                                            className="btn btn-secondary"
                                            style={{ padding: '3px 6px', color: 'var(--accent-rose)' }}
                                            onClick={() => handleDeleteQuestion(q.id, q.text)}
                                            title="Видалити це питання"
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Question text */}
                                    <div style={{ fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.45, fontWeight: 500 }}>
                                      {q.text}
                                    </div>

                                    {/* Question Options */}
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                                      width: '100%',
                                      minWidth: 0,
                                      gap: '8px',
                                      marginTop: '4px'
                                    }}>
                                      {[...q.options].sort((a, b) => a.id.localeCompare(b.id)).map(opt => {
                                        const isCorrect = opt.id === q.correctAnswer;
                                        return (
                                          <div
                                            key={opt.id}
                                            style={{
                                              padding: '8px 12px',
                                              borderRadius: '6px',
                                              background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                              border: isCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                                              display: 'flex',
                                              alignItems: 'flex-start',
                                              gap: '8px',
                                              fontSize: '0.82rem'
                                            }}
                                          >
                                            <span style={{
                                              fontWeight: 700,
                                              color: isCorrect ? 'var(--accent-emerald)' : 'var(--text-muted)',
                                              minWidth: '18px'
                                            }}>
                                              {opt.id})
                                            </span>
                                            <span style={{ color: isCorrect ? '#ffffff' : 'var(--text-secondary)', flex: 1 }}>
                                              {opt.text}
                                            </span>
                                            {isCorrect && (
                                              <CheckCircle2 size={14} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Explanation & Source footer */}
                                    {(q.explanation || q.source?.title) && (
                                      <div style={{
                                        marginTop: '4px',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        background: 'rgba(0, 0, 0, 0.25)',
                                        fontSize: '0.78rem',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                      }}>
                                        {q.explanation && (
                                          <div>
                                            <strong style={{ color: 'var(--accent-cyan)' }}>Обґрунтування: </strong>
                                            <span>{q.explanation}</span>
                                          </div>
                                        )}
                                        {q.source?.title && (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            <strong style={{ color: 'var(--accent-indigo)' }}>Джерело: </strong>
                                            <span>{q.source.title} {q.source.articleOrSection ? `(${q.source.articleOrSection})` : ''}</span>
                                            {q.source.url && (
                                              <a
                                                href={q.source.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                              >
                                                <span>відкрити</span>
                                                <ExternalLink size={10} />
                                              </a>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Button to add topic to this subject */}
                    {canEdit && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => openAddTopicModal(sub.id)}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '8px 14px',
                          fontSize: '0.82rem',
                          gap: '6px',
                          marginTop: '4px',
                          border: '1px dashed var(--accent-cyan)'
                        }}
                      >
                        <Plus size={14} color="var(--accent-cyan)" />
                        <span>Додати нову тему до предмету</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT SUBJECT */}
      {subjectModalData && (
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
            maxWidth: '560px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(16px, 4vw, 28px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {subjectModalData.mode === 'add' ? 'Додати новий предмет' : 'Редагувати предмет'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setSubjectModalData(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="responsive-two-col" style={{ gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Код предмету:
                  </label>
                  <input
                    type="text"
                    required
                    value={subFormCode}
                    onChange={(e) => setSubFormCode(e.target.value)}
                    placeholder="SEC-BASE"
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
                    Кластер ЄДКІ (1-7):
                  </label>
                  <select
                    value={subFormCluster}
                    onChange={(e) => setSubFormCluster(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.88rem'
                    }}
                  >
                    <option value={1}>1. Нормативна база (8-12%)</option>
                    <option value={2}>2. ІТ в кібербезпеці (14-18%)</option>
                    <option value={3}>3. Безпека ІКС (15-25%)</option>
                    <option value={4}>4. КСЗІ (8-10%)</option>
                    <option value={5}>5. Управління безпекою (16-20%)</option>
                    <option value={6}>6. Криптографія (11-15%)</option>
                    <option value={7}>7. ТЗІ (12-16%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Назва предмету:
                </label>
                <input
                  type="text"
                  required
                  value={subFormName}
                  onChange={(e) => setSubFormName(e.target.value)}
                  placeholder="Основи кібербезпеки..."
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
                  Опис предмету:
                </label>
                <textarea
                  rows={3}
                  value={subFormDesc}
                  onChange={(e) => setSubFormDesc(e.target.value)}
                  placeholder="Короткий опис змісту та охоплення програми..."
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="subFormOfficial"
                  checked={subFormOfficial}
                  onChange={(e) => setSubFormOfficial(e.target.checked)}
                  style={{ accentColor: 'var(--accent-cyan)' }}
                />
                <label htmlFor="subFormOfficial" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Входить до офіційної програми ЄДКІ
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSubjectModalData(null)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Check size={16} />
                  <span>Зберегти предмет</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT TOPIC */}
      {topicModalData && (
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
            maxWidth: '560px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(16px, 4vw, 28px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {topicModalData.mode === 'add' ? 'Додати нову тему' : 'Редагувати тему та підтеми'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setTopicModalData(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="responsive-two-col" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Номер/ID теми:
                  </label>
                  <input
                    type="text"
                    required
                    value={topicFormId}
                    onChange={(e) => setTopicFormId(e.target.value)}
                    placeholder="1.1"
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
                    Назва теми:
                  </label>
                  <input
                    type="text"
                    required
                    value={topicFormName}
                    onChange={(e) => setTopicFormName(e.target.value)}
                    placeholder="Конфіденційність, цілісність, доступність (CIA)"
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
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Підтеми (кожна підтема з нового рядка):
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Введіть назви підтем. До них можна додавати індивідуальні тестові запитання.
                </p>
                <textarea
                  rows={4}
                  value={topicFormSubtopicsText}
                  onChange={(e) => setTopicFormSubtopicsText(e.target.value)}
                  placeholder="Визначення кібербезпеки&#10;Стандарти захисту&#10;Цінність інформаційних активів"
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    lineHeight: '1.4'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="topicFormOfficial"
                  checked={topicFormOfficial}
                  onChange={(e) => setTopicFormOfficial(e.target.checked)}
                  style={{ accentColor: 'var(--accent-cyan)' }}
                />
                <label htmlFor="topicFormOfficial" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Офіційна тема програми ЄДКІ
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setTopicModalData(null)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Check size={16} />
                  <span>Зберегти тему</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT QUESTION */}
      {questionModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '780px',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  {questionModalData.mode === 'add' ? 'Додати тестове завдання' : 'Редагувати тестове завдання'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Заповніть форму та варіанти відповідей для бази знань ЄДКІ
                </p>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setQuestionModalData(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Prominent Context Banner showing Subject, Topic Name & Pre-selected Subtopic */}
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Предмет:</span>
                  <span className="mono-code" style={{ fontSize: '0.74rem' }}>{activeSubject?.code}</span>
                  <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{activeSubject?.name}</strong>
                </div>
                <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>Кластер {activeSubject?.clusterId}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Тема:</span>
                <span className="mono-code" style={{ fontSize: '0.76rem', background: 'rgba(6,182,212,0.2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
                  {activeModalTopic?.id}
                </span>
                <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                  {activeModalTopic?.name}
                </span>
              </div>

              {qSubtopic && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Обрана підтема:</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.76rem', padding: '3px 9px' }}>
                    🎯 {qSubtopic}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Subtopic selection & Type/Difficulty */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Підтема (оберіть із наявних або вкажіть власну):
                </label>
                
                {/* Clickable subtopic chips to select */}
                {activeModalTopic && activeModalTopic.subtopics.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {activeModalTopic.subtopics.map((st, i) => {
                      const isSelected = qSubtopic === st;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setQSubtopic(st)}
                          style={{
                            background: isSelected ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected && <Check size={12} color="var(--accent-cyan)" />}
                          <span>• {st}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <input
                  type="text"
                  required
                  placeholder="Вкажіть назву підтеми..."
                  value={qSubtopic}
                  onChange={(e) => setQSubtopic(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              {/* Difficulty & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Складність:
                  </label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as Difficulty)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.84rem'
                    }}
                  >
                    <option value="Easy">Легке (Базовий рівень)</option>
                    <option value="Medium">Середнє (Стандарт ЄДКІ)</option>
                    <option value="Hard">Складне (Поглиблений аналіз)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Тип запитання:
                  </label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.84rem'
                    }}
                  >
                    <option value="Official">Офіційне ЄДКІ</option>
                    <option value="Practice">Практичне завдання</option>
                    <option value="Previous year">Минулі роки</option>
                    <option value="AI-generated">Згенероване ШІ</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Формулювання запитання *
                </label>
                <textarea
                  required
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Введіть повний текст тестового запитання..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    lineHeight: 1.45
                  }}
                />
              </div>

              {/* Options A, B, C, D */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Варіанти відповідей (виберіть радіо-кнопкою правильний варіант):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(['A', 'B', 'C', 'D'] as OptionKey[]).map(key => {
                    const val = key === 'A' ? optA : key === 'B' ? optB : key === 'C' ? optC : optD;
                    const setter = key === 'A' ? setOptA : key === 'B' ? setOptB : key === 'C' ? setOptC : setOptD;
                    const isCorrect = correctAnswer === key;

                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                          border: isCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '6px 12px'
                        }}
                      >
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          color: isCorrect ? 'var(--accent-emerald)' : 'var(--text-muted)'
                        }}>
                          <input
                            type="radio"
                            name="correctAnswerOption"
                            checked={isCorrect}
                            onChange={() => setCorrectAnswer(key)}
                            style={{ accentColor: 'var(--accent-emerald)' }}
                          />
                          <span>{key}</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={`Варіант ${key}...`}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            padding: '6px 4px',
                            fontSize: '0.86rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Науково-технічне обґрунтування відповіді:
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Чому саме цей варіант є правильним згідно зі стандартами / нормами..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              {/* Regulatory Source */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Стандарт або Закон:
                  </label>
                  <input
                    type="text"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    placeholder="напр. ISO/IEC 27001 або ЗУ «Про кібербезпеку»"
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Стаття / Розділ:
                  </label>
                  <input
                    type="text"
                    value={sourceSection}
                    onChange={(e) => setSourceSection(e.target.value)}
                    placeholder="напр. Стаття 8, Пункт 2"
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Посилання на джерело (URL):
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://zakon.rada.gov.ua/..."
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setQuestionModalData(null)}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Check size={16} />
                  <span>{questionModalData.mode === 'add' ? 'Додати запитання' : 'Зберегти зміни'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT QUESTIONS (FILE OR JSON) */}
      {importModalData && importModalData.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)'
                }}>
                  <Upload size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Імпортувати тестові запитання</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Завантажте файл .json або вставте текст масиву питань
                  </p>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setImportModalData(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Target Destination Info */}
            {activeImportTopic && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Цільовий предмет:</span>
                  <strong style={{ fontSize: '0.84rem', color: '#ffffff' }}>{activeImportSubject?.name}</strong>
                  <span className="mono-code" style={{ fontSize: '0.7rem' }}>{activeImportSubject?.code}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Цільова тема:</span>
                  <span className="mono-code" style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>{activeImportTopic.id}</span>
                  <strong style={{ fontSize: '0.86rem', color: 'var(--accent-cyan)' }}>{activeImportTopic.name}</strong>
                </div>
                {importModalData.targetSubtopic && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Підтема:</span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>{importModalData.targetSubtopic}</span>
                  </div>
                )}
              </div>
            )}

            {/* Target destination mode toggle if pre-selected */}
            {activeImportTopic && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importTargetMode === 'selected'}
                    onChange={() => setImportTargetMode('selected')}
                    style={{ accentColor: 'var(--accent-cyan)' }}
                  />
                  <span>Прив'язати всі питання до цієї теми/підтеми</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="importMode"
                    checked={importTargetMode === 'auto'}
                    onChange={() => setImportTargetMode('auto')}
                    style={{ accentColor: 'var(--accent-cyan)' }}
                  />
                  <span>Брати тему та підтему з самого JSON</span>
                </label>
              </div>
            )}

            {/* File Upload Box */}
            <div
              style={{
                border: '2px dashed rgba(6, 182, 212, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
                marginBottom: '14px'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Upload size={28} color="var(--accent-cyan)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                Натисніть для вибору .JSON файлу з диска
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Файл повинен містити масив запитань із полями text, options, correctAnswer
              </div>
            </div>

            {/* Direct JSON input */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Або вставте текст JSON вручну:
                </label>
                <button
                  type="button"
                  onClick={handleDownloadSampleJson}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Download size={12} />
                  <span>Завантажити зразок формату</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => handleJsonTextChange(e.target.value)}
                placeholder='[&#10;  {&#10;    "text": "Текст тестового питання...",&#10;    "options": [&#10;      { "id": "A", "text": "Варіант 1" },&#10;      { "id": "B", "text": "Варіант 2" },&#10;      { "id": "C", "text": "Варіант 3" },&#10;      { "id": "D", "text": "Варіант 4" }&#10;    ],&#10;    "correctAnswer": "A",&#10;    "subtopic": "Назва підтеми",&#10;    "difficulty": "Medium"&#10;  }&#10;]'
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-code)',
                  fontFamily: 'monospace',
                  padding: '10px 12px',
                  fontSize: '0.8rem',
                  lineHeight: 1.4
                }}
              />
            </div>

            {/* Preview indicator */}
            {previewCount !== null && (
              <div style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: 'var(--accent-cyan)',
                fontSize: '0.82rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>У документі знайдено <strong>{previewCount}</strong> тестових завдань, готових до імпорту.</span>
              </div>
            )}

            {/* Status Alert */}
            {importStatus && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: importStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: importStatus.success ? '#34d399' : '#fb7185',
                border: `1px solid ${importStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                fontSize: '0.84rem',
                marginBottom: '14px'
              }}>
                {importStatus.message}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setImportModalData(null)}
              >
                Скасувати
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExecuteImport}
                disabled={!importJsonText.trim()}
                style={{ gap: '6px' }}
              >
                <Upload size={15} />
                <span>Імпортувати питання {previewCount ? `(${previewCount})` : ''}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FULL BACKUP (JSON) */}
      {showBackupModal && (
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
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileJson size={22} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Повне резервне копіювання
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowBackupModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              Ви можете завантажити повний архів бази знань, що включає всі {questions.length} тестових питань, історію тестувань та банк помилок.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-primary" onClick={handleDownloadBackup} style={{ padding: '12px 18px', gap: '8px', justifyContent: 'center' }}>
                <Download size={16} />
                <span>Завантажити повну копію бази (JSON)</span>
              </button>

              <button className="btn btn-secondary" onClick={() => { setShowBackupModal(false); openImportModal(); }} style={{ padding: '10px 18px', gap: '8px', justifyContent: 'center' }}>
                <Upload size={16} color="var(--accent-cyan)" />
                <span>Імпортувати запитання у базу</span>
              </button>

              <button className="btn btn-secondary" onClick={resetAllProgress} style={{ padding: '10px 18px', gap: '8px', justifyContent: 'center', color: 'var(--accent-amber)', marginTop: '8px' }}>
                <RotateCcw size={16} />
                <span>Скинути прогрес та спроби тестувань</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowBackupModal(false)}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
