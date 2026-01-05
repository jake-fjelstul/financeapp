package com.jakefinance.financeapp.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        return builder
                .serializationInclusion(JsonInclude.Include.ALWAYS) // Always include all fields, even if empty
                .modules(new JavaTimeModule()) // Support for LocalDate, LocalDateTime, etc.
                .featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES) // Ignore unknown properties
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS) // Write dates as ISO strings
                .build();
    }

    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        return new Jackson2ObjectMapperBuilder()
                .serializationInclusion(JsonInclude.Include.ALWAYS) // Always include all fields, even if empty
                .modules(new JavaTimeModule()) // Support for LocalDate, LocalDateTime, etc.
                .featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES); // Ignore unknown properties
    }
}

