# Architecture Overview

This document explains the high-level architecture of the Finance Tracker application, including design patterns, data flow, and system components.

## 🏛️ System Architecture

The application follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│                  (React Frontend)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │Components │  │  Context │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API
                       │ (JSON)
┌──────────────────────▼──────────────────────────────────┐
│                   APPLICATION LAYER                     │
│                (Spring Boot Backend)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Controller│→ │ Service  │→ │Repository│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL/JPA
┌──────────────────────▼──────────────────────────────────┐
│                      DATA LAYER                         │
│                   (PostgreSQL)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Users   │  │Transactions│ │  Goals   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└───────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### Example: Viewing Transactions

1. **User Action**: User navigates to Dashboard page
2. **React Component**: `Dashboard.jsx` mounts and calls `useEffect`
3. **API Call**: Calls `getAllTransactions()` from `api/transactions.js`
4. **HTTP Request**: Axios sends `GET /api/transactions` with JWT token
5. **Security Filter**: `JwtAuthFilter` validates token
6. **Controller**: `TransactionController.getAllTransactions()` receives request
7. **Service**: `TransactionService.getAllTransactions()` processes business logic
8. **Repository**: `TransactionRepository.findByUser()` queries database
9. **Database**: PostgreSQL returns transaction records
10. **Response Chain**: Data flows back through Service → Controller → HTTP Response
11. **Frontend Update**: React component receives data and updates UI

## 🧩 Component Layers

### Frontend Layers

#### 1. **Pages** (`frontend/src/pages/`)
- **Purpose**: Top-level components representing full pages
- **Examples**: `Dashboard.jsx`, `AddTransaction.jsx`, `Planning.jsx`
- **Responsibilities**:
  - Manage page-level state
  - Fetch data from API
  - Compose smaller components
  - Handle user interactions

#### 2. **Components** (`frontend/src/components/`)
- **Purpose**: Reusable UI components
- **Examples**: `Navbar.jsx`, `TransactionList.js`
- **Responsibilities**:
  - Presentational logic
  - Reusable across pages
  - Receive data via props

#### 3. **Context** (`frontend/src/context/`)
- **Purpose**: Global state management
- **Example**: `UserContext.js` - stores authentication state
- **Responsibilities**:
  - Provide data to all components
  - Manage authentication state
  - Handle login/logout

#### 4. **API** (`frontend/src/api/`)
- **Purpose**: Communication layer with backend
- **Examples**: `transactions.js`, `goals.js`, `recommendations.js`
- **Responsibilities**:
  - Define API endpoints
  - Handle request/response formatting
  - Use Axios for HTTP calls

### Backend Layers

#### 1. **Controller** (`controller/`)
- **Purpose**: Handle HTTP requests and responses
- **Pattern**: REST API endpoints
- **Responsibilities**:
  - Receive HTTP requests
  - Validate input
  - Call service layer
  - Return HTTP responses
- **Example**:
  ```java
  @GetMapping
  public ResponseEntity<List<Transaction>> getAllTransactions(Principal principal) {
      String email = principal.getName();
      List<Transaction> transactions = transactionService.getAllTransactions(email);
      return ResponseEntity.ok(transactions);
  }
  ```

#### 2. **Service** (`service/`)
- **Purpose**: Business logic layer
- **Responsibilities**:
  - Implement business rules
  - Coordinate between repositories
  - Validate data
  - Transform data
- **Example**:
  ```java
  public Transaction addTransaction(Transaction transaction, String email) {
      User user = getUserByEmail(email);
      transaction.setUser(user);
      return transactionRepository.save(transaction);
  }
  ```

#### 3. **Repository** (`repository/`)
- **Purpose**: Data access layer
- **Pattern**: Spring Data JPA
- **Responsibilities**:
  - Database operations (CRUD)
  - Query execution
  - Entity management
- **Example**:
  ```java
  public interface TransactionRepository extends JpaRepository<Transaction, Long> {
      List<Transaction> findByUser(User user);
  }
  ```

#### 4. **Model** (`model/`)
- **Purpose**: Data entities (database tables)
- **Pattern**: JPA Entities
- **Responsibilities**:
  - Define database schema
  - Map Java objects to database tables
  - Define relationships between entities
- **Example**:
  ```java
  @Entity
  public class Transaction {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;
      // ... fields
  }
  ```

## 🔐 Security Architecture

### Authentication Flow

```
┌─────────┐         ┌──────────┐         ┌─────────┐
│  User   │────────▶│ Frontend │────────▶│ Backend │
└─────────┘         └──────────┘         └─────────┘
   Login                POST /api/auth/login
                        ↓
                    JWT Token
                        ↓
   ┌───────────────────────────────────────┐
   │  localStorage.setItem("token", ...)    │
   └───────────────────────────────────────┘
                        ↓
   Subsequent Requests
   ┌───────────────────────────────────────┐
   │  Authorization: Bearer <token>        │
   └───────────────────────────────────────┘
                        ↓
                    JwtAuthFilter
                        ↓
                    Validates Token
                        ↓
                    Extracts User Email
                        ↓
                    Principal Object
                        ↓
                    Controller Method
```

### Security Components

1. **JwtAuthFilter**: Intercepts requests, validates JWT tokens
2. **SecurityConfig**: Configures which endpoints require authentication
3. **JwtService**: Generates and validates JWT tokens
4. **AuthService**: Handles login/registration logic
5. **BCryptPasswordEncoder**: Hashes passwords securely

## 📊 Data Model

### Entity Relationships

```
User (1) ────< (Many) Transaction
User (1) ────< (Many) Goal
```

**Key Points**:
- One user can have many transactions
- One user can have many goals
- Transactions and Goals are linked to User via `user_id` foreign key

### Database Schema

```sql
users
├── id (PK)
├── email (UNIQUE)
├── password (hashed)
├── first_name
└── last_name

transaction
├── id (PK)
├── user_id (FK → users.id)
├── title
├── amount
├── type (income/expense)
├── category
├── account
├── date
└── notes

goals
├── id (PK)
├── user_id (FK → users.id)
├── text
├── steps (JSON)
├── timeframe
├── completed
├── created_at
└── completed_at
```

## 🔌 API Communication

### Request Format
```javascript
// Frontend sends:
axios.get('/api/transactions', {
  headers: {
    'Authorization': 'Bearer <jwt_token>'
  }
})
```

### Response Format
```json
[
  {
    "id": 1,
    "title": "Grocery Shopping",
    "amount": 150.50,
    "type": "expense",
    "category": "Groceries",
    "account": "Checking",
    "date": "2024-01-15",
    "notes": "Weekly groceries"
  }
]
```

## 🎨 Frontend State Management

### Local State (useState)
- **Use Case**: Component-specific data
- **Example**: Form inputs, UI toggles
- **Lifetime**: Component mount/unmount

### Context State (UserContext)
- **Use Case**: Global authentication state
- **Example**: Current user, login status
- **Lifetime**: Application lifetime

### Server State (API calls)
- **Use Case**: Data from backend
- **Example**: Transactions, goals, recommendations
- **Lifetime**: Fetched on demand, cached in component state

## 🚀 Design Patterns Used

### 1. **MVC (Model-View-Controller)**
- **Model**: JPA Entities (Transaction, User, Goal)
- **View**: React Components
- **Controller**: Spring Boot Controllers

### 2. **Repository Pattern**
- Abstracts database access
- Provides consistent interface
- Spring Data JPA implements automatically

### 3. **Dependency Injection**
- Spring manages object creation
- Controllers receive Services via constructor
- Services receive Repositories via constructor

### 4. **RESTful API**
- Resource-based URLs (`/api/transactions`)
- HTTP methods (GET, POST, PUT, DELETE)
- Stateless communication

### 5. **Context Pattern (React)**
- Global state without prop drilling
- UserContext provides auth state to all components

## 🔄 Data Flow Patterns

### Create Operation (POST)
```
User Input → Form Validation → API Call → Controller → Service → Repository → Database
                                                                              ↓
UI Update ← State Update ← Response ← JSON ← Controller ← Service ← Repository
```

### Read Operation (GET)
```
Component Mount → API Call → Controller → Service → Repository → Database
                                                                  ↓
UI Render ← State Update ← Response ← JSON ← Controller ← Service ← Repository
```

### Update Operation (PUT)
```
User Action → API Call → Controller → Service → Repository → Database Update
                                                                      ↓
UI Update ← State Update ← Response ← JSON ← Controller ← Service ← Repository
```

## 🛠️ Configuration Management

### Backend Configuration
- **File**: `application.properties`
- **Contains**: Database connection, JPA settings
- **Environment Variables**: Can override with system properties

### Frontend Configuration
- **File**: `package.json` (dependencies)
- **Environment**: `.env` file (optional, for API URLs)
- **Axios**: Configured in `axios.js` with base URL and interceptors

## 📦 Build and Deployment

### Backend Build
```bash
mvn clean package
# Creates: target/financeapp-0.0.1-SNAPSHOT.jar
```

### Frontend Build
```bash
cd frontend
npm run build
# Creates: frontend/build/ (static files)
```

### Run Script
- `run.sh` handles both builds and starts both servers
- Checks for environment variables (GEMINI_API_KEY)
- Runs backend on port 8080
- Runs frontend on port 3000

## 🎯 Key Architectural Decisions

### Why Spring Boot?
- Rapid development
- Built-in security
- Database integration
- Production-ready features

### Why React?
- Component reusability
- Virtual DOM for performance
- Large ecosystem
- Declarative UI

### Why PostgreSQL?
- Relational data structure
- ACID compliance
- Robust and scalable
- Free and open-source

### Why JWT?
- Stateless authentication
- Scalable (no server-side sessions)
- Works with REST APIs
- Secure token-based auth

## 🔍 Understanding the Codebase

### Finding Code by Functionality

**Want to add a new transaction?**
- Frontend: `frontend/src/pages/AddTransaction.jsx`
- API: `frontend/src/api/transactions.js`
- Backend Controller: `controller/TransactionController.java`
- Backend Service: `service/TransactionService.java`
- Backend Repository: `repository/TransactionRepository.java`
- Model: `model/Transaction.java`

**Want to understand authentication?**
- Frontend Context: `frontend/src/context/UserContext.js`
- Backend Controller: `controller/AuthController.java`
- Backend Service: `service/AuthService.java`
- Security Config: `config/SecurityConfig.java`
- JWT Filter: `config/JwtAuthFilter.java`

**Want to see how goals work?**
- Frontend: `frontend/src/pages/Planning.jsx`
- API: `frontend/src/api/goals.js`
- Backend: `controller/GoalController.java`, `service/GoalService.java`

## 📚 Next Steps

- Read [Backend Documentation](./BACKEND.md) for detailed Spring Boot implementation
- Read [Frontend Documentation](./FRONTEND.md) for detailed React implementation
- Read [API Documentation](./API.md) for endpoint details
- Read [Development Guide](./DEVELOPMENT.md) to start adding features

