# Frontend Documentation

This document provides detailed documentation of the React frontend, including components, hooks, state management, and programming concepts.

## 📚 Table of Contents

1. [React Basics](#react-basics)
2. [Project Structure](#project-structure)
3. [Components](#components)
4. [State Management](#state-management)
5. [Routing](#routing)
6. [API Communication](#api-communication)
7. [Hooks Explained](#hooks-explained)
8. [Common Patterns](#common-patterns)

## ⚛️ React Basics

### What is React?

React is a JavaScript library for building user interfaces. It uses a **component-based** architecture where UI is broken into reusable pieces.

### Key Concepts

#### Components
Components are JavaScript functions that return JSX (HTML-like syntax):

```javascript
function Welcome() {
  return <h1>Hello, World!</h1>;
}
```

#### JSX
JSX lets you write HTML-like code in JavaScript:

```javascript
const element = <h1>Hello, {name}!</h1>;
// Note: {name} is JavaScript expression
```

#### Props
Props pass data from parent to child components:

```javascript
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Greeting name="Jake" />
```

#### State
State stores data that can change and trigger re-renders:

```javascript
const [count, setCount] = useState(0);
// count is the value
// setCount is the function to update it
```

## 📁 Project Structure

```
frontend/src/
├── api/              # API client functions
├── components/       # Reusable UI components
├── context/          # React Context providers
├── pages/           # Page-level components
├── App.js           # Main app component (routing)
├── index.js         # Entry point
└── axios.js         # Axios configuration
```

### Directory Purposes

**api/**: Functions that call backend API
- `transactions.js` - Transaction API calls
- `goals.js` - Goals API calls
- `recommendations.js` - Recommendations API calls

**components/**: Reusable components
- `Navbar.jsx` - Navigation bar
- `TransactionList.js` - Transaction list display

**context/**: Global state management
- `UserContext.js` - Authentication state

**pages/**: Full page components
- `Dashboard.jsx` - Main dashboard
- `AddTransaction.jsx` - Add transaction form
- `Planning.jsx` - Goals management
- etc.

## 🧩 Components

### Component Types

#### 1. Functional Components (Modern React)

```javascript
import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
```

**Why functional?**
- Simpler syntax
- Better performance
- Hooks work with functions

#### 2. Component with Props

```javascript
function TransactionCard({ transaction }) {
  return (
    <div>
      <h3>{transaction.title}</h3>
      <p>${transaction.amount}</p>
    </div>
  );
}

// Usage
<TransactionCard transaction={transactionData} />
```

#### 3. Component with State

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Component Lifecycle

Components have a lifecycle:
1. **Mount**: Component is created and added to DOM
2. **Update**: Component re-renders when state/props change
3. **Unmount**: Component is removed from DOM

**useEffect** hooks into lifecycle:

```javascript
useEffect(() => {
  // Runs after component mounts
  fetchData();
  
  return () => {
    // Cleanup (runs when component unmounts)
    // Cancel requests, clear timers, etc.
  };
}, []); // Empty array = run once on mount
```

## 🔄 State Management

### Local State (useState)

**Use for**: Component-specific data

```javascript
const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**How it works:**
- `useState(initialValue)` returns `[value, setter]`
- Call `setter(newValue)` to update
- Component re-renders when state changes

**Example:**
```javascript
function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  
  const addTransaction = (newTransaction) => {
    setTransactions([...transactions, newTransaction]);
    // Spread operator: creates new array with old + new
  };
  
  return (
    <div>
      {transactions.map(t => <div key={t.id}>{t.title}</div>)}
    </div>
  );
}
```

### Global State (Context)

**Use for**: Data shared across many components

```javascript
// UserContext.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage in any component
const { user } = useAuth();
```

**Why Context?**
- Avoids "prop drilling" (passing props through many levels)
- Centralized state management
- Easy to access from any component

### Example: UserContext

```javascript
// context/UserContext.js
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const login = async (email, password) => {
    const response = await authAxios.post("/api/auth/login", {
      email, password
    });
    
    const token = response.data.token;
    localStorage.setItem("token", token);
    setUser({ email: response.data.email });
  };
  
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🛣️ Routing

React Router handles navigation between pages.

### Setup

```javascript
// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Navigation

```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/dashboard');
  };
  
  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### Protected Routes

```javascript
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" />;
  }
  
  return children;
}

// Usage
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## 🌐 API Communication

### Axios Setup

```javascript
// axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to all requests
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
```

**What are interceptors?**
- **Request interceptor**: Runs before every request
  - Adds JWT token automatically
- **Response interceptor**: Runs after every response
  - Handles errors (like 401 unauthorized)

### API Functions

```javascript
// api/transactions.js
import axios from '../axios';

export const getAllTransactions = () => 
  axios.get('/api/transactions');

export const addTransaction = (transaction) => 
  axios.post('/api/transactions', transaction);

export const deleteTransaction = (id) => 
  axios.delete(`/api/transactions/${id}`);
```

### Using API in Components

```javascript
import { getAllTransactions } from '../api/transactions';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAllTransactions();
        setTransactions(response.data);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []); // Empty array = run once on mount
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {transactions.map(t => (
        <div key={t.id}>{t.title}</div>
      ))}
    </div>
  );
}
```

## 🎣 Hooks Explained

### useState

**Purpose**: Manage component state

```javascript
const [state, setState] = useState(initialValue);

// Update state
setState(newValue);

// Update based on previous value
setState(prev => prev + 1);
```

**Example:**
```javascript
const [count, setCount] = useState(0);

<button onClick={() => setCount(count + 1)}>
  Count: {count}
</button>
```

### useEffect

**Purpose**: Perform side effects (API calls, subscriptions, etc.)

```javascript
useEffect(() => {
  // Code to run
}, [dependencies]);
```

**Dependency Array:**
- `[]` - Run once on mount
- `[value]` - Run when `value` changes
- No array - Run on every render (usually avoid)

**Example:**
```javascript
useEffect(() => {
  // Fetch data when component mounts
  fetchTransactions();
}, []); // Empty = run once

useEffect(() => {
  // Update when userId changes
  fetchUserTransactions(userId);
}, [userId]); // Run when userId changes
```

**Cleanup:**
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);
  
  return () => {
    clearInterval(timer); // Cleanup on unmount
  };
}, []);
```

### useContext

**Purpose**: Access context values

```javascript
const { user, login, logout } = useAuth();
```

### useNavigate

**Purpose**: Programmatic navigation

```javascript
const navigate = useNavigate();
navigate('/dashboard');
```

### useCallback

**Purpose**: Memoize functions (prevent unnecessary re-renders)

```javascript
const fetchData = useCallback(async () => {
  const response = await getAllTransactions();
  setTransactions(response.data);
}, []); // Dependencies

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### useMemo

**Purpose**: Memoize computed values

```javascript
const totalExpenses = useMemo(() => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}, [transactions]); // Recompute when transactions change
```

## 🎨 Common Patterns

### 1. Fetching Data on Mount

```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await getAllTransactions();
      setTransactions(response.data);
    } catch (error) {
      setError(error.message);
    }
  };
  
  fetchData();
}, []);
```

### 2. Form Handling

```javascript
function AddTransaction() {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTransaction(formData);
      // Success!
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 3. Conditional Rendering

```javascript
{loading && <Spinner />}
{error && <Alert variant="danger">{error}</Alert>}
{transactions.length > 0 ? (
  <TransactionList transactions={transactions} />
) : (
  <p>No transactions found</p>
)}
```

### 4. Lists and Keys

```javascript
{transactions.map(transaction => (
  <TransactionCard 
    key={transaction.id}  // Required for lists
    transaction={transaction}
  />
))}
```

**Why keys?**
- React uses keys to identify which items changed
- Improves performance
- Prevents bugs with state

### 5. Loading States

```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitForm();
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading}>
    {loading ? 'Submitting...' : 'Submit'}
  </button>
);
```

### 6. Error Handling

```javascript
const [error, setError] = useState(null);

try {
  await apiCall();
} catch (err) {
  setError(err.response?.data?.error || 'Something went wrong');
}

{error && (
  <Alert variant="danger" onClose={() => setError(null)}>
    {error}
  </Alert>
)}
```

## 🔍 Understanding the Codebase

### Example: Dashboard Component

```javascript
export default function Dashboard() {
  // 1. State declarations
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllTransactions();
        setTransactions(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 3. Compute derived data
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // 4. Render
  if (loading) return <Spinner />;
  
  return (
    <Container>
      <h1>Dashboard</h1>
      <p>Total Expenses: ${totalExpenses}</p>
      <TransactionList transactions={transactions} />
    </Container>
  );
}
```

**Flow:**
1. Component mounts
2. `useEffect` runs, fetches data
3. State updates with data
4. Component re-renders with data
5. User sees transactions

### Example: Add Transaction Form

```javascript
export default function AddTransaction() {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
  });
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTransaction(formData);
      navigate('/dashboard'); // Redirect after success
    } catch (error) {
      alert('Failed to add transaction');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Transaction</button>
    </form>
  );
}
```

## 🎯 Key Programming Concepts

### Spread Operator

```javascript
// Copy array
const newArray = [...oldArray, newItem];

// Copy object
const newObject = { ...oldObject, newProperty: value };

// Update nested state
setFormData({
  ...formData,
  [fieldName]: fieldValue
});
```

### Destructuring

```javascript
// Object destructuring
const { user, login, logout } = useAuth();

// Array destructuring
const [first, second] = array;

// Function parameters
function MyComponent({ title, amount }) {
  // Use title and amount directly
}
```

### Async/Await

```javascript
// Old way (Promises)
getAllTransactions()
  .then(response => {
    setTransactions(response.data);
  })
  .catch(error => {
    console.error(error);
  });

// New way (async/await)
try {
  const response = await getAllTransactions();
  setTransactions(response.data);
} catch (error) {
  console.error(error);
}
```

### Arrow Functions

```javascript
// Regular function
function handleClick() {
  console.log('Clicked');
}

// Arrow function
const handleClick = () => {
  console.log('Clicked');
};

// Inline arrow function
<button onClick={() => console.log('Clicked')}>
  Click me
</button>
```

## 🐛 Debugging Tips

### 1. Console Logging

```javascript
console.log('State:', transactions);
console.log('Props:', props);
```

### 2. React DevTools
- Install React DevTools browser extension
- Inspect component tree
- View props and state

### 3. Network Tab
- Check API requests in browser DevTools
- See request/response data
- Identify failed requests

### 4. Common Issues

**Issue: "Cannot read property of undefined"**
```javascript
// Bad
transactions.map(t => t.title)

// Good (with check)
transactions?.map(t => t.title) || []
```

**Issue: "State not updating"**
- Check if you're mutating state directly (don't!)
- Use setter function: `setState(newValue)`

**Issue: "Infinite loop in useEffect"**
- Check dependency array
- Make sure dependencies are correct

## 📚 Next Steps

- Read [Backend Documentation](./BACKEND.md) to understand Spring Boot
- Read [API Documentation](./API.md) for endpoint details
- Read [Development Guide](./DEVELOPMENT.md) to add features

