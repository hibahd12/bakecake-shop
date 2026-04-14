<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Allows the React frontend (localhost:5173) to call the Laravel API.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        'http://localhost:5173',       // Vite React dev server
        'http://localhost:3000',       // alternative dev port
        'http://127.0.0.1:5173',
        env('FRONTEND_URL'),           // Production Vercel URL (set in Railway env vars)
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Must be true for Sanctum cookie/token auth to work
    'supports_credentials' => true,

];
