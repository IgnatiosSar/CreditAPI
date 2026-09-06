package com.creditapi.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.http.MediaType;

import com.creditapi.backend.dto.CreditPredictionResponse;
import com.creditapi.backend.dto.CreditProfile;

/**
 * 
 * CreditEvaluationService class is responsible for communicating with the FastAPI service.
 * 
 */

@Service
public class CreditEvaluationService {

    private RestClient fastApiClient;

    @Autowired
    public CreditEvaluationService(RestClient fastApiClient) {
        this.fastApiClient = fastApiClient;
    }


    public CreditPredictionResponse evaluateCreditProfile(CreditProfile creditProfile) {
       try {
            CreditPredictionResponse response = fastApiClient.post()
                .uri("/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .body(creditProfile)
                .retrieve()
                .body(CreditPredictionResponse.class);

            return response;
           
        } catch (RestClientResponseException ex) {
            throw new RuntimeException(
                    "Inference service rejected the request (status "
                            + ex.getStatusCode() + "): " + ex.getResponseBodyAsString(), ex);
        } catch (Exception ex) {
            throw new RuntimeException("Inference service unreachable", ex);
        }
    }
}
