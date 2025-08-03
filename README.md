# 📋 TaskHub

```
 ████████╗ █████╗ ███████╗██╗  ██╗██╗  ██╗██╗   ██╗██████╗ 
 ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝██║  ██║██║   ██║██╔══██╗
    ██║   ███████║███████╗█████╔╝ ███████║██║   ██║██████╔╝
    ██║   ██╔══██║╚════██║██╔═██╗ ██╔══██║██║   ██║██╔══██╗
    ██║   ██║  ██║███████║██║  ██╗██║  ██║╚██████╔╝██████╔╝
    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
```

**TaskHub** — это минималистичный backend-сервис для управления задачами.

## 🛠 Технологии

- **Java 21**
- **Spring Boot**
- **PostgreSQL**
- **MapStruct**
- **Liquibase**

## 🚀 Как запустить проект

1. Скопируйте template конфигурации:
```bash
cp src/main/resources/application-template.yml src/main/resources/application.yml
```

2. Настройте переменные окружения для базы данных или отредактируйте `application.yml`:
```bash
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
```

3. Запустите приложение:
```bash
./mvnw spring-boot:run
```

## 📋 Требования к окружению

- **Java 21**
- **PostgreSQL**

## 📁 Структура проекта

```
└── src
    └── main
        ├── java
        │   └── ... (основной код)
        └── resources
            ├── application.yml
            └── db
                └── changelog
```

## 📊 Статус

🚧 **В активной разработке (MVP)**

## 📄 Лицензия

MIT