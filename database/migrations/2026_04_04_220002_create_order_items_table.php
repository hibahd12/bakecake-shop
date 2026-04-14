<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create order_items pivot table
 * Links orders to products with quantity and pricing snapshot
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');   // Parent order
            $table->foreignId('product_id')->constrained()->onDelete('cascade'); // Product
            $table->integer('quantity')->default(1);                             // Qty ordered
            $table->decimal('unit_price', 10, 2);                               // Price at time of order
            $table->decimal('subtotal', 10, 2);                                 // quantity * unit_price
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
