package com.creditapi.backend.config;

import java.net.http.HttpClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
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
        // Enforce HTTP/1.1 to avoid issues integration test that use wiremock
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();

        return RestClient.builder()
                .baseUrl(fastApiUrl)
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .build();
    }
}