package dev.ruslan.taskhub.analytics;

import dev.ruslan.taskhub.model.dto.events.TaskEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Сервис для работы с ClickHouse и аналитикой событий задач
 */
@Service
public class ClickHouseService {

    private static final Logger logger = LoggerFactory.getLogger(ClickHouseService.class);

    @Value("${clickhouse.datasource.url}")
    private String clickhouseUrl;

    @Value("${clickhouse.datasource.username}")
    private String username;

    @Value("${clickhouse.datasource.password}")
    private String password;

    /**
     * Вставляет событие задачи в ClickHouse
     */
    public void insertTaskEvent(TaskEvent event) {
        String sql = """
            INSERT INTO task_events (id, event_type, title, status, created_at) 
            VALUES (?, ?, ?, ?, ?)
            """;

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, UUID.randomUUID().toString());
            statement.setString(2, event.getEventType());
            statement.setString(3, event.getTitle());
            statement.setString(4, event.getStatus().name());
            statement.setObject(5, event.getTimestamp());

            int rowsAffected = statement.executeUpdate();
            logger.debug("Inserted task event into ClickHouse: {} rows affected", rowsAffected);

        } catch (SQLException e) {
            logger.error("Error inserting task event into ClickHouse: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to insert task event", e);
        }
    }

    /**
     * Получает количество задач по дням за последний месяц
     */
    public Map<String, Long> getTaskCountByDay() {
        String sql = """
            SELECT 
                toDate(created_at) as date,
                count() as task_count
            FROM task_events 
            WHERE created_at >= now() - INTERVAL 30 DAY
                AND event_type = 'task.created'
            GROUP BY toDate(created_at)
            ORDER BY date DESC
            """;

        Map<String, Long> result = new HashMap<>();

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                String date = resultSet.getString("date");
                Long count = resultSet.getLong("task_count");
                result.put(date, count);
            }

            logger.debug("Retrieved task count by day: {} records", result.size());

        } catch (SQLException e) {
            logger.error("Error retrieving task count by day: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve task count by day", e);
        }

        return result;
    }

    /**
     * Получает среднее время выполнения задач (от создания до выполнения)
     */
    public Double getAvgTaskDuration() {
        String sql = """
            SELECT 
                avg(duration_hours) as avg_duration
            FROM (
                SELECT 
                    id,
                    dateDiff('hour', 
                        min(case when event_type = 'task.created' then created_at end),
                        min(case when event_type = 'task.updated' and status = 'COMPLETED' then created_at end)
                    ) as duration_hours
                FROM task_events
                WHERE created_at >= now() - INTERVAL 30 DAY
                GROUP BY id
                HAVING duration_hours > 0
            ) as task_durations
            """;

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            if (resultSet.next()) {
                Double avgDuration = resultSet.getDouble("avg_duration");
                logger.debug("Retrieved average task duration: {} hours", avgDuration);
                return avgDuration;
            }

        } catch (SQLException e) {
            logger.error("Error retrieving average task duration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve average task duration", e);
        }

        return 0.0;
    }

    /**
     * Получает количество задач по статусам
     */
    public Map<String, Long> getTaskCountByStatus() {
        String sql = """
            SELECT 
                status,
                count() as task_count
            FROM (
                SELECT 
                    id,
                    argMax(status, created_at) as status
                FROM task_events
                WHERE created_at >= now() - INTERVAL 30 DAY
                GROUP BY id
            ) as latest_statuses
            GROUP BY status
            ORDER BY task_count DESC
            """;

        Map<String, Long> result = new HashMap<>();

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                String status = resultSet.getString("status");
                Long count = resultSet.getLong("task_count");
                result.put(status, count);
            }

            logger.debug("Retrieved task count by status: {} statuses", result.size());

        } catch (SQLException e) {
            logger.error("Error retrieving task count by status: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve task count by status", e);
        }

        return result;
    }

    /**
     * Получает соединение с ClickHouse
     */
    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(clickhouseUrl, username, password);
    }
}