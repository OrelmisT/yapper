<p align="center">
  <img src="./yapper-client/public/logo.png" width="400" alt="Yapper logo" />
</p>


Yapper is a full‑stack live web text application built with a **React** frontend and an **Express** backend.

> 🚧 **Work in Progress**
> Yapper is actively under development. I'm progressively building it to resemble a production‑ready real‑time messaging application.


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


## Prerequisites

Make sure you have the following installed before running the project:

* Node.js
* npm or yarn
* PostgreSQL instance
* Redis instance
* An S3‑compatible object storage provider (AWS S3, MinIO, etc.)


## Environment Variables

### Client Environment Variables

Create a `.env` file inside `yapper-client`:

```env
VITE_SERVER_URL=http://localhost:<SERVER-PORT>/api
VITE_SOCKET_URL=http://localhost:<SERVER-PORT>
```

* **VITE_SERVER_URL** – Base URL for REST API requests
* **VITE_SOCKET_URL** – Base URL for WebSocket connections


### Server Environment Variables

Create a `.env` file inside `yapper-server`:

```env
PORT=<PORT>
CLIENT_URL=http://localhost:5173
SESSION_SECRET=<SECRET FOR express sessions!!>
DB_URI=<A postgres URI>
S3_BUCKET=<S3 Bucket name>
S3_ACCESS_KEY_ID=<S3 ACCESS KEY ID>
S3_SECRET_ACCESS_KEY=<S3 SECRET ACCESS KEY>
S3_ENDPOINT=<S3 ENDPOINT>
S3_PFP_URL_PREFIX=<Publicly accessible prefix for profile photos in S3 bucket>
SALT_ROUNDS=<Number of salt rounds>
REDIS_URI=<URI for a redis instance>
```

#### Variable Descriptions

* **PORT** – Port the Express server will run on
* **CLIENT_URL** – URL of the frontend (used for CORS and session configuration)
* **SESSION_SECRET** – Secret used to sign Express sessions
* **DB_URI** – PostgreSQL connection string
* **S3_BUCKET** – Name of the S3 bucket used for file storage
* **S3_ACCESS_KEY_ID** – S3 access key
* **S3_SECRET_ACCESS_KEY** – S3 secret key
* **S3_ENDPOINT** – Custom S3 endpoint (useful for non‑AWS providers)
* **S3_PFP_URL_PREFIX** – Public URL prefix for profile pictures stored in S3
* **SALT_ROUNDS** – Number of bcrypt salt rounds for password hashing
* **REDIS_URI** – Redis connection URI (sessions, caching, etc.)


## Running the Application

### 1. Install Dependencies

From the project root:

```bash
cd yapper-server
npm install

cd ../yapper-client
npm install
```


### 2. Start the Backend

```bash
cd yapper-server
npm run dev
```

The server will start on `http://localhost:<PORT>`.


### 3. Start the Frontend

```bash
cd yapper-client
npm run dev
```

The client will be available at:

```
http://localhost:5173
```


## Development Notes

* The client and server must both be running for the application to function correctly.
* WebSocket functionality relies on the same server port as the REST API.
* Ensure Redis and PostgreSQL are running before starting the backend.
* S3 configuration supports AWS S3 as well as S3‑compatible providers.