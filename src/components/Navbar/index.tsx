import React, { useState, useEffect } from 'react';
import {
  Shield,
  BookOpen,
  AlertOctagon,
  Library,
  Flame,
  LayoutDashboard,
  GraduationCap,
  Users,
  ShieldAlert,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useEdki } from '../../context/EdkiContext';
import { useAuth } from '../../context/AuthContext';

export type TabType = 
  | 'dashboard' 
  | 'clusters'
  | 'training' 
  | 'simulation' 
  | 'catalog' 
  | 'mistakes' 
  | 'sources' 
  | 'teacher'
  | 'admin_panel';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onStartExam: () => void;
  isQuizActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onStartExam: _onStartExam, isQuizActive = false }) => {
  const { analytics, mistakes } = useEdki();
  const { isTeacher, isAdmin, isStudent, currentUser, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeMistakesCount = Object.values(mistakes).filter(m => !m.isMastered).length;
  const roleLabel = isAdmin ? 'Адміністратор' : isTeacher ? 'Викладач' : 'Студент';
  const roleColor = isAdmin ? 'var(--accent-rose)' : isTeacher ? 'var(--accent-indigo)' : 'var(--accent-cyan)';

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* ─── MAIN STICKY TOP HEADER ─── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 12, 21, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(56, 89, 138, 0.28)',
        padding: '8px 16px'
      }}>
        <div style={{
          maxWidth: '1480px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Brand Logo */}
          <div 
            onClick={() => handleTabClick('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              minWidth: 0
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(99, 102, 241, 0.3) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.25)',
              flexShrink: 0
            }}>
              <Shield size={20} color="#06b6d4" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #ffffff 40%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  CyberEDKI
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                  125
                </span>
              </div>
              <p className="desktop-only" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Тренажер підготовки до ЄДКІ
              </p>
            </div>
          </div>

          {/* Desktop Navigation Bar (> 860px) */}
          <nav className="desktop-only" style={{
            alignItems: 'center',
            gap: '3px',
            background: 'rgba(14, 21, 38, 0.7)',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto'
          }}>
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => handleTabClick('dashboard')}
              icon={<LayoutDashboard size={15} />}
              label="Головна"
            />
            <NavButton 
              active={activeTab === 'clusters'} 
              onClick={() => handleTabClick('clusters')}
              icon={<Layers size={15} />}
              label="7 Кластерів"
            />
            <NavButton 
              active={activeTab === 'training'} 
              onClick={() => handleTabClick('training')}
              icon={<BookOpen size={15} />}
              label="Тренажер"
            />
            <NavButton 
              active={activeTab === 'simulation'} 
              onClick={() => handleTabClick('simulation')}
              icon={<GraduationCap size={15} />}
              label="Симуляція"
              highlight
            />
            <NavButton 
              active={activeTab === 'mistakes'} 
              onClick={() => handleTabClick('mistakes')}
              icon={<AlertOctagon size={15} />}
              label="Помилки"
              badgeCount={activeMistakesCount}
            />
            <NavButton 
              active={activeTab === 'catalog'} 
              onClick={() => handleTabClick('catalog')}
              icon={<Library size={15} />}
              label="Каталог"
            />
            <NavButton 
              active={activeTab === 'sources'} 
              onClick={() => handleTabClick('sources')}
              icon={<Flame size={15} />}
              label="Джерела"
            />

            {(isTeacher || isAdmin) && (
              <>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 3px' }} />
                <NavButton 
                  active={activeTab === 'teacher'} 
                  onClick={() => handleTabClick('teacher')}
                  icon={<Users size={15} color="var(--accent-indigo)" />}
                  label="Контроль"
                />
              </>
            )}

            {isAdmin && (
              <NavButton 
                active={activeTab === 'admin_panel'} 
                onClick={() => handleTabClick('admin_panel')}
                icon={<ShieldAlert size={15} color="var(--accent-rose)" />}
                label="Адмін"
              />
            )}
          </nav>

          {/* Right Header Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Student Readiness Badge (Visible on all screens) */}
            {isStudent && (
              <div 
                onClick={() => handleTabClick('dashboard')}
                title={`Ваш рівень готовності до ЄДКІ: ${analytics.readinessScore}%`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(18, 28, 48, 0.75)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Готовність
                  </div>
                  <div style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    color: analytics.readinessScore >= 60 ? 'var(--accent-emerald)' : 'var(--accent-cyan)'
                  }}>
                    {analytics.readinessScore}%
                  </div>
                </div>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: `conic-gradient(var(--accent-cyan) ${analytics.readinessScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#0e1526' }} />
                </div>
              </div>
            )}

            {/* Desktop User Profile + Logout */}
            {currentUser && (
              <div className="desktop-only" style={{
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(18, 28, 48, 0.7)',
                padding: '4px 8px 4px 6px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${roleColor}44, ${roleColor}22)`,
                  border: `1px solid ${roleColor}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: roleColor,
                  flexShrink: 0
                }}>
                  {currentUser.firstName?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: roleColor, fontWeight: 600 }}>
                    {roleLabel}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Вийти із системи"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '4px',
                    borderRadius: '6px', display: 'flex', alignItems: 'center'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button (<= 860px) */}
            <button
              className="mobile-only"
              onClick={() => setIsDrawerOpen(v => !v)}
              aria-label="Меню"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '10px',
                background: isDrawerOpen ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${isDrawerOpen ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                color: isDrawerOpen ? 'var(--accent-cyan)' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER (SIDE-OVER MENU) ─── */}
      {isDrawerOpen && (
        <div 
          className="mobile-drawer-overlay" 
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="mobile-drawer-sheet" 
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Top / Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#06b6d4" />
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>CyberEDKI</span>
                <span className="badge badge-cyan" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>125</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* User Profile Card */}
            {currentUser && (
              <div style={{
                background: 'rgba(18, 28, 48, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${roleColor}44, ${roleColor}22)`,
                  border: `1.5px solid ${roleColor}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: roleColor,
                  flexShrink: 0
                }}>
                  {currentUser.firstName?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.firstName} {currentUser.lastName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: roleColor,
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {roleLabel}
                    </span>
                    {currentUser.groupName && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {currentUser.groupName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Student Readiness Progress inside Drawer */}
            {isStudent && (
              <div style={{
                background: 'rgba(6, 182, 212, 0.06)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan-light)', fontWeight: 600 }}>
                    Готовність до ЄДКІ:
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: analytics.readinessScore >= 60 ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>
                    {analytics.readinessScore}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, analytics.readinessScore)}%`,
                    background: analytics.readinessScore >= 60 ? 'linear-gradient(90deg, #06b6d4, #10b981)' : '#06b6d4',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            )}

            {/* Navigation Tabs List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
              <button 
                className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleTabClick('dashboard')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LayoutDashboard size={18} color="var(--accent-cyan)" />
                  <span>Головна</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>

              <button 
                className={`mobile-nav-item ${activeTab === 'clusters' ? 'active' : ''}`}
                onClick={() => handleTabClick('clusters')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={18} color="var(--accent-cyan)" />
                  <span>7 Кластерів ЄДКІ</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>

              <button 
                className={`mobile-nav-item ${activeTab === 'training' ? 'active' : ''}`}
                onClick={() => handleTabClick('training')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={18} color="var(--accent-cyan)" />
                  <span>Тренажер тем</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>

              <button 
                className={`mobile-nav-item ${activeTab === 'simulation' ? 'active' : ''}`}
                onClick={() => handleTabClick('simulation')}
                style={{
                  background: activeTab === 'simulation' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)' : 'rgba(6, 182, 212, 0.05)',
                  borderColor: 'rgba(6, 182, 212, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GraduationCap size={18} color="var(--accent-cyan-light)" />
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>Симуляція ЄДКІ</span>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>100 питань</span>
              </button>

              <button 
                className={`mobile-nav-item ${activeTab === 'mistakes' ? 'active' : ''}`}
                onClick={() => handleTabClick('mistakes')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertOctagon size={18} color={activeTab === 'mistakes' ? 'var(--accent-cyan)' : activeMistakesCount > 0 ? '#fb7185' : 'var(--accent-rose)'} />
                  <span>Мої помилки</span>
                </div>
                {activeMistakesCount > 0 ? (
                  <span style={{
                    background: 'rgba(244, 63, 94, 0.25)',
                    color: '#fb7185',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 7px'
                  }}>
                    {activeMistakesCount}
                  </span>
                ) : (
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--accent-emerald)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '1px 6px',
                    borderRadius: '6px'
                  }}>
                    0
                  </span>
                )}
              </button>

              <button 
                className={`mobile-nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
                onClick={() => handleTabClick('catalog')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Library size={18} color="var(--text-secondary)" />
                  <span>Каталог тем</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>

              <button 
                className={`mobile-nav-item ${activeTab === 'sources' ? 'active' : ''}`}
                onClick={() => handleTabClick('sources')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Flame size={18} color="var(--accent-amber)" />
                  <span>Джерела та стандарти</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>

              {(isTeacher || isAdmin) && (
                <button 
                  className={`mobile-nav-item ${activeTab === 'teacher' ? 'active' : ''}`}
                  onClick={() => handleTabClick('teacher')}
                  style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={18} color="var(--accent-indigo)" />
                    <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Контроль навчання</span>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </button>
              )}

              {isAdmin && (
                <button 
                  className={`mobile-nav-item ${activeTab === 'admin_panel' ? 'active' : ''}`}
                  onClick={() => handleTabClick('admin_panel')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={18} color="var(--accent-rose)" />
                    <span style={{ color: '#fb7185', fontWeight: 600 }}>Адмін-панель</span>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </button>
              )}
            </div>

            {/* Logout Button in Drawer Footer */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '12px' }}>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  logout();
                }}
                className="btn btn-danger"
                style={{ width: '100%', padding: '12px', fontSize: '0.9rem', justifyContent: 'center' }}
              >
                <LogOut size={16} />
                <span>Вийти з облікового запису</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MOBILE BOTTOM NAVIGATION DOCK (STICKY 1-THUMB BAR) ─── */}
      {!isQuizActive && (
        <nav className="mobile-bottom-dock" aria-label="Мобільна навігація">
          <button
            className={`mobile-dock-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            <div className="dock-icon-box">
              <LayoutDashboard size={18} />
            </div>
            <span>Головна</span>
          </button>

          <button
            className={`mobile-dock-btn ${activeTab === 'clusters' ? 'active' : ''}`}
            onClick={() => handleTabClick('clusters')}
          >
            <div className="dock-icon-box">
              <Layers size={18} />
            </div>
            <span>Кластери</span>
          </button>

          <button
            className={`mobile-dock-btn ${activeTab === 'training' ? 'active' : ''}`}
            onClick={() => handleTabClick('training')}
          >
            <div className="dock-icon-box">
              <BookOpen size={18} />
            </div>
            <span>Тренажер</span>
          </button>

          <button
            className={`mobile-dock-btn ${activeTab === 'simulation' ? 'active' : ''}`}
            onClick={() => handleTabClick('simulation')}
          >
            <div className="dock-icon-box">
              <GraduationCap size={18} color={activeTab === 'simulation' ? 'var(--accent-cyan)' : '#38bdf8'} />
            </div>
            <span>ЄДКІ</span>
          </button>

          <button
            className={`mobile-dock-btn ${activeTab === 'mistakes' ? 'active' : ''}`}
            onClick={() => handleTabClick('mistakes')}
            aria-label="Помилки"
          >
            <div className="dock-icon-box">
              <AlertOctagon 
                size={18} 
                color={activeTab === 'mistakes' ? 'var(--accent-cyan)' : activeMistakesCount > 0 ? '#fb7185' : 'var(--text-secondary)'} 
              />
            </div>
            <span>Помилки</span>
            {activeMistakesCount > 0 ? (
              <span className="mobile-dock-badge">{activeMistakesCount}</span>
            ) : (
              <span className="mobile-dock-badge" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>0</span>
            )}
          </button>

          <button
            className={`mobile-dock-btn ${isDrawerOpen ? 'active' : ''}`}
            onClick={() => setIsDrawerOpen(true)}
          >
            <div className="dock-icon-box">
              <Menu size={18} />
            </div>
            <span>Меню</span>
          </button>
        </nav>
      )}
    </>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badgeCount?: number;
  highlight?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  badgeCount,
  highlight
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 11px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: active 
          ? (highlight ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)' : 'rgba(255, 255, 255, 0.08)')
          : 'transparent',
        color: active 
          ? (highlight ? 'var(--accent-cyan-light)' : '#ffffff') 
          : 'var(--text-secondary)',
        fontSize: '0.82rem',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        outline: 'none',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <span style={{ color: active ? 'var(--accent-cyan)' : 'inherit' }}>
        {icon}
      </span>
      <span>{label}</span>
      {typeof badgeCount === 'number' && badgeCount > 0 && (
        <span style={{
          marginLeft: '4px',
          background: 'rgba(244, 63, 94, 0.25)',
          color: '#fb7185',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: '999px',
          fontSize: '0.65rem',
          fontWeight: 700,
          padding: '1px 5px',
          lineHeight: '1.2'
        }}>
          {badgeCount}
        </span>
      )}
    </button>
  );
};
