# BakeCake — Full-Stack Setup Guide

> **Stack:** Laravel 13 (API) · React + Vite (Frontend) · Bootstrap 5 · MySQL

---

## 📋 Prerequisites

| Tool | Version |
|------|---------|
| PHP | ≥ 8.2 |
| Composer | ≥ 2.x |
| Node.js | ≥ 18 |
| MySQL | ≥ 8.0 |

---

## 🗄️ Database Setup (MySQL)

Create the database:
```sql
CREATE DATABASE bakecake CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bakecake
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

---

## ⚙️ Backend (Laravel)

```bash
composer install
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan serve          # → http://localhost:8000
```

## ⚛️ Frontend (React)

```bash
cd frontend
npm install
npm run dev               # → http://localhost:5173
```

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bakecake.fr | admin1234 |
| User | gartoise@example.com | password |
