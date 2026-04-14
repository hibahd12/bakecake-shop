<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Product Model (Cakes/Pastries)
 */
class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'category',
        'image',
        'is_active',
        'total_sales',
    ];

    protected function casts(): array
    {
        return [
            'price'       => 'decimal:2',
            'is_active'   => 'boolean',
            'stock'       => 'integer',
            'total_sales' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /** A product appears in many order items */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ─── Scopes ────────────────────────────────────────────────────────────────

    /** Only active products visible to customers */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /** Low stock (≤ 5 units) */
    public function scopeLowStock($query, int $threshold = 5)
    {
        return $query->where('stock', '<=', $threshold);
    }
}
