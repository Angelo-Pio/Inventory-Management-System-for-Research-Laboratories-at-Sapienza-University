-- 1. Lab User Table
CREATE TABLE lab_user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 2. Department Table
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    details TEXT
);

-- 3. UserRole Table
-- One-to-one with Lab User; defines the role and (if applicable) department
CREATE TABLE user_role (
    user_id INT PRIMARY KEY REFERENCES lab_user(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('researcher','lab_manager','admin')),
    department_id INT REFERENCES department(id) ON DELETE CASCADE,
    CONSTRAINT department_required CHECK (
        (role = 'admin' AND department_id IS NULL)
        OR (role IN ('researcher','lab_manager') AND department_id IS NOT NULL)
    )
);

-- 4. Research Material Table
CREATE TABLE research_material (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    category VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('None', 'Damaged')) DEFAULT 'None',
    department_id INT NOT NULL REFERENCES department(id) ON DELETE CASCADE
);

-- 5. Material Logs Table
CREATE TABLE material_logs (
    id SERIAL PRIMARY KEY,
    material_id INT NOT NULL REFERENCES research_material(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quantity_used INT DEFAULT 0,
    quantity_added INT DEFAULT 0,
    department_id INT NOT NULL REFERENCES department(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('None', 'Damaged')) DEFAULT 'None'
);
