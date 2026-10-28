package com.example.accountmanager.service;

import com.example.accountmanager.dto.request.PositionRequest;
import com.example.accountmanager.dto.response.PositionResponse;
import com.example.accountmanager.entity.Position;
import com.example.accountmanager.exception.BadRequestException;
import com.example.accountmanager.exception.ResourceNotFoundException;
import com.example.accountmanager.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final PositionRepository positionRepository;

    public List<PositionResponse> getAllPositions() {
        return positionRepository.findAll().stream()
                .map(pos -> PositionResponse.fromEntity(
                        pos,
                        positionRepository.countAccountsByPositionId(pos.getId())
                ))
                .collect(Collectors.toList());
    }

    public PositionResponse getPositionById(Long id) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found with id: " + id));
        long count = positionRepository.countAccountsByPositionId(id);
        return PositionResponse.fromEntity(position, count);
    }

    @Transactional
    public PositionResponse createPosition(PositionRequest request) {
        String name = request.getName().trim();
        if (positionRepository.existsByName(name)) {
            throw new BadRequestException("Position with name '" + name + "' already exists");
        }

        Position position = Position.builder()
                .name(name)
                .build();
        Position saved = positionRepository.save(position);
        return PositionResponse.fromEntity(saved, 0);
    }

    @Transactional
    public PositionResponse updatePosition(Long id, PositionRequest request) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found with id: " + id));

        String name = request.getName().trim();
        if (positionRepository.existsByNameAndIdNot(name, id)) {
            throw new BadRequestException("Position with name '" + name + "' already exists");
        }

        position.setName(name);
        Position saved = positionRepository.save(position);
        long count = positionRepository.countAccountsByPositionId(id);
        return PositionResponse.fromEntity(saved, count);
    }

    @Transactional
    public void deletePosition(Long id) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found with id: " + id));

        long referencedCount = positionRepository.countAccountsByPositionId(id);
        if (referencedCount > 0) {
            throw new BadRequestException("Cannot delete position because it is currently assigned to " + referencedCount + " account(s)");
        }

        positionRepository.delete(position);
    }
}
