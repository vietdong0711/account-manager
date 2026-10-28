package com.example.accountmanager.service;

import com.example.accountmanager.dto.request.ChangePasswordRequest;
import com.example.accountmanager.dto.request.LoginRequest;
import com.example.accountmanager.dto.response.AccountResponse;
import com.example.accountmanager.dto.response.AuthResponse;
import com.example.accountmanager.entity.Account;
import com.example.accountmanager.exception.BadRequestException;
import com.example.accountmanager.exception.ResourceNotFoundException;
import com.example.accountmanager.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", account.getRole().name());
        extraClaims.put("fullname", account.getFullname());

        String jwtToken = jwtService.generateToken(extraClaims, account);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .account(AccountResponse.fromEntity(account))
                .build();
    }

    public AccountResponse getMe(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with username: " + username));
        return AccountResponse.fromEntity(account);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with username: " + username));

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }
}
