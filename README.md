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

## How It's Organized

### Frontend (React)
The frontend is in the `autogrid/` folder and handles the user interface:
```
autogrid/src/
├── components/
│   ├── GenericDataGrid.js    # Main data grid component
│   ├── DataManagementPage.js # File upload and data management
│   ├── Dashboard.js          # Main dashboard
│   ├── LoginPage.js          # Google authentication
│   └── ...
├── context/
│   └── AuthContext.js        # Handles user authentication state
└── services/
    └── firebaseAuth.js       # Firebase integration
```

### Backend (Node.js)
The server code is in the `server/` folder:
```
server/
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── data.js              # Data CRUD operations
│   └── grids.js             # Grid management
├── config/
│   └── auth.js              # JWT middleware
└── database/
    └── setup.js             # Database initialization
```

### Database Structure
I kept the database design simple but flexible:

```sql
-- Main data storage - everything as JSON for flexibility
universal_data (
  id VARCHAR(36) PRIMARY KEY,
  data JSON,                 -- The actual CSV row data
  added_by VARCHAR(255),     -- Which user uploaded it
  grid_id VARCHAR(36),       -- Which dataset it belongs to
  created_at TIMESTAMP
)

-- Grid metadata to track user's datasets
user_grids (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),         -- Dataset name
  added_by VARCHAR(255),     -- User ID
  column_order JSON,         -- How to display columns
  created_at TIMESTAMP
)
```

## Technical Approach

The core idea was to make it generic enough to handle any CSV structure without having to predefine database schemas. Here's how it works:

1. **Flexible Data Storage**: Everything gets stored as JSON, so I don't need to know the column structure ahead of time
2. **Frontend Column Detection**: When you upload a CSV, the frontend reads the headers and automatically creates the grid
3. **Server-side Filtering**: All the filtering logic runs on the backend using MySQL's JSON functions
4. **User Isolation**: Each user can only see and modify their own data

## Getting It Running

You'll need a few things set up first:
- Node.js (I used v16, but v14+ should work)
- MySQL database (I used a local MySQL install)
- Firebase project for authentication

### Setting Up

```bash
# Clone and install everything
git clone <repository-url>
cd BMW_Aptitude_Test_IT_Internship_Position

# Install all the dependencies
npm install
cd autogrid && npm install
cd ../server && npm install
```

### Environment Configuration

Copy the example environment file and fill in your details:
```bash
cp server/env.example server/.env
```

Then edit `server/.env` with your actual credentials:
```bash
# Database connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bmw_datagrid

# Firebase project details (get these from your Firebase console)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
JWT_SECRET=any_random_string_for_jwt
```

### Running the App

I set up a simple npm script that starts both the frontend and backend:
```bash
npm run dev
```

The frontend will be at http://localhost:3000 and the backend at http://localhost:3001.

## How to Use It

### Uploading Data
1. Sign in with your Google account (I used Firebase Auth for this)
2. Upload any CSV file - I tested it with car data, but it should work with employee lists, product catalogs, whatever
3. The system reads the CSV headers and automatically creates a data grid
4. You can then filter, search, and manage your data

### Filtering Examples
The filtering was one of the more complex parts I implemented. Here's what you can do:

**Text filtering:**
- Search for cars that contain "BMW" in the brand name
- Find models that start with "X" (like X3, X5, etc.)
- Look for cars where the model equals exactly "Model 3"

**Number filtering:**
- Find cars with price > 50000
- Filter by range >= 300 miles
- Show cars with year = 2023

**Complex filtering:**
- Brand contains "Tesla" AND price > 40000
- Model starts with "Model" OR brand contains "BMW"

The nice thing is it's case-insensitive, so searching for "tesla" or "Tesla" gives the same results.

## Technical Details

### Data Handling Challenges
The biggest challenge was making it work with any CSV structure without knowing the columns ahead of time. I solved this by:
- Storing everything as JSON in MySQL (flexible but still queryable)
- Having the frontend dynamically detect column types (text vs numbers)
- Using MySQL's JSON functions for filtering on the backend

### Performance Considerations  
I tried to think about performance from the start:
- All filtering happens on the server side (faster than client-side filtering)
- Added pagination for large datasets
- Debounced the search input so it doesn't spam the API
- Used proper database indexes where possible

### Security Stuff
- JWT tokens for session management
- Each user can only see their own data (enforced at the database level)
- Parameterized queries to prevent SQL injection
- Input validation on both frontend and backend

## Interface Notes

I kept the UI pretty straightforward - Material-UI components with a clean layout. It's responsive so it works on mobile too. The main features:
- Click column headers to sort
- Filter panel for each column type
- Pagination controls at the bottom
- Search box that works across all columns
- Delete and view actions for each row

Nothing too fancy, but it gets the job done and looks professional.

## What I'd Improve

### Current Limitations
There are definitely some things I'd work on if I had more time:
- The CSV parser is pretty basic - it might struggle with complex CSV files (quotes, escaping, etc.)
- No data export feature yet (though it would be straightforward to add)
- The UI could use some more polish and better error messages
- No bulk operations like selecting multiple rows to delete at once
- File size limits aren't enforced on the frontend

### If I Had More Time
Some features I'd love to add:
- Export filtered data back to CSV or Excel
- Bulk select and delete operations
- Better CSV parsing that handles edge cases
- Data visualization (charts and graphs)
- Real-time updates when other users modify data
- Better mobile experience

### Development Notes
This was built over a few weeks, focusing on getting the core functionality working first. The generic data handling was the most complex part - making sure the filtering worked correctly with MySQL's JSON functions took some trial and error.

I tried to keep the code clean and well-commented, especially in the backend filtering logic since that's where most of the complexity lives.