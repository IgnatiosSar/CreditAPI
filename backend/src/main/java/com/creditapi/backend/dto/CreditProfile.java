package com.creditapi.backend.dto;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * CreditProfile class represents the credit profile of a user.
 * It contains basic information related to the user's credit profile.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditProfile {

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 100, message = "Age cannot exceed 100")
    private Integer age;

    @NotBlank(message = "Sex is required")
    private String sex;

    @NotNull
    @Min(0)
    @Max(3)
    private Integer job;

    @NotBlank
    private String housing;

    @JsonProperty("saving_accounts")
    private String savingAccounts;

    @JsonProperty("checking_account")
    private String checkingAccount;

    @NotNull
    @Positive(message = "Credit amount must be greater than 0")
    @JsonProperty("credit_amount")
    private Double creditAmount;

    @NotNull
    @Positive(message = "Duration must be greater than 0")
    private Integer duration;

    @NotBlank
    private String purpose;
}
