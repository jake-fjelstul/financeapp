# Development Guide

This guide will help you add new features, debug issues, and understand how to extend the Finance Tracker application.

## 📚 Table of Contents

1. [Adding a New Feature](#adding-a-new-feature)
2. [Debugging Guide](#debugging-guide)
3. [Common Tasks](#common-tasks)
4. [Best Practices](#best-practices)
5. [Testing](#testing)

## 🚀 Adding a New Feature

### Step-by-Step: Adding a New Entity (Example: Budget)

Let's say you want to add a "Budget" feature where users can set monthly spending limits.

#### Step 1: Create the Model (Backend)

**File**: `src/main/java/com/jakefinance/financeapp/model/Budget.java`

```java
package com.jakefinance.financeapp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "budgets")
public class Budget {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private LocalDate month; // First day of the month
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    
    // Constructors, getters, setters...
    public Budget() {}
    
    // Getters
    public Long getId() { return id; }
    public String getCategory() { return category; }
    public Double getAmount() { return amount; }
    public LocalDate getMonth() { return month; }
    public User getUser() { return user; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setCategory(String category) { this.category = category; }
    public void setAmount(Double amount) { this.amount = amount; }
    public void setMonth(LocalDate month) { this.month = month; }
    public void setUser(User user) { this.user = user; }
}
```

**Key Points:**
- `@Entity` marks it as a database table
- `@ManyToOne` links to User (many budgets per user)
- `@JsonIgnore` on user prevents serialization issues

#### Step 2: Create the Repository

**File**: `src/main/java/com/jakefinance/financeapp/repository/BudgetRepository.java`

```java
package com.jakefinance.financeapp.repository;

import com.jakefinance.financeapp.model.Budget;
import com.jakefinance.financeapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    Optional<Budget> findByUserAndCategoryAndMonth(User user, String category, LocalDate month);
}
```

**Key Points:**
- Extends `JpaRepository<Budget, Long>`
- Spring automatically implements these methods
- Custom queries are generated from method names

#### Step 3: Create the Service

**File**: `src/main/java/com/jakefinance/financeapp/service/BudgetService.java`

```java
package com.jakefinance.financeapp.service;

import com.jakefinance.financeapp.model.Budget;
import com.jakefinance.financeapp.model.User;
import com.jakefinance.financeapp.repository.BudgetRepository;
import com.jakefinance.financeapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {
    
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    
    public BudgetService(BudgetRepository budgetRepository, 
                        UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }
    
    public List<Budget> getAllBudgets(String email) {
        User user = getUserByEmail(email);
        return budgetRepository.findByUser(user);
    }
    
    public Budget addBudget(Budget budget, String email) {
        User user = getUserByEmail(email);
        budget.setUser(user);
        return budgetRepository.save(budget);
    }
    
    public Budget updateBudget(Long id, Budget budgetUpdate, String email) {
        User user = getUserByEmail(email);
        Optional<Budget> existingBudget = budgetRepository.findById(id);
        
        if (existingBudget.isEmpty()) {
            throw new IllegalArgumentException("Budget not found");
        }
        
        Budget budget = existingBudget.get();
        
        // Verify ownership
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Budget does not belong to user");
        }
        
        // Update fields
        if (budgetUpdate.getCategory() != null) {
            budget.setCategory(budgetUpdate.getCategory());
        }
        if (budgetUpdate.getAmount() != null) {
            budget.setAmount(budgetUpdate.getAmount());
        }
        if (budgetUpdate.getMonth() != null) {
            budget.setMonth(budgetUpdate.getMonth());
        }
        
        return budgetRepository.save(budget);
    }
    
    public void deleteBudget(Long id, String email) {
        User user = getUserByEmail(email);
        Optional<Budget> budget = budgetRepository.findById(id);
        
        if (budget.isEmpty()) {
            throw new IllegalArgumentException("Budget not found");
        }
        
        if (!budget.get().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Budget does not belong to user");
        }
        
        budgetRepository.deleteById(id);
    }
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
```

**Key Points:**
- Always verify user ownership before operations
- Use `getUserByEmail()` helper method
- Throw `IllegalArgumentException` for validation errors

#### Step 4: Create the Controller

**File**: `src/main/java/com/jakefinance/financeapp/controller/BudgetController.java`

```java
package com.jakefinance.financeapp.controller;

import com.jakefinance.financeapp.model.Budget;
import com.jakefinance.financeapp.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    
    private final BudgetService budgetService;
    
    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }
    
    @GetMapping
    public ResponseEntity<List<Budget>> getAllBudgets(Principal principal) {
        String email = principal.getName();
        List<Budget> budgets = budgetService.getAllBudgets(email);
        return ResponseEntity.ok(budgets);
    }
    
    @PostMapping
    public ResponseEntity<?> addBudget(@RequestBody Budget budget, Principal principal) {
        try {
            String email = principal.getName();
            Budget saved = budgetService.addBudget(budget, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id,
                                          @RequestBody Budget budgetUpdate,
                                          Principal principal) {
        try {
            String email = principal.getName();
            Budget updated = budgetService.updateBudget(id, budgetUpdate, email);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBudget(@PathVariable Long id,
                                                            Principal principal) {
        try {
            String email = principal.getName();
            budgetService.deleteBudget(id, email);
            return ResponseEntity.ok(Map.of("message", "Budget deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
```

**Key Points:**
- `Principal principal` gets authenticated user email
- Handle exceptions and return appropriate HTTP status codes
- Use `@PathVariable` for URL parameters

#### Step 5: Create Frontend API Client

**File**: `frontend/src/api/budgets.js`

```javascript
import axios from '../axios';

export const getAllBudgets = () => 
  axios.get('/api/budgets');

export const addBudget = (budget) => 
  axios.post('/api/budgets', goal);

export const updateBudget = (id, budget) => 
  axios.put(`/api/budgets/${id}`, budget);

export const deleteBudget = (id) => 
  axios.delete(`/api/budgets/${id}`);
```

#### Step 6: Create Frontend Component

**File**: `frontend/src/pages/Budgets.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col } from 'react-bootstrap';
import { getAllBudgets, addBudget, deleteBudget } from '../api/budgets';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7) // YYYY-MM
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await getAllBudgets();
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budget = {
        ...formData,
        amount: parseFloat(formData.amount),
        month: formData.month + '-01' // Convert to full date
      };
      await addBudget(budget);
      fetchBudgets(); // Refresh list
      setFormData({ category: '', amount: '', month: new Date().toISOString().slice(0, 7) });
    } catch (error) {
      console.error('Failed to add budget:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      fetchBudgets(); // Refresh list
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container className="py-4">
      <h1>Budgets</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Month</Form.Label>
                  <Form.Control
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant="primary">Add Budget</Button>
          </Form>
        </Card.Body>
      </Card>

      <div>
        {budgets.map(budget => (
          <Card key={budget.id} className="mb-2">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h5>{budget.category}</h5>
                  <p>${budget.amount} for {budget.month}</p>
                </div>
                <Button variant="danger" onClick={() => handleDelete(budget.id)}>
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
}
```

#### Step 7: Add Route

**File**: `frontend/src/App.js`

```javascript
import Budgets from './pages/Budgets';

// In Routes:
<Route
  path="/budgets"
  element={
    <ProtectedRoute>
      <Budgets />
    </ProtectedRoute>
  }
/>
```

#### Step 8: Add Navigation Link

**File**: `frontend/src/components/Navbar.jsx`

```javascript
<Nav.Link as={Link} to="/budgets" className="nav-underline text-white px-3">
  Budgets
</Nav.Link>
```

#### Step 9: Rebuild and Test

```bash
# Backend
mvn clean package

# Frontend
cd frontend
npm start
```

## 🐛 Debugging Guide

### Backend Debugging

#### 1. Check Logs

**Location**: `backend.log` or console output

**Common Issues:**
- Database connection errors
- JWT validation failures
- Null pointer exceptions

**Example:**
```
ERROR: User not found for email: user@example.com
```
→ Check if user exists in database

#### 2. Enable SQL Logging

**File**: `application.properties`
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

**What to look for:**
- SQL queries being executed
- Parameter values
- Query performance

#### 3. Add Debug Logging

```java
System.out.println("DEBUG: User email: " + email);
System.out.println("DEBUG: Transaction: " + transaction);
```

**Better approach:**
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

logger.debug("Processing transaction for user: {}", email);
logger.error("Failed to save transaction", e);
```

#### 4. Test Endpoints with cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get transactions (replace TOKEN)
curl -X GET http://localhost:8080/api/transactions \
  -H "Authorization: Bearer TOKEN"
```

### Frontend Debugging

#### 1. Browser DevTools

**Console Tab:**
- Check for JavaScript errors
- Log API responses
- Inspect state values

```javascript
console.log('Transactions:', transactions);
console.log('User:', user);
```

**Network Tab:**
- See all API requests
- Check request/response data
- Identify failed requests (red)

**React DevTools:**
- Inspect component tree
- View props and state
- Check context values

#### 2. Common Frontend Issues

**Issue: "Cannot read property of undefined"**
```javascript
// Bad
transactions.map(t => t.title)

// Good
transactions?.map(t => t.title) || []
```

**Issue: "State not updating"**
```javascript
// Bad - mutating state
transactions.push(newTransaction);
setTransactions(transactions);

// Good - creating new array
setTransactions([...transactions, newTransaction]);
```

**Issue: "Infinite loop in useEffect"**
```javascript
// Bad - missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // userId changes but effect doesn't run

// Good
useEffect(() => {
  fetchData(userId);
}, [userId]); // Runs when userId changes
```

#### 3. API Error Handling

```javascript
try {
  const response = await addTransaction(data);
  // Success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.error);
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server');
  } else {
    // Something else
    console.error('Error:', error.message);
  }
}
```

### Database Debugging

#### 1. Connect to PostgreSQL

```bash
psql -U your_username -d financeapp
```

#### 2. Check Tables

```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View transactions
SELECT * FROM transaction;

-- Check user's transactions
SELECT t.* FROM transaction t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'user@example.com';
```

#### 3. Common Database Issues

**Issue: "Table doesn't exist"**
- Check `ddl-auto` setting in `application.properties`
- Set to `update` to auto-create tables
- Restart application

**Issue: "Foreign key constraint violation"**
- Ensure user exists before creating related records
- Check `user_id` values are valid

## 🔧 Common Tasks

### Adding a New Field to Existing Entity

**Example: Add `tags` field to Transaction**

1. **Update Model:**
```java
// Transaction.java
private String tags; // Comma-separated tags

public String getTags() { return tags; }
public void setTags(String tags) { this.tags = tags; }
```

2. **Database will auto-update** (if `ddl-auto=update`)

3. **Update Frontend:**
```javascript
// Add to form
<Form.Control
  name="tags"
  value={formData.tags}
  onChange={handleChange}
/>
```

### Adding Validation

**Backend:**
```java
@PostMapping
public ResponseEntity<?> addTransaction(@RequestBody Transaction transaction) {
    // Validate
    if (transaction.getAmount() <= 0) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Amount must be positive"));
    }
    
    if (transaction.getTitle() == null || transaction.getTitle().trim().isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Title is required"));
    }
    
    // Process...
}
```

**Frontend:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate
  if (formData.amount <= 0) {
    setError("Amount must be positive");
    return;
  }
  
  // Submit...
};
```

### Adding Pagination

**Backend:**
```java
@GetMapping
public ResponseEntity<Map<String, Object>> getTransactions(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Principal principal) {
    
    String email = principal.getName();
    Pageable pageable = PageRequest.of(page, size);
    Page<Transaction> transactionPage = transactionRepository.findByUser(
        getUserByEmail(email), pageable);
    
    Map<String, Object> response = new HashMap<>();
    response.put("transactions", transactionPage.getContent());
    response.put("totalPages", transactionPage.getTotalPages());
    response.put("currentPage", page);
    response.put("hasMore", page < transactionPage.getTotalPages() - 1);
    
    return ResponseEntity.ok(response);
}
```

**Frontend:**
```javascript
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const fetchTransactions = async () => {
  const response = await axios.get(`/api/transactions?page=${page}&size=20`);
  const { transactions, hasMore } = response.data;
  setTransactions(prev => [...prev, ...transactions]);
  setHasMore(hasMore);
};
```

## ✅ Best Practices

### Backend

1. **Always verify user ownership**
```java
if (!transaction.getUser().getId().equals(user.getId())) {
    throw new IllegalArgumentException("Unauthorized");
}
```

2. **Use service layer for business logic**
- Don't put logic in controllers
- Controllers should only handle HTTP

3. **Handle exceptions properly**
```java
try {
    // Operation
} catch (IllegalArgumentException e) {
    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
} catch (Exception e) {
    logger.error("Unexpected error", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error", "An error occurred"));
}
```

4. **Use meaningful error messages**
```java
// Bad
throw new IllegalArgumentException("Error");

// Good
throw new IllegalArgumentException("Transaction amount must be positive");
```

### Frontend

1. **Handle loading states**
```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await submit();
  } finally {
    setLoading(false);
  }
};
```

2. **Clean up effects**
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    // Do something
  }, 1000);
  
  return () => clearInterval(timer); // Cleanup
}, []);
```

3. **Use keys in lists**
```javascript
{items.map(item => (
  <ItemComponent key={item.id} item={item} />
))}
```

4. **Validate user input**
```javascript
if (!email.includes('@')) {
  setError('Invalid email');
  return;
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Can register new user
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Can add transaction
- [ ] Can view transactions
- [ ] Can delete transaction
- [ ] Can add goal
- [ ] Can complete goal
- [ ] Can view recommendations
- [ ] Logout works correctly

### Testing New Features

1. **Test happy path** (everything works)
2. **Test error cases** (invalid input, missing data)
3. **Test edge cases** (empty lists, null values)
4. **Test security** (can't access other users' data)

## 📚 Next Steps

- Read [Architecture Overview](./ARCHITECTURE.md) for system design
- Read [Backend Documentation](./BACKEND.md) for Spring Boot details
- Read [Frontend Documentation](./FRONTEND.md) for React details
- Read [API Documentation](./API.md) for endpoint reference

---

**Happy Coding! 💰**

