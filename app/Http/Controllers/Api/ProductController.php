<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * ProductController
 * Public browse + Admin CRUD for cake products
 */
class ProductController extends Controller
{
    // ───────────────────────────────────────────────────────
    // GET /api/products  [Public]
    // ───────────────────────────────────────────────────────

    /**
     * List all active products (public catalog).
     * Admin also sees inactive products.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::latest();

        // Non-admin: only active products
        if (!$request->user()?->isAdmin()) {
            $query->active();
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate(20);

        return response()->json($products);
    }

    // ───────────────────────────────────────────────────────
    // GET /api/products/{id}  [Public]
    // ───────────────────────────────────────────────────────

    public function show(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        return response()->json(['product' => $product]);
    }

    // ───────────────────────────────────────────────────────
    // POST /api/products  [Admin]
    // ───────────────────────────────────────────────────────

    /**
     * Create a new product.
     */
    public function store(Request $request): JsonResponse
    {
        $this->requireAdmin($request);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price'       => ['required', 'numeric', 'min:0'],
            'stock'       => ['required', 'integer', 'min:0'],
            'category'    => ['required', 'string', 'max:100'],
            'image'       => ['nullable', 'image', 'max:2048'],
            'is_active'   => ['boolean'],
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Produit créé avec succès.',
            'product' => $product,
        ], 201);
    }

    // ───────────────────────────────────────────────────────
    // PUT /api/products/{id}  [Admin]
    // ───────────────────────────────────────────────────────

    /**
     * Update an existing product.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $this->requireAdmin($request);

        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'price'       => ['sometimes', 'numeric', 'min:0'],
            'stock'       => ['sometimes', 'integer', 'min:0'],
            'category'    => ['sometimes', 'string', 'max:100'],
            'image'       => ['sometimes', 'nullable', 'image', 'max:2048'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);

        // Replace image if a new one is uploaded
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Produit mis à jour.',
            'product' => $product->fresh(),
        ]);
    }

    // ───────────────────────────────────────────────────────
    // DELETE /api/products/{id}  [Admin]
    // ───────────────────────────────────────────────────────

    /**
     * Soft-delete a product (set is_active = false) or hard-delete.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->requireAdmin($request);

        $product = Product::findOrFail($id);

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Produit supprimé.']);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function requireAdmin(Request $request): void
    {
        if (!$request->user()?->isAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }
    }
}
