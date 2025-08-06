# BMW Aptitude Test - Data Management System

This is my submission for the BMW IT Internship position. I built a web application that can upload and manage CSV data with a focus on making it flexible enough to handle different types of data structures.

The main idea was to create something that could work with any CSV file - whether it's car data, employee records, or whatever else you might want to upload and filter through.

## What I Built

### Data Grid System
I made a system that can handle any CSV structure you throw at it. Upload a file and it automatically figures out what columns you have and displays them properly. All the data gets stored as JSON in MySQL, which gives a lot of flexibility for different data types.

Each user only sees their own data - I set up proper authentication so multiple people can use it without seeing each other's uploads.

### Authentication
Used Firebase for Google login since it's reliable and most people already have Google accounts. Added JWT tokens for session management and made sure all the routes are properly protected.

### Filtering and Search
This was probably the trickiest part. I implemented server-side filtering that supports:
- Text searches (contains, equals, starts with, ends with)
- Number comparisons (greater than, less than, equals)
- Multiple filters that work together logically
- Case-insensitive search

The filtering happens on the backend for better performance, especially with larger datasets.

### Interface
Built with React and Material-UI to keep it looking professional. It's responsive and includes proper loading states and error handling. Nothing too fancy, but it works well.

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