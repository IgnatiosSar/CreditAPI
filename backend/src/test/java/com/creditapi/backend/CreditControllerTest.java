package com.creditapi.backend;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.creditapi.backend.controller.CreditController;
import com.creditapi.backend.dto.CreditPredictionResponse;
import com.creditapi.backend.service.CreditEvaluationService;



@WebMvcTest(CreditController.class)
public class CreditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreditEvaluationService creditEvaluationService;


    private static final String VALID_REQUEST_JSON = """
        {
            "age": 30, "sex": "male", "job": 2, "housing": "own",
            "saving_accounts": "little", "checking_account": "little",
            "credit_amount": 2000, "duration": 12, "purpose": "radio/TV"
        }
        """;

    private static final String INVALID_REQUEST_JSON = """
        {
            "age": 16, "sex": "male", "job": 2, "housing": "own",
            "saving_accounts": "little", "checking_account": "little",
            "credit_amount": -500, "duration": 12, "purpose": "radio/TV"
        }
        """;
    @Test
    void sendValidCreditProfileReturnsPrediction() throws Exception {
         given(creditEvaluationService.evaluateCreditProfile(any()))
                .willReturn(new CreditPredictionResponse(true, 0.82));
 
        mockMvc.perform(post("/api/credit/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REQUEST_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.is_approved").value(true))
                .andExpect(jsonPath("$.probability_good").value(0.82));
    }

    @Test
    void sendInvalidCreditProfileNeverReachesService() throws Exception {
        mockMvc.perform(post("/api/credit/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(INVALID_REQUEST_JSON))
                .andExpect(status().isBadRequest());
        
        // Verify that the service method was never called due to validation failure
        then(creditEvaluationService).shouldHaveNoInteractions();

    }
    
    
}
