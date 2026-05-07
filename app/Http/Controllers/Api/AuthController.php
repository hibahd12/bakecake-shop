<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EmailVerificationCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

/**
 * AuthController
 * Handles registration (with email OTP verification), login, logout, and profile.
 * All responses are JSON for React frontend consumption.
 */
class AuthController extends Controller
{
    // ───────────────────────────────────────────────────────
    // POST /api/register
    // Step 1 of registration: create a pending (unverified) account
    // and send a 6-digit OTP to the user's email.
    // ───────────────────────────────────────────────────────

    /**
     * Register a new user account.
     * The account is created but NOT active until email is verified.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone'    => ['nullable', 'string', 'max:20'],
            'address'  => ['nullable', 'string', 'max:500'],
        ]);

        // Create user with email auto-verified — no OTP step required
        $user = User::create([
            'name'                    => $validated['name'],
            'email'                   => $validated['email'],
            'password'                => Hash::make($validated['password']),
            'role'                    => 'user',
            'phone'                   => $validated['phone'] ?? null,
            'address'                 => $validated['address'] ?? null,
            'is_active'               => true,
            'email_verified_at'       => Carbon::now(), // Auto-verified
            'verification_code'       => null,
            'verification_expires_at' => null,
        ]);

        // Issue a Sanctum token immediately so user is logged in
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Compte créé avec succès. Bienvenue chez BakeCake !',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ], 201);
    }

    // ───────────────────────────────────────────────────────
    // POST /api/verify-email
    // Step 2 of registration: verify the OTP and activate the account.
    // ───────────────────────────────────────────────────────

    /**
     * Verify the email with the OTP code sent during registration.
     * On success, marks the account as verified and returns a Sanctum token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code'  => ['required', 'string', 'size:6'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Aucun compte trouvé avec cet e-mail.'], 404);
        }

        if ($user->email_verified_at !== null) {
            return response()->json(['message' => 'Ce compte est déjà vérifié.'], 409);
        }

        // Check code validity
        if ($user->verification_code !== $request->code) {
            return response()->json(['message' => 'Code de vérification incorrect.'], 422);
        }

        if (Carbon::now()->isAfter($user->verification_expires_at)) {
            return response()->json(['message' => 'Le code de vérification a expiré. Veuillez vous réinscrire.'], 422);
        }

        // Mark email as verified and clear the OTP
        $user->update([
            'email_verified_at'       => Carbon::now(),
            'verification_code'       => null,
            'verification_expires_at' => null,
        ]);

        // Issue a Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'E-mail vérifié avec succès. Bienvenue chez BakeCake !',
            'token'   => $token,
            'user'    => $this->formatUser($user->fresh()),
        ]);
    }

    // ───────────────────────────────────────────────────────
    // POST /api/resend-verification
    // Resend OTP when the previous one expired
    // ───────────────────────────────────────────────────────

    /**
     * Resend a fresh verification code to a pending (unverified) account.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Aucun compte trouvé avec cet e-mail.'], 404);
        }

        if ($user->email_verified_at !== null) {
            return response()->json(['message' => 'Ce compte est déjà vérifié.'], 409);
        }

        // Throttle: don't resend if current code hasn't expired yet
        if ($user->verification_expires_at && Carbon::now()->isBefore($user->verification_expires_at)) {
            $remaining = Carbon::now()->diffInSeconds($user->verification_expires_at);
            return response()->json([
                'message'           => 'Un code est déjà actif. Veuillez attendre avant de renvoyer.',
                'retry_after_seconds' => $remaining,
            ], 429);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'verification_code'       => $code,
            'verification_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new EmailVerificationCode($code, $user->name));

        return response()->json(['message' => 'Un nouveau code de vérification a été envoyé.']);
    }

    // ───────────────────────────────────────────────────────
    // POST /api/login
    // ───────────────────────────────────────────────────────

    /**
     * Authenticate a user (admin or regular user).
     * Returns a Sanctum token + user data including role.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Votre compte est désactivé. Contactez l\'administrateur.',
            ], 403);
        }

        // Revoke old tokens and issue fresh one
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ]);
    }

    // ───────────────────────────────────────────────────────
    // POST /api/logout
    // ───────────────────────────────────────────────────────

    /**
     * Revoke the current user's token (logout).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    // ───────────────────────────────────────────────────────
    // GET /api/me
    // ───────────────────────────────────────────────────────

    /**
     * Return the currently authenticated user's profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    // ───────────────────────────────────────────────────────
    // PUT /api/profile
    // ───────────────────────────────────────────────────────

    /**
     * Update current user profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name'    => ['sometimes', 'string', 'max:255'],
            'phone'   => ['sometimes', 'nullable', 'string', 'max:20'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user'    => $this->formatUser($user->fresh()),
        ]);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    /**
     * Format user data for API responses.
     * Keep consistent shape on all auth endpoints.
     */
    private function formatUser(User $user): array
    {
        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'role'              => $user->role,
            'phone'             => $user->phone,
            'address'           => $user->address,
            'is_active'         => $user->is_active,
            'email_verified_at' => $user->email_verified_at,
            'created_at'        => $user->created_at,
        ];
    }
}
