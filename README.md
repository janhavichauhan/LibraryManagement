# Library Management System

A full-stack web application for managing library operations including book cataloging, member management, lending/returning books, waitlist management, and generating reports.

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Library Management System               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌──────────────────┐         │
│  │   Client (UI)   │ ◄────► │   Server (API)   │         │
│  │   React + Vite  │  HTTP  │   Node.js/Express│         │
│  │   TailwindCSS   │         │                  │         │
│  └─────────────────┘         └────────┬─────────┘         │
│                                       │                    │
│                              ┌────────▼─────────┐         │
│                              │   MongoDB        │         │
│                              │   (Database)     │         │
│                              └──────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **React 19.2.0** - UI library for building interactive interfaces
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notification system

#### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Project Structure

```
LibraryManagement/
├── Client/                    # Frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js       # API service layer
│   │   ├── assets/          # Images and media
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── RightPanel.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Catalog.jsx  # Book management page
│   │   │   ├── Members.jsx  # Member management page
│   │   │   └── Reports.jsx  # Analytics and reports
│   │   ├── App.jsx          # Root component
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── eslint.config.js
│
└── Server/                    # Backend application
    ├── config/
    │   └── db.js             # Database connection
    ├── controllers/
    │   ├── bookController.js
    │   ├── memberController.js
    │   └── reportController.js
    ├── models/
    │   ├── Book.js           # Book schema
    │   ├── Loan.js           # Loan schema
    │   └── Member.js         # Member schema
    ├── routes/
    │   ├── books.js          # Book routes
    │   ├── members.js        # Member routes
    │   └── reports.js        # Report routes
    ├── LibraryManagement/    # API testing collection (Bruno)
    │   ├── AddBook.bru
    │   ├── AddMember.bru
    │   ├── GetBooks.bru
    │   └── bruno.json
    ├── server.js             # Express server entry
    ├── package.json
    └── .env                  # Environment variables
```

## 🎯 Core Features

### 1. Book Catalog Management
- Add books manually with title, author, tags, and cover images
- Populate library from Open Library API
- Search and filter books
- Delete books (only when not borrowed)
- Automatic cover image fallback fetching
- Visual status indicators (Available/Borrowed)

### 2. Lending System
- Lend books to registered members
- Automatic waitlist management
- Take back borrowed books
- Auto-assign books to waitlist when returned
- Track checkout count per book

### 3. Member Management
- Register new members
- View member profiles
- Track active loans per member
- Direct book return from member view

### 4. Waitlist System
- Automatic waitlist creation when book is borrowed
- Queue visualization with member names
- Priority-based assignment when book is returned

### 5. Reports & Analytics
- Overdue books report
- Top 5 most borrowed books
- Member lending statistics

## 🚀 Getting Started

### Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v6 or higher) - Running instance
- **Git** (optional, for cloning)

### Installation

#### 1. Clone or Download the Project

```bash
cd LibraryManagement
```

#### 2. Server Setup

Navigate to the Server directory and install dependencies:

```bash
cd Server
npm install
```

Create a `.env` file in the `Server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/libraryDB
```

Replace `MONGO_URI` with your MongoDB connection string if using MongoDB Atlas or a different configuration.

#### 3. Client Setup

Navigate to the Client directory and install dependencies:

```bash
cd ../Client
npm install
```

### Running the Application

#### 1. Start MongoDB

Ensure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or if using MongoDB as a service (Windows)
net start MongoDB

# Or if using MongoDB as a service (Linux/Mac)
sudo systemctl start mongod
```

#### 2. Start the Backend Server

From the `Server` directory:

```bash
npm run dev
```

The server will start on `http://localhost:5000`

You should see:
```
Server running on port 5000
MongoDB Connected Successfully
```

#### 3. Start the Frontend Development Server

Open a new terminal, navigate to the `Client` directory:

```bash
npm run dev
```

The client will start on `http://localhost:5173` (or another available port)

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## 📡 API Endpoints

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books/getBooks` | Fetch all books |
| POST | `/api/books/addBook` | Add a new book |
| POST | `/api/books/:bookId/lend` | Lend book or add to waitlist |
| POST | `/api/books/:bookId/return` | Return book and process waitlist |
| DELETE | `/api/books/:bookId` | Delete a book |
| POST | `/api/books/populate` | Populate books from Open Library |

### Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members/getMembers` | Fetch all members with active loans |
| POST | `/api/members/addMember` | Register a new member |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/overdue` | Get overdue books |
| GET | `/api/reports/top-books` | Get top 5 borrowed books |

## 🧪 Testing

This project includes comprehensive E2E tests using Cypress. See [TESTING.md](Client/TESTING.md) for detailed testing documentation.

### Quick Start

```bash
# Run tests in interactive mode
cd Client
npm run cypress:open

# Run tests in headless mode
npm test
```

### Test Coverage

- ✅ Book catalog management
- ✅ Member operations
- ✅ Lending and returning flows
- ✅ Waitlist management
- ✅ Navigation and UI
- ✅ API endpoints
- ✅ Error handling
- ✅ Complete user workflows

For more details, see [Client/TESTING.md](Client/TESTING.md).

## 🗄️ Database Schemas

### Book Schema
```javascript
{
  title: String (required, unique),
  author: String,
  tags: [String],
  status: String (default: "AVAILABLE"),
  checkoutCount: Number (default: 0),
  waitlist: [ObjectId] (ref: Member),
  coverImage: String (default: "")
}
```

### Member Schema
```javascript
{
  firstName: String (required),
  lastName: String (required),
  activeLoans: [ObjectId] (ref: Loan)
}
```

### Loan Schema
```javascript
{
  book: ObjectId (ref: Book, required),
  member: ObjectId (ref: Member, required),
  borrowedDate: Date (default: Date.now),
  dueDate: Date (required)
}
```

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern Glassmorphism Effects** - Beautiful backdrop blur and shadows
- **Interactive Animations** - Smooth hover effects and transitions
- **Toast Notifications** - Real-time feedback for all actions
- **Modal Dialogs** - Clean forms for adding books and members
- **Dynamic Cover Images** - Automatic fallback fetching from Open Library
- **Waitlist Tooltips** - Hover to see queue information
- **Status Badges** - Visual indicators for book and member status

## 🔧 Development Scripts

### Client

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server

```bash
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start normally
```

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 or 5173 is already in use:

**Server:** Edit `.env` file and change `PORT` value
**Client:** Vite will automatically use the next available port

### MongoDB Connection Failed

- Verify MongoDB is running: `mongosh` or `mongo`
- Check connection string in `.env`
- Ensure no firewall blocking port 27017

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Ensure the server has CORS enabled (already configured in `server.js`)

## 📝 Environment Variables

### Server (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/libraryDB
NODE_ENV=development
```

## 🧪 Testing the API

Use the included Bruno collection in `Server/LibraryManagement/` for API testing.

Or use curl:

```bash
# Add a book
curl -X POST http://localhost:5000/api/books/addBook \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Book","author":"Test Author","tags":["fiction"]}'

# Get all books
curl http://localhost:5000/api/books/getBooks
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is open source and available for educational purposes.

## 👥 Authors

Built as a full-stack library management solution.

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Open Library API](https://openlibrary.org/developers/api)

---

**Happy Coding! 📚✨**
