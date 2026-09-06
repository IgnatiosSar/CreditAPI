package com.creditapi.backend.dto;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@AllArgsConstructor
@NoArgsConstructor

/**
 * 
 * CreditPredictionResponse class represents the response for a user's credit profile.
 * 
 */
public class CreditPredictionResponse{
    @JsonProperty("is_approved")
    Boolean isApproved;

    @JsonProperty("probability_good")
    Double probabilityGood;
}