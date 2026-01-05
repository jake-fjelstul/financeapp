# Finance Tracker Application - Documentation

Welcome to the Finance Tracker application documentation! This comprehensive guide will help you understand how the application works, from high-level concepts to detailed code implementation.

## 📚 Documentation Structure

This documentation is organized into several focused guides:

1. **[Architecture Overview](./ARCHITECTURE.md)** - High-level system design and architecture patterns
2. **[Backend Documentation](./BACKEND.md)** - Spring Boot backend implementation details
3. **[Frontend Documentation](./FRONTEND.md)** - React frontend implementation details
4. **[API Documentation](./API.md)** - REST API endpoints and usage
5. **[Development Guide](./DEVELOPMENT.md)** - How to add features and debug issues

## 🎯 What is This Application?

Finance Tracker is a full-stack web application that helps users manage their personal finances. Users can:

- **Track Transactions**: Record income and expenses with categories, accounts, and dates
- **View Accounts**: See detailed breakdowns of spending by account
- **Set Financial Goals**: Create and track progress toward financial objectives
- **Get Recommendations**: Receive AI-powered product recommendations based on spending patterns
- **Analyze Spending**: View dashboards with charts and spending breakdowns

## 🏗️ Technology Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.5** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database access layer
- **PostgreSQL** - Relational database
- **JWT (JSON Web Tokens)** - Authentication tokens
- **Maven** - Build and dependency management

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **React Bootstrap** - UI components
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Node.js & npm** - Package management

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 16+ and npm
- PostgreSQL database
- (Optional) Gemini API key for AI recommendations

### Setup Steps

1. **Database Setup**
   ```sql
   CREATE DATABASE financeapp;
   ```

2. **Configure Backend**
   - Edit `src/main/resources/application.properties`
   - Update database credentials:
     ```properties
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

3. **Run Backend**
   ```bash
   ./mvnw spring-boot:run
   # Or use the run script:
   ./run.sh
   ```

4. **Run Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 📖 How to Use This Documentation

### For Beginners
Start with [Architecture Overview](./ARCHITECTURE.md) to understand the big picture, then read [Frontend Documentation](./FRONTEND.md) or [Backend Documentation](./BACKEND.md) depending on your interest.

### For Developers Adding Features
1. Read [Development Guide](./DEVELOPMENT.md) first
2. Reference [API Documentation](./API.md) for available endpoints
3. Check relevant backend or frontend documentation for implementation patterns

### For Debugging Issues
1. Check [Development Guide - Debugging Section](./DEVELOPMENT.md#debugging)
2. Review error logs in `backend.log` and `frontend.log`
3. Use browser DevTools for frontend issues
4. Check Spring Boot logs for backend issues

## 🔑 Key Concepts Explained

### What is a Full-Stack Application?
A full-stack application has two main parts:
- **Frontend (Client)**: What users see and interact with (React)
- **Backend (Server)**: Handles business logic, database operations, and API (Spring Boot)

They communicate via HTTP requests (REST API).

### What is REST API?
REST (Representational State Transfer) is a way for frontend and backend to communicate:
- Frontend sends HTTP requests (GET, POST, PUT, DELETE)
- Backend responds with JSON data
- Example: `GET /api/transactions` returns a list of transactions

### What is JWT Authentication?
JWT (JSON Web Token) is a secure way to authenticate users:
1. User logs in with email/password
2. Backend verifies credentials and returns a JWT token
3. Frontend stores token and sends it with every request
4. Backend validates token before processing requests

### What is React Context?
React Context provides a way to share data (like user info) across components without passing props through every level. The `UserContext` stores authentication state globally.

## 📁 Project Structure

```
financeapp/
├── src/                    # Backend (Spring Boot)
│   └── main/
│       ├── java/          # Java source code
│       │   └── com/jakefinance/financeapp/
│       │       ├── config/      # Configuration classes
│       │       ├── controller/  # REST API endpoints
│       │       ├── model/        # Database entities
│       │       ├── repository/   # Database access
│       │       └── service/      # Business logic
│       └── resources/
│           └── application.properties  # Configuration
├── frontend/               # Frontend (React)
│   └── src/
│       ├── api/           # API client functions
│       ├── components/    # Reusable UI components
│       ├── context/       # React Context providers
│       ├── pages/         # Page components
│       └── App.js         # Main app component
└── documentation/         # This documentation
```

## 🎓 Learning Path

### Understanding the Flow
1. **User Action** → User clicks a button in React component
2. **API Call** → Frontend calls API function (e.g., `addTransaction`)
3. **HTTP Request** → Axios sends request to backend
4. **Controller** → Spring Boot controller receives request
5. **Service** → Business logic processes the request
6. **Repository** → Data is saved to database
7. **Response** → JSON response sent back to frontend
8. **UI Update** → React component updates with new data

### Example: Adding a Transaction
```
User fills form → AddTransaction.jsx
  ↓
handleSubmit() calls addTransaction() from api/transactions.js
  ↓
Axios sends POST /api/transactions
  ↓
TransactionController.addTransaction() receives request
  ↓
TransactionService.addTransaction() validates and processes
  ↓
TransactionRepository.save() stores in database
  ↓
Response sent back with saved transaction
  ↓
Frontend updates state and shows success message
```

## 🔍 Common Questions

**Q: Where do I start if I want to add a new feature?**
A: Read [Development Guide](./DEVELOPMENT.md) - it has step-by-step instructions.

**Q: How does authentication work?**
A: See [Backend Documentation - Authentication](./BACKEND.md#authentication) and [Frontend Documentation - User Context](./FRONTEND.md#user-context).

**Q: How do I debug a failing API call?**
A: Check [Development Guide - Debugging](./DEVELOPMENT.md#debugging) for step-by-step debugging.

**Q: What's the difference between Controller, Service, and Repository?**
A: See [Backend Documentation - Architecture](./BACKEND.md#architecture-layers) for detailed explanation.

## 📝 Next Steps

- Read [Architecture Overview](./ARCHITECTURE.md) to understand the system design
- Explore [Backend Documentation](./BACKEND.md) to learn Spring Boot patterns
- Study [Frontend Documentation](./FRONTEND.md) to understand React implementation
- Use [Development Guide](./DEVELOPMENT.md) when adding new features

---

**Happy Coding! 💰**

