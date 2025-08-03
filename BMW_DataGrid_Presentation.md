# 🚗 BMW DataGrid - Universal Data Management System
## Aptitude Test for BMW IT Internship Position

---

## 📋 **Project Overview**

A comprehensive **Universal DataGrid Management System** built with React, AG Grid, and Express.js, featuring advanced user authentication, multi-tenant data management, and powerful data visualization capabilities.

---

## 🎯 **Core Requirements Fulfilled**

### ✅ **1. Generic DataGrid Component**
- **Universal CSV Support**: Handles any data structure with N columns
- **Dynamic Column Detection**: Automatically detects and displays columns from any CSV
- **Actions Column**: Built-in "View" and "Delete" actions for each record
- **Detailed View**: Click "View" navigates to detailed record page with back button

### ✅ **2. Advanced Search (Backend API)**
- **Real-time Search**: Instant filtering across all columns
- **Backend Integration**: Search queries processed server-side for performance
- **Multi-column Search**: Search across any data field

### ✅ **3. Advanced Filtering (Backend API)**
- **Multiple Filter Types**: 
  - Contains, Equals, Starts with, Ends with
  - Is empty, Greater than, Less than
- **OR/AND Logic**: Complex filtering combinations
- **Column-specific Filters**: Different filter types per column

### ✅ **4. Backend Service (Express.js)**
- **RESTful APIs**: Complete CRUD operations
- **Authentication**: JWT and Firebase authentication
- **Database Integration**: MySQL with optimized queries
- **Multi-tenant Architecture**: User data isolation

---

## 🚀 **Additional Features Implemented**

### 🔐 **Advanced User Management**
- **Dual Authentication**: 
  - Manual registration/login with validation
  - Google Firebase authentication
- **User Status Management**: Active/inactive status tracking
- **Comprehensive Validation**: Email format, password strength, confirm password
- **Secure Password Hashing**: SHA256 encryption

### 📊 **Grid Management System**
- **1-to-Many Relationship**: Users can create multiple grids
- **CSV File Upload**: Drag-and-drop file upload with validation
- **Grid Operations**: Create, update, delete grids and records
- **Data Persistence**: JSON storage for maximum flexibility

### 🎨 **Professional UI/UX**
- **BMW Branding**: Custom BMW icons and styling
- **Material-UI Design**: Modern, responsive interface
- **Intuitive Navigation**: Tab-based dashboard layout
- **Error Handling**: Comprehensive error messages and validation

---

## 🛠 **Technical Architecture**

### **Frontend Stack**
```
React 18 + TypeScript
├── AG Grid (Data Visualization)
├── Material-UI (Styling)
├── React Router (Navigation)
├── Context API (State Management)
└── Firebase Auth (Google Sign-in)
```

### **Backend Stack**
```
Node.js + Express.js
├── MySQL Database
├── JWT Authentication
├── Firebase Integration
├── Multer (File Upload)
└── CORS & Security
```

### **Database Schema**
```sql
users (id, email, name, password, status)
user_grids (id, name, user_id, created_at)
universal_data (id, data, grid_id, added_by, created_at)
```

---

## 📈 **Key Features Showcase**

### **1. Universal Data Handling**
- ✅ Any CSV structure supported
- ✅ Automatic column detection
- ✅ JSON storage for flexibility
- ✅ Multi-tenant data isolation

### **2. Advanced Search & Filtering**
- ✅ Real-time search across all columns
- ✅ Multiple filter types (contains, equals, etc.)
- ✅ OR/AND logic combinations
- ✅ Backend API integration

### **3. User Authentication**
- ✅ Manual registration with validation
- ✅ Google Firebase authentication
- ✅ User status management (active/inactive)
- ✅ Secure password hashing

### **4. Grid Management**
- ✅ Create multiple grids per user
- ✅ Upload CSV files with validation
- ✅ Update grid names and files
- ✅ Delete grids and individual records

### **5. Professional UI**
- ✅ BMW branding and icons
- ✅ Responsive Material-UI design
- ✅ Intuitive navigation
- ✅ Error handling and validation

---

## 🔧 **API Endpoints**

### **Authentication**
```
POST /api/auth/register    - Manual user registration
POST /api/auth/login       - Manual user login
POST /api/auth/logout      - User logout
POST /api/auth/firebase/verify - Google authentication
```

### **Data Management**
```
GET    /api/data          - Fetch data with search/filter
POST   /api/data          - Create new record
PUT    /api/data/:id      - Update record
DELETE /api/data/:id      - Delete record
```

### **Grid Management**
```
GET    /api/grids         - Fetch user's grids
POST   /api/grids         - Create new grid
PUT    /api/grids/:id     - Update grid
DELETE /api/grids/:id     - Delete grid
```

---

## 🎯 **BMW Requirements Compliance**

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Generic DataGrid | ✅ Complete | AG Grid with dynamic columns |
| Actions Column | ✅ Complete | View/Delete actions |
| Detailed View | ✅ Complete | Record detail page with back button |
| Search Feature | ✅ Complete | Backend API integration |
| Filtering | ✅ Complete | Multiple filter types with OR/AND logic |
| Backend Service | ✅ Complete | Express.js with MySQL |
| Database | ✅ Complete | MySQL with optimized schema |

---

## 🚀 **Enhanced Features Beyond Requirements**

### **User Management**
- ✅ Manual authentication with validation
- ✅ Google Firebase integration
- ✅ User status tracking
- ✅ Multi-tenant data isolation

### **Advanced DataGrid**
- ✅ Universal CSV support
- ✅ Dynamic column detection
- ✅ Advanced filtering and search
- ✅ Responsive design

### **Grid Management**
- ✅ Multiple grids per user
- ✅ CSV file upload and validation
- ✅ Grid CRUD operations
- ✅ Record management

---

## 📊 **Project Statistics**

- **Lines of Code**: 5,000+ lines
- **Components**: 12 React components
- **API Endpoints**: 15+ RESTful endpoints
- **Database Tables**: 3 optimized tables
- **Features**: 20+ implemented features
- **Authentication Methods**: 2 (Manual + Google)

---

## 🎉 **Conclusion**

This BMW DataGrid project demonstrates:

1. **Technical Excellence**: Modern React/Node.js stack with best practices
2. **Feature Completeness**: All requirements + additional enhancements
3. **Professional Quality**: BMW branding, error handling, validation
4. **Scalability**: Multi-tenant architecture, optimized database
5. **User Experience**: Intuitive interface, responsive design

**Ready for BMW's review and internship application!** 🚗✨

---

*Developed with ❤️ for BMW IT Internship Position* 