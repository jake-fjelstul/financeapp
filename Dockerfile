# Use a base Java image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven files and build
COPY . /app
RUN ./mvnw clean install -DskipTests

# Expose the port your app runs on
EXPOSE 8080

# Run the app
CMD ["java", "-jar", "target/financeapp-0.0.1-SNAPSHOT.jar"]