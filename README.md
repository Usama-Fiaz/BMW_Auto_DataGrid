# BMW Aptitude Test - Universal Data Management System

A modern, professional **Generic DataGrid** application built with React, Material-UI, and AG Grid for BMW's IT Internship position. This system can handle any CSV data structure with advanced filtering, search, and multi-tenant capabilities.

## 🚀 **Key Features**

### **📊 Generic DataGrid System**
- **Universal CSV Support**: Handles any CSV structure - employees, products, sales data, or custom data
- **Automatic Column Detection**: Frontend automatically detects and displays columns from any CSV structure
- **JSON Storage**: All data stored as JSON in a single database column for maximum flexibility
- **Multi-tenant Architecture**: Each user can only access their own data

### **🔐 Authentication & Security**
- **Firebase Authentication**: Secure user login with Google
- **JWT Tokens**: Session management with secure token-based authentication
- **User Data Isolation**: Each user can only access their own data
- **Protected Routes**: Automatic redirection for unauthenticated users

### **📈 Advanced Filtering & Search**
- **Backend Filtering**: All filtering done on the server for performance
- **Multiple Filter Types**: Contains, equals, starts with, ends with, greater than, less than
- **OR/AND Logic**: Multiple filters on same field use OR logic, different fields use AND logic
- **Case-Insensitive**: Filters work with both uppercase and lowercase
- **Numeric Support**: Proper handling of number-based filters
- **Real-time Updates**: Instant results as you type

### **🎨 Modern UI/UX**
- **Material-UI Design**: Professional, modern interface
- **Responsive Layout**: Works on desktop and mobile
- **Dark/Light Theme**: Consistent theming throughout
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 🏗️ **Architecture**

### **Frontend (React + Material-UI)**
```
autogrid/src/
├── components/
│   ├── GenericDataGrid.js    # Generic data grid component
│   ├── DataManagementPage.js # Data upload and management
│   ├── Dashboard.js          # Main dashboard layout
│   ├── LoginPage.js          # Authentication page
│   └── ...
├── context/
│   └── AuthContext.js        # Firebase authentication context
└── services/
    └── firebaseAuth.js       # Firebase integration
```

### **Backend (Node.js + Express)**
```
server/
├── routes/
│   ├── auth.js              # Firebase authentication
│   ├── data.js              # Generic data CRUD operations
│   └── grids.js             # Grid management
├── config/
│   └── auth.js              # JWT middleware
└── database/
    └── setup.js             # Database schema
```

### **Database (MySQL)**
```sql
-- Generic data storage
universal_data (
  id VARCHAR(36) PRIMARY KEY,
  data JSON,                 -- Flexible JSON storage for any data structure
  added_by VARCHAR(255),     -- User ID for multi-tenant isolation
  grid_id VARCHAR(36),       -- Grid association
  created_at TIMESTAMP
)

-- Grid metadata
user_grids (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),         -- Grid name
  added_by VARCHAR(255),     -- User ID
  column_order JSON,         -- Column display order
  created_at TIMESTAMP
)
```

## 🎯 **Generic DataGrid System**

### **Universal CSV Support**
```
✅ Any CSV Structure: Brand, Model, Price, Year, etc.
✅ Employee Data: Name, Department, Salary, Position, etc.
✅ Product Data: SKU, Name, Category, Price, Stock, etc.
✅ Custom Data: Any column structure you need
```

### **Key Features:**
1. **Automatic Column Detection**: Frontend detects columns from CSV structure
2. **Flexible Data Storage**: JSON storage handles any data format
3. **Advanced Filtering**: OR/AND logic for complex filtering
4. **Multi-tenant**: Each user's data is completely isolated
5. **Real-time Updates**: Instant filtering and search results

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v14+)
- MySQL database
- Firebase project

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd BMW_Aptitude_Test_IT_Internship_Position

# Install dependencies
npm install
cd autogrid && npm install
cd ../server && npm install

# Set up environment variables
cp server/env.example server/.env
# Edit server/.env with your database and Firebase credentials

# Start the application
npm run dev
```

### **Environment Setup**
```bash
# server/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bmw_datagrid

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
JWT_SECRET=your_jwt_secret
```

## 📊 **Usage Examples**

### **Uploading Any CSV Data**
1. Login with Google authentication
2. Upload any CSV file (employees, products, sales data, etc.)
3. System automatically detects columns and displays data
4. Use advanced filtering and search features

### **Advanced Filtering Examples**
- **Text Filters**: "contains", "equals", "starts with", "ends with"
- **Number Filters**: "equals", "greater than", "less than"
- **OR Logic**: Brand starts with "T" OR contains "di"
- **AND Logic**: Price > 50000 AND Range > 300
- **Case Insensitive**: Works with both "Tesla" and "tesla"

## 🔧 **Technical Highlights**

### **Generic Data Handling**
- **JSON Storage**: Flexible schema for any data structure
- **Dynamic Columns**: Frontend automatically detects and displays columns
- **Type Detection**: Automatic detection of numeric vs text fields
- **Advanced Filtering**: OR/AND logic with backend SQL JSON functions

### **Performance Optimizations**
- **Pagination**: Server-side pagination for large datasets
- **Indexed Queries**: Optimized database indexes
- **Debounced Filtering**: Reduced API calls during typing
- **Caching**: Browser caching for static assets

### **Security Features**
- **JWT Authentication**: Secure token-based sessions
- **User Isolation**: Database-level user data separation
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Protection**: Parameterized queries

## 🎨 **UI/UX Features**

### **Modern Design**
- **Material-UI Components**: Professional, accessible components
- **Responsive Layout**: Mobile-friendly design
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

### **Grid Features**
- **Sorting**: Click column headers to sort
- **Filtering**: Advanced filter panel for each column
- **Pagination**: Navigate through large datasets
- **Actions**: View details, delete records
- **Search**: Global search across all columns

## 🚀 **Future Enhancements**

### **Planned Features**
- **Data Export**: Export filtered data to CSV/Excel
- **Bulk Operations**: Select multiple records for batch operations
- **Data Visualization**: Charts and graphs for data analysis
- **API Integration**: Connect to external data sources
- **Advanced Analytics**: Statistical analysis and reporting

### **Scalability Improvements**
- **Database Sharding**: Distribute data across multiple databases
- **Caching Layer**: Redis for improved performance
- **Microservices**: Split into smaller, focused services
- **Real-time Updates**: WebSocket for live data updates