# API Documentation

Complete reference for all REST API endpoints in the Finance Tracker application.

## 🔐 Authentication

All endpoints except `/api/auth/**` require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📋 Base URL

- **Development**: `http://localhost:8080`
- **Production**: Set via `REACT_APP_API_BASE_URL` environment variable

## 🔑 Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "email": "user@example.com",
  "firstName": "John"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Email already exists"
}
```

**Frontend Usage:**
```javascript
import { useAuth } from '../context/UserContext';

const { register } = useAuth();
await register(email, password, firstName, lastName);
```

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "firstName": "John"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid email or password"
}
```

**Frontend Usage:**
```javascript
const { login } = useAuth();
await login(email, password);
// Token is automatically stored in localStorage
```

---

## 💰 Transaction Endpoints

### Get All Transactions

**GET** `/api/transactions`

Retrieve all transactions for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
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
  },
  {
    "id": 2,
    "title": "Salary",
    "amount": 3000.00,
    "type": "income",
    "category": "Salary",
    "account": "Checking",
    "date": "2024-01-01",
    "notes": "Monthly salary"
  }
]
```

**Frontend Usage:**
```javascript
import { getAllTransactions } from '../api/transactions';

const response = await getAllTransactions();
const transactions = response.data;
```

---

### Add Transaction

**POST** `/api/transactions`

Create a new transaction.

**Request Body:**
```json
{
  "title": "Coffee",
  "amount": 5.50,
  "type": "expense",
  "category": "Food",
  "account": "Checking",
  "date": "2024-01-20",
  "notes": "Morning coffee"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "title": "Coffee",
  "amount": 5.50,
  "type": "expense",
  "category": "Food",
  "account": "Checking",
  "date": "2024-01-20",
  "notes": "Morning coffee"
}
```

**Frontend Usage:**
```javascript
import { addTransaction } from '../api/transactions';

const transaction = {
  title: "Coffee",
  amount: 5.50,
  type: "expense",
  category: "Food",
  account: "Checking",
  date: "2024-01-20",
  notes: "Morning coffee"
};

await addTransaction(transaction);
```

---

### Delete Transaction

**DELETE** `/api/transactions/{id}`

Delete a transaction by ID.

**Response (200 OK):**
No response body

**Frontend Usage:**
```javascript
import { deleteTransaction } from '../api/transactions';

await deleteTransaction(transactionId);
```

---

### Import Transactions

**POST** `/api/transactions/import`

Import transactions from CSV or JSON file.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `file` field

**CSV Format:**
```csv
title,amount,type,category,account,date,notes
Grocery Shopping,150.50,expense,Groceries,Checking,1/15/2024,Weekly groceries
Salary,3000.00,income,Salary,Checking,1/1/2024,Monthly salary
```

**JSON Format:**
```json
[
  {
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

**Response (200 OK):**
```json
{
  "message": "Imported successfully",
  "imported": 2,
  "details": "2 transaction(s) were imported and saved to your account."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "No valid transactions found in file",
  "imported": 0,
  "details": "Please check that your file contains valid data..."
}
```

**Frontend Usage:**
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await axios.post('/api/transactions/import', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});
```

---

### Export Transactions

**GET** `/api/transactions/export`

Export all user transactions (same as GET `/api/transactions`).

**Response (200 OK):**
Same as GET `/api/transactions`

---

## 🎯 Goal Endpoints

### Get All Goals

**GET** `/api/goals`

Retrieve all goals for the authenticated user.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "text": "Save $10,000 for emergency fund",
    "steps": "[{\"text\":\"Save $1,000 per month\",\"completed\":false}]",
    "timeframe": "10 months",
    "completed": false,
    "createdAt": "2024-01-01",
    "completedAt": null
  }
]
```

**Frontend Usage:**
```javascript
import { getAllGoals } from '../api/goals';

const response = await getAllGoals();
const goals = response.data;
```

---

### Add Goal

**POST** `/api/goals`

Create a new financial goal.

**Request Body:**
```json
{
  "text": "Save $10,000 for emergency fund",
  "steps": "[{\"text\":\"Save $1,000 per month\",\"completed\":false}]",
  "timeframe": "10 months",
  "completed": false
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "text": "Save $10,000 for emergency fund",
  "steps": "[{\"text\":\"Save $1,000 per month\",\"completed\":false}]",
  "timeframe": "10 months",
  "completed": false,
  "createdAt": "2024-01-01",
  "completedAt": null
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Goal text is required"
}
```

**Frontend Usage:**
```javascript
import { addGoal } from '../api/goals';

const goal = {
  text: "Save $10,000 for emergency fund",
  steps: JSON.stringify([{text: "Save $1,000 per month", completed: false}]),
  timeframe: "10 months",
  completed: false
};

await addGoal(goal);
```

---

### Update Goal

**PUT** `/api/goals/{id}`

Update an existing goal.

**Request Body:**
```json
{
  "text": "Save $15,000 for emergency fund",
  "completed": false
}
```

**Response (200 OK):**
Updated goal object

**Frontend Usage:**
```javascript
import { updateGoal } from '../api/goals';

await updateGoal(goalId, { text: "Updated goal text" });
```

---

### Complete Goal

**PUT** `/api/goals/{id}/complete`

Mark a goal as completed.

**Response (200 OK):**
Updated goal object with `completed: true` and `completedAt` set

**Frontend Usage:**
```javascript
import { completeGoal } from '../api/goals';

await completeGoal(goalId);
```

---

### Delete Goal

**DELETE** `/api/goals/{id}`

Delete a goal.

**Response (200 OK):**
```json
{
  "message": "Goal deleted successfully"
}
```

**Frontend Usage:**
```javascript
import { deleteGoal } from '../api/goals';

await deleteGoal(goalId);
```

---

## 🛍️ Recommendation Endpoints

### Get Recommendations

**GET** `/api/recommendations`

Get personalized product recommendations based on spending patterns and goals.

**Query Parameters:**
- `page` (optional, default: 0) - Page number for pagination
- `size` (optional, default: 12) - Number of items per page

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Meal Prep Containers Set",
      "description": "BPA-free glass containers perfect for meal prepping...",
      "price": 24.99,
      "image": "https://images.unsplash.com/...",
      "url": "https://www.amazon.com/..."
    }
  ],
  "page": 0,
  "size": 12,
  "total": 36,
  "hasMore": true
}
```

**Frontend Usage:**
```javascript
import { getRecommendations } from '../api/recommendations';

const response = await getRecommendations(0, 12);
const { products, hasMore, total } = response.data;
```

---

## 🚨 Error Responses

All endpoints may return error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

### 401 Unauthorized
- Missing or invalid JWT token
- Frontend should redirect to login page

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred"
}
```

---

## 📝 Data Types

### Transaction
```typescript
{
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  account: string;
  date: string; // ISO date format: "YYYY-MM-DD"
  notes?: string;
}
```

### Goal
```typescript
{
  id: number;
  text: string;
  steps: string; // JSON string of array
  timeframe: string;
  completed: boolean;
  createdAt: string; // ISO date format
  completedAt: string | null; // ISO date format or null
}
```

### Product (Recommendation)
```typescript
{
  id: number;
  name: string;
  description: string;
  price: number;
  image: string; // URL
  url: string; // URL
}
```

---

## 🔧 Testing Endpoints

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

**Get Transactions:**
```bash
curl -X GET http://localhost:8080/api/transactions \
  -H "Authorization: Bearer <your_token>"
```

### Using Postman

1. Create a new request
2. Set method (GET, POST, etc.)
3. Enter URL: `http://localhost:8080/api/transactions`
4. In Headers tab, add:
   - Key: `Authorization`
   - Value: `Bearer <your_token>`
5. For POST requests, in Body tab:
   - Select "raw" and "JSON"
   - Enter JSON body

---

## 📚 Next Steps

- Read [Backend Documentation](./BACKEND.md) to understand implementation
- Read [Frontend Documentation](./FRONTEND.md) to see how to use these APIs
- Read [Development Guide](./DEVELOPMENT.md) to add new endpoints

