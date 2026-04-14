<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Order Model
 * Represents a customer order
 */
class Order extends Model
{
    protected $fillable = [
        'user_id',
        'total_amount',
        'status',
        'delivery_address',
        'notes',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'delivered_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /** Order belongs to a customer */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Order has many line items */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ─── Scopes ────────────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePreparation($query)
    {
        return $query->where('status', 'preparation');
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /** Human-friendly status label (French) */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending'      => 'En attente',
            'preparation'  => 'En préparation',
            'ready'        => 'Prêt',
            'delivered'    => 'Livré',
            'cancelled'    => 'Annulé',
            default        => $this->status,
        };
    }
}
