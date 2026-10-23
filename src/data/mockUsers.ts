import { AppUser, AcademicGroup } from '../types/edki';

export const MOCK_ACADEMIC_GROUPS: AcademicGroup[] = [
  { id: 'grp-kb-41', name: 'КБ-41', course: 4, specialty: '125 Кібербезпека', studentCount: 22, inviteToken: 'kb41-start', inviteEnabled: true },
  { id: 'grp-kb-42', name: 'КБ-42', course: 4, specialty: '125 Кібербезпека', studentCount: 20, inviteToken: 'kb42-start', inviteEnabled: true },
  { id: 'grp-kb-31', name: 'КБ-31', course: 3, specialty: '125 Кібербезпека', studentCount: 24, inviteToken: 'kb31-start', inviteEnabled: true }
];

export const MOCK_USERS: AppUser[] = [
  // 1. Admin
  {
    id: 'user-admin-1',
    name: 'Олексій Мельник',
    firstName: 'Олексій',
    lastName: 'Мельник',
    role: 'admin',
    email: 'admin.cyber@university.edu.ua',
    username: 'AdM1n',
    password: 'te6tadm1N',
    isActive: true,
    department: 'Головний адміністратор платформи',
    createdAt: '2024-01-10T09:00:00.000Z'
  },
  // 2. Teachers
  {
    id: 'user-teacher-1',
    name: 'доц. Василь Петренко',
    firstName: 'Василь',
    lastName: 'Петренко',
    role: 'teacher',
    email: 'teacher.cyber@university.edu.ua',
    username: 'Teacher',
    password: 'te6tTeac4',
    isActive: true,
    department: 'Кафедра систем інформаційного та кіберзахисту',
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 'user-teacher-2',
    name: 'проф. Олена Сидоренко',
    firstName: 'Олена',
    lastName: 'Сидоренко',
    role: 'teacher',
    email: 'o.sydorenko@university.edu.ua',
    username: 'o.sydorenko',
    password: 'te6tTeac4',
    isActive: true,
    department: 'Кафедра безпеки інформаційних технологій',
    createdAt: '2024-01-18T14:00:00.000Z'
  },
  // 3. Students
  {
    id: 'user-student-1',
    name: 'Олександр Коваленко',
    firstName: 'Олександр',
    lastName: 'Коваленко',
    role: 'student',
    groupName: 'КБ-41',
    email: 'student.cyber@stud.edu.ua',
    username: 'Student',
    password: 'Stu2eNt',
    isActive: true,
    createdAt: '2024-02-01T11:00:00.000Z'
  },
  {
    id: 'user-student-2',
    name: 'Анна Мельниченко',
    firstName: 'Анна',
    lastName: 'Мельниченко',
    role: 'student',
    groupName: 'КБ-41',
    email: 'a.melnychenko@stud.edu.ua',
    username: 'a.melnychenko',
    password: 'student123',
    isActive: true,
    createdAt: '2024-02-01T11:15:00.000Z'
  },
  {
    id: 'user-student-3',
    name: 'Дмитро Шевченко',
    firstName: 'Дмитро',
    lastName: 'Шевченко',
    role: 'student',
    groupName: 'КБ-42',
    email: 'd.shevchenko@stud.edu.ua',
    username: 'd.shevchenko',
    password: 'student123',
    isActive: true,
    createdAt: '2024-02-02T12:00:00.000Z'
  },
  {
    id: 'user-student-4',
    name: 'Софія Бондаренко',
    firstName: 'Софія',
    lastName: 'Бондаренко',
    role: 'student',
    groupName: 'КБ-42',
    email: 's.bondarenko@stud.edu.ua',
    username: 's.bondarenko',
    password: 'student123',
    isActive: true,
    createdAt: '2024-02-03T10:00:00.000Z'
  },
  {
    id: 'user-student-5',
    name: 'Максим Ткаченко',
    firstName: 'Максим',
    lastName: 'Ткаченко',
    role: 'student',
    groupName: 'КБ-31',
    email: 'm.tkachenko@stud.edu.ua',
    username: 'm.tkachenko',
    password: 'student123',
    isActive: true,
    createdAt: '2024-02-05T15:20:00.000Z'
  }
];
