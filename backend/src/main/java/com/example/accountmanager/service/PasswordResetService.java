package com.example.accountmanager.service;

import com.example.accountmanager.dto.request.ForgotPasswordRequest;
import com.example.accountmanager.dto.request.ResetPasswordRequest;
import com.example.accountmanager.entity.Account;
import com.example.accountmanager.entity.PasswordResetToken;
import com.example.accountmanager.exception.BadRequestException;
import com.example.accountmanager.repository.AccountRepository;
import com.example.accountmanager.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final AccountRepository accountRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.reset-token-expiration-minutes:30}")
    private int expirationMinutes;

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        Optional<Account> accountOpt = accountRepository.findByEmail(request.getEmail().trim().toLowerCase());
        if (accountOpt.isEmpty()) {
            // General message to prevent email enumeration
            log.info("Password reset requested for non-existing email: {}", request.getEmail());
            return;
        }

        Account account = accountOpt.get();
        tokenRepository.deleteAllByAccount(account);

        String rawToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().substring(0, 8);
        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .account(account)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .build();

        tokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(account.getEmail(), rawToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken().trim());
        PasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("Password reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("Password reset token has expired");
        }

        Account account = resetToken.getAccount();
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}
