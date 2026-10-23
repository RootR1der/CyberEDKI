import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Search,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Layers,
  Award,
  Key,
  Power,
  PowerOff,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEdki } from '../../context/EdkiContext';
import { AppUser } from '../../types/edki';

interface TeacherDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigateTab }) => {
  const { allUsers, academicGroups, addStudent, bulkAddStudents, updateUserStatus, resetUserPassword, deleteUser, isTeacher, isAdmin, currentUser } = useAuth();
  const { attempts, mistakes, questions } = useEdki();

  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);

  // Single student form
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newGroupName, setNewGroupName] = useState(academicGroups[0]?.name || 'КБ-41');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Bulk form
  const [bulkGroup, setBulkGroup] = useState(academicGroups[0]?.name || 'КБ-41');
  const [bulkText, setBulkText] = useState('');

  // Password reset
  const [resetStudentId, setResetStudentId] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);

  // Filter students
  const students = allUsers.filter(u => u.role === 'student');
  const filteredStudents = students.filter(s => {
    if (selectedGroupFilter !== 'all' && s.groupName !== selectedGroupFilter) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || (s.groupName && s.groupName.toLowerCase().includes(q));
    }
    return true;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim() || !newUsername.trim() || !newPassword.trim()) {
      alert('Заповніть всі поля');
      return;
    }
    if (allUsers.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert(`Логін "${newUsername}" вже зайнятий`);
      return;
    }
    const student = addStudent({
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      groupName: newGroupName,
      username: newUsername.trim(),
      password: newPassword.trim()
    });
    setNewFirstName('');
    setNewLastName('');
    setNewUsername('');
    setNewPassword('');
    setShowAddStudentModal(false);
    alert(`Студента додано! Логін: ${student.username}`);
  };

  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    const names = bulkText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    const count = bulkAddStudents(bulkGroup, names);
    alert(`Успішно імпортовано ${count} студентів до групи ${bulkGroup}`);
    setBulkText('');
    setShowBulkAddModal(false);
  };

  // Group Quality Analytics calculation
  const getStudentStats = (student: AppUser) => {
    const studentAttempts = attempts.filter(a => a.userId === student.id);
    const completedCount = studentAttempts.length;
    const avgScore = completedCount > 0
      ? Math.round(studentAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) / completedCount)
      : 0;

    const simulationAttempts = studentAttempts.filter(a => a.mode === 'simulation');
    const hasPassedSimulation = simulationAttempts.some(a => a.passed);
    const studentMistakes = Object.values(mistakes).filter(m => m.userId === student.id && !m.isMastered).length;

    return {
      completedCount,
      avgScore,
      hasPassedSimulation,
      simulationCount: simulationAttempts.length,
      activeMistakes: studentMistakes,
      lastAttempt: studentAttempts[0]
    };
  };

  // Overall Group Stats
  const targetStudents = selectedGroupFilter === 'all' 
    ? students 
    : students.filter(s => s.groupName === selectedGroupFilter);

  const groupCompletedAttempts = attempts.filter(a => 
    selectedGroupFilter === 'all' || a.groupName === selectedGroupFilter
  );

  const groupAvgScore = groupCompletedAttempts.length > 0
    ? Math.round(groupCompletedAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) / groupCompletedAttempts.length)
    : 0;

  const passedStudentsCount = targetStudents.filter(s => {
    const stats = getStudentStats(s);
    return stats.hasPassedSimulation;
  }).length;

  const readinessPercent = targetStudents.length > 0
    ? Math.round((passedStudentsCount / targetStudents.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header bar */}
      <div className="glass-card" style={{
        padding: 'clamp(16px, 4vw, 28px) clamp(14px, 4vw, 24px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.9) 0%, rgba(20, 35, 65, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <GraduationCap size={28} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}>Панель контролю якості навчання та кафедрального моніторингу</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.55 }}>
            Моніторинг готовності студентів за групами (КБ-41, КБ-42 тощо), контроль успішності симуляцій ЄДКІ, виявлення загальних слабких тем та наповнення бази тестів.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowAddStudentModal(true)}
            style={{ padding: '8px 14px', fontSize: '0.86rem' }}
          >
            <Plus size={16} />
            <span>Додати студента</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowBulkAddModal(true)}
            style={{ padding: '8px 14px', fontSize: '0.86rem' }}
          >
            <Users size={16} />
            <span>Імпорт групи списком</span>
          </button>
        </div>
      </div>

      {/* Quality Control Metrics */}
      <div className="grid-4">
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            Всього студентів на обліку
          </div>
          <div style={{ fontSize: 'clamp(1.6rem, 5vw, 2.3rem)', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
            {targetStudents.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Груп: {academicGroups.length} (КБ-41, КБ-42, КБ-31)
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            Середній бал групи
          </div>
          <div style={{ fontSize: 'clamp(1.6rem, 5vw, 2.3rem)', fontWeight: 800, color: groupAvgScore >= 60 ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginBottom: '4px' }}>
            {groupAvgScore}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Прохідний норматив: 60%
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            Склали симуляцію ЄДКІ
          </div>
          <div style={{ fontSize: 'clamp(1.6rem, 5vw, 2.3rem)', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
            {passedStudentsCount} / {targetStudents.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Рівень готовності: <strong style={{ color: 'var(--accent-cyan)' }}>{readinessPercent}%</strong>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            База завдань ЄДКІ
          </div>
          <div style={{ fontSize: 'clamp(1.6rem, 5vw, 2.3rem)', fontWeight: 800, color: 'var(--accent-indigo)', marginBottom: '4px' }}>
            {questions.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            За 7 офіційними кластерами
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card" style={{ padding: 'clamp(12px, 3vw, 18px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>Група:</span>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            style={{
              background: 'rgba(14, 21, 38, 0.9)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              outline: 'none'
            }}
          >
            <option value="all">Усі академічні групи</option>
            {academicGroups.map(g => (
              <option key={g.id} value={g.name}>{g.name} ({g.course} курс)</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 220px)', width: '100%' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Пошук студента за ПІБ..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(14, 21, 38, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              padding: '8px 12px 8px 34px',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Students Performance Table */}
      <div className="glass-card" style={{ padding: 'clamp(14px, 3vw, 24px)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Журнал успішності студентів ({filteredStudents.length})</h3>
        </div>

        {/* Desktop Table View */}
        <div className="desktop-block" style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Студент (ПІБ / логін)</th>
                <th style={{ padding: '12px 16px' }}>Група</th>
                <th style={{ padding: '12px 16px' }}>Пройдено тестів</th>
                <th style={{ padding: '12px 16px' }}>Середній бал</th>
                <th style={{ padding: '12px 16px' }}>Симуляція ЄДКІ</th>
                <th style={{ padding: '12px 16px' }}>Активні помилки</th>
                <th style={{ padding: '12px 16px' }}>Остання активність</th>
                <th style={{ padding: '12px 16px' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const stats = getStudentStats(student);

                return (
                  <tr 
                    key={student.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--accent-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.78rem'
                        }}>
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <div>{student.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-indigo">{student.groupName || '—'}</span>
                      {!student.isActive && <span style={{ marginLeft: '4px', fontSize: '0.68rem', color: '#f87171', fontWeight: 600 }}>⊘ Деакт.</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {stats.completedCount} тестів
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontWeight: 700,
                        color: stats.avgScore >= 60 ? 'var(--accent-emerald)' : (stats.completedCount > 0 ? 'var(--accent-rose)' : 'var(--text-muted)')
                      }}>
                        {stats.completedCount > 0 ? `${stats.avgScore}%` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {stats.hasPassedSimulation ? (
                        <span className="badge badge-emerald">
                          <CheckCircle size={13} /> Складено
                        </span>
                      ) : stats.simulationCount > 0 ? (
                        <span className="badge badge-rose">
                          <XCircle size={13} /> Не складено
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                          Не проходив
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {stats.activeMistakes > 0 ? (
                        <span style={{ color: '#fb7185', fontWeight: 600 }}>{stats.activeMistakes} у черзі</span>
                      ) : (
                        <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>0 помилок</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {stats.lastAttempt ? new Date(stats.lastAttempt.date).toLocaleDateString('uk-UA') : 'Нещодавно доданий'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => updateUserStatus(student.id, !student.isActive)}
                          title={student.isActive ? 'Деактивувати доступ' : 'Активувати доступ'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: student.isActive ? 'var(--accent-emerald)' : '#f87171', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                        >
                          {student.isActive ? <Power size={14} /> : <PowerOff size={14} />}
                        </button>
                        <button
                          onClick={() => {
                            const pwd = prompt(`Новий пароль для ${student.name}:`);
                            if (pwd && pwd.length >= 6) { resetUserPassword(student.id, pwd); alert('Пароль оновлено!'); }
                            else if (pwd) alert('Пароль має бути не менше 6 символів');
                          }}
                          title="Скинути пароль"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                        >
                          <Key size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (!confirm(`Видалити студента ${student.name}?`)) return;
                            deleteUser(student.id);
                          }}
                          title="Видалити студента"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mobile-block" style={{ flexDirection: 'column', gap: '12px' }}>
          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Студентів не знайдено за заданими фільтрами.
            </div>
          ) : (
            filteredStudents.map(student => {
              const stats = getStudentStats(student);
              return (
                <div
                  key={student.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: 'var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        flexShrink: 0
                      }}>
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.92rem', wordBreak: 'break-word' }}>{student.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{student.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span className="badge badge-indigo">{student.groupName || '—'}</span>
                      {!student.isActive && <span style={{ fontSize: '0.68rem', color: '#f87171', fontWeight: 600 }}>⊘ Деакт.</span>}
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Тестів: </span>
                      <strong style={{ color: '#ffffff' }}>{stats.completedCount}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Сер. бал: </span>
                      <strong style={{ color: stats.avgScore >= 60 ? 'var(--accent-emerald)' : (stats.completedCount > 0 ? 'var(--accent-rose)' : 'var(--text-muted)') }}>
                        {stats.completedCount > 0 ? `${stats.avgScore}%` : '—'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Симуляція: </span>
                      {stats.hasPassedSimulation ? (
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Складено</span>
                      ) : stats.simulationCount > 0 ? (
                        <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>Не складено</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Помилок: </span>
                      <strong style={{ color: stats.activeMistakes > 0 ? '#fb7185' : 'var(--accent-emerald)' }}>
                        {stats.activeMistakes}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <button
                      onClick={() => updateUserStatus(student.id, !student.isActive)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px', minHeight: '34px' }}
                    >
                      {student.isActive ? <Power size={13} color="var(--accent-emerald)" /> : <PowerOff size={13} color="#f87171" />}
                      <span>{student.isActive ? 'Активний' : 'Деактивовано'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const pwd = prompt(`Новий пароль для ${student.name}:`);
                        if (pwd && pwd.length >= 6) { resetUserPassword(student.id, pwd); alert('Пароль оновлено!'); }
                        else if (pwd) alert('Пароль має бути не менше 6 символів');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px', minHeight: '34px' }}
                    >
                      <Key size={13} color="var(--accent-cyan)" />
                      <span>Пароль</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!confirm(`Видалити студента ${student.name}?`)) return;
                        deleteUser(student.id);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 8px', color: 'var(--accent-rose)', minHeight: '34px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Single Student Modal */}
      {showAddStudentModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 110, padding: '20px'
        }}>
          <form onSubmit={handleCreateStudent} className="glass-card modal-dialog-responsive" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Додати нового студента</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Логін та пароль будуть використовуватись студентом для входу в систему.
            </p>

            <div className="responsive-two-col" style={{ marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Прізвище *</label>
                <input
                  type="text" required
                  placeholder="Ковальчук"
                  value={newLastName}
                  onChange={e => setNewLastName(e.target.value)}
                  style={{ width: '100%', background: 'rgba(14,21,38,0.9)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff', padding: '10px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ім'я *</label>
                <input
                  type="text" required
                  placeholder="Ярослав"
                  value={newFirstName}
                  onChange={e => setNewFirstName(e.target.value)}
                  style={{ width: '100%', background: 'rgba(14,21,38,0.9)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff', padding: '10px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Академічна група *</label>
              <select
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                style={{ width: '100%', background: 'rgba(14,21,38,0.9)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff', padding: '10px' }}
              >
                {academicGroups.map(g => (
                  <option key={g.id} value={g.name}>{g.name} ({g.course} курс)</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Логін для входу *</label>
              <input
                type="text" required
                placeholder="y.kovalchuk.kb41"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                style={{ width: '100%', background: 'rgba(14,21,38,0.9)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff', padding: '10px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Початковий пароль *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required minLength={6}
                  placeholder="Мінімум 6 символів"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%', background: 'rgba(14,21,38,0.9)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff', padding: '10px', paddingRight: '40px', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowNewPass(v => !v)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Студент зможе увійти з цими даними. Пароль можна змінити пізніше.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddStudentModal(false)}>Скасувати</button>
              <button type="submit" className="btn btn-primary">Зберегти студента</button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Add Students Modal */}
      {showBulkAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 110, padding: '20px'
        }}>
          <form onSubmit={handleBulkAdd} className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Груповий імпорт студентів списком</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Вставте ПІБ студентів (кожен студент з нового рядка):
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Оберіть групу для зарахування:</label>
              <select
                value={bulkGroup}
                onChange={e => setBulkGroup(e.target.value)}
                style={{ width: '100%', background: 'rgba(14,21,38,0.9)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff', padding: '10px' }}
              >
                {academicGroups.map(g => (
                  <option key={g.id} value={g.name}>{g.name} ({g.course} курс)</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <textarea
                rows={6}
                required
                placeholder="Іваненко Петро Сергійович&#10;Сидоренко Катерина Олексіївна&#10;Марченко Богдан Юрійович"
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                style={{ width: '100%', background: 'rgba(14,21,38,0.9)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: '#ffffff', padding: '10px', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowBulkAddModal(false)}>Скасувати</button>
              <button type="submit" className="btn btn-primary">Імпортувати список</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
