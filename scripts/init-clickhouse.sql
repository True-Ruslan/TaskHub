-- Инициализация ClickHouse для TaskHub Analytics
-- Этот скрипт должен выполняться напрямую в ClickHouse

-- Создание таблицы для хранения событий задач
CREATE TABLE IF NOT EXISTS task_events (
    id String,
    event_type String,
    title String,
    status String,
    created_at DateTime
) ENGINE = MergeTree() 
ORDER BY created_at
SETTINGS index_granularity = 8192;

-- Создание представления для последних статусов задач
CREATE VIEW IF NOT EXISTS latest_task_status AS
SELECT 
    id,
    argMax(status, created_at) as latest_status,
    argMax(title, created_at) as latest_title,
    min(created_at) as first_created,
    max(created_at) as last_updated
FROM task_events
GROUP BY id;

-- Индексы для оптимизации запросов
-- (ClickHouse автоматически создает индексы на основе ORDER BY)

-- Проверка созданных таблиц
SHOW TABLES;