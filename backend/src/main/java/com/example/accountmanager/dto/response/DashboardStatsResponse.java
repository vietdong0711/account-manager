package com.example.accountmanager.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalAccounts;
    private long totalDepartments;
    private long totalPositions;
    private long adminCount;
    private long userCount;
}
