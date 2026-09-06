package com.creditapi.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.creditapi.backend.dto.CreditPredictionResponse;
import com.creditapi.backend.dto.CreditProfile;
import com.creditapi.backend.service.CreditEvaluationService;

import jakarta.validation.Valid;

/**
 * 
 * CreditController class is responsible for handling HTTP requests related to credit evaluation and returning the prediction results.
 * 
 */

@RequestMapping("/api/credit")
@RestController
public class CreditController {
    private final CreditEvaluationService creditEvaluationService;

    public CreditController(CreditEvaluationService creditEvaluationService) {
        this.creditEvaluationService = creditEvaluationService;
    }
    
    @PostMapping("/predict")
    public CreditPredictionResponse predictCreditRisk(@Valid @RequestBody CreditProfile creditProfile) {
        return creditEvaluationService.evaluateCreditProfile(creditProfile);
    }
}
