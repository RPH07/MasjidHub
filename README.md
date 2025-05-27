# MasjidHub - Mosque Information System

MasjidHub is a web-based application designed to serve as an information system for mosques. It helps manage mosque activities, finances (Kas), zakat, infaq, and provides a platform for community engagement. The project is divided into a backend API built with Node.js and Express, and a frontend application built with React and Vite.

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Prerequisites](#prerequisites)
* [License](#license)

## Features

* **User Management:**
    * User signup and login.
    * Admin signup with a secret key.
    * Role-based access control (admin, user).
    * Google OAuth for user login.
* **Kegiatan (Activities) Management:**
    * CRUD operations for mosque activities.
    * Image upload for activity photos.
    * Display and sort activities.
* **Zakat Management:** (Frontend form exists, backend endpoint not fully shown but implied)
    * Form for users to submit zakat payments.
* **Kas (Finance) Management:** (Placeholder on frontend)
* **Data Export:** (Placeholder on frontend)
* **Public Pages:**
    * Homepage displaying mosque information, prayer times, and recent activities.
    * Prayer schedule integration (using Al Adhan API).

## Tech Stack

**Backend:**
* Node.js
* Express.js
* MySQL2 (with promise support) for database interaction.
* Bcrypt.js for password hashing.
* JSON Web Tokens (JWT) for authentication (implied, though token generation/validation in login isn't explicitly using JWT in the provided `auth.js` but `jsonwebtoken` is a dependency).
* Dotenv for environment variable management.
* Multer for handling file uploads.
* CORS for enabling cross-origin requests.

**Frontend:**
* React
* Vite as a build tool and development server.
* React Router DOM for navigation.
* Axios for making HTTP requests.
* Supabase for Google OAuth and potentially other BaaS features.
* Tailwind CSS for styling.
* Shadcn/ui for UI components.
    * Includes components like Button, Input, Separator, Sheet, Tooltip, Dialog, etc.
* Lucide React for icons.

**Database:**
* MySQL

## Project Structure

The repository is a monorepo containing two main directories:

* `masjid-backend/`: Contains the Node.js Express server application.
    * `config/`: Database configuration.
    * `routes/`: API route definitions (auth, kegiatan, user).
    * `uploads/`: Default directory for uploaded files (e.g., activity photos).
    * `server.js`: The main entry point for the backend server.
    * `package.json`: Backend dependencies and scripts.
* `masjid-frontend/`: Contains the React frontend application.
    * `public/`: Static assets.
    * `src/`: Source code for the React application.
        * `auth/`: Components related to authentication (Login, Signup, AdminSignup, AuthCallback).
        * `components/`: Reusable UI components (Footer, JadwalSholat, Navbar, Layouts, UI elements from Shadcn).
        * `config/`: Configuration files (Axios instance, Supabase client).
        * `hooks/`: Custom React hooks (useAuth, useMediaQuery, useIsMobile).
        * `lib/`: Utility functions.
        * `pages/`: Top-level page components (HomePage, ZakatForm, Admin pages).
        * `App.jsx`: Main application component with routing setup.
        * `main.jsx`: Entry point for the React application.
    * `package.json`: Frontend dependencies and scripts.
    * `vite.config.js`: Vite configuration file.
    * `tailwind.config.js` (implied by `tailwindcss` dependency and `@tailwindcss/vite` plugin)
    * `components.json`: Configuration for Shadcn/ui.

## Prerequisites

* Node.js (v14.x or later recommended)
* npm (comes with Node.js)
* MySQL Server
* A Supabase account (for Google OAuth)

## License

This project is licensed under the ISC License.
