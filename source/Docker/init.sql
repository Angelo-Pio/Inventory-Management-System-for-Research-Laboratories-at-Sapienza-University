-- 1. Lab User Table
CREATE TABLE lab_user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('researcher','lab_manager','admin')),
    department_id INT REFERENCES department(id) ON DELETE CASCADE,
    CONSTRAINT department_required CHECK (
        (role = 'admin' AND department_id IS NULL)
        OR (role IN ('researcher','lab_manager') AND department_id IS NOT NULL)
    )
);

-- 2. Department Table
CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    details TEXT
);

-- 4. Research Material Table
CREATE TABLE research_material (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL REFERENCES category(id),
    status VARCHAR(20) CHECK (status IN ('None', 'Damaged')) DEFAULT 'None',
    department_id INT NOT NULL REFERENCES department(id) ON DELETE CASCADE
);

CREATE TABLE category (
    id SERIAL PRIMARY KEY
    title VARCHAR(150) NOT NULL
);

-- 5. Material Logs Table
CREATE TABLE material_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    material_id INT NOT NULL REFERENCES research_material(id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES department(id) ON DELETE CASCADE,
    used INT DEFAULT 0,
    added INT DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('None', 'Damaged')) DEFAULT 'None'
);

CREATE TABLE material_request (
    id SERIAL PRIMARY KEY,
    material_id INT NOT NULL REFERENCES research_material(id) ON DELETE CASCADE,
    researcher_id INT NOT NULL REFERENCES lab_user(id) ON DELETE CASCADE,
    material_condition VARCHAR(100) CHECK (material_condition IN ('None', 'Damaged')) DEFAULT 'None',
    requested_quantity INT DEFAULT 0,
    request_status BOOLEAN DEFAULT False
);

