package com.example.accountmanager.service;

import com.example.accountmanager.dto.request.CreateAccountRequest;
import com.example.accountmanager.dto.request.UpdateAccountRequest;
import com.example.accountmanager.dto.response.AccountResponse;
import com.example.accountmanager.dto.response.DashboardStatsResponse;
import com.example.accountmanager.dto.response.PageResponse;
import com.example.accountmanager.entity.Account;
import com.example.accountmanager.entity.Department;
import com.example.accountmanager.entity.Position;
import com.example.accountmanager.entity.Role;
import com.example.accountmanager.exception.BadRequestException;
import com.example.accountmanager.exception.ResourceNotFoundException;
import com.example.accountmanager.repository.AccountRepository;
import com.example.accountmanager.repository.DepartmentRepository;
import com.example.accountmanager.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final PasswordEncoder passwordEncoder;

    public PageResponse<AccountResponse> searchAccounts(
            String keyword,
            Long departmentId,
            Long positionId,
            Role role,
            Pageable pageable
    ) {
        Page<Account> page = accountRepository.searchAccounts(
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                departmentId,
                positionId,
                role,
                pageable
        );

        List<AccountResponse> content = page.getContent().stream()
                .map(AccountResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.of(page, content);
    }

    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
        return AccountResponse.fromEntity(account);
    }

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request) {
        String username = request.getUsername().trim();
        if (accountRepository.existsByUsername(username)) {
            throw new BadRequestException("Username '" + username + "' is already taken");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (accountRepository.existsByEmail(email)) {
            throw new BadRequestException("Email '" + email + "' is already registered");
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        }

        Position position = null;
        if (request.getPositionId() != null) {
            position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Position not found with id: " + request.getPositionId()));
        }

        Account account = Account.builder()
                .username(username)
                .fullname(request.getFullname().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .department(department)
                .position(position)
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .createDate(LocalDateTime.now())
                .build();

        Account saved = accountRepository.save(account);
        return AccountResponse.fromEntity(saved);
    }

    @Transactional
    public AccountResponse updateAccount(Long id, UpdateAccountRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        String email = request.getEmail().trim().toLowerCase();
        accountRepository.findByEmail(email).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Email '" + email + "' is already used by another account");
            }
        });

        // Rule: Không cho phép hạ quyền tài khoản ADMIN cuối cùng
        if (account.getRole() == Role.ADMIN && request.getRole() != Role.ADMIN) {
            long adminCount = accountRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot demote the last ADMIN account in the system");
            }
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        }

        Position position = null;
        if (request.getPositionId() != null) {
            position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Position not found with id: " + request.getPositionId()));
        }

        account.setFullname(request.getFullname().trim());
        account.setEmail(email);
        account.setDepartment(department);
        account.setPosition(position);
        account.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            account.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        Account updated = accountRepository.save(account);
        return AccountResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        // Rule: Không cho phép xóa tài khoản ADMIN cuối cùng
        if (account.getRole() == Role.ADMIN) {
            long adminCount = accountRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot delete the last ADMIN account in the system");
            }
        }

        accountRepository.delete(account);
    }

    public DashboardStatsResponse getDashboardStats() {
        return DashboardStatsResponse.builder()
                .totalAccounts(accountRepository.count())
                .totalDepartments(departmentRepository.count())
                .totalPositions(positionRepository.count())
                .adminCount(accountRepository.countByRole(Role.ADMIN))
                .userCount(accountRepository.countByRole(Role.USER))
                .build();
    }
}
