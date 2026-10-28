package com.example.accountmanager.dto.response;

import com.example.accountmanager.entity.Position;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionResponse {

    private Long id;
    private String name;
    private long accountCount;

    public static PositionResponse fromEntity(Position position, long accountCount) {
        if (position == null) return null;
        return PositionResponse.builder()
                .id(position.getId())
                .name(position.getName())
                .accountCount(accountCount)
                .build();
    }
}
