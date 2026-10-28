package com.example.accountmanager.dto.response;

import com.example.accountmanager.entity.Department;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {

    private Long id;
    private String name;
    private long accountCount;

    public static DepartmentResponse fromEntity(Department department, long accountCount) {
        if (department == null) return null;
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .accountCount(accountCount)
                .build();
    }
}
