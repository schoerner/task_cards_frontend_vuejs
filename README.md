# Task Card App - Frontend

## Goals of this project
- Didactical analysis of Vue.js to...
    - Layers of a modern Web Architecture
    - Reactive / declarative programming paradigm
    - Services in JavaScript
    - Authentication by JWT
    - User role assignment

## Requirements
- NPM and NVM
- Docker to run docker compose with all services (see readme in the repository of the frontend)

## Initial Setup

Create a .env file to set your credentials for your database connection and for initialization of the admin account.
Change your admin password after your first log in.

```
MYSQL_USER=schueler
MYSQL_PASSWORD=Geheim01
MYSQL_ROOT_PASSWORD=Geheim02
APP_ADMIN_EMAIL=admin@example.com
APP_ADMIN_PASSWORD=12345678
```

If you run the scripts with powershell, you may have to execute the following command:
```sh
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run the whole application

You hav to clone the backend first.

```sh
docker-compose up
```
