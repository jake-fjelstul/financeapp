# Backend Documentation

This document provides detailed documentation of the Spring Boot backend, including architecture, implementation details, and programming concepts.

## 📚 Table of Contents

1. [Architecture Layers](#architecture-layers)
2. [Models (Entities)](#models-entities)
3. [Repositories](#repositories)
4. [Services](#services)
5. [Controllers](#controllers)
6. [Configuration](#configuration)
7. [Authentication & Security](#authentication--security)
8. [Error Handling](#error-handling)
9. [Database Configuration](#database-configuration)

## 🏗️ Architecture Layers

The backend follows a **layered architecture** pattern:

```
Controller (HTTP Layer)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database (PostgreSQL)
```

### Why This Structure?

**Separation of Concerns**: Each layer has a specific responsibility:
- **Controller**: Handles HTTP requests/responses
- **Service**: Contains business logic
- **Repository**: Manages database operations
- **Model**: Represents data structure

This makes code:
- **Testable**: Each layer can be tested independently
- **Maintainable**: Changes in one layer don't affect others
- **Reusable**: Services can be used by multiple controllers

## 📦 Models (Entities)

Models represent database tables as Java objects. They use **JPA (Java Persistence API)** annotations.

### Understanding JPA Annotations

```java
@Entity                    // Marks this class as a database table
@Table(name = "users")     // Optional: specifies table name
public class User {
    
    @Id                    // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private Long id;
    
    @Column(nullable = false, unique = true)  // Database constraints
    private String email;
    
    @ManyToOne(fetch = FetchType.LAZY)  // Relationship to other entity
    @JoinColumn(name = "user_id")        // Foreign key column
    @JsonIgnore                          // Don't serialize in JSON
    private User user;
}
```

### Key Concepts

#### @Entity
- Tells Spring: "This class represents a database table"
- Spring automatically creates the table on startup (if `ddl-auto=update`)

#### @Id and @GeneratedValue
- `@Id`: Marks the primary key field
- `@GeneratedValue`: Auto-generates values (like AUTO_INCREMENT in SQL)
- `GenerationType.IDENTITY`: Uses database auto-increment

#### @Column
- Defines column properties:
  - `nullable = false`: Field is required
  - `unique = true`: No duplicate values allowed
  - `length = 500`: Maximum string length

#### Relationships

**@ManyToOne**: Many transactions belong to one user
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private User user;
```

**FetchType.LAZY**: Load user data only when accessed (performance optimization)

### Example: Transaction Model

```java
@Entity
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private double amount;
    private String type;  // "income" or "expense"
    private String category;
    private String account;
    private LocalDate date;
    private String notes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore  // Don't include user object in JSON responses
    private User user;
    
    // Constructors, getters, setters...
}
```

**Why @JsonIgnore on user?**
- Prevents infinite loops in JSON serialization
- User object contains transactions, which contain user, which...
- We only need `user_id` in the database, not the full user object in responses

## 🗄️ Repositories

Repositories provide a simple interface for database operations. Spring Data JPA automatically implements them!

### Basic Repository

```java
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // That's it! Spring provides:
    // - save(Transaction)
    // - findById(Long)
    // - findAll()
    // - deleteById(Long)
    // - etc.
}
```

**What is JpaRepository?**
- Generic interface: `JpaRepository<EntityType, IdType>`
- Provides common CRUD operations automatically
- No implementation needed!

### Custom Query Methods

Spring can generate queries from method names:

```java
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    // Spring generates: SELECT * FROM transaction WHERE user_id = ?
}
```

**How it works:**
1. Method name: `findByUser`
2. Spring parses: "find" + "By" + "User"
3. Generates SQL: `WHERE user_id = ?`
4. Parameter: `User user` → uses `user.getId()`

**Query Method Patterns:**
- `findByUser(User user)` → `WHERE user_id = ?`
- `findByType(String type)` → `WHERE type = ?`
- `findByAmountGreaterThan(double amount)` → `WHERE amount > ?`
- `findByUserAndType(User user, String type)` → `WHERE user_id = ? AND type = ?`

### Example: TransactionRepository

```java
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Find all transactions for a specific user
    List<Transaction> findByUser(User user);
    
    // Spring automatically provides:
    // - save(Transaction) → INSERT or UPDATE
    // - findById(Long) → SELECT WHERE id = ?
    // - findAll() → SELECT *
    // - deleteById(Long) → DELETE WHERE id = ?
}
```

## 🔧 Services

Services contain **business logic** - the rules and operations that make your application work.

### Service Pattern

```java
@Service  // Tells Spring: "This is a service, manage it"
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    
    // Constructor injection - Spring provides dependencies
    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }
    
    public Transaction addTransaction(Transaction transaction, String email) {
        // Business logic here
        User user = getUserByEmail(email);
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }
}
```

### Key Concepts

#### @Service Annotation
- Marks class as a service component
- Spring manages the lifecycle
- Can be injected into other classes

#### Dependency Injection
- Services receive dependencies via constructor
- Spring automatically provides implementations
- No need to create objects manually: `new TransactionRepository()`

#### Business Logic Examples

**Example 1: Adding a Transaction**
```java
public Transaction addTransaction(Transaction transaction, String email) {
    // 1. Get user from email
    User user = getUserByEmail(email);
    
    // 2. Associate transaction with user
    transaction.setUser(user);
    
    // 3. Save to database
    return transactionRepository.save(transaction);
}
```

**Example 2: Getting User Transactions**
```java
public List<Transaction> getAllTransactions(String email) {
    // 1. Get user
    User user = getUserByEmail(email);
    
    // 2. Find all transactions for this user
    return transactionRepository.findByUser(user);
}
```

**Why get user first?**
- Security: Ensures user can only access their own data
- Data integrity: Links transaction to correct user

### Error Handling in Services

```java
private User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));
}
```

**What's happening?**
- `findByEmail()` returns `Optional<User>`
- `orElseThrow()` throws exception if user not found
- Prevents null pointer exceptions

## 🌐 Controllers

Controllers handle HTTP requests and responses. They're the **entry point** for API calls.

### REST Controller Basics

```java
@RestController  // Combines @Controller + @ResponseBody
@RequestMapping("/api/transactions")  // Base URL for all methods
public class TransactionController {
    
    private final TransactionService transactionService;
    
    // Constructor injection
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }
}
```

### HTTP Method Mappings

#### GET - Retrieve Data
```java
@GetMapping
public ResponseEntity<List<Transaction>> getAllTransactions(Principal principal) {
    String email = principal.getName();  // From JWT token
    List<Transaction> transactions = transactionService.getAllTransactions(email);
    return ResponseEntity.ok(transactions);  // HTTP 200 OK
}
```

**What is Principal?**
- Represents the authenticated user
- Provided by Spring Security after JWT validation
- `principal.getName()` returns the email (set in JwtAuthFilter)

#### POST - Create Data
```java
@PostMapping
public ResponseEntity<Transaction> addTransaction(@RequestBody Transaction transaction,
                                                  Principal principal) {
    String email = principal.getName();
    Transaction saved = transactionService.addTransaction(transaction, email);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);  // HTTP 201 Created
}
```

**@RequestBody**: Converts JSON request body to Java object

#### DELETE - Remove Data
```java
@DeleteMapping("/{id}")
public void deleteTransaction(@PathVariable Long id) {
    transactionService.deleteTransaction(id);
    // Returns HTTP 200 OK by default
}
```

**@PathVariable**: Extracts `{id}` from URL (`/api/transactions/123`)

### Response Types

#### ResponseEntity
- Allows control over HTTP status code and headers
- `ResponseEntity.ok(data)` → 200 OK
- `ResponseEntity.status(HttpStatus.CREATED).body(data)` → 201 Created

#### Void Return
- Returns HTTP 200 OK with no body
- Use for DELETE operations

### Example: Complete Controller

```java
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    
    private final TransactionService transactionService;
    
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }
    
    // GET /api/transactions
    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(Principal principal) {
        String email = principal.getName();
        List<Transaction> transactions = transactionService.getAllTransactions(email);
        return ResponseEntity.ok(transactions);
    }
    
    // POST /api/transactions
    @PostMapping
    public ResponseEntity<Transaction> addTransaction(@RequestBody Transaction transaction,
                                                      Principal principal) {
        String email = principal.getName();
        Transaction saved = transactionService.addTransaction(transaction, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    // DELETE /api/transactions/{id}
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
    }
}
```

## ⚙️ Configuration

Configuration classes set up Spring Boot features.

### SecurityConfig

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthFilter jwtAuthFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())  // Enable CORS
            .csrf(csrf -> csrf.disable())     // Disable CSRF for API
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // Public endpoints
                .anyRequest().authenticated()                 // All others need auth
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // For hashing passwords
    }
}
```

**Key Points:**
- `/api/auth/**` is public (login, register)
- All other endpoints require authentication
- JWT filter validates tokens before requests reach controllers

### JacksonConfig

```java
@Configuration
public class JacksonConfig {
    @Bean
    public Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder() {
        return new Jackson2ObjectMapperBuilder()
            .modules(new JavaTimeModule())  // Support LocalDate, LocalDateTime
            .featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }
}
```

**Why needed?**
- Java's `LocalDate` needs special handling for JSON
- Prevents errors when frontend sends extra fields

## 🔐 Authentication & Security

### JWT Flow

1. **User Logs In**
   ```java
   // AuthController.java
   @PostMapping("/login")
   public ResponseEntity<?> login(@RequestBody LoginRequest request) {
       // Validate credentials
       // Generate JWT token
       // Return token to frontend
   }
   ```

2. **Token Generation**
   ```java
   // JwtService.java
   public String generateToken(String email) {
       return Jwts.builder()
           .setSubject(email)
           .setIssuedAt(new Date())
           .setExpiration(new Date(System.currentTimeMillis() + 86400000))  // 24 hours
           .signWith(SignatureAlgorithm.HS256, secretKey)
           .compact();
   }
   ```

3. **Token Validation (JwtAuthFilter)**
   ```java
   // JwtAuthFilter.java
   protected void doFilterInternal(HttpServletRequest request, ...) {
       String authHeader = request.getHeader("Authorization");
       String jwt = authHeader.substring(7);  // Remove "Bearer "
       String email = jwtService.extractEmail(jwt);
       
       // Set authentication in Spring Security context
       UsernamePasswordAuthenticationToken authToken = 
           new UsernamePasswordAuthenticationToken(email, null, authorities);
       SecurityContextHolder.getContext().setAuthentication(authToken);
   }
   ```

4. **Controller Access**
   ```java
   // TransactionController.java
   @GetMapping
   public ResponseEntity<List<Transaction>> getAllTransactions(Principal principal) {
       String email = principal.getName();  // From JWT token
       // ...
   }
   ```

### Password Hashing

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// In AuthService
String hashedPassword = passwordEncoder.encode(password);
// Store hashedPassword in database

// When logging in
boolean matches = passwordEncoder.matches(plainPassword, hashedPassword);
```

**Why hash passwords?**
- Never store plain text passwords
- BCrypt is one-way: can't reverse to get original password
- Even if database is compromised, passwords are safe

## 🚨 Error Handling

### Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("error", e.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "An unexpected error occurred"));
    }
}
```

**@RestControllerAdvice**: Catches exceptions from all controllers
**@ExceptionHandler**: Handles specific exception types

## 🗃️ Database Configuration

### application.properties

```properties
# Database connection
spring.datasource.url=jdbc:postgresql://localhost:5432/financeapp
spring.datasource.username=your_username
spring.datasource.password=your_password

# JPA settings
spring.jpa.hibernate.ddl-auto=update  # Auto-create/update tables
spring.jpa.show-sql=true              # Log SQL queries (for debugging)
```

**ddl-auto options:**
- `update`: Update schema if entities change (development)
- `create-drop`: Drop and recreate on startup (testing)
- `validate`: Only validate, don't change (production)
- `none`: No automatic schema management

### Understanding Hibernate

Hibernate is the JPA implementation that:
- Maps Java objects to database tables
- Generates SQL queries
- Manages database connections
- Handles transactions

## 🔍 Debugging Tips

### 1. Enable SQL Logging
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### 2. Check Logs
- Backend logs: `backend.log` or console output
- Look for stack traces and error messages

### 3. Common Issues

**Issue: "User not found"**
- Check: Is user logged in? Is JWT token valid?
- Debug: Add logging in `getUserByEmail()`

**Issue: "Transaction not saved"**
- Check: Is user set on transaction?
- Debug: Log transaction object before saving

**Issue: "401 Unauthorized"**
- Check: Is JWT token in Authorization header?
- Debug: Check JwtAuthFilter logs

## 📚 Key Programming Concepts

### Dependency Injection
Instead of:
```java
TransactionRepository repo = new TransactionRepository();
```

Spring provides:
```java
public TransactionService(TransactionRepository repo) {
    this.repo = repo;  // Spring creates and provides this
}
```

**Benefits:**
- Easier testing (can inject mock objects)
- Loose coupling
- Spring manages object lifecycle

### Optional Type
```java
Optional<User> user = userRepository.findByEmail(email);
if (user.isPresent()) {
    User u = user.get();
} else {
    // Handle not found
}
```

Or use:
```java
User user = userRepository.findByEmail(email)
    .orElseThrow(() -> new IllegalArgumentException("Not found"));
```

### ResponseEntity
```java
// Success with data
return ResponseEntity.ok(data);

// Created (201)
return ResponseEntity.status(HttpStatus.CREATED).body(data);

// Error (400)
return ResponseEntity.status(HttpStatus.BAD_REQUEST)
    .body(Map.of("error", "Invalid input"));
```

## 🎯 Next Steps

- Read [Frontend Documentation](./FRONTEND.md) to understand React implementation
- Read [API Documentation](./API.md) for endpoint details
- Read [Development Guide](./DEVELOPMENT.md) to add new features

