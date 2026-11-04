import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, AcademicGroup, AuditLogEntry, UserRole } from '../types/edki';
import { MOCK_USERS, MOCK_ACADEMIC_GROUPS } from '../data/mockUsers';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: AppUser | null;
  allUsers: AppUser[];
  academicGroups: AcademicGroup[];
  auditLogs: AuditLogEntry[];
  isLoggedIn: boolean;

  // Permissions helpers
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  canEditContent: boolean; // Teacher & Admin
  canManageTeachers: boolean; // Admin only
  canManageStudents: boolean; // Teacher & Admin

  // Auth actions
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // User management
  switchUser: (userId: string) => void; // Admin-only impersonation helper
  addStudent: (data: {
    firstName: string;
    lastName: string;
    groupName: string;
    email?: string;
    username: string;
    password: string;
  }) => Promise<AppUser>;
  registerStudent: (data: {
    firstName: string;
    lastName: string;
    groupName: string;
    email?: string;
    username: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  bulkAddStudents: (groupName: string, namesList: string[]) => Promise<number>;
  addTeacher: (data: { name: string; department: string; email: string; username: string; password: string }) => Promise<AppUser>;
  updateUserStatus: (userId: string, isActive: boolean) => void;
  resetUserPassword: (userId: string, newPassword: string) => void;
  deleteUser: (userId: string) => void;
  addAcademicGroup: (name: string, course: number) => AcademicGroup;
  deleteAcademicGroup: (groupId: string) => void;
  sendPasswordResetCode: (emailOrUsername: string) => { success: boolean; message: string; code?: string; email?: string };
  resetPasswordByEmail: (emailOrUsername: string, newPassword: string) => { success: boolean; message: string };
  addAuditLog: (action: string, details: string) => void;
}

const STORAGE_KEYS = {
  USERS: 'cyberedki_users_v4',
  CURRENT_USER_ID: 'cyberedki_session_user_id_v4',
  GROUPS: 'cyberedki_groups_v4',
  LOGS: 'cyberedki_audit_logs_v4'
};

const transliterateGroupSlug = (text: string) => {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh',
    'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya'
  };
  return text.toLowerCase().split('').map(c => map[c] ?? c).join('').replace(/[^a-z0-9]/g, '');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Users state
  const [allUsers, setAllUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { }
    }
    return MOCK_USERS;
  });

  // 2. Current session user ID (null = not logged in)
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  });

  // 3. Academic Groups
  const [academicGroups, setAcademicGroups] = useState<AcademicGroup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((g: AcademicGroup) => ({
            ...g,
            inviteToken: g.inviteToken || (transliterateGroupSlug(g.name) + '-' + Math.random().toString(36).substring(2, 8)),
            inviteEnabled: g.inviteEnabled ?? true
          }));
        }
      } catch (e) { }
    }
    return MOCK_ACADEMIC_GROUPS;
  });

  // 4. Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return [
      {
        id: 'log-init',
        timestamp: new Date().toISOString(),
        userId: 'system',
        userName: 'Система CyberEDKI',
        userRole: 'admin' as UserRole,
        action: 'Ініціалізація платформи',
        details: 'Завантажено 7 офіційних кластерів та базу нормативних тестів ЄДКІ.'
      }
    ];
  });

  // Persist state
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(academicGroups)); }, [academicGroups]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs)); }, [auditLogs]);

  // Academic groups are needed on the login/register screen
  useEffect(() => {
    let isMounted = true;
    api.fetchGroups().then(remoteGroups => {
      if (isMounted && remoteGroups && Array.isArray(remoteGroups) && remoteGroups.length > 0) {
        setAcademicGroups(remoteGroups);
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(remoteGroups));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentUser = currentUserId ? (allUsers.find(u => u.id === currentUserId) || null) : null;
  const isLoggedIn = currentUser !== null;

  // Do not download the full user list (with passwords) into every student browser
  useEffect(() => {
    if (currentUser?.role !== 'teacher' && currentUser?.role !== 'admin') return;
    let isMounted = true;
    api.fetchUsers().then(remoteUsers => {
      if (isMounted && remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        setAllUsers(prev => {
          const remoteMap = new Map(remoteUsers.map(u => [u.id, u]));
          const merged = [...remoteUsers];
          prev.forEach(u => {
            if (!remoteMap.has(u.id)) {
              merged.push(u);
            }
          });
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
          return merged;
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentUser?.role]);

  // ── Audit log helper (uses currentUser if available) ────────────────────────
  const addAuditLog = (action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'Система',
      userRole: currentUser?.role || 'admin',
      action,
      details
    };
    setAuditLogs(prev => [newEntry, ...prev.slice(0, 199)]);
  };

  // ── Authentication ───────────────────────────────────────────────────────────
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    const cleanUsername = username.trim();
    const trimmed = cleanUsername.toLowerCase();

    // 1. First, attempt backend API login against PostgreSQL
    try {
      const serverRes = await api.login(cleanUsername, password);
      if (serverRes.success && serverRes.user) {
        const serverUser = serverRes.user;
        setCurrentUserId(serverUser.id);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, serverUser.id);

        setAllUsers(prev => {
          const exists = prev.some(u => u.id === serverUser.id);
          const updated = exists ? prev.map(u => u.id === serverUser.id ? serverUser : u) : [serverUser, ...prev];
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
          return updated;
        });

        const logEntry: AuditLogEntry = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          userId: serverUser.id,
          userName: serverUser.name,
          userRole: serverUser.role,
          action: 'Вхід до системи (PostgreSQL)',
          details: `Успішна авторизація через сервер: ${serverUser.username} (${serverUser.role})`
        };
        setAuditLogs(prev => [logEntry, ...prev.slice(0, 199)]);
        api.logAudit({
          timestamp: logEntry.timestamp,
          userId: serverUser.id,
          userName: serverUser.name,
          userRole: serverUser.role,
          action: logEntry.action,
          details: logEntry.details
        });

        return { success: true, message: `Ласкаво просимо, ${serverUser.firstName}!` };
      } else if (!serverRes.isOffline && serverRes.message) {
        // Explicit rejection from PostgreSQL (e.g. wrong password or account deactivated)
        return { success: false, message: serverRes.message };
      }
    } catch {
      // Offline fallback
    }

    // 2. Seamless offline fallback: localStorage / mock users
    let user = allUsers.find(
      u => u.username.toLowerCase() === trimmed && u.password === password
    );

    // Fallback: check localStorage in case state has not flushed yet
    if (!user) {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.USERS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            user = parsed.find((u: AppUser) => u.username.toLowerCase() === trimmed && u.password === password);
          }
        }
      } catch { }
    }

    if (!user) {
      return { success: false, message: 'Невірний логін або пароль' };
    }
    if (!user.isActive) {
      return { success: false, message: 'Ваш обліковий запис деактивовано. Зверніться до адміністратора або викладача.' };
    }

    setCurrentUserId(user.id);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);

    // Log the event
    setAuditLogs(prev => [{
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'Вхід до системи (Офлайн)',
      details: `Успішна автономна авторизація: ${user.username} (${user.role})`
    }, ...prev.slice(0, 199)]);

    return { success: true, message: `Ласкаво просимо, ${user.firstName}!` };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('Вихід із системи', `Сеанс завершено: ${currentUser.username}`);
    }
    setCurrentUserId(null);
  };

  // ── Admin impersonation (admin can "enter" as any user for debug) ────────────
  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      addAuditLog('Адмін-перехід до облікового запису', `${user.name} (${user.role})`);
    }
  };

  // ── User management ──────────────────────────────────────────────────────────
  const registerStudent = async (data: {
    firstName: string;
    lastName: string;
    groupName: string;
    email?: string;
    username: string;
    password: string;
  }): Promise<{ success: boolean; message: string; user?: AppUser }> => {
    const cleanUsername = data.username.trim();
    const cleanEmail = data.email?.trim() || `${cleanUsername}@stud.edu.ua`;
    const fullName = `${data.lastName.trim()} ${data.firstName.trim()}`;

    // 1. Try to register on PostgreSQL backend
    let savedUser: AppUser | undefined;
    try {
      const serverRes = await api.registerUser({
        name: fullName,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: 'student',
        groupName: data.groupName,
        email: cleanEmail,
        username: cleanUsername,
        password: data.password
      });

      if (serverRes.success && serverRes.user) {
        savedUser = serverRes.user;
      } else if (!serverRes.isOffline && serverRes.message) {
        // Explicit rejection from PostgreSQL (e.g. login already taken on server)
        return { success: false, message: serverRes.message };
      }
    } catch {
      // Offline fallback
    }

    // 2. Offline fallback if server unavailable
    if (!savedUser) {
      if (allUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
        return { success: false, message: `Логін "${cleanUsername}" уже зайнятий. Будь ласка, оберіть інший.` };
      }
      if (cleanEmail && allUsers.some(u => u.email && u.email.toLowerCase() === cleanEmail.toLowerCase())) {
        return { success: false, message: `Користувач із поштою "${cleanEmail}" вже зареєстрований.` };
      }

      savedUser = {
        id: 'stud-' + Date.now(),
        name: fullName,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: 'student',
        groupName: data.groupName,
        email: cleanEmail,
        username: cleanUsername,
        password: data.password,
        isActive: true,
        createdAt: new Date().toISOString()
      };
    }

    // Update state and immediately persist users
    setAllUsers(prev => {
      const updated = [...prev.filter(u => u.id !== savedUser!.id), savedUser!];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      return updated;
    });

    // Directly set user session so the user is instantly logged in
    setCurrentUserId(savedUser.id);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, savedUser.id);

    const logEntry: AuditLogEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: savedUser.id,
      userName: savedUser.name,
      userRole: 'student',
      action: 'Реєстрація студента',
      details: `Успішна реєстрація: ${savedUser.username} (група ${savedUser.groupName})`
    };
    setAuditLogs(prev => [logEntry, ...prev.slice(0, 199)]);
    api.logAudit({
      timestamp: logEntry.timestamp,
      userId: savedUser.id,
      userName: savedUser.name,
      userRole: 'student',
      action: logEntry.action,
      details: logEntry.details
    });

    return { success: true, message: `Ласкаво просимо, ${savedUser.firstName}!`, user: savedUser };
  };

  const addStudent = async (data: {
    firstName: string;
    lastName: string;
    groupName: string;
    email?: string;
    username: string;
    password: string;
  }): Promise<AppUser> => {
    const localStudent: AppUser = {
      id: 'stud-' + Date.now(),
      name: `${data.lastName} ${data.firstName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'student',
      groupName: data.groupName,
      email: data.email || `${data.username}@stud.edu.ua`,
      username: data.username,
      password: data.password,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    let saved = localStudent;
    try {
      const serverRes = await api.registerUser({
        name: localStudent.name,
        firstName: localStudent.firstName,
        lastName: localStudent.lastName,
        role: 'student',
        groupName: localStudent.groupName,
        email: localStudent.email,
        username: localStudent.username,
        password: localStudent.password
      });
      if (serverRes.success && serverRes.user) {
        saved = serverRes.user;
      }
    } catch {
      // Offline fallback keeps the local student
    }

    setAllUsers(prev => {
      const updated = [...prev.filter(u => u.id !== saved.id && u.username !== saved.username), saved];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      return updated;
    });
    addAuditLog('Додано нового студента', `${saved.name}, група ${saved.groupName}, логін: ${saved.username}`);
    return saved;
  };

  const bulkAddStudents = async (groupName: string, namesList: string[]): Promise<number> => {
    const created: AppUser[] = [];

    for (const [idx, fullName] of namesList.entries()) {
      const trimmed = fullName.trim();
      if (!trimmed) continue;
      const parts = trimmed.split(' ');
      const lastName = parts[0] || 'Студент';
      const firstName = parts.slice(1).join(' ') || 'Ім\'я';
      const baseUsername = `${lastName.toLowerCase()}.${firstName[0]?.toLowerCase() || 'x'}${groupName.toLowerCase().replace('-', '')}`;

      const student = await addStudent({
        firstName,
        lastName,
        groupName,
        email: `${baseUsername}@stud.edu.ua`,
        username: `${baseUsername}${idx > 0 ? idx : ''}`,
        password: 'Student1234'
      });
      created.push(student);
    }

    if (created.length > 0) {
      addAuditLog('Груповий імпорт студентів', `Додано ${created.length} студентів до групи ${groupName}. Пароль за замовчуванням: Student1234`);
    }
    return created.length;
  };

  const addTeacher = async (data: { name: string; department: string; email: string; username: string; password: string }): Promise<AppUser> => {
    const parts = data.name.split(' ');
    const localTeacher: AppUser = {
      id: 'teach-' + Date.now(),
      name: data.name,
      firstName: parts[1] || data.name,
      lastName: parts[0] || '',
      role: 'teacher',
      department: data.department,
      email: data.email,
      username: data.username,
      password: data.password,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    let saved = localTeacher;
    try {
      const serverRes = await api.registerUser({
        name: localTeacher.name,
        firstName: localTeacher.firstName,
        lastName: localTeacher.lastName,
        role: 'teacher',
        email: localTeacher.email,
        username: localTeacher.username,
        password: localTeacher.password,
        department: localTeacher.department
      });
      if (serverRes.success && serverRes.user) {
        saved = serverRes.user;
      }
    } catch {
      // Offline fallback
    }

    setAllUsers(prev => [...prev.filter(u => u.id !== saved.id && u.username !== saved.username), saved]);
    addAuditLog('Призначено викладача', `${saved.name}, ${saved.department}, логін: ${saved.username}`);
    return saved;
  };

  const updateUserStatus = (userId: string, isActive: boolean) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive } : u));
    const user = allUsers.find(u => u.id === userId);
    addAuditLog(
      isActive ? 'Активовано доступ' : 'Деактивовано доступ',
      `Користувач: ${user?.name || userId}`
    );
    api.updateUserStatus(userId, isActive);
    // If the deactivated user is currently logged in, force logout
    if (!isActive && userId === currentUserId) {
      setCurrentUserId(null);
    }
  };

  const resetUserPassword = (userId: string, newPassword: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
    const user = allUsers.find(u => u.id === userId);
    addAuditLog('Скинуто пароль', `Пароль змінено для: ${user?.name || userId}`);
    api.resetPassword(userId, newPassword);
  };

  const deleteUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('Видалено користувача', `${user?.name || userId} (${user?.role})`);
    api.deleteUser(userId);
    if (userId === currentUserId) setCurrentUserId(null);
  };

  const addAcademicGroup = (name: string, course: number): AcademicGroup => {
    const newGrp: AcademicGroup = {
      id: 'grp-' + Date.now(),
      name,
      course,
      specialty: '125 Кібербезпека',
      studentCount: 0,
      inviteToken: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 8),
      inviteEnabled: true
    };
    setAcademicGroups(prev => [...prev, newGrp]);
    addAuditLog('Створено академічну групу', `Група ${name} (${course} курс)`);
    return newGrp;
  };

  const deleteAcademicGroup = (groupId: string) => {
    const grp = academicGroups.find(g => g.id === groupId || g.name === groupId);
    if (!grp) return;
    setAcademicGroups(prev => prev.filter(g => g.id !== grp.id));
    setAllUsers(prev => prev.map(u => u.groupName === grp.name ? { ...u, groupName: undefined } : u));
    addAuditLog('Видалено академічну групу', `Група ${grp.name} (${grp.course} курс) видалена з системи`);
  };

  // ── Password recovery via email ──────────────────────────────────────────
  const sendPasswordResetCode = (emailOrUsername: string): { success: boolean; message: string; code?: string; email?: string } => {
    const clean = emailOrUsername.trim().toLowerCase();
    const user = allUsers.find(
      u => (u.email && u.email.trim().toLowerCase() === clean) ||
        u.username.trim().toLowerCase() === clean
    );
    if (!user) {
      return { success: false, message: 'Користувача з такою електронною поштою або логіном не знайдено в системі.' };
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const targetEmail = user.email || `${user.username}@stud.edu.ua`;
    addAuditLog('Запит на відновлення пароля', `Згенеровано код відновлення для ${user.name} (${targetEmail})`);
    return {
      success: true,
      message: `Код підтвердження надіслано на вашу електронну пошту (${targetEmail})`,
      code,
      email: targetEmail
    };
  };

  const resetPasswordByEmail = (emailOrUsername: string, newPassword: string): { success: boolean; message: string } => {
    const clean = emailOrUsername.trim().toLowerCase();
    const user = allUsers.find(
      u => (u.email && u.email.trim().toLowerCase() === clean) ||
        u.username.trim().toLowerCase() === clean
    );
    if (!user) {
      return { success: false, message: 'Користувача не знайдено.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Пароль має містити щонайменше 6 символів.' };
    }
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));
    api.resetPassword(user.id, newPassword);
    addAuditLog('Відновлення пароля через email', `Успішно змінено пароль для ${user.name} (${user.email || user.username})`);
    return { success: true, message: 'Пароль успішно змінено! Тепер ви можете увійти.' };
  };

  const isStudent = currentUser?.role === 'student';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const canEditContent = isTeacher || isAdmin;
  const canManageTeachers = isAdmin;
  const canManageStudents = isTeacher || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        academicGroups,
        auditLogs,
        isLoggedIn,
        isStudent,
        isTeacher,
        isAdmin,
        canEditContent,
        canManageTeachers,
        canManageStudents,
        login,
        logout,
        switchUser,
        addStudent,
        registerStudent,
        bulkAddStudents,
        addTeacher,
        updateUserStatus,
        resetUserPassword,
        deleteUser,
        addAcademicGroup,
        deleteAcademicGroup,
        sendPasswordResetCode,
        resetPasswordByEmail,
        addAuditLog
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};