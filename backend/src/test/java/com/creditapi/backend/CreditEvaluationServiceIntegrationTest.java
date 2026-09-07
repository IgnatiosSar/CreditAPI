package com.creditapi.backend;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;


import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalToJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
 
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
 
import com.creditapi.backend.dto.CreditPredictionResponse;
import com.creditapi.backend.dto.CreditProfile;
import com.creditapi.backend.service.CreditEvaluationService;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.http.Fault;
 
/**
 * 
 * This integration test replicates the interaction between the CreditEvaluationService and the FastAPI service using WireMock to simulate the FastAPI service.
 * 
 */
@SpringBootTest
public class CreditEvaluationServiceIntegrationTest {

    private static WireMockServer wireMockServer;

    @Autowired
    private CreditEvaluationService creditEvaluationService;

    @BeforeAll
    static void startWireMock() {
        wireMockServer = new WireMockServer(0); 
        wireMockServer.start();
    }
 
    @AfterAll
    static void stopWireMock() {
        wireMockServer.stop();
    }

    @BeforeEach
    void resetWireMock() {
        wireMockServer.resetAll();
    }
 
    @DynamicPropertySource
    static void overrideInferenceServiceUrl(DynamicPropertyRegistry registry) {
        registry.add("fastapi.base-url", () -> "http://localhost:" + wireMockServer.port());
    }

    @Test
    @DisplayName("Integration Test: CreditEvaluationService should communicate with mocked FastAPI service")
    void testEvaluateCreditProfile() {
         String expectedRequestJson = """
                {
                  "age": 30,
                  "sex": "male",
                  "job": 2,
                  "housing": "own",
                  "saving_accounts": "little",
                  "checking_account": "little",
                  "credit_amount": 2000.0,
                  "duration": 12,
                  "purpose": "radio/TV"
                }
                """;

         wireMockServer.stubFor(post(urlEqualTo("/predict"))
                .withRequestBody(equalToJson(expectedRequestJson))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"is_approved\": true, \"probability_good\": 0.82}")));

        CreditProfile profile = new CreditProfile(
            30, "male", 2, "own", "little", "little", 2000.0, 12, "radio/TV");
        
        CreditPredictionResponse response = creditEvaluationService.evaluateCreditProfile(profile);
 
        assertThat(response.getIsApproved()).isTrue();
        assertThat(response.getProbabilityGood()).isEqualTo(0.82);
        
    }

    @Test 
    @DisplayName("Integration Test: CreditEvaluationService should handle unreachable FastAPI service")
    void testUnreachableFastApiService(){
        wireMockServer.stubFor(post(urlEqualTo("/predict"))
            .willReturn(aResponse().withFault(Fault.CONNECTION_RESET_BY_PEER)));

        CreditProfile profile = new CreditProfile(
            30, "male", 2, "own", "little", "little", 2000.0, 12, "radio/TV");

       
            assertThatThrownBy(() -> creditEvaluationService.evaluateCreditProfile(profile))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Inference service unreachable");
       
    }

    @Test 
    @DisplayName("Integration Test: CreditEvaluationService should handle FastAPI service rejection")
    void testFastApiServiceRejection() {
        wireMockServer.stubFor(post(urlEqualTo("/predict"))
            .willReturn(aResponse()
                    .withStatus(500)
                    .withHeader("Content-Type", "application/json")
                    .withBody("{\"error\": \"Internal Model Error\"}")));

    CreditProfile profile = new CreditProfile(
            30, "male", 2, "own", "little", "little", 2000.0, 12, "radio/TV");

    assertThatThrownBy(() -> creditEvaluationService.evaluateCreditProfile(profile))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Inference service rejected the request (status 500 INTERNAL_SERVER_ERROR)");
    }
}
