package com.example.accountmanager.dto.response;

import com.example.accountmanager.entity.Account;
import com.example.accountmanager.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {

    private Long id;
    private String username;
    private String fullname;
    private String email;
    private Long departmentId;
    private String departmentName;
    private Long positionId;
    private String positionName;
    private LocalDateTime createDate;
    private Role role;

    public static AccountResponse fromEntity(Account account) {
        if (account == null) return null;
        return AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .fullname(account.getFullname())
                .email(account.getEmail())
                .departmentId(account.getDepartment() != null ? account.getDepartment().getId() : null)
                .departmentName(account.getDepartment() != null ? account.getDepartment().getName() : null)
                .positionId(account.getPosition() != null ? account.getPosition().getId() : null)
                .positionName(account.getPosition() != null ? account.getPosition().getName() : null)
                .createDate(account.getCreateDate())
                .role(account.getRole())
                .build();
    }
}
