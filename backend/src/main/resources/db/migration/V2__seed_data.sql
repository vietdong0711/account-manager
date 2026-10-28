-- V2__seed_data.sql

INSERT INTO departments (id, name) VALUES
(1, 'Engineering'),
(2, 'Human Resources'),
(3, 'Marketing'),
(4, 'Finance')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval(pg_get_serial_sequence('departments', 'id'), COALESCE((SELECT MAX(id) FROM departments), 1));

INSERT INTO positions (id, name) VALUES
(1, 'Software Engineer'),
(2, 'Senior Software Engineer'),
(3, 'HR Specialist'),
(4, 'Marketing Lead'),
(5, 'Financial Analyst'),
(6, 'Project Manager')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval(pg_get_serial_sequence('positions', 'id'), COALESCE((SELECT MAX(id) FROM positions), 1));
