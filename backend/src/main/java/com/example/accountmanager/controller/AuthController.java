package com.example.accountmanager.controller;

import com.example.accountmanager.dto.request.ChangePasswordRequest;
import com.example.accountmanager.dto.request.ForgotPasswordRequest;
import com.example.accountmanager.dto.request.LoginRequest;
import com.example.accountmanager.dto.request.ResetPasswordRequest;
import com.example.accountmanager.dto.response.AccountResponse;
import com.example.accountmanager.dto.response.ApiResponse;
import com.example.accountmanager.dto.response.AuthResponse;
import com.example.accountmanager.service.AuthService;
import com.example.accountmanager.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AccountResponse>> getMe(Authentication authentication) {
        AccountResponse response = authService.getMe(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password has been successfully changed"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success(null, "If the email is registered, a password reset link has been sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password has been successfully reset. You may now log in with your new password."));
    }
}
