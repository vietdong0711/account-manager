package com.example.accountmanager.config;

import com.example.accountmanager.entity.Account;
import com.example.accountmanager.entity.Department;
import com.example.accountmanager.entity.Position;
import com.example.accountmanager.entity.Role;
import com.example.accountmanager.repository.AccountRepository;
import com.example.accountmanager.repository.DepartmentRepository;
import com.example.accountmanager.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Department deptEng = departmentRepository.findByName("Engineering")
                .orElseGet(() -> departmentRepository.save(Department.builder().name("Engineering").build()));

        Department deptHr = departmentRepository.findByName("Human Resources")
                .orElseGet(() -> departmentRepository.save(Department.builder().name("Human Resources").build()));

        Position posLead = positionRepository.findByName("Senior Software Engineer")
                .orElseGet(() -> positionRepository.save(Position.builder().name("Senior Software Engineer").build()));

        Position posEng = positionRepository.findByName("Software Engineer")
                .orElseGet(() -> positionRepository.save(Position.builder().name("Software Engineer").build()));

        if (accountRepository.findByUsername("admin").isEmpty()) {
            Account admin = Account.builder()
                    .username("admin")
                    .fullname("Administrator")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .department(deptEng)
                    .position(posLead)
                    .createDate(LocalDateTime.now())
                    .build();
            accountRepository.save(admin);
            log.info("Initialized default admin account: admin / Admin@123");
        }

        if (accountRepository.findByUsername("user").isEmpty()) {
            Account user = Account.builder()
                    .username("user")
                    .fullname("Standard User")
                    .email("user@example.com")
                    .password(passwordEncoder.encode("User@123"))
                    .role(Role.USER)
                    .department(deptHr)
                    .position(posEng)
                    .createDate(LocalDateTime.now())
                    .build();
            accountRepository.save(user);
            log.info("Initialized default user account: user / User@123");
        }
    }
}
