# Envision

A comprehensive web application designed to guide teams and individuals through the Design Thinking process. This tool provides structured templates, interactive visual editors, and document management features to streamline the journey from Empathy to Testing.

## 🚀 Features

- **Project Management**: Create and organize multiple design thinking projects locally.
- **Structured Workflow**: Guided phases: Empathize, Define, Ideate, Prototype, Test.
- **Interactive Visual Editor**:
- **Split-View Interface**: Real-time visual preview of your diagrams as you type.
- **Dynamic Layouts**: Automatically adjusts layouts (e.g., Empathy Maps, Personas) based on content.
- **Live Preview**: Toggle between form view and visual preview.
- **Export Functionality**: Generate high-quality PDFs of your visual diagrams for sharing and presentation.
- **Template Library**: Pre-seeded templates including Empathy Maps, User Personas, User Journey Maps, and more.
- **Local Storage**: All data is persisted locally in your browser.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **PDF Generation**: html-to-image, jsPDF
- **Routing**: React Router v7
- **Icons**: Lucide React

## 🏁 Getting Started

1.  **Navigate to client directory**:
    ```bash
    cd client
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start Dev Server**:
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
│   │   ├── services/       # Local storage integration
│   │   └── pages/          # Editor, Dashboard, etc.
│   ├── vite.config.js
│   └── index.html
└── README.md
```

## 📝 License
This project is open source.
