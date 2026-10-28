package com.example.accountmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionRequest {

    @NotBlank(message = "Position name cannot be empty")
    @Size(max = 150, message = "Position name cannot exceed 150 characters")
    private String name;
}
