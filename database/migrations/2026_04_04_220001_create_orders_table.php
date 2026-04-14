<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create orders table
 * Tracks all customer orders with status management
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Customer
            $table->decimal('total_amount', 10, 2)->default(0);               // Order total
            $table->enum('status', ['pending', 'preparation', 'ready', 'delivered', 'cancelled'])
                  ->default('pending');                                        // Order status
            $table->string('delivery_address')->nullable();                   // Delivery address
            $table->text('notes')->nullable();                                // Special instructions
            $table->timestamp('delivered_at')->nullable();                    // Delivery timestamp
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
