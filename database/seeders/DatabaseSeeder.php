<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * DatabaseSeeder
 * Seeds demo data: admin, sample users, products, and orders
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin Account ─────────────────────────────────────────────────────
        $admin = User::updateOrCreate(
            ['email' => 'admin@bakecake.fr'],
            [
                'name'     => 'Marie Dubois',
                'password' => Hash::make('admin1234'),
                'role'     => 'admin',
                'phone'    => '+212 6 12 34 56 78',
                'address'  => '10 Rue de la Pâtisserie, Paris',
                'is_active' => true,
            ]
        );

        // ── Regular Users ─────────────────────────────────────────────────────
        $users = [
            ['name' => 'Gartoise Bovsays', 'email' => 'gartoise@example.com', 'phone' => '+33 6 11 22 33 44'],
            ['name' => 'Sabine Martin',    'email' => 'sabine@example.com',   'phone' => '+33 6 55 66 77 88'],
            ['name' => 'Luc Bernard',      'email' => 'luc@example.com',      'phone' => '+33 6 99 88 77 66'],
        ];

        $createdUsers = [];
        foreach ($users as $data) {
            $createdUsers[] = User::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'password'  => Hash::make('password'),
                    'role'      => 'user',
                    'is_active' => true,
                ])
            );
        }

        // ── Products (Cakes) ──────────────────────────────────────────────────
        $products = [
            ['name' => 'Gâteau Chocolat',    'description' => 'Riche gâteau au chocolat noir fondant.',    'price' => 28.00, 'stock' => 12, 'category' => 'gateau',  'total_sales' => 98],
            ['name' => 'Framboisier',         'description' => 'Mousse légère aux framboises fraîches.',    'price' => 32.00, 'stock' => 8,  'category' => 'gateau',  'total_sales' => 84],
            ['name' => 'Carrot Cake',         'description' => 'Gâteau à la carotte avec glaçage cream cheese.', 'price' => 26.00, 'stock' => 15, 'category' => 'gateau', 'total_sales' => 71],
            ['name' => 'Gâteau Opéra',        'description' => 'Le classique biscuit joconde, café et chocolat.', 'price' => 38.00, 'stock' => 6, 'category' => 'gateau',  'total_sales' => 65],
            ['name' => 'Gâteau Forêt Noire', 'description' => 'Cerise griotte et chantilly sur génoise.',  'price' => 34.00, 'stock' => 3,  'category' => 'gateau',  'total_sales' => 52],
            ['name' => 'Tarte aux Citrons',   'description' => 'Crème citron acidulée sur pâte sablée.',   'price' => 22.00, 'stock' => 10, 'category' => 'tarte',   'total_sales' => 40],
            ['name' => 'Paris-Brest',         'description' => 'Choux à la crème pralinée maison.',         'price' => 30.00, 'stock' => 7,  'category' => 'patisserie', 'total_sales' => 35],
        ];

        $createdProducts = [];
        foreach ($products as $data) {
            $createdProducts[] = Product::updateOrCreate(
                ['name' => $data['name']],
                array_merge($data, ['is_active' => true])
            );
        }

        // ── Sample Orders ─────────────────────────────────────────────────────
        $sampleOrders = [
            [
                'user'   => $admin,
                'items'  => [[$createdProducts[0], 3], [$createdProducts[1], 1]],
                'status' => 'preparation',
                'total'  => (3 * 28) + (1 * 32), // 116
            ],
            [
                'user'   => $admin,
                'items'  => [[$createdProducts[3], 2]],
                'status' => 'delivered',
                'total'  => 2 * 38,
            ],
            [
                'user'   => $createdUsers[0],
                'items'  => [[$createdProducts[2], 2]],
                'status' => 'preparation',
                'total'  => 2 * 26,
            ],
            [
                'user'   => $createdUsers[1],
                'items'  => [[$createdProducts[4], 1], [$createdProducts[0], 2]],
                'status' => 'pending',
                'total'  => 52 + 56,
            ],
        ];

        foreach ($sampleOrders as $orderData) {
            $order = Order::create([
                'user_id'      => $orderData['user']->id,
                'total_amount' => $orderData['total'],
                'status'       => $orderData['status'],
                'delivered_at' => $orderData['status'] === 'delivered' ? now()->subDays(2) : null,
            ]);

            foreach ($orderData['items'] as [$product, $qty]) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $qty,
                    'unit_price' => $product->price,
                    'subtotal'   => $product->price * $qty,
                ]);
            }
        }

        $this->command->info('✅ Database seeded:');
        $this->command->info('   Admin: admin@bakecake.fr / admin1234');
        $this->command->info('   User:  gartoise@example.com / password');
    }
}
