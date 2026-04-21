# ETAPA 1: Compilación con Maven y Java 23
FROM maven:3.9-eclipse-temurin-23 AS build
WORKDIR /app
# Copiamos los archivos de configuración y el código fuente
COPY pom.xml .
COPY src ./src
# Compilamos saltándonos los tests para ir más rápido
RUN mvn clean package -DskipTests

# ETAPA 2: Contenedor ligero de ejecución
FROM eclipse-temurin:23-jre
WORKDIR /app
# Copiamos SOLO el .jar compilado de la etapa anterior
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Comando de arranque de Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]