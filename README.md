# NestJS Task Manager with Duplicate Prevention

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/vsadeghy/noduplicate.git
   cd noduplicate
   cp .env.example .env
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**

   Add your database environment variables to the `.env` file.

   ```plaintext
   POSTGRES_DB=database-name
   POSTGRES_USER=username
   POSTGRES_PASSWORD=password
   DATABASE_URL=postgresql://username:password@localhost:5432/database-name
   ```

## Running the Application

- **Start the Appliction**

  ```bash
  pnpm run migrate:start:dev
  ```

  The application should now be running at `http://localhost:3000`.

## Docker Setup

- **Build and Run Docker Containers**

  ```bash
  docker-compose up -d --build
  ```

  This will build and start the Docker containers for the application, Redis cache, and the PostgreSQL database.
  - Find the container ID for the app:

    ```bash
    docker ps
    ```

  - Open a shell in the container:

    ```bash
    docker exec -it <containerId> sh
    ```

## Docker Setup for Development

- **Build and Run Docker Containers**

  ```bash
  docker-compose -f compose.yml -f compose.dev.yml up -d --build
  ```

  This will start the Docker containers and run the application in development mode. mapping your project to the container allowing you to live reload with docker.
