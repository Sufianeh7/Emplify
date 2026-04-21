# Emplify
Proyecto Intermodular - Desarrollo de aplicaciones multiplataforma

Get started with Emplify
Install the prerequisites, configure MySQL, start the Spring Boot backend and Ionic frontend, and log in to Emplify for the first time.

By the end of this guide you will have the Emplify backend running on port 8080 and the frontend running on port 8100, with a working login session in your browser.
​
Prerequisites
Before you begin, make sure the following are installed on your machine:
Tool	Minimum version	Purpose
Java	21	Run the Spring Boot backend
Maven	bundled via mvnw	Build and run the backend
Node.js	18 LTS or later	Run the Ionic/Angular frontend
MySQL	8.0 or later	Relational database
The repository includes the Maven wrapper (mvnw), so you do not need to install Maven separately. Java 21 is required because the pom.xml declares <java.version>21</java.version>.
​
Setup
1
Clone the repository

Clone the Emplify monorepo and move into it:

´´´bash
git clone https://github.com/Sufianeh7/Emplify.git
cd Emplify
´´´
2
Create the MySQL database

The backend datasource URL includes createDatabaseIfNotExist=true, so Hibernate will create the emplify_db schema automatically on first boot. You only need a running MySQL server and a user with the right privileges.
Connect to MySQL and grant access if you are using the default root account with no password (as in the default config):
-- Run this only if your root user requires a password grant
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
If you use a different username or password, update application.properties in the next step before starting the backend.
3
Configure the backend

Open Back/backend/src/main/resources/application.properties and confirm or update the datasource settings to match your MySQL installation:
spring.application.name=backend

# MySQL connection
spring.datasource.url=jdbc:mysql://localhost:3306/emplify_db?createDatabaseIfNotExist=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=

# Hibernate — creates or updates tables automatically from the entity model
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
The key fields to change are spring.datasource.username and spring.datasource.password.
4
Start the Spring Boot backend

From the Back/backend/ directory, run the Maven wrapper:

macOS / Linux

Windows
cd Back/backend
./mvnw spring-boot:run
Spring Boot starts on port 8080. Watch for a line like the following in the console output, which confirms the server is ready:
Started BackendApplication in X.XXX seconds
On first run, Hibernate runs ddl-auto=update and creates all tables in emplify_db.
5
Install frontend dependencies

Open a new terminal, move into the frontend directory, and install Node packages:
cd Front/emplify-app
npm install
6
Start the Ionic/Angular frontend

Start the dev server with the start script (which runs ng serve):

npm

ionic CLI
npm start
The frontend is served on port 8100. The Angular CLI outputs a URL like:
Local: http://localhost:8100/
7
Log in for the first time

Open http://localhost:8100 in your browser. You will see the Emplify login screen.
Enter the email address and password of an existing user record. The app encodes your credentials as a Base64 Authorization: Basic header and calls GET /api/empleados/perfil to verify them. On success, your session token is stored in localStorage and you are redirected to your role’s dashboard.
There is no self-registration flow. The first ADMIN user must be inserted directly into the usuario table with a BCrypt-hashed password, or created through the POST /api/admin/alta-empleado endpoint once you have an existing ADMIN credential.
To generate a BCrypt hash for an initial password, you can use any online BCrypt tool or temporarily uncomment the hash-generation block in BackendApplication.java:
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String miHash = encoder.encode("your-password");
System.out.println("Hash: " + miHash);
Then insert a row in the usuario table:
INSERT INTO usuario (nombre, email, password, rol, activo)
VALUES ('Admin', 'admin@example.com', '$2a$10$...paste-hash-here...', 'ADMIN', 1);
​
What’s running
Once both processes are up, you have:
Service	URL	Notes
Spring Boot API	http://localhost:8080	REST endpoints under /api/
WebSocket endpoint	http://localhost:8080/ws-endpoint	STOMP over SockJS
Ionic frontend	http://localhost:8100	Angular dev server

