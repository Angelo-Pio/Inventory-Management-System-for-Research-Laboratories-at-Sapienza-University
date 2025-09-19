****# SYSTEM DESCRIPTION

The project aims to develop an **inventory management system for the research laboratories at Sapienza University of Rome**. This system is designed to improve the management and control of resources used in research projects, ensuring greater operational efficiency, reducing waste, and providing continuous support to scientific activities.

The primary objective is to create an intuitive and functional tool that allows **real-time stock monitoring** and simplifies communication among laboratory members.

The platform will be managed by **two types of users**:
- **Lab manager** (administrator): configures the system, defines categories, adds items, sets reorder thresholds, assigns materials to researchers, monitors resource usage, and downloads reports.
- **Researchers**: view materials, update stock levels, submit requests for unavailable items, and report damaged equipment.

This collaborative approach will enable transparent and effective management, reducing the risk of interruptions due to insufficient stock.

Among the system's primary use cases:
- The lab manager configures the platform to meet the laboratory's specific needs (categories, stock rules, thresholds).
- Researchers update the system to reflect material usage during daily activities.
- Researchers submit requests for unavailable materials or report damaged equipment, allowing the lab manager to address issues promptly.

The system will be a fundamental tool for improving resource management in research laboratories, making operations more organized and ensuring that every laboratory member has access to the information needed to carry out their work efficiently.
It will also be flexible and adaptable to other contexts or departments in the future, meeting the dynamic needs of scientific research.

---

# USER STORIES

1. As a lab manager, I want to create and edit material categories so that I can organize inventory items logically and make them easier to manage.
2. As a lab manager, I want to add new materials (with details such as name, category, and stock level) so that all resources used in the lab are tracked in the system.
3. As a lab manager, I want to set reorder thresholds for each material so that I receive alerts when stock levels fall below the defined minimum.
4. As a lab manager, I want to assign materials to departments so that responsibilities and access rights are clearly defined.
5. As a lab manager, I want to view and download periodic reports of material usage so that I can plan procurement and manage the laboratory budget more efficiently.
6. As a lab manager, I want to receive notifications about material requests or reported damaged equipment so that I can take prompt action and avoid disruptions to research activities.
7. As a researcher, I want to view a real-time list of available materials assigned to my department so that I know exactly what resources I can use for my projects.
8. As a researcher, I want to update stock levels after I use materials so that the inventory remains accurate for all laboratory members.
9. As a researcher, I want to submit requests for materials that are low or unavailable so that the lab manager can reorder them in time.
10. As a researcher, I want to report damaged or malfunctioning equipment through the system so that the issue is documented and addressed promptly.
11. As a researcher, I want to track the status of my material requests so that I know when new supplies or replacements will arrive.
12. As a laboratory member, I want the system interface to be intuitive and easy to use so that I can manage my tasks without requiring extensive training.
13. As an administrator, I want the system to be configurable and adaptable to other contexts or departments so that it can be scaled or reused across the university.
14. As a user I want to login the system so I can access my dashboard.



---

# CONTAINERS

## CONTAINER_NAME: Database

### DESCRIPTION
Manages material stock and user accounts. Responsible for storing all persistent data related to materials, categories, users, permissions.

### USER STORIES
Covers all stories where data persistence is required (1–13).

### PORTS
5432:5432

### PERSISTENCE EVALUATION
This container is the main persistence layer. It permanently stores all system data.

### EXTERNAL SERVICES CONNECTIONS
None (internal PostgreSQL database).

### TECHNOLOGICAL SPECIFICATION
- PostgreSQL database.
- PgAdmin interface

### MICROSERVICE

#### MICROSERVICE: database-service
- TYPE: database
- DESCRIPTION: Provides persistent storage for materials, users, and categories.
- PORTS: 5432
- TECHNOLOGICAL SPECIFICATION:
  - PostgreSQL

---

## CONTAINER_NAME: Application Interface

### DESCRIPTION
React frontend application responsible for providing the interface to the users (lab managers, researchers). It makes REST requests to the backend application responsible for business logic.

### USER STORIES
Supports all UI-level interactions:
- 1–13 (view/add/edit materials, submit requests, track stock, view reports).

### PORTS
3000:3000

### PERSISTENCE EVALUATION
Does not store data permanently. Relies on backend for persistence.

### EXTERNAL SERVICES CONNECTIONS
Communicates with backend container through REST API.
Subscribes to broker mqtt to receive notifications

### TECHNOLOGICAL SPECIFICATION
- React
- Axios/fetch for REST calls

### MICROSERVICE

#### MICROSERVICE: ui-service
- TYPE: frontend
- DESCRIPTION: Provides the user interface and interacts with backend REST APIs.
- PORTS: 3000
- TECHNOLOGICAL SPECIFICATION:
  - ReactJS
  - REST calls to backend

AUTH ENDPOINTS:

/login Login in the system input: (email,password) 
/logout Logout from the system 

BROKER ENDPOINTS:

/{department_id}/notifications subscribe to this topic in order to retrieve these notifications about requests etc.

---

## CONTAINER_NAME: Back End

### DESCRIPTION
Java Spring application to handle the business logic. It interacts with the application interface, the database, and the broker.
Responsible for implementing rules, workflows, and notifications.

### USER STORIES
Implements all business logic for user stories 1–13.

### PORTS
8080:8080

### PERSISTENCE EVALUATION
Does not persist data itself but interacts with the database container.

### EXTERNAL SERVICES CONNECTIONS
- Connects to PostgreSQL database container.
- Publishes to RabbitMQ broker container for notifications.

### TECHNOLOGICAL SPECIFICATION
- Java Spring Boot
- Spring Data JPA (database interaction)
- REST endpoints exposed to the frontend

### MICROSERVICE

#### MICROSERVICE: backend-service
- TYPE: backend
- DESCRIPTION: Handles all business logic, material management, requests, and notifications.
- PORTS: 8080
- TECHNOLOGICAL SPECIFICATION:
  - Java Spring Boot
  - Spring Data JPA
  - RabbitMQ integration
- ENDPOINTS:

ADMIN ONLY endpoints: 

/admin/user
POST Create new user (researcher or lab manager) input: (User data, role, department)
GET Get all users 
DELETE Delete user input(user id)
UPDATE Update user information input: (user id)

/admin/department 
POST Create new department input: (Department data)
UPDATE Modify department data input: (department id)

LAB MANAGER Endpoints:

/management/{department_id}/material
POST: Add new material to department input: (material data)
GET: Get all material of a department
UPDATE: Modify quantiy of material by increasing or decreasing its vlaue  input: (increase/decrease)
DELETE: Remove material from department

/management/material/category
POST: Create new material category input: (category name)
GET: Get all material categories
UPDATE: Edit material category's information
DELETE: Delete material category input: (category id)

/management/{department_id}/researcher
POST: Add new researcher to department
DELETE: Remove researcher from department

/report/{department_id}
GET: Get monthly material usage report input: (month, year)

/requests
GET: Retrieve all material requests
POST: Mark request as done input: (request_id)

LAB RESEARCHER ENDPOINTS:
 
/material/
GET: Get all materials of researcher's department input: (researcher_id)

/material/{material_id}
GET: Get material info
POST: Decrease material quantity input: (value of decrease)

/material/{material_id}
POST: Issue a material request input: material request

/material/{material_id}/issue
POST: Set material status as damaged and issue a ticket for replacement

/researcher/requests
GET: Get all requests opened by researcher input: (researcher_id)

Queue: {department_id}/notifications periodically publish to this queue if you find requests not already completed, repeat once a day 




---

## CONTAINER_NAME: Broker

### DESCRIPTION
RabbitMQ message broker to handle asynchronous messaging between components. Used mainly for sending notifications (e.g., reorder alerts, material requests, damaged equipment reports).

### USER STORIES
Supports notification-related parts of user stories 3, 6, 9, 10 (alerts and communication).

### PORTS
5672:5672

### PERSISTENCE EVALUATION
Temporary message persistence only; no long-term storage.

### EXTERNAL SERVICES CONNECTIONS
- Connected to the backend container.

### TECHNOLOGICAL SPECIFICATION
- RabbitMQ

### MICROSERVICE

#### MICROSERVICE: broker-service
- TYPE: broker
- DESCRIPTION: Handles asynchronous messaging and notifications between services.
- PORTS: 5672
- TECHNOLOGICAL SPECIFICATION:
  - RabbitMQ
