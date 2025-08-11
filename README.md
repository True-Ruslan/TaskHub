# 📋 TaskHub

```
 ████████╗ █████╗ ███████╗██╗  ██╗██╗  ██╗██╗   ██╗██████╗ 
 ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝██║  ██║██║   ██║██╔══██╗
    ██║   ███████║███████╗█████╔╝ ███████║██║   ██║██████╔╝
    ██║   ██╔══██║╚════██║██╔═██╗ ██╔══██║██║   ██║██╔══██╗
    ██║   ██║  ██║███████║██║  ██╗██║  ██║╚██████╔╝██████╔╝
    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
```

**TaskHub** — это полнофункциональная система управления задачами с AI-интеграцией, состоящая из backend API и современного веб-интерфейса.

## ✨ Основные возможности

- 📋 **CRUD операции** - Создание, чтение, обновление и удаление задач
- 🤖 **AI Генерация** - Создание технических задач с помощью OpenRouter AI
- 🎨 **Modern UI** - Responsive веб-интерфейс на Vanilla JavaScript
- 📚 **API Документация** - Автоматическая генерация Swagger/OpenAPI
- 🐳 **Docker** - Готовая инфраструктура для разработки
- 🔧 **Мониторинг** - Health checks и метрики через Spring Actuator

## 🛠 Технологический стек

### Backend
- **Java 21** - Современная версия JDK
- **Spring Boot 3.5.4** - Основной фреймворк
- **Spring Security** - Безопасность
- **PostgreSQL** - Основная БД
- **Liquibase** - Миграции БД
- **OpenAPI/Swagger** - Документация API

### Frontend
- **Vanilla JavaScript** - ES6 модули
- **Tailwind CSS** - CSS фреймворк
- **Fetch API** - HTTP клиент

### Инфраструктура
- **Redis** - Кэширование и сессии
- **Apache Kafka** - Message broker
- **ClickHouse** - Аналитическая БД
- **Docker Compose** - Контейнеризация
- **GitHub Packages** - Публикация Docker образов

## 🚀 Быстрый старт

### Вариант 1: Docker Compose (Рекомендуется)

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd TaskHub
   ```

2. **Запустите инфраструктуру:**
   ```bash
   docker-compose up -d
   ```

3. **Скопируйте конфигурацию:**
   ```bash
   cp src/main/resources/application-template.yml src/main/resources/application.yml
   ```

4. **Настройте переменные окружения:**
   ```bash
   export DB_USERNAME=taskuser
   export DB_PASSWORD=taskpass
   export OPENROUTER_API_KEY=your_openrouter_key  # Для AI функций
   ```

5. **Запустите backend:**
   ```bash
   ./mvnw spring-boot:run
   ```

6. **Запустите frontend:**
   ```bash
   cd frontend
   python -m http.server 3000
   ```

### Вариант 3: Docker Image (Production)

1. **Используйте готовый образ:**
   ```bash
   docker pull ghcr.io/{your-username}/taskhub:latest
   ```

2. **Запустите контейнер:**
   ```bash
   docker run -d \
     --name taskhub \
     -p 8080:8080 \
     -e SPRING_PROFILES_ACTIVE=prod \
     ghcr.io/{your-username}/taskhub:latest
   ```

3. **Или используйте docker-compose:**
   ```bash
   # Отредактируйте docker-compose.yml, заменив build на image
   docker-compose up -d
   ```

**Примечание:** Замените `{your-username}` на ваше имя пользователя GitHub.

### Вариант 2: Локальная установка

1. **Установите PostgreSQL** и создайте БД `taskdb`

2. **Настройте конфигурацию:**
   ```bash
   cp src/main/resources/application-template.yml src/main/resources/application.yml
   # Отредактируйте connection string в application.yml
   ```

3. **Запустите backend:**
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Запустите frontend:**
   ```bash
   cd frontend
   python -m http.server 3000
   ```

## 📍 Доступные сервисы

После запуска Docker Compose будут доступны:

| Сервис | URL | Описание |
|--------|-----|----------|
| **Backend API** | http://localhost:8080 | Основное приложение |
| **Frontend** | http://localhost:3000 | Веб-интерфейс |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | API документация |
| **PostgreSQL** | localhost:5432 | База данных |
| **pgAdmin** | http://localhost:5050 | Веб-интерфейс для PostgreSQL |
| **Redis** | localhost:6379 | Кэш и сессии |
| **RedisInsight** | http://localhost:5540 | Redis веб-интерфейс |
| **Kafka** | localhost:29092 | Message broker |
| **Kafka UI** | http://localhost:8081 | Kafka веб-интерфейс |
| **ClickHouse** | localhost:8123 | Аналитическая БД |
| **ClickHouse UI** | http://localhost:5521 | ClickHouse веб-интерфейс |

## 🔌 API Endpoints

### Управление задачами
- `GET /api/v1/tasks` - Получить все задачи
- `GET /api/v1/tasks/{id}` - Получить задачу по ID
- `POST /api/v1/tasks` - Создать новую задачу
- `PUT /api/v1/tasks/{id}` - Обновить задачу
- `DELETE /api/v1/tasks/{id}` - Удалить задачу

### AI Генерация
- `POST /api/v1/tasks/generate` - Сгенерировать задачу с помощью AI
- `GET /api/v1/tasks/generate/health` - Проверить доступность AI сервиса

### Служебные
- `GET /api/v1/tasks/ping` - Health check
- `GET /actuator/health` - Подробная информация о состоянии
- `GET /api-docs` - OpenAPI схема

## 📁 Структура проекта

```
TaskHub/
├── src/                          # Backend исходники
│   ├── main/java/
│   │   └── dev/ruslan/taskhub/
│   │       ├── api/              # REST контроллеры
│   │       ├── service/          # Бизнес-логика
│   │       ├── model/            # Модели и DTO
│   │       ├── repository/       # JPA репозитории
│   │       ├── config/           # Конфигурация
│   │       └── exception/        # Обработка ошибок
│   └── main/resources/
│       ├── application-template.yml
│       └── db/changelog/         # Liquibase миграции
├── frontend/                     # Frontend приложение
│   ├── components/               # UI компоненты
│   ├── main.js                   # Основной JS файл
│   └── index.html                # HTML страница
├── docker-compose.yml            # Инфраструктура
└── pom.xml                       # Maven конфигурация
```

## 🔧 Настройка AI

Для использования AI генерации задач:

1. **Получите API ключ** от [OpenRouter](https://openrouter.ai/)

2. **Установите переменную окружения:**
   ```bash
   export OPENROUTER_API_KEY=your_actual_api_key
   ```

3. **Или отредактируйте** `application.yml`:
   ```yaml
   openrouter:
     api:
       key: your_actual_api_key
   ```

## 🧪 Тестирование

```bash
# Запуск тестов
./mvnw test

# Проверка работоспособности API
curl http://localhost:8080/api/v1/tasks/ping

# Проверка AI сервиса
curl http://localhost:8080/api/v1/tasks/generate/health
```

## 🚀 CI/CD Pipeline

Проект использует GitHub Actions для автоматизации:

### Docker Publishing
- **Автоматическая сборка** при push в master ветку
- **Публикация в GitHub Packages** (ghcr.io)
- **Множественные теги** для разных версий
- **Кэширование слоев** для быстрой сборки

### Workflows
- `maven.yml` - Сборка и тестирование Java приложения
- `docker-publish.yml` - Сборка и публикация Docker образа

### Использование готовых образов
```bash
# Последняя версия
docker pull ghcr.io/{username}/taskhub:latest

# Конкретная версия
docker pull ghcr.io/{username}/taskhub:v1.0.0

# Ветка разработки
docker pull ghcr.io/{username}/taskhub:develop-abc123
```

## 📋 Требования к окружению

- **Java 21+**
- **Maven 3.8+**
- **Docker & Docker Compose** (для инфраструктуры)
- **Python 3** (для frontend сервера)

## 🚧 Статус проекта

✅ **MVP завершен** - Основной функционал реализован
🔄 **Активная разработка** - Добавляются новые возможности

## 📄 Лицензия

MIT