# 🌐 NetWatch - Network Topology & Monitoring System

NetWatch is a modern, web-based Network Management and Topology Monitoring application designed for administrators to visualize, configure, and monitor network infrastructures in real time. It features an interactive, drag-and-drop network topology map, device status monitoring via a backend ping engine, secure authentication, and administrator control panels.

---

## 🚀 Key Features

* **Interactive Network Topology Map**: 
  * Drag-and-drop visualization canvas for network equipment (Routers, Switches, PCs, Servers, etc.).
  * Automatic persistence of device coordinates ($X$, $Y$) in the backend database.
  * Click to view device details without interrupting the drag experience.
  * Fullscreen mode support for clean, expansive map visualization.
* **Link Types & Connectivity**:
  * Visual representation of link connections (e.g., Fiber, Ethernet) drawn directly on the topology diagram.
  * Easy creation of links through the admin interface with visual success feedback.
* **Responsive Control Panel (Device Directory)**:
  * Collapsible sidebar displaying equipment lists, operational statuses, and critical alerts.
  * Modern, custom-styled scrollbars conforming to the interface design.
* **Unified Modern Dark Theme**:
  * Professional dark slate aesthetics (`#0f172a` / `#1e293b` palette).
  * Metrics bar displaying critical telemetry (Total Equipment, Operational Status, Critical Alerts) in a compact, sleek design.
* **Admin Privilege Suite**:
  * Creation, modification, and deletion of network devices and physical connections.
  * Secure JSON Web Token (JWT) user authentication.
  * Bulk export of current devices and link databases to CSV format.
* **Live Network Status Engine**:
  * Background ping monitor that verifies device reachability and logs response time.

---

## 🛠️ Tech Stack

### Frontend
* **React 19** - Single Page Application library.
* **Vite** - High-speed bundler and development server.
* **Tailwind CSS 3** - Utility-first styling for modern UI/UX components.
* **React Router DOM 7** - Declarative client-side routing.
* **Axios** - HTTP client for REST API communication.

### Backend & Database
* **Node.js & Express** - Server framework and REST API engine.
* **SQLite 3 & sqlite** - Lightweight relational database for persistent data storage.
* **bcryptjs & jsonwebtoken** - Secure password hashing and token-based session auth.
* **ping** - Node.js implementation of ICMP ping for device monitoring.

---

## 📁 Project Structure

```text
Netwatch_stage_CHR/
├── backend/                  # Node.js/Express Backend Server
│   ├── config/               # Database initialization & config
│   ├── controllers/          # Request handling logic
│   ├── middleware/           # Auth and validation middleware
│   ├── routes/               # API route definitions (auth, device, link, engine, etc.)
│   ├── services/             # Background services (ping monitoring engine)
│   ├── server.js             # Main server entrypoint
│   ├── package.json          # Backend dependencies and metadata
│   └── .env                  # Backend environment variables (ignored in Git)
│
├── frontend/                 # React/Vite Frontend Application
│   ├── public/               # Public assets
│   ├── src/                  # React Source Code
│   │   ├── assets/           # Icons and images
│   │   ├── components/       # UI Components (AdminControls, NetworkMap, Login, Navbar)
│   │   ├── App.jsx           # Main App component
│   │   ├── index.css         # Tailwind directives & global styling
│   │   └── api.js            # Axios client config
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── vite.config.js        # Vite build configuration
│   └── package.json          # Frontend dependencies and scripts
│
├── database/                 # Persistent SQLite Database
│   └── network.sqlite        # SQLite database file (ignored in Git)
│
├── .gitignore                # Root-level Git ignore settings
└── README.md                 # Project documentation
```

---

## ⚙️ Getting Started (Docker Installation)

The application has been fully containerized. You can run the entire stack (Frontend, Backend, and Database) with a single command.

### Prerequisites
Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

### 1. Configuration
Create a `.env` file in the `backend/` directory and specify your JWT secret:
```env
JWT_SECRET=your_secure_jwt_secret_key_here
```

### 2. Launch the Application
Run the following command at the root of the project:
```bash
docker compose up -d
```
The first run will automatically build the images, create the SQLite database in the `database/` folder (which is mounted as a persistent volume), and seed default administrative user credentials.

### 3. Access the Dashboard
Open your browser and navigate to:
* **`http://localhost`** (or `http://YOUR_SERVER_IP` to access from another PC on the network).

*(Note: The frontend container includes an Nginx reverse proxy that automatically routes `/api` traffic to the backend, eliminating CORS issues and making the application fully portable across your local network).*

---

## 🔒 Authentication

Default administrator credentials (created automatically during database seeding):
* **Username**: `admin`
* **Password**: `admin123`

*(Make sure to change these credentials or create new ones via the user management system once running in a production environment).*

---

## 📡 Key API Endpoints

### Authentication
* `POST /api/auth/login` - Authenticates user and returns a JWT token.
* `POST /api/auth/register` - Registers a new user.

### Devices
* `GET /api/devices` - Retrieves all devices with current status and map coordinates.
* `POST /api/devices` - Creates a new device (Admin only).
* `PUT /api/devices/:id` - Updates a device's configurations or coordinates.
* `DELETE /api/devices/:id` - Deletes a device (Admin only).

### Links
* `GET /api/links` - Retrieves all physical/logical links.
* `POST /api/links` - Establishes a new link (Admin only).
* `DELETE /api/links/:id` - Deletes an existing link (Admin only).

### Monitoring Engine
* `POST /api/engine/ping/:id` - Triggers a manual ping request for a specific device.

---

## 📄 License

This project is prepared for CHR network management. All rights reserved.
