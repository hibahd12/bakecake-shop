<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AdminController
 * Dashboard statistics and user management (admin only)
 */
class AdminController extends Controller
{
    // ───────────────────────────────────────────────────────
    // GET /api/admin/stats
    // ───────────────────────────────────────────────────────

    /**
     * Return dashboard KPIs for the admin overview.
     */
    public function stats(Request $request): JsonResponse
    {
        $this->requireAdmin($request);

        $now       = now();
        $thisMonth = $now->startOfMonth()->toDateString();

        // Revenue
        $totalRevenue    = Order::where('status', 'delivered')->sum('total_amount');
        $monthlyRevenue  = Order::where('status', 'delivered')
                                ->whereDate('created_at', '>=', $thisMonth)
                                ->sum('total_amount');

        // Pending orders count
        $pendingOrders   = Order::whereIn('status', ['pending', 'preparation'])->count();
        $totalOrders     = Order::count();

        // New clients this month
        $newClients      = User::where('role', 'user')
                               ->whereDate('created_at', '>=', $thisMonth)
                               ->count();
        $totalClients    = User::where('role', 'user')->count();

        // Top product by total_sales
        $topProduct = Product::orderByDesc('total_sales')->first();

        // Monthly revenue series for chart (last 12 months)
        $monthlySeries = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthlySeries[] = [
                'month'   => $month->format('M'),
                'revenue' => (float) Order::where('status', 'delivered')
                    ->whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->sum('total_amount'),
            ];
        }

        // Popular products (top 5)
        $popularProducts = Product::orderByDesc('total_sales')->limit(5)->get([
            'id', 'name', 'category', 'total_sales',
        ]);

        return response()->json([
            'revenue' => [
                'total'   => $totalRevenue,
                'monthly' => $monthlyRevenue,
            ],
            'orders' => [
                'pending' => $pendingOrders,
                'total'   => $totalOrders,
            ],
            'clients' => [
                'new'   => $newClients,
                'total' => $totalClients,
            ],
            'top_product'      => $topProduct,
            'monthly_series'   => $monthlySeries,
            'popular_products' => $popularProducts,
        ]);
    }

    // ───────────────────────────────────────────────────────
    // GET /api/admin/users
    // ───────────────────────────────────────────────────────

    /**
     * List all users (admin management).
     */
    public function users(Request $request): JsonResponse
    {
        $this->requireAdmin($request);

        $users = User::withCount('orders')
                     ->when($request->filled('search'), function ($q) use ($request) {
                         $q->where('name', 'like', '%'.$request->search.'%')
                           ->orWhere('email', 'like', '%'.$request->search.'%');
                     })
                     ->when($request->filled('role'), fn($q) => $q->where('role', $request->role))
                     ->latest()
                     ->paginate(15);

        return response()->json($users);
    }

    // ───────────────────────────────────────────────────────
    // PATCH /api/admin/users/{id}
    // ───────────────────────────────────────────────────────

    /**
     * Update user (role, is_active) — admin only.
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);

        // Prevent admin from demoting themselves
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Impossible de modifier votre propre compte.'], 422);
        }

        $validated = $request->validate([
            'role'      => ['sometimes', 'in:admin,user'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Utilisateur mis à jour.',
            'user'    => $user->fresh(),
        ]);
    }

    // ───────────────────────────────────────────────────────
    // DELETE /api/admin/users/{id}
    // ───────────────────────────────────────────────────────

    /**
     * Delete a user account (admin only).
     */
    public function deleteUser(Request $request, int $id): JsonResponse
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function requireAdmin(Request $request): void
    {
        if (!$request->user()?->isAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }
    }
}
