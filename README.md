# Yapper

Yapper is a full‑stack live web text application built with a **React** frontend and an **Express** backend. It is organized as a monorepo with separate client and server directories.

```
.
├── yapper-client   # React (Vite) frontend
└── yapper-server   # Express backend
```

---

## Tech Stack

### Frontend (`yapper-client`)

* React
* Vite
* Socket.io 

### Backend (`yapper-server`)

* Node.js
* Express
* PostgreSQL
* Redis
* AWS S3 (or S3‑compatible storage)
* Express Sessions
* Socket.io

---

## Prerequisites

Make sure you have the following installed before running the project:

* Node.js (LTS recommended)
* npm or yarn
* PostgreSQL instance
* Redis instance
* An S3‑compatible object storage provider (AWS S3, MinIO, etc.)

---

## Environment Variables

### Client Environment Variables

Create a `.env` file inside `yapper-client`:

```env
VITE_SERVER_URL=http://localhost:<SERVER-PORT>/api
VITE_SOCKET_URL=http://localhost:<SERVER-PORT>
```

* **VITE_SERVER_URL** – Base URL for REST API requests
* **VITE_SOCKET_URL** – Base URL for WebSocket connections

---

### Server Environment Variables

Create a `.env` file inside `yapper-server`:

```env
PORT=<PORT>
CLIENT_URL=http://localhost:5173
SESSION_SECRET=<token secret for express sessions>
DB_URI=<A postgres URI>
S3_BUCKET=<S3 Bucket name>
S3_ACCESS_KEY_ID=<S3 ACCESS KEY ID>
S3_SECRET_ACCESS_KEY=<S3 SECRET ACCESS KEY>
S3_ENDPOINT=<S3 ENDPOINT>
S3_PFP_URL_PREFIX=<Publicly accessible prefix for profile photos in S3 bucket>
SALT_ROUNDS=<Number of salt rounds>
REDIS_URI=<URI for a redis instance>
```

## Running the Application Locally

### 1. Install Dependencies

From the project root:

```bash
cd yapper-server
npm install

cd ../yapper-client
npm install
```

---

### 2. Start the Backend

```bash
cd yapper-server
npm run dev
```

The server will start on `http://localhost:<PORT>`.

---

### 3. Start the Frontend

```bash
cd yapper-client
npm run dev
```

The client will be available at:

```
http://localhost:5173
```

---

## Development Notes

* The client and server must both be running for the application to function correctly.
* WebSocket functionality relies on the same server port as the REST API.
* Ensure Redis and PostgreSQL are running before starting the backend.
* S3 configuration supports AWS S3 as well as S3‑compatible providers.

---

## Project Structure

```
yapper-client/
  ├── src/
  ├── public/
  └── vite.config.js

yapper-server/
  ├── src/
  ├── routes/
  ├── controllers/
  └── server.js
```