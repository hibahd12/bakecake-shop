<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User Model
 * Supports role-based access: 'admin' and 'user'
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Mass-assignable attributes
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'is_active',
    ];

    /**
     * Hidden from JSON responses
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    // ─── Role Helpers ────────────────────────────────────────────────────────

    /** Returns true if the user is an admin */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /** Returns true if the user is a regular user */
    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /** A user has many orders */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
