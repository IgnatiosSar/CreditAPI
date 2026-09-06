package com.creditapi.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * 
 * FastApiConfig class is responsible for configuring the RestClient bean to communicate with the FastAPI service.
 * 
 */

@Configuration
public class FastApiConfig {

    @Bean(name = "fastApiClient") 
    public RestClient fastApiClient(@Value("${fastapi.base-url}") String fastApiUrl) {
        return RestClient.builder()
                .baseUrl(fastApiUrl)
                .build();
    }
}