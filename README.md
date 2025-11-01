<div align="center">
  <img src="public/logo.svg" alt="TourVista Logo" width="200"/>
  <h1>TourVista</h1>
  <p>Your intelligent travel companion for personalized itinerary generation and landmark discovery.</p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/>
  </p>
</div>

## 📚 Table of Contents

- [✨ Features](#-features)
- [🚀 Technologies Used](#-technologies-used)
- [Getting Started](#getting-started)
- [📄 License](#-license)

## ✨ Features

*   **AI-Powered Itinerary Generation:** Create personalized travel itineraries using the power of Gemini.
*   **Landmark Discovery:** Explore and learn about landmarks and nearby places.
*   **User Authentication:** Secure sign-up and sign-in functionality with email verification and password reset.
*   **Interactive Chat:** Get travel-related information and assistance through an interactive chat interface.
*   **Postcard Creator:** Design and generate custom postcards from your travel memories.
*   **Image Enhancer:** Enhance your travel photos with a single click.
*   **Historical Timelines:** Discover the historical context of landmarks with interactive timelines.
*   **Save & Manage:** Save and manage your favorite itineraries and discoveries.

## 🚀 Technologies Used

### Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool for modern web development.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **React Router:** For declarative routing in your React application.
*   **Firebase:** For authentication and other frontend services.
*   **Gemini API:** For AI-powered features.

### Backend

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express:** A minimal and flexible Node.js web application framework.
*   **TypeScript:** For type-safe backend development.
*   **Firebase Admin:** For backend integration with Firebase services.
*   **Gemini API:** For server-side AI-powered features.
*   **Multer:** For handling `multipart/form-data`, primarily used for file uploads.
*   **Zod:** For schema validation.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   pnpm (or your favorite package manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/RoystonDAlmeida/tourvista.git
    cd tourvista
    ```

2.  **Install frontend dependencies:**
    ```bash
    pnpm install
    ```

3.  **Install backend dependencies:**
    ```bash
    cd server/
    pnpm install
    ```

### Configuration

1.  **Create a `.env` file in the root directory** for frontend environment variables:
    ```
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_firebase_app_id
    ```
    *   You can get these values from your Firebase project settings.

2.  **Create a `.env` file in the `server` directory** for backend environment variables:
    ```
    FRONTEND_URL=your_frontend_url
    GEMINI_API_KEY=your_gemini_api_key
    COUNTRY_LANGUAGES_API_KEY=your_country_languages_api_key
    COUNTRY_LANGUAGES_API_URL=https://api.apiverve.com/v1/countrylanguages
    IMGBB_API_KEY=your_imgbb_api_key
    IMGBB_API_URL=https://api.imgbb.com/1/upload
    FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_key
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd server/
    pnpm run dev
    ```

2.  **Start the frontend development server:**
    ```bash
    # From the root directory
    pnpm run dev
    ```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.