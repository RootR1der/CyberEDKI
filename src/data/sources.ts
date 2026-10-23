import { SourceReference } from '../types/edki';

export interface RegulatorySourceItem extends SourceReference {
  id: string;
  category: 'Закони України' | 'Міжнародні стандарти' | 'NIST' | 'RFC' | 'Фреймворки та гайдлайни';
  description: string;
  relevanceToEDKI: string;
}

export const OFFICIAL_SOURCES: RegulatorySourceItem[] = [
  {
    id: 'law-cyber-base',
    category: 'Закони України',
    title: 'Закон України «Про основні засади забезпечення кібербезпеки України»',
    code: '№ 2163-VIII',
    type: 'law',
    url: 'https://zakon.rada.gov.ua/laws/show/2163-19',
    articleOrSection: 'Статті 1, 5, 8, 9',
    description: 'Базовий закон, що визначає правові та організаційні засади забезпечення захисту життєво важливих інтересів людини і громадянина, суспільства та держави у кіберпросторі, повноваження суб’єктів кібербезпеки (ДССЗЗІ, СБУ, НПУ, МОУ тощо).',
    relevanceToEDKI: 'Обов’язковий нормативний блок. Визначає терміни: «кібератака», «кіберінцидент», «кібероборона», національну систему кібербезпеки.'
  },
  {
    id: 'law-info-ics',
    category: 'Закони України',
    title: 'Закон України «Про захист інформації в інформаційно-комунікаційних системах»',
    code: '№ 80/94-ВР',
    type: 'law',
    url: 'https://zakon.rada.gov.ua/laws/show/80/94-%D0%B2%D1%80',
    articleOrSection: 'Статті 8, 10',
    description: 'Регулює умови обробки та захисту державних інформаційних ресурсів та конфіденційної інформації. Визначає обов’язковість створення КСЗІ (комплексної системи захисту інформації).',
    relevanceToEDKI: 'Питання щодо обов’язковості КСЗІ, атестації відповідності та критеріїв захисту інформації, що є власністю держави.'
  },
  {
    id: 'law-critical-infra',
    category: 'Закони України',
    title: 'Закон України «Про критичну інфраструктуру»',
    code: '№ 1882-IX',
    type: 'law',
    url: 'https://zakon.rada.gov.ua/laws/show/1882-20',
    articleOrSection: 'Статті 9, 10, 11',
    description: 'Визначає правові та організаційні засади функціонування та захисту критичної інфраструктури, категоризацію об’єктів (I, II, III, IV категорії).',
    relevanceToEDKI: 'Питання про сектори критичної інфраструктури, критерії визначення категорій критичності та вимоги до кіберстійкості.'
  },
  {
    id: 'law-personal-data',
    category: 'Закони України',
    title: 'Закон України «Про захист персональних даних»',
    code: '№ 2297-VI',
    type: 'law',
    url: 'https://zakon.rada.gov.ua/laws/show/2297-17',
    articleOrSection: 'Статті 2, 6, 7, 24',
    description: 'Правове регулювання обробки персональних даних, права суб’єктів даних, обов’язки володільців та розпорядників баз даних.',
    relevanceToEDKI: 'Питання щодо згоди на обробку, особливих категорій даних (чутливих), технічних вимог до захисту від несанкціонованого доступу.'
  },
  {
    id: 'iso-27001',
    category: 'Міжнародні стандарти',
    title: 'ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection — ISMS',
    code: 'ISO/IEC 27001:2022',
    type: 'standard',
    url: 'https://www.iso.org/standard/27001',
    articleOrSection: 'Clauses 4-10, Annex A Controls',
    description: 'Міжнародний стандарт для створення, впровадження, підтримки та постійного вдосконалення системи управління інформаційною безпекою (СУІБ).',
    relevanceToEDKI: 'Цикл PDCA, обов’язкові документи СУІБ (Statement of Applicability), структура заходів контролю додатку Annex A (4 домени замість 14).'
  },
  {
    id: 'iso-27002',
    category: 'Міжнародні стандарти',
    title: 'ISO/IEC 27002:2022 Information security controls',
    code: 'ISO/IEC 27002:2022',
    type: 'standard',
    url: 'https://www.iso.org/standard/75652.html',
    articleOrSection: 'Розділи 5-8',
    description: 'Звід практик та практичних рекомендацій щодо реалізації 93 заходів безпеки, згрупованих за 4 темами (Організаційні, Кадрові, Фізичні, Технологічні).',
    relevanceToEDKI: 'Конкретні технічні та організаційні заходи захисту (керування доступом, маскування даних, моніторинг активності).'
  },
  {
    id: 'iso-27035',
    category: 'Міжнародні стандарти',
    title: 'ISO/IEC 27035 Information security incident management',
    code: 'ISO/IEC 27035',
    type: 'standard',
    url: 'https://www.iso.org/standard/60803.html',
    articleOrSection: 'Частини 1-3',
    description: 'Міжнародні настанови щодо принципів управління інцидентами інформаційної безпеки, планування та підготовки, реагування та постінспекції.',
    relevanceToEDKI: 'Життєвий цикл інциденту, форми повідомлень, формування групи реагування CSIRT/IRT.'
  },
  {
    id: 'nist-sp-800-61',
    category: 'NIST',
    title: 'NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide',
    code: 'NIST SP 800-61r2',
    type: 'guideline',
    url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final',
    articleOrSection: 'Section 3: Incident Handling Checklist',
    description: 'Еталонне керівництво з обробки комп’ютерних інцидентів безпеки від Національного інституту стандартів і технологій США.',
    relevanceToEDKI: '4 фази реагування: Preparation -> Detection & Analysis -> Containment, Eradication & Recovery -> Post-Incident Activity.'
  },
  {
    id: 'nist-sp-800-207',
    category: 'NIST',
    title: 'NIST SP 800-207: Zero Trust Architecture',
    code: 'NIST SP 800-207',
    type: 'guideline',
    url: 'https://csrc.nist.gov/pubs/sp/800/207/final',
    articleOrSection: 'Section 2: Zero Trust Basics',
    description: 'Фундаментальний документ парадигми нульової довіри: "Never Trust, Always Verify".',
    relevanceToEDKI: 'Принципи Zero Trust: динамічний розрахунок довіри, мікросегментація, обов’язкова автентифікація кожного сеансу.'
  },
  {
    id: 'rfc-5246-tls',
    category: 'RFC',
    title: 'RFC 5246 / RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.2 & 1.3',
    code: 'RFC 5246 / 8446',
    type: 'rfc',
    url: 'https://datatracker.ietf.org/doc/html/rfc8446',
    articleOrSection: 'TLS Handshake Protocol',
    description: 'Офіційні стандарти IETF для криптографічного протоколу захисту комунікацій у мережах.',
    relevanceToEDKI: 'Етапи рукостискання (ClientHello, ServerHello, Certificate, KeyExchange, Finished), 1-RTT та 0-RTT у TLS 1.3.'
  },
  {
    id: 'owasp-top-10',
    category: 'Фреймворки та гайдлайни',
    title: 'OWASP Top 10 Web Application Security Risks (2021)',
    code: 'OWASP Top 10:2021',
    type: 'framework',
    url: 'https://owasp.org/Top10/',
    articleOrSection: 'A01:2021 — Broken Access Control, A03:2021 — Injection',
    description: 'Стандартний галузевий документ з рейтингом найбільш критичних ризиків безпеки веб-додатків.',
    relevanceToEDKI: 'SQL Injection, XSS, SSRF, Broken Access Control, Security Misconfiguration, методи запобігання.'
  },
  {
    id: 'mitre-attack',
    category: 'Фреймворки та гайдлайни',
    title: 'MITRE ATT&CK® Enterprise Matrix',
    code: 'MITRE ATT&CK v14',
    type: 'framework',
    url: 'https://attack.mitre.org/',
    articleOrSection: 'Tactics & Techniques',
    description: 'Глобально доступна база знань про тактики, техніки та процедури супротивників (TTP), заснована на реальних спостереженнях.',
    relevanceToEDKI: '14 тактик: Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access тощо.'
  }
];
