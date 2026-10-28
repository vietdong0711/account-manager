package com.example.accountmanager.repository;

import com.example.accountmanager.entity.Account;
import com.example.accountmanager.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByUsername(String username);

    Optional<Account> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    @Query("SELECT a FROM Account a WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(a.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.fullname) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:departmentId IS NULL OR (a.department IS NOT NULL AND a.department.id = :departmentId)) AND " +
           "(:positionId IS NULL OR (a.position IS NOT NULL AND a.position.id = :positionId)) AND " +
           "(:role IS NULL OR a.role = :role)")
    Page<Account> searchAccounts(
            @Param("keyword") String keyword,
            @Param("departmentId") Long departmentId,
            @Param("positionId") Long positionId,
            @Param("role") Role role,
            Pageable pageable
    );
}
