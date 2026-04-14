<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * OrderController
 * CRUD for orders — filtered by role (admin sees all, user sees own)
 */
class OrderController extends Controller
{
    // ───────────────────────────────────────────────────────
    // GET /api/orders
    // ───────────────────────────────────────────────────────

    /**
     * List orders.
     * Admin: all orders with user info.
     * User: only their own orders.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user:id,name,email', 'items.product:id,name,price'])
                      ->latest();

        // Non-admin users only see their own orders
        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        // Optional status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(15);

        return response()->json($orders);
    }

    // ───────────────────────────────────────────────────────
    // POST /api/orders
    // ───────────────────────────────────────────────────────

    /**
     * Create a new order for the authenticated user.
     *
     * Request body: { items: [{product_id, quantity}], delivery_address, notes }
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items'                 => ['required', 'array', 'min:1'],
            'items.*.product_id'   => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'delivery_address'     => ['nullable', 'string', 'max:500'],
            'notes'                => ['nullable', 'string', 'max:1000'],
        ]);

        // Build order and items, compute total
        $totalAmount = 0;
        $orderItems  = [];

        foreach ($validated['items'] as $item) {
            $product  = Product::findOrFail($item['product_id']);
            $subtotal = $product->price * $item['quantity'];

            $totalAmount += $subtotal;
            $orderItems[] = [
                'product_id' => $product->id,
                'quantity'   => $item['quantity'],
                'unit_price' => $product->price,
                'subtotal'   => $subtotal,
            ];

            // Increment product sales counter
            $product->increment('total_sales', $item['quantity']);
            $product->decrement('stock', $item['quantity']);
        }

        $order = Order::create([
            'user_id'          => $request->user()->id,
            'total_amount'     => $totalAmount,
            'status'           => 'pending',
            'delivery_address' => $validated['delivery_address'] ?? null,
            'notes'            => $validated['notes'] ?? null,
        ]);

        // Bulk-insert order items
        $order->items()->createMany($orderItems);

        return response()->json([
            'message' => 'Commande créée avec succès.',
            'order'   => $order->load('items.product'),
        ], 201);
    }

    // ───────────────────────────────────────────────────────
    // GET /api/orders/{id}
    // ───────────────────────────────────────────────────────

    /**
     * Show a single order.
     * Enforces ownership for non-admin users.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['user:id,name,email', 'items.product'])->findOrFail($id);

        // Authorization: regular user can only view own orders
        if (!$request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(['order' => $order]);
    }

    // ───────────────────────────────────────────────────────
    // PATCH /api/orders/{id}/status   [Admin only]
    // ───────────────────────────────────────────────────────

    /**
     * Update order status (admin only).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,preparation,ready,delivered,cancelled'],
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        if ($validated['status'] === 'delivered') {
            $order->update(['delivered_at' => now()]);
        }

        return response()->json([
            'message' => 'Statut mis à jour.',
            'order'   => $order->fresh(['items.product']),
        ]);
    }

    // ───────────────────────────────────────────────────────
    // DELETE /api/orders/{id}   [Admin only]
    // ───────────────────────────────────────────────────────

    /**
     * Delete an order (admin only).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Commande supprimée.']);
    }
}
