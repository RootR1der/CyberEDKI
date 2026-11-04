import { Subject } from '../types/edki';

export const SUBJECTS_DATA: Subject[] = [
  {
    id: 1,
    code: 'SEC-BASE',
    name: 'Основи кібербезпеки та інформаційної безпеки',
    description: 'Базові поняття, CIA-тріада, активи, загрози, вразливості, моделі загроз та принципи побудови систем захисту.',
    iconName: 'Shield',
    isOfficial: true,
    clusterId: 1, // Законодавча та нормативно-правова база, основи
    topics: [
      {
        id: '1.1',
        subjectId: 1,
        name: 'Поняття інформації, інформаційної та кібербезпеки',
        subtopics: ['Визначення кіберпростору та кібербезпеки', 'Стандарти безпеки', 'Цінність інформаційних активів'],
        isOfficial: true
      },
      {
        id: '1.2',
        subjectId: 1,
        name: 'Конфіденційність, цілісність, доступність (CIA)',
        subtopics: ['Тріада CIA', 'Порушення конфіденційності', 'Цілісність даних та систем', 'Забезпечення доступності'],
        isOfficial: true
      },
      {
        id: '1.3',
        subjectId: 1,
        name: 'Активи, загрози, вразливості та ризики',
        subtopics: ['Співвідношення понять актив-загроза-вразливість', 'Джерела загроз', 'Класифікація вразливостей'],
        isOfficial: true
      },
      {
        id: '1.4',
        subjectId: 1,
        name: 'Моделі загроз і поверхня атаки',
        subtopics: ['Моделювання загроз STRIDE/PASTA', 'Мінімізація поверхні атаки', 'Вектори атак'],
        isOfficial: true
      },
      {
        id: '1.5',
        subjectId: 1,
        name: 'Принципи побудови систем захисту',
        subtopics: ['Ешелонований захист (Defense-in-Depth)', 'Принцип найменших привілеїв', 'Повнота охоплення захистом'],
        isOfficial: true
      },
      {
        id: '1.6',
        subjectId: 1,
        name: 'Політики та базові заходи безпеки',
        subtopics: ['Класифікація політик безпеки', 'Організаційні та технічні заходи', 'Обізнаність користувачів (Security Awareness)'],
        isOfficial: true
      }
    ]
  },
  {
    id: 2,
    code: 'SEC-TECH',
    name: 'Технічні засоби інформаційної безпеки (ТЗІ)',
    description: 'ТЗІ, апаратні засоби захисту, контроль доступу, технічні канали витоку інформації та фізична безпека.',
    iconName: 'Cpu',
    isOfficial: true,
    clusterId: 7, // Технічний захист інформації
    topics: [
      {
        id: '2.1',
        subjectId: 2,
        name: 'Технічний захист інформації (ТЗІ)',
        subtopics: ['Концепція ТЗІ в Україні', 'Атестація комплексів ТЗІ', 'Захист від НСД', 'ДСТУ 3396.0,1,2-97'],
        isOfficial: true
      },
      {
        id: '2.2',
        subjectId: 2,
        name: 'Апаратні засоби захисту',
        subtopics: ['Апаратні ключі та токени', 'Модулі безпеки HSM та TPM', 'Генератори випадкових чисел'],
        isOfficial: true
      },
      {
        id: '2.3',
        subjectId: 2,
        name: 'Засоби контролю та розмежування доступу',
        subtopics: ['Системи контролю фізичного доступу (СКД)', 'Біометричні системи', 'Турнікети та зчитувачі', 'Системи телевізійного спостереження (ТСВ/CCTV) та охоронні системи'],
        isOfficial: true
      },
      {
        id: '2.4',
        subjectId: 2,
        name: 'Технічні канали витоку інформації',
        subtopics: ['ПЕМІН (побічні електромагнітні випромінювання)', 'Акустичні та віброакустичні канали', 'Оптико-електронні канали витоку', 'Параметричний канал (ВЧ-нав’язування)'],
        isOfficial: true
      },
      {
        id: '2.5',
        subjectId: 2,
        name: 'Захист приміщень та протидія СТЗ',
        subtopics: ['Екранування приміщень', 'Захист ліній живлення та заземлення', 'Нелінійні локатори (NLJD)', 'Пошук засобів негласного зняття інформації'],
        isOfficial: true
      }
    ]
  },
  {
    id: 3,
    code: 'CRYPTO',
    name: 'Криптографічний захист інформації',
    description: 'Математичні засади, симетричні та асиметричні алгоритми, хеш-функції, КЕП, PKI, цифрова стеганографія.',
    iconName: 'KeyRound',
    isOfficial: true,
    clusterId: 6, // Криптографічний захист інформації
    topics: [
      {
        id: '3.1',
        subjectId: 3,
        name: 'Математичні основи криптографії',
        subtopics: ['Модулярна арифметика', 'Теореми Ейлера та Ферма', 'Розширений алгоритм Евкліда', 'Скінченні поля Галуа GF(2^n)'],
        isOfficial: true
      },
      {
        id: '3.2',
        subjectId: 3,
        name: 'Симетричні криптографічні алгоритми',
        subtopics: ['AES (Rijndael)', 'ДСТУ 7624 "Калина"', 'Потоковий шифр ДСТУ 8845 "Струмок"', 'RC4', 'Режими роботи блокових шифрів (CBC, GCM, CTR)'],
        isOfficial: true
      },
      {
        id: '3.3',
        subjectId: 3,
        name: 'Асиметрична криптографія',
        subtopics: ['Алгоритм RSA', 'Еліптичні криві (ECC, ДСТУ 4145)', 'Обмін ключами Діффі-Хеллмана (ECDH)', 'Схема ElGamal'],
        isOfficial: true
      },
      {
        id: '3.4',
        subjectId: 3,
        name: 'Хеш-функції та MAC',
        subtopics: ['Критерії стійкості до колізій', 'SHA-2, SHA-3, ДСТУ 7564 "Купина"', 'HMAC для контролю цілісності'],
        isOfficial: true
      },
      {
        id: '3.5',
        subjectId: 3,
        name: 'Цифрова стеганографія та ЦВЗ',
        subtopics: ['Метод найменшого значущого біта (LSB)', 'Стеганоаналіз', 'Цифрові водяні знаки (ЦВЗ)', 'Стійкість до модифікацій'],
        isOfficial: true
      },
      {
        id: '3.6',
        subjectId: 3,
        name: 'КЕП, PKI та криптопротоколи',
        subtopics: ['X.509 сертифікати', 'TLS 1.2 та TLS 1.3', 'IPsec (IKE, ESP, AH)', 'SSHv2'],
        isOfficial: true
      }
    ]
  },
  {
    id: 4,
    code: 'KSZI',
    name: 'Комплексні системи захисту інформації (КСЗІ)',
    description: 'Проєктування, створення та супровід КСЗІ, модель загроз і порушника, дослідження середовищ функціонування, оцінка захищеності.',
    iconName: 'ShieldAlert',
    isOfficial: true,
    clusterId: 4, // Комплексні системи захисту інформації
    topics: [
      {
        id: '4.1',
        subjectId: 4,
        name: 'Проєктування та створення КСЗІ',
        subtopics: ['Стадії створення за НД ТЗІ 3.7-003-2000', 'Технічне завдання на КСЗІ', 'Технічний проєкт КСЗІ'],
        isOfficial: true
      },
      {
        id: '4.2',
        subjectId: 4,
        name: 'Моделі загроз і порушника',
        subtopics: ['Класифікація загроз CIA', 'Рівні кваліфікації та можливості порушника', 'Внутрішній та зовнішній порушник'],
        isOfficial: true
      },
      {
        id: '4.3',
        subjectId: 4,
        name: 'Оцінка захищеності та атестація',
        subtopics: ['Атестація відповідності КСЗІ', 'Державна експертиза ДССЗЗІ', 'НД ТЗІ 2.5-004-99 (критерії оцінки від НСД)'],
        isOfficial: true
      }
    ]
  },
  {
    id: 5,
    code: 'NET-CORE',
    name: 'Комп’ютерні мережі та ІТ в кібербезпеці',
    description: 'Моделі OSI та TCP/IP, віртуалізація, гіпервізори, архітектура комп\'ютерів, адресація, маршрутизація, алгоритми.',
    iconName: 'Network',
    isOfficial: true,
    clusterId: 2, // ІТ в інформаційній та/або кібербезпеці
    topics: [
      {
        id: '5.1',
        subjectId: 5,
        name: 'Моделі OSI та TCP/IP',
        subtopics: ['7 рівнів OSI', 'Інкапсуляція даних', 'Порівняння з моделлю TCP/IP', 'Протоколи TCP/UDP/ICMP'],
        isOfficial: true
      },
      {
        id: '5.2',
        subjectId: 5,
        name: 'Віртуалізація та гіпервізори',
        subtopics: ['Гіпервізори Type 1 (bare-metal) vs Type 2 (hosted)', 'Ізоляція віртуальних машин', 'Контейнеризація vs віртуалізація'],
        isOfficial: true
      },
      {
        id: '5.3',
        subjectId: 5,
        name: 'Алгоритмізація, ООП та архітектура ЕОМ',
        subtopics: ['Складність алгоритмів (Big-O)', 'Алгоритми сортування (QuickSort, MergeSort)', 'Принципи ООП', 'Кільця захисту процесора'],
        isOfficial: true
      },
      {
        id: '5.4',
        subjectId: 5,
        name: 'Маршрутизація, VLAN та комутація',
        subtopics: ['Таблиця маршрутизації', 'Стандарт IEEE 802.1Q VLAN', 'NAT та PAT', 'ARP протокол'],
        isOfficial: true
      }
    ]
  },
  {
    id: 6,
    code: 'NET-SEC',
    name: 'Мережева безпека та захист ІКС',
    description: 'Firewall, IDS/IPS, WAF, VPN, сегментація, Zero Trust, AAA протоколи (RADIUS/TACACS+), мережеві атаки.',
    iconName: 'ShieldAlert',
    isOfficial: true,
    clusterId: 3, // Безпека інформаційно-комунікаційних систем
    topics: [
      {
        id: '6.1',
        subjectId: 6,
        name: 'Firewall та фільтрація трафіку',
        subtopics: ['Packet Filtering', 'Stateful Inspection', 'Next-Generation Firewall (NGFW)', 'WAF'],
        isOfficial: true
      },
      {
        id: '6.2',
        subjectId: 6,
        name: 'IDS / IPS системи',
        subtopics: ['Сигнатурний аналіз vs аномалії', 'Snort/Suricata правила', 'Розміщення в мережі (Inline vs SPAN/TAP)'],
        isOfficial: true
      },
      {
        id: '6.3',
        subjectId: 6,
        name: 'Протоколи AAA та автентифікації',
        subtopics: ['RADIUS (UDP 1812/1813)', 'TACACS+ (TCP 49)', 'MFA фактори', 'FIDO2 та WebAuthn'],
        isOfficial: true
      },
      {
        id: '6.4',
        subjectId: 6,
        name: 'VPN та тунелювання',
        subtopics: ['IPsec VPN (Tunnel vs Transport mode, ESP vs AH)', 'OpenVPN та WireGuard', 'SSL VPN'],
        isOfficial: true
      }
    ]
  },
  {
    id: 7,
    code: 'OS-SEC',
    name: 'Безпека операційних систем',
    description: 'Архітектура захисту Windows і Linux, керування правами ACL, процеси, пам’ять (ASLR, DEP), Active Directory, hardening.',
    iconName: 'Terminal',
    isOfficial: true,
    clusterId: 2, // ІТ в інформаційній та/або кібербезпеці
    topics: [
      {
        id: '7.1',
        subjectId: 7,
        name: 'Захисні механізми пам’яті операційних систем',
        subtopics: ['Address Space Layout Randomization (ASLR)', 'Data Execution Prevention (DEP / NX-біт)', 'Stack Canaries', 'UAC'],
        isOfficial: true
      },
      {
        id: '7.2',
        subjectId: 7,
        name: 'Windows Security та Active Directory',
        subtopics: ['Kerberos протокол (TGT, TGS, PAC)', 'DACL та SACL', 'SAM та LSASS', 'Атаки Golden Ticket / Pass-the-Hash'],
        isOfficial: true
      },
      {
        id: '7.3',
        subjectId: 7,
        name: 'Linux Security',
        subtopics: ['Дискреційні права rwx, SUID/SGID/Sticky bit', 'SELinux та AppArmor (MAC)', 'Pluggable Authentication Modules (PAM)'],
        isOfficial: true
      }
    ]
  },
  {
    id: 8,
    code: 'APP-SEC',
    name: 'Безпека програмного забезпечення та Web Security',
    description: 'Secure SDLC, OWASP Top 10, ін’єкції (SQLi), XSS, CSRF, SSRF, RCE, безпека сесій та API.',
    iconName: 'Code2',
    isOfficial: true,
    clusterId: 3, // Безпека ІКС
    topics: [
      {
        id: '8.1',
        subjectId: 8,
        name: 'Secure SDLC та методології',
        subtopics: ['SAST vs DAST vs IAST', 'SCA (аналіз сторонніх бібліотек)', 'Security Code Review'],
        isOfficial: true
      },
      {
        id: '8.2',
        subjectId: 8,
        name: 'OWASP Top 10: Ін’єкції та Web-вразливості',
        subtopics: ['SQL Injection та Prepared Statements', 'XSS та Content Security Policy', 'CSRF та SameSite атрибути', 'SSRF'],
        isOfficial: true
      }
    ]
  },
  {
    id: 9,
    code: 'SOC-SIEM',
    name: 'Моніторинг, SOC та SIEM',
    description: 'Функції Security Operations Center, архітектура SIEM, збір логів, правила кореляції, джерела подій.',
    iconName: 'Activity',
    isOfficial: true,
    clusterId: 3, // Безпека ІКС
    topics: [
      {
        id: '9.1',
        subjectId: 9,
        name: 'SIEM системи та збір логів',
        subtopics: ['Джерела подій безпеки', 'Нормалізація та парсинг подій', 'Синхронізація часу NTP'],
        isOfficial: true
      },
      {
        id: '9.2',
        subjectId: 9,
        name: 'Правила кореляції та аналітика SOC',
        subtopics: ['Порогова кореляція', 'Статистичні аномалії', 'Рівні аналітиків Tier 1/2/3', 'Triage інцидентів'],
        isOfficial: true
      }
    ]
  },
  {
    id: 10,
    code: 'INCIDENT-RESP',
    name: 'Управління інцидентами та кібератаки',
    description: 'Життєвий цикл інциденту за NIST SP 800-61 та ISO 27035, класифікація атак за MITRE ATT&CK, розслідування.',
    iconName: 'Flame',
    isOfficial: true,
    clusterId: 5, // Управління інформаційною та/або кібербезпекою
    topics: [
      {
        id: '10.1',
        subjectId: 10,
        name: 'Етапи реагування на кіберінциденти',
        subtopics: ['Preparation (Підготовка)', 'Detection & Analysis (Виявлення та аналіз)', 'Containment & Eradication (Локалізація та викорінення)', 'Post-Incident (Lessons Learned)'],
        isOfficial: true
      },
      {
        id: '10.2',
        subjectId: 10,
        name: 'Класифікація кібератак та загроз',
        subtopics: ['Матриця MITRE ATT&CK', 'Cyber Kill Chain', 'APT угрупування', 'Взаємодія з CERT-UA'],
        isOfficial: true
      }
    ]
  },
  {
    id: 11,
    code: 'RISK-MGMT',
    name: 'Управління ризиками кібербезпеки та політики ІБ',
    description: 'Оцінка ризиків (ISO 31000, NIST SP 800-30), матриця ризиків, розрахунок ALE, стратегії обробки, політики ІБ.',
    iconName: 'AlertTriangle',
    isOfficial: true,
    clusterId: 5, // Управління інформаційною та/або кібербезпекою
    topics: [
      {
        id: '11.1',
        subjectId: 11,
        name: 'Оцінювання та аналіз ризиків ІБ',
        subtopics: ['Формула ризику (Risk = Asset × Threat × Vulnerability)', 'Кількісний аналіз (SLE, ARO, ALE)', 'Матриця ймовірність/вплив'],
        isOfficial: true
      },
      {
        id: '11.2',
        subjectId: 11,
        name: 'Стратегії обробки ризиків',
        subtopics: ['Зменшення (Mitigation)', 'Прийняття (Acceptance)', 'Уникнення (Avoidance)', 'Передавання (Transfer / кіберстрахування)'],
        isOfficial: true
      },
      {
        id: '11.3',
        subjectId: 11,
        name: 'Розробка та дотримання політик ІБ',
        subtopics: ['СУІБ за ISO/IEC 27001', 'Ієрархія документів політик безпеки', 'Інтеграція в бізнес-процеси'],
        isOfficial: true
      }
    ]
  },
  {
    id: 12,
    code: 'LAW-CYBER',
    name: 'Законодавча та нормативно-правова база кібербезпеки',
    description: 'Закони України, Постанова КМУ №518, ДСТУ ISO/IEC 15408, Регламент ЄС 2019/881 (ENISA), КК України.',
    iconName: 'Scale',
    isOfficial: true,
    clusterId: 1, // Законодавча та нормативно-правова база
    topics: [
      {
        id: '12.1',
        subjectId: 12,
        name: 'Законодавство України у сфері кібербезпеки',
        subtopics: ['ЗУ «Про основні засади забезпечення кібербезпеки України»', 'ЗУ «Про захист персональних даних» та GDPR', 'ЗУ «Про інформацію» та «Про науково-технічну інформацію»', 'ЗУ «Про державну таємницю»', 'Стаття 361 КК України'],
        isOfficial: true
      },
      {
        id: '12.2',
        subjectId: 12,
        name: 'Кіберзахист критичної інфраструктури (Постанова КМУ №518)',
        subtopics: ['Постанова КМУ №518 від 19.06.2019', 'Загальні вимоги до кіберзахисту ОКІ', 'ЗУ «Про критичну інфраструктуру»'],
        isOfficial: true
      },
      {
        id: '12.3',
        subjectId: 12,
        name: 'Стандарти критеріїв оцінки безпеки ІТ (Common Criteria)',
        subtopics: ['ДСТУ ISO/IEC 15408-1,2,3', 'Рівні гарантій оцінки (EAL1 - EAL7)', 'Профіль захисту (Protection Profile)', 'Завдання з безпеки (Security Target)'],
        isOfficial: true
      },
      {
        id: '12.4',
        subjectId: 12,
        name: 'Європейське законодавство та ENISA',
        subtopics: ['Регламент ЄС 2019/881 (EU Cybersecurity Act)', 'Схеми сертифікації кібербезпеки EUCS', 'Будапештська конвенція'],
        isOfficial: true
      }
    ]
  }
];
