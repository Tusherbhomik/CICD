# Stage 1: Build the JAR using Maven
FROM maven:3.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy only pom.xml first for better caching
COPY pom.xml .

# Download dependencies (cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application, skipping tests
RUN mvn clean package -DskipTests -B

# Stage 2: Create minimal runtime image
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the pre-built JAR file from target folder
COPY --from=build /app/target/prescription-system-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]