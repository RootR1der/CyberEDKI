import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Lock, User, Eye, EyeOff, AlertCircle, ChevronRight,
  UserPlus, CheckCircle, Sparkles, Mail, ArrowLeft, Key, Check, Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

const transliterate = (text: string) => {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh',
    'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya'
  };
  return text.toLowerCase().split('').map(c => map[c] ?? c).join('').replace(/[^a-z0-9]/g, '');
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, allUsers, academicGroups, registerStudent, sendPasswordResetCode, resetPasswordByEmail } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<AuthMode>('login');

  // Shared state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }>>([]);
  const loginInputRef = useRef<HTMLInputElement>(null);

  // ── Login state ────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Registration state ─────────────────────────────────────────────────────
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(() => academicGroups[0]?.id || '');

  // ── Password recovery state ────────────────────────────────────────────────
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotSentCode, setForgotSentCode] = useState<string | null>(null);
  const [forgotTargetEmail, setForgotTargetEmail] = useState('');
  const [forgotCodeInput, setForgotCodeInput] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Background particles animation
  useEffect(() => {
    const pts = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 20 + 10
    }));
    setParticles(pts);
  }, []);

  // Set default group when academicGroups load
  useEffect(() => {
    if (!selectedGroupId && academicGroups.length > 0) {
      setSelectedGroupId(academicGroups[0].id);
    }
  }, [academicGroups, selectedGroupId]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    if (newMode === 'forgot') {
      setForgotStep(1);
      setForgotSentCode(null);
      setForgotCodeInput('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    }
  };

  // Auto-generate student username from name & group
  const handleAutoSuggestUsername = () => {
    if (!regLastName.trim()) return;
    const l = transliterate(regLastName.trim());
    const f = regFirstName.trim() ? transliterate(regFirstName.trim()).charAt(0) : '';
    const grp = academicGroups.find(g => g.id === selectedGroupId);
    const grpCode = grp?.name ? transliterate(grp.name).replace(/[^a-z0-9]/g, '') : '';
    const suggested = f ? `${l}.${f}${grpCode}` : `${l}${grpCode}`;
    setRegUsername(suggested);
  };

  // ── Handle Login ───────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Введіть логін та пароль');
      return;
    }

    setIsLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 400));

    const result = login(username, password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message);
    }
  };

  // ── Handle Registration ────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const group = academicGroups.find(g => g.id === selectedGroupId);
    if (!group) {
      setError('Будь ласка, оберіть академічну групу');
      return;
    }
    if (!regFirstName.trim() || !regLastName.trim()) {
      setError('Введіть прізвище та ім\'я');
      return;
    }
    const cleanUsername = regUsername.trim();
    if (!cleanUsername) {
      setError('Введіть логін для входу');
      return;
    }
    if (allUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      setError(`Логін "${cleanUsername}" уже зайнятий. Будь ласка, оберіть інший.`);
      return;
    }
    const cleanEmail = regEmail.trim();
    if (!cleanEmail) {
      setError('Введіть вашу електронну пошту (вона необхідна для відновлення пароля)');
      return;
    }
    if (allUsers.some(u => u.email && u.email.toLowerCase() === cleanEmail.toLowerCase())) {
      setError(`Користувач із поштою "${cleanEmail}" вже зареєстрований.`);
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Пароль має містити щонайменше 6 символів');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    setIsLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = registerStudent({
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      groupName: group.name,
      email: cleanEmail,
      username: cleanUsername,
      password: regPassword
    });

    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message);
    }
  };

  // ── Handle Password Recovery: Step 1 (Request Code) ────────────────────────
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setError('Введіть вашу пошту або логін');
      return;
    }

    setIsLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 500));

    const res = sendPasswordResetCode(forgotIdentifier);
    setIsLoading(false);

    if (res.success && res.code && res.email) {
      setForgotSentCode(res.code);
      setForgotTargetEmail(res.email);
      setForgotCodeInput(res.code);
      setForgotStep(2);
    } else {
      setError(res.message);
    }
  };

  // ── Handle Password Recovery: Step 2 (Verify Code & Save Password) ─────────
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCodeInput.trim()) {
      setError('Введіть 6-значний код підтвердження');
      return;
    }
    if (forgotCodeInput.trim() !== forgotSentCode) {
      setError('Невірний код підтвердження. Перевірте код або надішліть новий.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setError('Новий пароль має містити щонайменше 6 символів');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    setIsLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 500));

    const res = resetPasswordByEmail(forgotIdentifier, forgotNewPassword);
    setIsLoading(false);

    if (res.success) {
      setForgotStep(3);
    } else {
      setError(res.message);
    }
  };

  // Quick fill demo user credentials
  const fillDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Animated background gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '10%', width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'pulseGlow 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '8%', width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulseGlow 8s ease-in-out infinite reverse'
        }} />

        {/* Floating particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            opacity: p.opacity,
            animation: `floatUp ${p.speed}s linear infinite`,
            animationDelay: `${-Math.random() * p.speed}s`
          }} />
        ))}

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Main card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: mode === 'register' ? '500px' : '440px',
        margin: '16px auto',
        padding: '0 12px',
        zIndex: 10,
        transition: 'max-width 0.25s ease'
      }}>
        {/* Logo / Header with framed shield */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '24px',
            background: 'rgba(8, 14, 30, 0.85)',
            border: '2px solid rgba(0, 212, 255, 0.5)',
            boxShadow: '0 0 35px rgba(0, 212, 255, 0.3), 0 0 70px rgba(0, 212, 255, 0.1)',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(8,14,30,0.9) 50%, rgba(99,102,241,0.12) 100%)',
              border: '1px solid rgba(0, 212, 255, 0.25)'
            }}>
              <Shield size={30} color="#00d4ff" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))' }} />
            </div>
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px',
            letterSpacing: '-0.5px'
          }}>CyberEDKI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Платформа підготовки до ЄДКІ з кібербезпеки
          </p>
        </div>

        {/* Card content */}
        <div style={{
          background: 'rgba(14, 21, 38, 0.88)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(0,212,255,0.22)',
          borderRadius: '18px',
          padding: '24px 20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset'
        }}>

          {/* ═══════════════════════════════════════════════════════════════════
              MODE 1: LOGIN (ВХІД)
             ═══════════════════════════════════════════════════════════════════ */}
          {mode === 'login' && (
            <div>
              <div style={{ marginBottom: '22px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Вхід до системи
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Введіть ваш логін та пароль для входу в кабінет
                </p>
              </div>

              <form onSubmit={handleLoginSubmit}>
                {/* Username */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block', fontSize: '0.8rem', fontWeight: 600,
                    color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Логін
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)'
                    }} />
                    <input
                      ref={loginInputRef}
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(''); }}
                      placeholder="Введіть ваш логін"
                      autoComplete="username"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(0,212,255,0.15)'}`,
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Password with Forgot Password link */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{
                      fontSize: '0.8rem', fontWeight: 600,
                      color: 'var(--text-secondary)', letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>
                      Пароль
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--accent-cyan)', fontSize: '0.78rem',
                        cursor: 'pointer', padding: 0
                      }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Забули пароль?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)'
                    }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Введіть пароль"
                      autoComplete="current-password"
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(0,212,255,0.15)'}`,
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: '4px',
                        display: 'flex', alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 14px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    color: '#f87171',
                    fontSize: '0.85rem'
                  }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: isLoading
                      ? 'rgba(0,212,255,0.3)'
                      : 'linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,164,255,0.9))',
                    border: '1px solid rgba(0,212,255,0.4)',
                    borderRadius: '10px',
                    color: isLoading ? 'rgba(255,255,255,0.5)' : '#000',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isLoading ? 'Авторизація...' : (
                    <>
                      <span>Увійти</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo quick fill accounts */}
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{
                  fontSize: '0.72rem', color: 'var(--text-muted)',
                  marginBottom: '10px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  Швидкий вхід для тестування
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('AdM1n', 'te6tadm1N')}
                    style={{
                      padding: '7px 4px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: '8px',
                      color: '#f87171',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Адмін
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('Teacher', 'te6tTeac4')}
                    style={{
                      padding: '7px 4px',
                      background: 'rgba(139,92,246,0.1)',
                      border: '1px solid rgba(139,92,246,0.25)',
                      borderRadius: '8px',
                      color: '#a78bfa',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Викладач
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('Student', 'Stu2eNt')}
                    style={{
                      padding: '7px 4px',
                      background: 'rgba(0,212,255,0.1)',
                      border: '1px solid rgba(0,212,255,0.25)',
                      borderRadius: '8px',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Студент
                  </button>
                </div>
              </div>

              {/* Link to Register */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Ще не маєте облікового запису?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--accent-cyan)', fontSize: '0.82rem',
                    fontWeight: 700, cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  Зареєструватися
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              MODE 2: REGISTRATION (ЗВИЧАЙНА РЕЄСТРАЦІЯ БЕЗ ПОСИЛАНЬ)
             ═══════════════════════════════════════════════════════════════════ */}
          {mode === 'register' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserPlus size={18} color="var(--accent-cyan)" />
                    Реєстрація студента
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                    Оберіть вашу групу та заповніть реєстраційні дані
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <ArrowLeft size={14} />
                  <span>До входу</span>
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                {/* Academic Group Selector */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{
                    display: 'block', fontSize: '0.76rem', fontWeight: 600,
                    color: 'var(--text-secondary)', marginBottom: '5px'
                  }}>
                    Академічна група *
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={e => setSelectedGroupId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(0,212,255,0.25)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  >
                    {academicGroups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.course} курс · {g.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Last Name & First Name (2 columns on tablet/desktop, 1 column on phone) */}
                <div className="responsive-two-col" style={{ marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Прізвище *
                    </label>
                    <input
                      type="text"
                      placeholder="Шевченко"
                      value={regLastName}
                      onChange={e => setRegLastName(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(0,212,255,0.18)', borderRadius: '8px',
                        color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Ім'я *
                    </label>
                    <input
                      type="text"
                      placeholder="Тарас"
                      value={regFirstName}
                      onChange={e => setRegFirstName(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(0,212,255,0.18)', borderRadius: '8px',
                        color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Email (mandatory for recovery) */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Електронна пошта (для відновлення пароля) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      placeholder="student@stud.edu.ua"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px 9px 36px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(0,212,255,0.18)', borderRadius: '8px',
                        color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Username with generator */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      Логін для входу *
                    </label>
                    {(regLastName || regFirstName) && (
                      <button
                        type="button"
                        onClick={handleAutoSuggestUsername}
                        style={{
                          background: 'none', border: 'none', color: 'var(--accent-cyan)',
                          fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                        }}
                      >
                        <Sparkles size={12} />
                        <span>Згенерувати логін</span>
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="shevchenko.t"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px 9px 36px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(0,212,255,0.18)', borderRadius: '8px',
                        color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Password & Confirm (2 columns on desktop/tablet, 1 on mobile) */}
                <div className="responsive-two-col" style={{ marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Пароль *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Мін. 6 симв."
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        minLength={6}
                        style={{
                          width: '100%', padding: '9px 30px 9px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(0,212,255,0.18)', borderRadius: '8px',
                          color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(v => !v)}
                        style={{
                          position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
                        }}
                      >
                        {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Підтвердження *
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Повторіть"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      minLength={6}
                      style={{
                        width: '100%', padding: '9px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(0,212,255,0.18)', borderRadius: '8px',
                        color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '9px 12px', background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                    marginBottom: '14px', color: '#f87171', fontSize: '0.82rem'
                  }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%', padding: '12px',
                    background: isLoading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,164,255,0.9))',
                    border: '1px solid rgba(0,212,255,0.4)', borderRadius: '10px',
                    color: isLoading ? 'rgba(255,255,255,0.5)' : '#000',
                    fontSize: '0.92rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {isLoading ? 'Реєстрація...' : (
                    <>
                      <UserPlus size={16} />
                      <span>Зареєструватися та увійти</span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom link */}
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Вже маєте обліковий запис?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--accent-cyan)', fontSize: '0.82rem',
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Увійти
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              MODE 3: PASSWORD RECOVERY VIA EMAIL (ВІДНОВЛЕННЯ ПАРОЛЮ)
             ═══════════════════════════════════════════════════════════════════ */}
          {mode === 'forgot' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Key size={18} color="var(--accent-cyan)" />
                    Відновлення пароля
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                    {forgotStep === 1 && 'Введіть вашу пошту або логін для отримання коду'}
                    {forgotStep === 2 && 'Введіть код підтвердження та встановіть новий пароль'}
                    {forgotStep === 3 && 'Пароль успішно оновлено!'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <ArrowLeft size={14} />
                  <span>До входу</span>
                </button>
              </div>

              {/* STEP 1: Enter email / username */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestResetCode}>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Електронна пошта або логін *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="student@stud.edu.ua або Student"
                        value={forgotIdentifier}
                        onChange={e => { setForgotIdentifier(e.target.value); setError(''); }}
                        style={{
                          width: '100%', padding: '12px 14px 12px 38px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(0,212,255,0.2)', borderRadius: '10px',
                          color: 'var(--text-primary)', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box'
                        }}
                        required
                        autoFocus
                      />
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                      💡 <em>У тестовому середовищі перевірочний код генерується системою та з'явиться на наступному кроці.</em>
                    </div>
                  </div>

                  {error && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                      marginBottom: '16px', color: '#f87171', fontSize: '0.84rem'
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%', padding: '12px',
                      background: isLoading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,164,255,0.9))',
                      border: '1px solid rgba(0,212,255,0.4)', borderRadius: '10px',
                      color: isLoading ? 'rgba(255,255,255,0.5)' : '#000',
                      fontSize: '0.92rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {isLoading ? 'Надсилання коду...' : (
                      <>
                        <Mail size={16} />
                        <span>Отримати код відновлення</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter code & new password */}
              {forgotStep === 2 && (
                <form onSubmit={handleSaveNewPassword}>
                  {/* Notice badge explaining local email simulation */}
                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={15} />
                      <span>Код відновлення для: {forgotTargetEmail}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginBottom: '8px', lineHeight: 1.35 }}>
                      Оскільки сайт працює локально (без зовнішнього SMTP-сервера), реальний лист не надходить на поштову скриньку. Код згенеровано та автоматично вставлено у поле нижче:
                    </div>

                    {forgotSentCode && (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px',
                        border: '1px dashed rgba(16, 185, 129, 0.4)'
                      }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Ваш код: <strong style={{ color: '#fff', letterSpacing: '0.15em', fontSize: '1.05rem' }}>{forgotSentCode}</strong>
                        </span>
                        <span style={{
                          fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 600,
                          background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px'
                        }}>
                          ✓ Автоматично підставлено
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Verification code field */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      6-значний код підтвердження *
                    </label>
                    <input
                      type="text"
                      placeholder="Наприклад: 482910"
                      value={forgotCodeInput}
                      onChange={e => { setForgotCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      maxLength={6}
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(0,212,255,0.25)', borderRadius: '8px',
                        color: 'var(--text-primary)', fontSize: '1.1rem', letterSpacing: '0.2em',
                        textAlign: 'center', outline: 'none', boxSizing: 'border-box', fontWeight: 700
                      }}
                      required
                      autoFocus
                    />
                  </div>

                  {/* New password & confirm (2 columns on tablet/desktop, 1 column on phone) */}
                  <div className="responsive-two-col" style={{ marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Новий пароль *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showForgotPass ? 'text' : 'password'}
                          placeholder="Мін. 6 симв."
                          value={forgotNewPassword}
                          onChange={e => setForgotNewPassword(e.target.value)}
                          minLength={6}
                          style={{
                            width: '100%', padding: '9px 30px 9px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(0,212,255,0.18)', borderRadius: '8px',
                            color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotPass(v => !v)}
                          style={{
                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex'
                          }}
                        >
                          {showForgotPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Підтвердження *
                      </label>
                      <input
                        type={showForgotPass ? 'text' : 'password'}
                        placeholder="Повторіть"
                        value={forgotConfirmPassword}
                        onChange={e => setForgotConfirmPassword(e.target.value)}
                        minLength={6}
                        style={{
                          width: '100%', padding: '9px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(0,212,255,0.18)', borderRadius: '8px',
                          color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                      marginBottom: '16px', color: '#f87171', fontSize: '0.84rem'
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%', padding: '12px',
                      background: isLoading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,164,255,0.9))',
                      border: '1px solid rgba(0,212,255,0.4)', borderRadius: '10px',
                      color: isLoading ? 'rgba(255,255,255,0.5)' : '#000',
                      fontSize: '0.92rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {isLoading ? 'Збереження...' : (
                      <>
                        <Key size={16} />
                        <span>Зберегти новий пароль</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 3: Success Screen */}
              {forgotStep === 3 && (
                <div style={{ textAlign: 'center', padding: '14px 0' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)', border: '2px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px auto', color: 'var(--accent-emerald)'
                  }}>
                    <CheckCircle size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Пароль успішно змінено!
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '22px' }}>
                    Тепер ви можете увійти до системи з оновленими обліковими даними.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(forgotIdentifier);
                      setPassword(forgotNewPassword);
                      switchMode('login');
                    }}
                    style={{
                      width: '100%', padding: '12px',
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,164,255,0.9))',
                      border: '1px solid rgba(0,212,255,0.4)', borderRadius: '10px',
                      color: '#000', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <span>Перейти до входу</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Bottom return to login */}
              {forgotStep !== 3 && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '0.82rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-cyan)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    ← Повернутися до сторінки входу
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
