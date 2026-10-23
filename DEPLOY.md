# Інструкція з розгортання платформи CyberEDKI на сервері через Docker

Цей посібник містить повну інструкцію для розгортання платформи **CyberEDKI** (підготовка до ЄДКІ з кібербезпеки) на сервері з використанням Docker, Docker Compose, Nginx, PostgreSQL, Node.js бекенду та React фронтенду.

---

## 🏛 Архітектура сервісів

Усі компоненти об'єднані у спільну ізольовану мережу `cyberedki_net`:

1. **`nginx` (Gateway Reverse Proxy)**:
   - Зовнішня точка входу на порт `80` (або `443` при підключенні SSL).
   - Роздає клієнтський SPA та статичні файли.
   - Маршрутизує запити `/api/*` на сервіс бекенду.
   - Gzip-стиснення, HTTP-заголовки захисту, таймаути для тривалих сесій тестування.

2. **`frontend` (React + TypeScript + Vite)**:
   - Багатоетапна збірка (`node:20-alpine` -> `nginx:alpine`).
   - Містить систему комп'ютерного тестування (QuizEngine), систему прокторингу з відстеженням порушень (split-screen, вихід з fullscreen, зміна вкладок), адмін-панель з протоколами тестувань, каталог питань та кабінети викладача і студента.

3. **`backend` (Node.js / Express REST API)**:
   - Працює на порті `5000` (внутрішній доступ).
   - Підключається до PostgreSQL з авто-повтором підключення.
   - Автоматично створює схему БД (`schema.sql`) при першому старті.
   - Автоматично наповнює БД (Seed) усіма ~160+ офіційними тестовими завданнями, 12 предметами та користувачами за замовчуванням.
   - Забезпечує фіксацію протоколів тестувань, дискваліфікацій та журналу аудиту.

4. **`postgres` (PostgreSQL 16)**:
   - Реляційна база даних.
   - Постійні дані зберігаються в Docker Volume `postgres_data` (зберігаються навіть після перезапуску або оновлення контейнерів).
   - Вбудований Healthcheck (`pg_isready`).

---

## 🚀 Швидкий старт на сервері

### Крок 1. Підготовка сервера
Переконайтеся, що на сервері встановлено **Docker** та **Docker Compose v2**:
```bash
# Для Ubuntu / Debian:
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

### Крок 2. Клонування або копіювання проекту
Завантажте проект на сервер (наприклад, у директорію `/opt/cyberedki` або `~/cyberedki`):
```bash
cd /opt/cyberedki
```

### Крок 3. Налаштування змінних оточення
Файл `.env` вже створено з базовими налаштуваннями. За потреби змініть пароль бази даних:
```bash
cp .env.example .env
nano .env
```
Приклад конфігурації `.env`:
```env
POSTGRES_DB=cyberedki
POSTGRES_USER=edki_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432
BACKEND_PORT=5000
NODE_ENV=production
HTTP_PORT=80
```

### Крок 4. Запуск контейнерів
Запустіть збірку та старт усіх сервісів у фоновому режимі:
```bash
docker compose up -d --build
```

### Крок 5. Перевірка статусу
Перевірте, що всі 4 контейнери успішно піднялися та знаходяться у статусі `Up` або `healthy`:
```bash
docker compose ps
```

Перевірте логи бекенду:
```bash
docker compose logs -f backend
```
Ви повинні побачити повідомлення:
```
PostgreSQL connection established successfully.
Database schema verified/created.
Database already seeded (or Seeded 160 questions successfully!)
CyberEDKI Backend API listening on port 5000
```

Тепер сайт доступний у браузері за IP-адресою або доменом вашого сервера:
```
http://<IP_АДРЕСА_СЕРВЕРА>/
```

---

## 🔑 Облікові записи за замовчуванням

Після автоматичного наповнення бази даних доступні наступні користувачі:

| Роль | Логін | Пароль | Опис |
|---|---|---|---|
| **Головний адміністратор** | `AdM1n` | `te6tadm1N` | Повний доступ до адмін-панелі, протоколів тестувань, викладачів, скидання паролів |
| **Викладач** | `Teacher` | `te6tTeac4` | Керування питаннями, темами, аналітика груп |
| **Студент** | `Student` | `Stu2eNt` | Складання симуляції ЄДКІ, тематичні тести, тренування помилок |

---

## 🔒 Підключення SSL / HTTPS (Let's Encrypt Certbot)

Для переводу сайту на безпечний протокол `https://`:

1. Встановіть `certbot`:
```bash
sudo apt install -y certbot
```

2. Зупиніть Nginx на короткий час для отримання сертифіката:
```bash
docker compose stop nginx
sudo certbot certonly --standalone -d your-domain.ua
```

3. Змонтуйте сертифікати в `nginx` у `docker-compose.yml`:
```yaml
  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

4. Запустіть сервіси знову:
```bash
docker compose up -d
```

---

## 🛠 Корисні команди для обслуговування

- **Перегляд логів у реальному часі:**
  ```bash
  docker compose logs -f
  ```
- **Перезапуск одного сервісу (наприклад, бекенду):**
  ```bash
  docker compose restart backend
  ```
- **Оновлення коду та перезапуск:**
  ```bash
  git pull
  docker compose up -d --build
  ```
- **Створення резервної копії бази даних PostgreSQL:**
  ```bash
  docker compose exec postgres pg_dump -U edki_user cyberedki > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- **Відновлення бази даних із бекапу:**
  ```bash
  cat backup_file.sql | docker compose exec -T postgres psql -U edki_user -d cyberedki
  ```
- **Повна зупинка зі збереженням даних:**
  ```bash
  docker compose down
  ```
- **Повне очищення (УВАГА: видаляє базу даних):**
  ```bash
  docker compose down -v
  ```
