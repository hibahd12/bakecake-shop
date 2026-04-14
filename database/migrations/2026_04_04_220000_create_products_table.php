<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create products (cakes) table
 * Stores all cake/product data for the BakeCake shop
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');                           // Product name
            $table->text('description')->nullable();          // Full description
            $table->decimal('price', 10, 2);                 // Price in euros
            $table->integer('stock')->default(0);             // Current stock level
            $table->string('category')->default('gateau');   // Category (gateau, tarte, etc.)
            $table->string('image')->nullable();              // Image path
            $table->boolean('is_active')->default(true);     // Visibility
            $table->integer('total_sales')->default(0);       // Sales counter
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
