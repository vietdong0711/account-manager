package com.example.accountmanager.dto.request;

import com.example.accountmanager.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAccountRequest {

    @NotBlank(message = "Fullname cannot be empty")
    private String fullname;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email format is invalid")
    private String email;

    private Long departmentId;

    private Long positionId;

    @NotNull(message = "Role must be specified")
    private Role role;

    @Size(min = 6, message = "Password must be at least 6 characters if specified")
    private String password;
}
