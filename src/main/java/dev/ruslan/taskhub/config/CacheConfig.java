package dev.ruslan.taskhub.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Конфигурация кеширования с Redis в качестве основного кеша
 * и Caffeine в качестве fallback кеша
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final Logger logger = LoggerFactory.getLogger(CacheConfig.class);

    @Value("${cache.redis.host:localhost}")
    private String redisHost;

    @Value("${cache.redis.port:6379}")
    private int redisPort;

    @Value("${cache.redis.password:}")
    private String redisPassword;

    @Value("${cache.redis.timeout:2000}")
    private int redisTimeout;

    @Value("${cache.redis.ttl:60}")
    private long redisTtl;

    @Value("${cache.caffeine.maximum-size:1000}")
    private long caffeineMaxSize;

    @Value("${cache.caffeine.expire-after-write:60s}")
    private String caffeineExpireAfterWrite;

    /**
     * Конфигурация подключения к Redis
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        try {
            RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
            config.setHostName(redisHost);
            config.setPort(redisPort);
            if (redisPassword != null && !redisPassword.trim().isEmpty()) {
                config.setPassword(redisPassword);
            }

            LettuceConnectionFactory factory = new LettuceConnectionFactory(config);
            factory.setValidateConnection(true);
            factory.afterPropertiesSet();
            
            logger.info("Redis connection factory configured for {}:{}", redisHost, redisPort);
            return factory;
        } catch (Exception e) {
            logger.error("Failed to configure Redis connection factory: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * ObjectMapper с поддержкой Java 8 времени для Redis
     */
    @Bean
    public ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    /**
     * Redis Template для работы с Redis
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper));
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper));
        template.afterPropertiesSet();
        return template;
    }

    /**
     * Redis Cache Manager - основной кеш
     */
    @Bean
    @Primary
    public CacheManager redisCacheManager(RedisConnectionFactory redisConnectionFactory, ObjectMapper redisObjectMapper) {
        try {
            RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofSeconds(redisTtl))
                    .serializeKeysWith(org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair
                            .fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair
                            .fromSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper)));

            RedisCacheManager cacheManager = RedisCacheManager.builder(redisConnectionFactory)
                    .cacheDefaults(cacheConfig)
                    .transactionAware()
                    .build();

            logger.info("Redis cache manager configured with TTL: {} seconds (individual task caching only)", redisTtl);
            return cacheManager;
        } catch (Exception e) {
            logger.error("Failed to configure Redis cache manager: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Caffeine Cache Manager - fallback кеш
     */
    @Bean
    @ConditionalOnMissingBean(name = "redisCacheManager")
    public CacheManager caffeineCacheManager() {
        logger.warn("Redis is not available, using Caffeine as fallback cache");
        
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(caffeineMaxSize)
                .expireAfterWrite(parseDuration(caffeineExpireAfterWrite), TimeUnit.SECONDS)
                .recordStats());

        logger.info("Caffeine cache manager configured as fallback with max size: {} and TTL: {}", 
                    caffeineMaxSize, caffeineExpireAfterWrite);
        return cacheManager;
    }

    /**
     * Парсинг строки продолжительности в секунды
     */
    private long parseDuration(String duration) {
        if (duration.endsWith("s")) {
            return Long.parseLong(duration.substring(0, duration.length() - 1));
        } else if (duration.endsWith("m")) {
            return Long.parseLong(duration.substring(0, duration.length() - 1)) * 60;
        } else if (duration.endsWith("h")) {
            return Long.parseLong(duration.substring(0, duration.length() - 1)) * 3600;
        }
        return Long.parseLong(duration);
    }
}