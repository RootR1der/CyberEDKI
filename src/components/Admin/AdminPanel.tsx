import React, { useState } from 'react';
import {
  ShieldAlert,
  UserPlus,
  Key,
  Database,
  History,
  CheckCircle,
  Download,
  RotateCcw,
  Users,
  Settings,
  ShieldCheck,
  Trash2,
  Power,
  PowerOff,
  Eye,
  EyeOff,
  Copy,
  Search,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  FileText,
  Link as LinkIcon,
  Check,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEdki } from '../../context/EdkiContext';

export const AdminPanel: React.FC = () => {
  const {
    allUsers, academicGroups, auditLogs,
    addTeacher, addAcademicGroup, deleteAcademicGroup,
    updateUserStatus, resetUserPassword, deleteUser, switchUser, currentUser
  } = useAuth();
  const { exportBackupJson, resetAllProgress, questions, attempts } = useEdki();

  const [activeTab, setActiveTab] = useState<'teachers' | 'groups' | 'passwords' | 'attempts' | 'audit' | 'system'>('teachers');

  // New teacher state
  const [teacherName, setTeacherName] = useState('');
  const [department, setDepartment] = useState('Кафедра систем інформаційного та кіберзахисту');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  // Catalog management states
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState<Record<number, string>>({});
  const [showTeacherPass, setShowTeacherPass] = useState(false);

  // New group state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCourse, setNewGroupCourse] = useState(4);

  // Password reset state
  const [resetUserId, setResetUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [passwordUserSearch, setPasswordUserSearch] = useState('');
  const [passwordRoleFilter, setPasswordRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');

  // Search
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchAttempt, setSearchAttempt] = useState('');
  const [filterDisqualified, setFilterDisqualified] = useState<'all' | 'disqualified' | 'passed' | 'failed'>('all');

  const teachers = allUsers.filter(u => u.role === 'teacher' || u.role === 'admin');
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
    t.username.toLowerCase().includes(searchTeacher.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(searchTeacher.toLowerCase())
  );

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherUsername.trim() || !teacherPassword.trim()) {
      alert('Заповніть всі поля: ПІБ, Email, Логін та Пароль');
      return;
    }
    // Check username uniqueness
    if (allUsers.some(u => u.username.toLowerCase() === teacherUsername.trim().toLowerCase())) {
      alert(`Логін "${teacherUsername}" вже існує в системі. Оберіть інший.`);
      return;
    }
    const created = await addTeacher({
      name: teacherName.trim(),
      department,
      email: teacherEmail.trim(),
      username: teacherUsername.trim(),
      password: teacherPassword.trim()
    });
    setTeacherName('');
    setTeacherEmail('');
    setTeacherUsername('');
    setTeacherPassword('');
    alert(`Викладача "${created.name}" додано! Логін: ${created.username}`);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    addAcademicGroup(newGroupName.trim(), newGroupCourse);
    setNewGroupName('');
    alert(`Академічну групу ${newGroupName} зареєстровано в системі!`);
  };

  const handleDeleteGroup = (grp: { id: string; name: string; course: number }) => {
    const studentCount = allUsers.filter(u => u.role === 'student' && u.groupName === grp.name).length;
    const confirmMsg = studentCount > 0
      ? `Ви дійсно бажаєте видалити академічну групу "${grp.name}" (${grp.course} курс)? У ній зараз зареєстровано ${studentCount} студентів. Їхні акаунти залишаться в системі, але група буде видалена.`
      : `Видалити академічну групу "${grp.name}" (${grp.course} курс)? Цю дію неможливо скасувати.`;
    if (!confirm(confirmMsg)) return;
    deleteAcademicGroup(grp.id);
  };


  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setShowResetPass(true);
  };

  const eligiblePasswordUsers = allUsers.filter(u => u.id !== currentUser?.id);
  const filteredPasswordUsers = eligiblePasswordUsers.filter(u => {
    if (passwordRoleFilter !== 'all' && u.role !== passwordRoleFilter) return false;
    if (!passwordUserSearch.trim()) return true;
    const q = passwordUserSearch.trim().toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.groupName || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
    );
  });
  const selectedResetUser = allUsers.find(u => u.id === resetUserId);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !newPassword.trim()) return;
    if (newPassword.length < 6) {
      alert('Пароль має містити щонайменше 6 символів');
      return;
    }
    resetUserPassword(resetUserId, newPassword.trim());
    setResetUserId('');
    setNewPassword('');
    alert('Пароль успішно змінено!');
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      alert('Неможливо видалити поточний обліковий запис');
      return;
    }
    if (!confirm(`Видалити викладача "${userName}"? Цю дію неможливо скасувати.`)) return;
    deleteUser(userId);
  };

  // Input style helper
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(0,212,255,0.15)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Header */}
      <div className="glass-card" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(20, 10, 30, 0.9) 0%, rgba(14, 21, 38, 0.8) 100%)',
        border: '1px solid rgba(244, 63, 94, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldAlert size={28} color="var(--accent-rose)" />
          <h2 style={{ fontSize: '1.6rem' }}>Панель Головного Адміністратора</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '750px' }}>
          Найвищий рівень доступу: керування викладачами, академічними групами, обліковими записами, журналом аудиту та системними налаштуваннями.
        </p>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { key: 'teachers', label: `Викладачі (${teachers.length})`, icon: <UserPlus size={16} /> },
            { key: 'groups', label: `Групи (${academicGroups.length})`, icon: <Users size={16} /> },
            { key: 'passwords', label: 'Скидання пароля', icon: <Key size={16} color="var(--accent-cyan)" /> },
            { key: 'attempts', label: `Протоколи (${attempts.length})`, icon: <ShieldAlert size={16} color="var(--accent-rose)" /> },
            { key: 'audit', label: 'Журнал аудиту', icon: <History size={16} /> },
            { key: 'system', label: 'Система', icon: <Settings size={16} /> },
          ].map(tab => (
            <button
              key={tab.key}
              className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{ fontSize: '0.86rem' }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TEACHERS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'teachers' && (
        <div className="responsive-two-col" style={{ gap: '20px' }}>
          {/* Add New Teacher */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="var(--accent-rose)" />
              Додати викладача / модератора
            </h3>
            <form onSubmit={handleAddTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ПІБ викладача *</label>
                <input
                  style={inputStyle}
                  placeholder="доц. Прізвище Ім'я По-батькові"
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Кафедра</label>
                <select
                  style={{ ...inputStyle }}
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                >
                  <option>Кафедра систем інформаційного та кіберзахисту</option>
                  <option>Кафедра безпеки інформаційних технологій</option>
                  <option>Кафедра комп'ютерних наук</option>
                  <option>Кафедра прикладної математики</option>
                  <option>Кафедра програмної інженерії</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email *</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="name@university.edu.ua"
                  value={teacherEmail}
                  onChange={e => setTeacherEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Логін (для входу) *</label>
                <input
                  style={inputStyle}
                  placeholder="n.surname або email-prefix"
                  value={teacherUsername}
                  onChange={e => setTeacherUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Початковий пароль *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    type={showTeacherPass ? 'text' : 'password'}
                    placeholder="Мінімум 6 символів"
                    value={teacherPassword}
                    onChange={e => setTeacherPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowTeacherPass(v => !v)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    {showTeacherPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
                <UserPlus size={16} /> Додати викладача
              </button>
            </form>
          </div>

          {/* Teachers List */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--accent-indigo)" />
                Список викладачів ({filteredTeachers.length})
              </h3>
            </div>

            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                style={{ ...inputStyle, paddingLeft: '32px' }}
                placeholder="Пошук за ПІБ, логіном або email..."
                value={searchTeacher}
                onChange={e => setSearchTeacher(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
              {filteredTeachers.map(teacher => (
                <div key={teacher.id} style={{
                  padding: '12px 14px',
                  background: `rgba(255,255,255,0.03)`,
                  border: `1px solid ${teacher.isActive ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--text-primary)'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: teacher.role === 'admin' ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.15)',
                    border: `1px solid ${teacher.role === 'admin' ? 'rgba(244,63,94,0.4)' : 'rgba(99,102,241,0.4)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 700,
                    color: teacher.role === 'admin' ? 'var(--accent-rose)' : 'var(--accent-indigo)',
                    flexShrink: 0
                  }}>
                    {teacher.firstName?.[0] || '?'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{teacher.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      @{teacher.username} · {teacher.email}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px',
                        background: teacher.role === 'admin' ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.15)',
                        color: teacher.role === 'admin' ? 'var(--accent-rose)' : 'var(--accent-indigo)',
                        fontWeight: 600
                      }}>
                        {teacher.role === 'admin' ? '👑 Адмін' : '🎓 Викладач'}
                      </span>
                      <span style={{
                        fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px',
                        background: teacher.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: teacher.isActive ? 'var(--accent-emerald)' : '#f87171',
                        fontWeight: 600
                      }}>
                        {teacher.isActive ? '● Активний' : '○ Деактивований'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {teacher.id !== currentUser?.id && (
                      <>
                        <button
                          onClick={() => updateUserStatus(teacher.id, !teacher.isActive)}
                          title={teacher.isActive ? 'Деактивувати доступ' : 'Активувати доступ'}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                            color: teacher.isActive ? 'var(--accent-emerald)' : '#f87171',
                            borderRadius: '6px', display: 'flex', alignItems: 'center'
                          }}
                        >
                          {teacher.isActive ? <Power size={15} /> : <PowerOff size={15} />}
                        </button>
                        <button
                          onClick={() => {
                            setResetUserId(teacher.id);
                            setActiveTab('passwords');
                          }}
                          title="Скинути пароль"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                            color: 'var(--accent-cyan)', borderRadius: '6px', display: 'flex', alignItems: 'center'
                          }}
                        >
                          <Key size={15} />
                        </button>
                        {teacher.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(teacher.id, teacher.name)}
                            title="Видалити викладача"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: '5px',
                              color: 'var(--text-muted)', borderRadius: '6px', display: 'flex', alignItems: 'center'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GROUPS TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'groups' && (
        <div className="responsive-split-panel" style={{ gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--accent-cyan)" />
              Додати академічну групу
            </h3>
            <form onSubmit={handleAddGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Назва групи *</label>
                <input
                  style={inputStyle}
                  placeholder="КБ-51, ІБ-31..."
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Курс</label>
                <select style={inputStyle} value={newGroupCourse} onChange={e => setNewGroupCourse(+e.target.value)}>
                  {[1, 2, 3, 4, 5, 6].map(c => <option key={c} value={c}>{c} курс</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
                <Users size={16} /> Створити групу
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--accent-cyan)" />
                Академічні групи ({academicGroups.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Керування академічними групами та контингентом студентів
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              {academicGroups.map(grp => {
                const studentCount = allUsers.filter(u => u.role === 'student' && u.groupName === grp.name).length;

                return (
                  <div key={grp.id} style={{
                    padding: '20px',
                    background: 'rgba(14, 21, 38, 0.75)',
                    border: '1px solid rgba(0,212,255,0.18)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}>
                    {/* Header: Name, Course, Delete Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {grp.name}
                        </div>
                        <span style={{
                          fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px',
                          background: 'rgba(0, 212, 255, 0.12)', color: 'var(--accent-cyan)', fontWeight: 600,
                          border: '1px solid rgba(0, 212, 255, 0.25)'
                        }}>
                          {grp.course} курс
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(grp)}
                        title={`Видалити групу ${grp.name}`}
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171',
                          borderRadius: '6px',
                          padding: '5px 9px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Видалити</span>
                      </button>
                    </div>

                    <div style={{
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>Спеціальність:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{grp.specialty}</strong>
                    </div>

                    <div style={{
                      padding: '10px 12px',
                      background: 'rgba(0, 212, 255, 0.06)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 212, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: 'var(--accent-cyan)'
                    }}>
                      <span>Зареєстровано студентів:</span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>{studentCount}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOG TAB ────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: 'clamp(14px, 3.5vw, 24px)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(1rem, 3.5vw, 1.25rem)' }}>
              <History size={18} color="var(--accent-cyan)" />
              Системний журнал аудиту ({auditLogs.length} записів)
            </h3>
            <button className="btn btn-secondary" onClick={() => {
              const csv = ['Час,Користувач,Роль,Дія,Деталі',
                ...auditLogs.map(l => `"${new Date(l.timestamp).toLocaleString('uk-UA')}","${l.userName}","${l.userRole}","${l.action}","${l.details}"`)
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'audit_log.csv'; a.click();
            }} style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
              <Download size={14} /> Завантажити CSV
            </button>
          </div>

          {/* Desktop View: Structured rows */}
          <div className="desktop-block" style={{ flexDirection: 'column', gap: '6px', maxHeight: '550px', overflowY: 'auto' }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                fontSize: '0.83rem'
              }}>
                <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: '130px', fontSize: '0.78rem' }}>
                  {new Date(log.timestamp).toLocaleString('uk-UA')}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: '140px' }}>{log.userName}</div>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                  background: log.userRole === 'admin' ? 'rgba(244,63,94,0.2)' : log.userRole === 'teacher' ? 'rgba(99,102,241,0.2)' : 'rgba(0,212,255,0.15)',
                  color: log.userRole === 'admin' ? 'var(--accent-rose)' : log.userRole === 'teacher' ? 'var(--accent-indigo)' : 'var(--accent-cyan)'
                }}>
                  {log.userRole}
                </span>
                <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</span>
                  {log.details && <span style={{ color: 'var(--text-muted)' }}> — {log.details}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile View: Event Cards */}
          <div className="mobile-block" style={{ flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                fontSize: '0.83rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                    {new Date(log.timestamp).toLocaleString('uk-UA')}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                    background: log.userRole === 'admin' ? 'rgba(244,63,94,0.2)' : log.userRole === 'teacher' ? 'rgba(99,102,241,0.2)' : 'rgba(0,212,255,0.15)',
                    color: log.userRole === 'admin' ? 'var(--accent-rose)' : log.userRole === 'teacher' ? 'var(--accent-indigo)' : 'var(--accent-cyan)'
                  }}>
                    {log.userRole}
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  {log.userName}
                </div>
                <div style={{ fontSize: '0.82rem', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-cyan-light)' }}>{log.action}</span>
                  {log.details && <span style={{ color: 'var(--text-secondary)' }}> — {log.details}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PASSWORDS TAB (SEARCH & RESET) ────────────────────────────── */}
      {activeTab === 'passwords' && (
        <div className="responsive-split-panel" style={{ gap: '20px' }}>
          {/* Left panel: Search and Select User */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Search size={18} color="var(--accent-cyan)" />
                Пошук користувача
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Введіть ПІБ, логін, email або групу для швидкого пошуку
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} />
              <input
                style={{ ...inputStyle, paddingLeft: '36px', paddingRight: passwordUserSearch ? '36px' : '14px' }}
                placeholder="Пошук за ім'ям, логіном, групою..."
                value={passwordUserSearch}
                onChange={e => setPasswordUserSearch(e.target.value)}
              />
              {passwordUserSearch && (
                <button
                  type="button"
                  onClick={() => setPasswordUserSearch('')}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Role Filter Pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { key: 'all', label: `Всі (${eligiblePasswordUsers.length})` },
                { key: 'student', label: `Студенти (${eligiblePasswordUsers.filter(u => u.role === 'student').length})` },
                { key: 'teacher', label: `Викладачі (${eligiblePasswordUsers.filter(u => u.role === 'teacher').length})` },
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setPasswordRoleFilter(f.key as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: passwordRoleFilter === f.key ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.03)',
                    borderColor: passwordRoleFilter === f.key ? 'rgba(0,212,255,0.45)' : 'rgba(255,255,255,0.08)',
                    color: passwordRoleFilter === f.key ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Scrollable User Results */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '440px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {filteredPasswordUsers.length === 0 ? (
                <div style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}>
                  🔍 Користувачів за запитом "{passwordUserSearch}" не знайдено
                </div>
              ) : (
                filteredPasswordUsers.map(user => {
                  const isSelected = user.id === resetUserId;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setResetUserId(user.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(0, 212, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: user.role === 'teacher' ? 'rgba(99,102,241,0.2)' : 'rgba(0,212,255,0.2)',
                        border: `1px solid ${user.role === 'teacher' ? 'rgba(99,102,241,0.4)' : 'rgba(0,212,255,0.4)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.82rem', fontWeight: 700,
                        color: user.role === 'teacher' ? 'var(--accent-indigo)' : 'var(--accent-cyan)',
                        flexShrink: 0
                      }}>
                        {user.firstName?.[0] || user.name?.[0] || '?'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          @{user.username} {user.groupName ? `· Група ${user.groupName}` : ''}
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px',
                        background: user.role === 'teacher' ? 'rgba(99,102,241,0.15)' : 'rgba(0,212,255,0.15)',
                        color: user.role === 'teacher' ? 'var(--accent-indigo)' : 'var(--accent-cyan)',
                        fontWeight: 600
                      }}>
                        {user.role === 'teacher' ? 'Викладач' : 'Студент'}
                      </span>

                      {isSelected && (
                        <Check size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: Reset Password Form */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--accent-cyan)" />
              Встановлення нового пароля
            </h3>

            {selectedResetUser ? (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Selected user card */}
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(0, 212, 255, 0.08)',
                  border: '1px solid rgba(0, 212, 255, 0.25)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)'
                    }}>
                      {selectedResetUser.firstName?.[0] || selectedResetUser.name?.[0] || '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                        {selectedResetUser.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                        Логін: <strong>@{selectedResetUser.username}</strong> · {selectedResetUser.email}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {selectedResetUser.role === 'teacher' ? `Викладач (${selectedResetUser.department || 'Кафедра'})` : `Студент (Група ${selectedResetUser.groupName || 'Не вказана'})`}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setResetUserId('')}
                    style={{
                      background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '0.78rem', minHeight: '38px', flexShrink: 0
                    }}
                  >
                    Змінити вибір
                  </button>
                </div>

                {/* Password field */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Новий пароль *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      style={{
                        background: 'none', border: 'none', color: 'var(--accent-cyan)',
                        fontSize: '0.76rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Згенерувати безпечний пароль</span>
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inputStyle, paddingRight: '44px', fontFamily: showResetPass ? 'monospace' : 'inherit', fontSize: '1rem' }}
                      type={showResetPass ? 'text' : 'password'}
                      placeholder="Введіть новий пароль (мін. 6 символів)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPass(v => !v)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)', background: 'none', border: 'none',
                        cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
                      }}
                    >
                      {showResetPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px', fontSize: '0.92rem', marginTop: '6px' }}
                >
                  <Key size={16} /> Встановити новий пароль для {selectedResetUser.firstName || selectedResetUser.name}
                </button>
              </form>
            ) : (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--text-muted)'
              }}>
                <Search size={36} color="rgba(0,212,255,0.4)" />
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Користувача ще не обрано
                </div>
                <div style={{ fontSize: '0.82rem', maxWidth: '360px', lineHeight: 1.5 }}>
                  Скористайтеся швидким пошуком у лівій колонці, щоб обрати потрібного студента чи викладача, та введіть новий пароль.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SYSTEM TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'system' && (
        <div className="responsive-two-col" style={{ gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--accent-cyan)" />
              Керування паролями
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '18px' }}>
              Для швидкого пошуку користувача за ПІБ, логіном, email або групою та оновлення паролю використовуйте спеціалізовану вкладку «Скидання пароля».
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('passwords')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Search size={15} />
              <span>Перейти до пошуку та скидання пароля</span>
            </button>
          </div>

          {/* System stats + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} color="var(--accent-emerald)" />
                Статистика системи
              </h3>
              <div className="responsive-two-col" style={{ gap: '12px' }}>
                {[
                  { label: 'Питань у банку', value: questions.length, color: 'var(--accent-cyan)' },
                  { label: 'Академічних груп', value: academicGroups.length, color: 'var(--accent-emerald)' },
                  { label: 'Студентів', value: allUsers.filter(u => u.role === 'student').length, color: 'var(--accent-indigo)' },
                  { label: 'Викладачів', value: allUsers.filter(u => u.role === 'teacher').length, color: 'var(--accent-rose)' },
                  { label: 'Активних', value: allUsers.filter(u => u.isActive).length, color: 'var(--accent-emerald)' },
                  { label: 'Деактивованих', value: allUsers.filter(u => !u.isActive).length, color: '#f87171' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    padding: '12px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} />
                Системні дії
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const jsonStr = exportBackupJson();
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cyberedki_backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{ justifyContent: 'flex-start', gap: '10px' }}
                >
                  <Download size={16} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Резервна копія даних</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Зберегти питання та налаштування як JSON</div>
                  </div>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (resetAllProgress('all')) {
                      alert('Прогрес скинуто.');
                    }
                  }}
                  style={{ justifyContent: 'flex-start', gap: '10px', borderColor: 'rgba(244,63,94,0.3)' }}
                >
                  <RotateCcw size={16} color="var(--accent-rose)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Скинути статистику</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Видалити всі результати та помилки</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── ATTEMPTS & PROCTORING TAB ──────────────────────────────────── */}
      {activeTab === 'attempts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Stats */}
          <div className="grid-4" style={{ gap: '16px' }}>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{attempts.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Всього спроб</div>
            </div>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
                {attempts.filter(a => a.disqualified).length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Дискваліфіковано (Прокторинг)</div>
            </div>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {attempts.filter(a => a.passed && !a.disqualified).length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Успішно склали (≥60%)</div>
            </div>
            <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
                {attempts.filter(a => !a.passed && !a.disqualified).length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Не склали (&lt;60%)</div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="glass-card" style={{ padding: 'clamp(12px, 3vw, 16px)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 'min(100%, 240px)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                style={{ ...inputStyle, padding: '8px 12px' }}
                placeholder="Пошук за ПІБ студента, групою або назвою тесту..."
                value={searchAttempt}
                onChange={e => setSearchAttempt(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'Всі' },
                { key: 'disqualified', label: 'Порушення / Дискваліфікації' },
                { key: 'passed', label: 'Складено' },
                { key: 'failed', label: 'Не складено' }
              ].map(f => (
                <button
                  key={f.key}
                  className={`btn ${filterDisqualified === f.key ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  onClick={() => setFilterDisqualified(f.key as typeof filterDisqualified)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attempts List */}
          {(() => {
            const filteredAttempts = attempts.filter(a => {
              const matchesSearch =
                (a.studentName || '').toLowerCase().includes(searchAttempt.toLowerCase()) ||
                (a.groupName || '').toLowerCase().includes(searchAttempt.toLowerCase()) ||
                (a.title || '').toLowerCase().includes(searchAttempt.toLowerCase());
              if (!matchesSearch) return false;
              if (filterDisqualified === 'disqualified') return a.disqualified;
              if (filterDisqualified === 'passed') return a.passed && !a.disqualified;
              if (filterDisqualified === 'failed') return !a.passed && !a.disqualified;
              return true;
            });

            return (
              <div className="glass-card" style={{ padding: 'clamp(14px, 3.5vw, 24px)', width: '100%', boxSizing: 'border-box' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(1rem, 3.5vw, 1.25rem)' }}>
                  <ShieldAlert size={18} color="var(--accent-rose)" />
                  Журнал протоколів тестувань та прокторингу ({filteredAttempts.length})
                </h3>

                {filteredAttempts.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p>Не знайдено жодної спроби тестування за обраними критеріями.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop View: Table */}
                    <div className="desktop-block" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                      <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px 10px' }}>Студент / Група</th>
                            <th style={{ padding: '12px 10px' }}>Режим / Тест</th>
                            <th style={{ padding: '12px 10px' }}>Результат</th>
                            <th style={{ padding: '12px 10px' }}>Статус прокторингу</th>
                            <th style={{ padding: '12px 10px' }}>Причина / Порушення</th>
                            <th style={{ padding: '12px 10px' }}>Час початку та завершення</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAttempts.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '12px 10px' }}>
                                <div style={{ fontWeight: 600 }}>{a.studentName || 'Гість'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {a.groupName ? `Група: ${a.groupName}` : 'Без групи'}
                                </div>
                              </td>
                              <td style={{ padding: '12px 10px' }}>
                                <div style={{ fontWeight: 500 }}>{a.title}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                                  {a.mode === 'simulation' ? '⚡ Офіційна симуляція ЄДКІ' : a.mode}
                                </div>
                              </td>
                              <td style={{ padding: '12px 10px' }}>
                                <div style={{ fontWeight: 700, color: a.disqualified ? 'var(--accent-rose)' : a.passed ? 'var(--accent-emerald)' : '#f59e0b' }}>
                                  {a.disqualified ? '0%' : `${a.scorePercentage}%`}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {a.correctCount} / {a.totalQuestions} правильних
                                </div>
                              </td>
                              <td style={{ padding: '12px 10px' }}>
                                {a.disqualified ? (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '4px 8px', borderRadius: '4px',
                                    background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)',
                                    fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(244, 63, 94, 0.3)'
                                  }}>
                                    <AlertTriangle size={12} /> ДИСКВАЛІФІКОВАНО
                                  </span>
                                ) : a.passed ? (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '4px 8px', borderRadius: '4px',
                                    background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)',
                                    fontWeight: 600, fontSize: '0.75rem'
                                  }}>
                                    <CheckCircle size={12} /> Складено
                                  </span>
                                ) : (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '4px 8px', borderRadius: '4px',
                                    background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
                                    fontWeight: 600, fontSize: '0.75rem'
                                  }}>
                                    Не складено
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 10px', maxWidth: '300px' }}>
                                {a.disqualified ? (
                                  <div>
                                    <div style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.8rem' }}>
                                      {a.terminationReason || 'Порушення правил прокторингу'}
                                    </div>
                                    {a.violations && a.violations.length > 0 && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                                        {a.violations.map(v => (
                                          <div key={v.id} style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            • {v.description} ({new Date(v.timestamp).toLocaleTimeString('uk-UA')})
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Порушень не зафіксовано</span>
                                )}
                              </td>
                              <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                                  <Clock size={12} color="var(--text-muted)" />
                                  {a.startedAt ? new Date(a.startedAt).toLocaleString('uk-UA') : a.date}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Завершено: {a.completedAt ? new Date(a.completedAt).toLocaleTimeString('uk-UA') : '-'} (тривалість: {Math.floor(a.durationSeconds / 60)}хв {a.durationSeconds % 60}с)
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View: Protocol Cards */}
                    <div className="mobile-block" style={{ flexDirection: 'column', gap: '12px' }}>
                      {filteredAttempts.map(a => (
                        <div
                          key={a.id}
                          style={{
                            background: 'rgba(15, 23, 42, 0.7)',
                            border: `1px solid ${a.disqualified ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          {/* Header: Student & Status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#ffffff' }}>
                                {a.studentName || 'Гість'}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {a.groupName ? `Група: ${a.groupName}` : 'Без групи'}
                              </div>
                            </div>

                            <div>
                              {a.disqualified ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '3px 8px', borderRadius: '4px',
                                  background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)',
                                  fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(244, 63, 94, 0.3)'
                                }}>
                                  <AlertTriangle size={12} /> ДИСКВАЛІФІКОВАНО
                                </span>
                              ) : a.passed ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '3px 8px', borderRadius: '4px',
                                  background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)',
                                  fontWeight: 600, fontSize: '0.72rem'
                                }}>
                                  <CheckCircle size={12} /> Складено
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '3px 8px', borderRadius: '4px',
                                  background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
                                  fontWeight: 600, fontSize: '0.72rem'
                                }}>
                                  Не складено
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Test Title & Mode */}
                          <div style={{
                            padding: '8px 10px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.04)'
                          }}>
                            <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                              {a.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                              {a.mode === 'simulation' ? '⚡ Офіційна симуляція ЄДКІ' : a.mode}
                            </div>
                          </div>

                          {/* Stats Grid: Score & Time */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            paddingTop: '2px'
                          }}>
                            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>РЕЗУЛЬТАТ</div>
                              <div style={{
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                color: a.disqualified ? 'var(--accent-rose)' : a.passed ? 'var(--accent-emerald)' : '#f59e0b'
                              }}>
                                {a.disqualified ? '0%' : `${a.scorePercentage}%`}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {a.correctCount} / {a.totalQuestions} правильних
                              </div>
                            </div>

                            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ТРИВАЛІСТЬ</div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                                {Math.floor(a.durationSeconds / 60)}хв {a.durationSeconds % 60}с
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {a.startedAt ? new Date(a.startedAt).toLocaleTimeString('uk-UA') : ''}
                                {a.completedAt ? ` - ${new Date(a.completedAt).toLocaleTimeString('uk-UA')}` : ''}
                              </div>
                            </div>
                          </div>

                          {/* Violations / Reasons if any */}
                          {a.disqualified && (
                            <div style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              background: 'rgba(244, 63, 94, 0.08)',
                              border: '1px solid rgba(244, 63, 94, 0.25)',
                              fontSize: '0.78rem'
                            }}>
                              <div style={{ color: 'var(--accent-rose)', fontWeight: 700, marginBottom: '4px' }}>
                                {a.terminationReason || 'Порушення правил прокторингу'}
                              </div>
                              {a.violations && a.violations.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  {a.violations.map(v => (
                                    <div key={v.id} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                      • {v.description} ({new Date(v.timestamp).toLocaleTimeString('uk-UA')})
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Timestamp footer */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
                            <Clock size={12} />
                            <span>Дата: {a.startedAt ? new Date(a.startedAt).toLocaleDateString('uk-UA') : a.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};