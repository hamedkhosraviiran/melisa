# melisa
Melisa – Centralized Test Coverage Management System

Melisa is a multi-module system designed to collect, store, analyze, and visualize test coverage data across multiple projects.
It consists of three main components:

melisa-backend → Quarkus (Java 21) API for storing and analyzing coverage data

melisa-ui → Next.js 15 dashboard for real-time visualization

melisa-reporter → Jest reporter that sends test coverage reports to the backend

## Project Structure
````

├── melisa-backend     → Quarkus API (Java 21, Maven)
├── melisa-ui          → Next.js 15 dashboard (Node.js)
└── melisa-reporter    → Jest reporter package (Node.js)

````
## 📦 Requirements

Before running the project, ensure you have the following installed:

- Java 21

- Maven 3.9+

- Node.js 18+

- npm 9+

## Running the Project

Below are instructions to run each module independently.
1. melisa-backend (Quarkus API)

📍 Location

/melisa-backend

🛠 Tech Stack

- Quarkus (Java 21)

- Hibernate ORM + Panache

- H2 database (in-memory)

- RESTful API for coverage ingestion and analytics
```
cd melisa-backend
./mvnw quarkus:dev
```
2. melisa-ui (Next.js Dashboard)

📍 Location

/melisa-ui

### 🛠 Tech Stack

- Next.js 15 (App Router)

- TypeScript

- Tailwind CSS

- Recharts for visualization

### ▶️ Run the UI
```aiignore
cd melisa-ui
npm install
npm run dev
```
UI will run on:
```aiignore
http://localhost:3000
```
3. melisa-reporter (Jest Reporter)

📍 Location

/melisa-reporter

### 🛠 Tech Stack

- TypeScript

- Jest

- Custom Coverage Sender (axios)

- Coverage parser utility

### ▶️ Run Tests + Send Coverage
```aiignore
cd melisa-reporter
npm install
npm run test:full
```
This command executes Jest tests, generates coverage, and sends results to the backend API.

📊 High-Level Architecture
```aiignore
Jest Tests
   ↓ (coverage)
melisa-reporter
   ↓ sends JSON
melisa-backend (Quarkus API)
   ↓ stores + analyzes
H2 Database
   ↓ serves API data
melisa-ui (Next.js Dashboard)

```

### 🧩 Modules Overview
#### melisa-backend

- Accepts coverage reports via REST

- Computes trends and project summaries

- Stores records in H2 or any configured SQL DB

#### melisa-ui

- Displays project summaries

- Renders historical coverage trends

- Uses a clean dashboard optimized with React + Next.js

#### melisa-reporter

- Extracts Jest coverage

- Transforms Istanbul coverage format

- Sends data automatically to backend