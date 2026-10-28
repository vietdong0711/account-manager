package com.example.accountmanager.service;

import com.example.accountmanager.dto.request.DepartmentRequest;
import com.example.accountmanager.dto.response.DepartmentResponse;
import com.example.accountmanager.entity.Department;
import com.example.accountmanager.exception.BadRequestException;
import com.example.accountmanager.exception.ResourceNotFoundException;
import com.example.accountmanager.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(dept -> DepartmentResponse.fromEntity(
                        dept,
                        departmentRepository.countAccountsByDepartmentId(dept.getId())
                ))
                .collect(Collectors.toList());
    }

    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        long count = departmentRepository.countAccountsByDepartmentId(id);
        return DepartmentResponse.fromEntity(dept, count);
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        String name = request.getName().trim();
        if (departmentRepository.existsByName(name)) {
            throw new BadRequestException("Department with name '" + name + "' already exists");
        }

        Department department = Department.builder()
                .name(name)
                .build();
        Department saved = departmentRepository.save(department);
        return DepartmentResponse.fromEntity(saved, 0);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        String name = request.getName().trim();
        if (departmentRepository.existsByNameAndIdNot(name, id)) {
            throw new BadRequestException("Department with name '" + name + "' already exists");
        }

        department.setName(name);
        Department saved = departmentRepository.save(department);
        long count = departmentRepository.countAccountsByDepartmentId(id);
        return DepartmentResponse.fromEntity(saved, count);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        long referencedCount = departmentRepository.countAccountsByDepartmentId(id);
        if (referencedCount > 0) {
            throw new BadRequestException("Cannot delete department because it is currently assigned to " + referencedCount + " account(s)");
        }

        departmentRepository.delete(department);
    }
}
