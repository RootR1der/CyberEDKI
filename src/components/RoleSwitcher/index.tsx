import React, { useState } from 'react';
import {
  User,
  Users,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, allUsers, switchUser, isStudent, isTeacher, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Current User Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          background: isAdmin 
            ? 'rgba(244, 63, 94, 0.15)' 
            : isTeacher 
              ? 'rgba(99, 102, 241, 0.15)' 
              : 'rgba(6, 182, 212, 0.12)',
          border: `1px solid ${isAdmin ? 'rgba(244, 63, 94, 0.4)' : isTeacher ? 'rgba(99, 102, 241, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
          cursor: 'pointer',
          color: '#ffffff',
          outline: 'none',
          fontSize: '0.82rem'
        }}
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isAdmin ? 'var(--accent-rose)' : isTeacher ? 'var(--accent-indigo)' : 'var(--accent-cyan)',
          color: '#080c15',
          fontWeight: 800,
          fontSize: '0.72rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isAdmin ? 'A' : isTeacher ? 'В' : 'С'}
        </div>

        <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
          <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            {currentUser.name}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {isAdmin ? 'Головний Адмін' : isTeacher ? 'Викладач' : `Студент (${currentUser.groupName || '125'})`}
          </div>
        </div>

        <ChevronDown size={14} color="var(--text-muted)" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="glass-card"
            style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              width: '320px',
              zIndex: 100,
              padding: '12px',
              border: '1px solid var(--border-glow)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', padding: '0 4px' }}>
              Швидке перемикання ролей:
            </div>

            {/* Admin */}
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-rose)', fontWeight: 600, padding: '4px 6px' }}>
              АДМІНІСТРАТОР
            </div>
            {allUsers.filter(u => u.role === 'admin').map(u => (
              <button
                key={u.id}
                onClick={() => { switchUser(u.id); setIsOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: currentUser.id === u.id ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  color: currentUser.id === u.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Всі привілеї + модерація</div>
                </div>
                {currentUser.id === u.id && <UserCheck size={16} color="var(--accent-rose)" />}
              </button>
            ))}

            {/* Teachers */}
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', fontWeight: 600, padding: '8px 6px 4px 6px' }}>
              ВИКЛАДАЧІ
            </div>
            {allUsers.filter(u => u.role === 'teacher').map(u => (
              <button
                key={u.id}
                onClick={() => { switchUser(u.id); setIsOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: currentUser.id === u.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: currentUser.id === u.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Кафедральний контроль</div>
                </div>
                {currentUser.id === u.id && <UserCheck size={16} color="var(--accent-indigo)" />}
              </button>
            ))}

            {/* Students */}
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600, padding: '8px 6px 4px 6px' }}>
              СТУДЕНТИ (ЗА ГРУПАМИ)
            </div>
            {allUsers.filter(u => u.role === 'student').map(u => (
              <button
                key={u.id}
                onClick={() => { switchUser(u.id); setIsOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: currentUser.id === u.id ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: currentUser.id === u.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Група {u.groupName || '125'}</div>
                </div>
                {currentUser.id === u.id && <UserCheck size={16} color="var(--accent-cyan)" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
