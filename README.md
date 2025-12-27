# Envision

A comprehensive web application designed to guide teams and individuals through the Design Thinking process. This tool provides structured templates, interactive visual editors, and document management features to streamline the journey from Empathy to Testing.

## 🚀 Features

- **Project Management**: Create and organize multiple design thinking projects.
- **Structured Workflow**: Guided phases: Empathize, Define, Ideate, Prototype, Test.
- **Interactive Visual Editor**:
- **Split-View Interface**: Real-time visual preview of your diagrams as you type.
- **Dynamic Layouts**: Automatically adjusts layouts (e.g., Empathy Maps, Personas) based on content.
- **Live Preview**: Toggle between form view and visual preview.
- **Export Functionality**: Generate high-quality PDFs of your visual diagrams for sharing and presentation.
- **Template Library**: Pre-seeded templates including Empathy Maps, User Personas, User Journey Maps, and more.
- **Authentication**: Secure user registration and login (JWT-based).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **PDF Generation**: html-to-image, jsPDF
- **Routing**: React Router v7

### Backend
- **Runtime**: Node.js & Express
- **Database**: SQLite
- **ORM**: Prisma
- **Validation**: Zod
- **Security**: Helmet, CORS, Bcrypt

### DevOps
- **Containerization**: Docker & Docker Compose
- **Server**: Nginx (Frontend reverse proxy)

## 🏁 Getting Started

### Option 1: Docker (Recommended)
Run the entire application with a single command.

1.  **Prerequisites**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2.  **Run**:
    ```bash
    docker-compose up --build
    ```
3.  **Access**:
    - Frontend: [http://localhost:8080](http://localhost:8080)
    - Backend API: [http://localhost:3000](http://localhost:3000)

### Option 2: Manual Setup

#### Backend
1.  Navigate to server:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Initialize Database:
    ```bash
    npx prisma migrate dev --name init
    npm run seed
    ```
4.  Start Server:
    ```bash
    npm start
    ```
    (Runs on port 3000)

#### Frontend
1.  Navigate to client:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Dev Server:
    ```bash
    npm run dev
    ```
    (Runs on port 5173 by default)

## 📂 Project Structure

```
design-thinking-project/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # VisualRenderer, etc.
│   │   ├── services/       # API integration
│   │   └── pages/          # Editor, Dashboard, etc.
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express Backend
│   ├── src/
│   │   ├── routes/         # API Routes
│   │   └── middleware/     # Auth middleware
│   ├── prisma/             # Database Schema & Seeds
│   └── Dockerfile
└── docker-compose.yml      # Docker Orchestration
```

## 📝 License
This project is open source.
