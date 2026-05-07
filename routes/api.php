<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes – BakeCake
|--------------------------------------------------------------------------
|
| All routes return JSON. Protected routes require a Sanctum Bearer token.
| Set header:  Authorization: Bearer {token}
|
*/

// ─── Public Routes (no auth required) ────────────────────────────────────────

// Authentication
Route::post('/register',             [AuthController::class, 'register']);            // POST /api/register
Route::post('/verify-email',         [AuthController::class, 'verifyEmail']);         // POST /api/verify-email
Route::post('/resend-verification',  [AuthController::class, 'resendVerification']);  // POST /api/resend-verification
Route::post('/login',                [AuthController::class, 'login']);               // POST /api/login

// Public product catalog
Route::get('/products',     [ProductController::class, 'index']); // GET  /api/products
Route::get('/products/{id}', [ProductController::class, 'show']);  // GET  /api/products/{id}

// Public contact
Route::post('/contacts',    [ContactController::class, 'store']); // POST /api/contacts

// ─── Protected Routes (Sanctum auth required) ─────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ─────────────────────────────────────────────────────────────────
    Route::post('/logout',  [AuthController::class, 'logout']);        // POST   /api/logout
    Route::get('/me',       [AuthController::class, 'me']);            // GET    /api/me
    Route::put('/profile',  [AuthController::class, 'updateProfile']); // PUT    /api/profile

    // ── Orders ───────────────────────────────────────────────────────────────
    Route::get('/orders',              [OrderController::class, 'index']);        // GET    /api/orders
    Route::post('/orders',             [OrderController::class, 'store']);        // POST   /api/orders
    Route::get('/orders/{id}',         [OrderController::class, 'show']);         // GET    /api/orders/{id}
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']); // PATCH  /api/orders/{id}/status  [Admin]
    Route::delete('/orders/{id}',      [OrderController::class, 'destroy']);      // DELETE /api/orders/{id}          [Admin]

    // ── Products (Admin CRUD) ─────────────────────────────────────────────────
    Route::post('/products',          [ProductController::class, 'store']);   // POST   /api/products      [Admin]
    Route::put('/products/{id}',      [ProductController::class, 'update']);  // PUT    /api/products/{id} [Admin]
    Route::delete('/products/{id}',   [ProductController::class, 'destroy']); // DELETE /api/products/{id} [Admin]

    // ── Admin ─────────────────────────────────────────────────────────────────
    Route::prefix('admin')->group(function () {
        Route::get('/stats',             [AdminController::class, 'stats']);       // GET    /api/admin/stats
        Route::get('/users',             [AdminController::class, 'users']);       // GET    /api/admin/users
        Route::patch('/users/{id}',      [AdminController::class, 'updateUser']);  // PATCH  /api/admin/users/{id}
        Route::delete('/users/{id}',     [AdminController::class, 'deleteUser']);  // DELETE /api/admin/users/{id}

        // Contacts
        Route::get('/contacts',             [ContactController::class, 'index']);      // GET    /api/admin/contacts
        Route::patch('/contacts/{id}/read', [ContactController::class, 'markAsRead']); // PATCH  /api/admin/contacts/{id}/read
    });
});
