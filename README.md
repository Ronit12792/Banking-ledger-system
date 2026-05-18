🏦 Banking Ledger System
A production-grade banking backend built with the MERN stack that simulates real-world financial transaction handling — with atomic operations, complete audit trails, and secure authentication.

Instead of simply updating balances, every money movement is stored as an immutable ledger entry, making transactions fully traceable and auditable — just like real banking systems.


Table of Contents

Overview
Architecture
Features
Tech Stack
Database Design
API Reference
Transaction Flow
Security
Error Handling
Future Roadmap


Overview
The core principle of this system is ledger-based accounting — the same approach used by real banks.
When User A transfers ₹500 to User B, the system doesn't just update two numbers. It creates immutable records:
DEBIT  → Account A → ₹500
CREDIT → Account B → ₹500
This ledger history enables:

🔍 Auditing & compliance
⚖️ Dispute resolution
🚨 Fraud detection
📄 Account statements


Architecture
Client Request
      ↓
   Routes
      ↓
JWT Auth Middleware
      ↓
  Controllers
      ↓
 Service Layer
 (Business Logic)
      ↓
Mongoose Models
      ↓
   MongoDB
LayerResponsibilityRoutesDefine API endpointsMiddlewareAuth, validation, error handlingControllersManage request/response lifecycleServicesCore business & transaction logicModelsDatabase schema definitions

Features

✅ JWT-based authentication with protected routes
✅ Multi-account support per user (savings, current, business)
✅ Atomic fund transfers using MongoDB sessions
✅ Immutable ledger entries for every transaction
✅ Complete transaction history & audit trail
✅ Centralized error handling with structured responses
✅ Balance validation before transaction execution
✅ Automatic rollback on any failure


Tech Stack
LayerTechnologyRuntimeNode.jsFrameworkExpress.jsDatabaseMongoDBODMMongooseAuthJSON Web Tokens (JWT)Password SecurityBcrypt hashing

Database Design
Users Collection
js{
  name: String,
  email: String,        // unique
  passwordHash: String,
  role: String,         // e.g. "customer", "admin"
  status: String        // e.g. "active", "suspended"
}
Accounts Collection
js{
  owner: ObjectId,      // ref → Users
  type: String,         // "savings" | "current" | "business"
  currency: String,
  balance: Number,
  status: String        // "active" | "frozen" | "closed"
}
Transactions / Ledger Collection
js{
  fromAccount: ObjectId,
  toAccount: ObjectId,
  amount: Number,
  transactionType: String,
  status: String,
  referenceId: String,  // unique per transaction
  timestamp: Date
}

API Reference
Auth
MethodEndpointDescriptionPOST/registerRegister a new userPOST/loginAuthenticate and receive JWT
Accounts
MethodEndpointDescriptionAuthPOST/accountsCreate a new account✅GET/accounts/:idFetch account details✅
Transactions
MethodEndpointDescriptionAuthPOST/transactions/transferTransfer funds between accounts✅GET/transactions/historyFetch transaction history✅

Transaction Flow
Every fund transfer follows this atomic sequence:
1. Validate sender account exists & is active
2. Validate receiver account exists & is active
3. Check sender has sufficient balance
4. Open MongoDB session (atomic transaction)
        ↓
5. Debit sender account
6. Credit receiver account
7. Create immutable ledger entry
        ↓
8. Commit — OR — Rollback on any failure
This guarantees no partial updates ever reach the database.

Security

Passwords are hashed before storage using bcrypt
JWT tokens are verified on every protected route
Middleware extracts and validates the token, then attaches the authenticated user to req.user
Authorization checks ensure users can only access their own accounts

Authentication flow:
Login → Verify Password → Generate JWT → Client stores token
                                               ↓
                              Protected Route → Middleware verifies JWT
                                               ↓
                                          Attach req.user → Controller

Error Handling
All errors are caught centrally and returned as structured JSON — the server never crashes on expected failure cases.
json{
  "success": false,
  "message": "Insufficient balance"
}
Handled scenarios:

400 — Validation errors, insufficient balance
401 — Unauthorized / invalid token
403 — Forbidden (accessing another user's resource)
404 — Account or resource not found
500 — Internal server errors


Future Roadmap
FeatureDescription🔴 Redis CachingCache account balances to reduce DB reads🔴 Rate LimitingPrevent abuse and brute-force attacks🔴 Fraud DetectionAI-powered anomaly detection on transactions🔴 Event-Driven ArchitectureAsync transaction processing with message queues🔴 MicroservicesSplit auth, accounts, and transactions into separate services🔴 Notification ServiceEmail/SMS alerts on transactions🔴 Analytics DashboardTransaction insights and reporting

What This Project Covers
Building this system deepened understanding of:

Backend architecture and separation of concerns
JWT authentication lifecycle
MongoDB relationships and multi-document transactions
Atomic operations and rollback strategies
REST API design principles
Middleware patterns
How real financial systems maintain ledger integrity beyond simple CRUD

🚀 Getting Started
A step-by-step guide to running the Banking Ledger System locally.

Prerequisites
Make sure you have the following installed:

Node.js (v16 or higher)
npm
MongoDB (local) or a MongoDB Atlas account


Installation
1. Clone the Repository
bashgit clone <your-repository-link>
cd Banking-system
2. Install Dependencies
Install all backend dependencies:
bashnpm install
Core dependencies:
bashnpm install express mongoose dotenv cors bcryptjs jsonwebtoken nodemailer
Development dependencies:
bashnpm install --save-dev nodemon
PackagePurposeexpressHTTP server and routingmongooseMongoDB ODM and schema modelingdotenvEnvironment variable managementcorsCross-origin request handlingbcryptjsPassword hashingjsonwebtokenJWT generation and verificationnodemailerEmail notificationsnodemonAuto-restart server during development

3. Configure Environment Variables
Create a .env file in the project root:
envPORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

⚠️ Never commit your .env file. Make sure it is listed in .gitignore.


4. Start MongoDB
Choose one of the following:

Local — Start your local MongoDB server
Cloud — Use a MongoDB Atlas cluster and paste the connection string into MONGODB_URI


5. Run the Server
Development (with auto-restart via nodemon):
bashnpm run dev
Production:
bashnpm start
Expected output on successful startup:
bashServer running on port 3000
MongoDB connected successfully

Server Startup Sequence
When the server starts, it follows this initialization order:
1. Express app initializes
2. Middleware loads (auth, cors, body-parser)
3. Database connects (MongoDB)
4. Routes register
5. Server begins listening on configured port

Testing the APIs
Use any REST client to test the endpoints:

Postman
Thunder Client (VS Code extension)

Quick API Reference
MethodEndpointDescriptionPOST/registerRegister a new userPOST/loginAuthenticate and receive JWTPOST/accountsCreate a bank accountPOST/transactions/transferTransfer funds between accountsGET/transactions/historyFetch transaction history

🔐 Protected routes require the Authorization: Bearer <token> header.


Project Structure
Banking-system/
├── controllers/       # Request/response handlers
├── middleware/        # Auth, validation middleware
├── models/            # Mongoose schemas
├── routes/            # API route definitions
├── services/          # Business logic & transaction handling
├── .env               # Environment variables (not committed)
├── .gitignore
├── package.json
└── server.js          # App entry point
License
MIT
