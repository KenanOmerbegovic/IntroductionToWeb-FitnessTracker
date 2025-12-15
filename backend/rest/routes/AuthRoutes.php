<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

Flight::group('/auth', function() {

    /**
     * @OA\Post(
     *     path="/auth/register",
     *     summary="Register new user",
     *     description="Register a new user in the fitness tracker system",
     *     tags={"auth"},
     *     @OA\RequestBody(
     *         description="User registration data",
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 required={"email", "password", "full_name"},
     *                 @OA\Property(
     *                     property="email",
     *                     type="string",
     *                     example="user@example.com",
     *                     description="User email"
     *                 ),
     *                 @OA\Property(
     *                     property="password",
     *                     type="string",
     *                     example="password123",
     *                     description="User password"
     *                 ),
     *                 @OA\Property(
     *                     property="full_name",
     *                     type="string",
     *                     example="John Doe",
     *                     description="User full name"
     *                 ),
     *                 @OA\Property(
     *                     property="fitness_goal",
     *                     type="string",
     *                     example="muscle_gain",
     *                     description="Fitness goal"
     *                 ),
     *                 @OA\Property(
     *                     property="experience_level",
     *                     type="string",
     *                     example="beginner",
     *                     description="Experience level"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User registered successfully"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     )
     * )
     */
    Flight::route("POST /register", function () {
        $data = Flight::request()->data->getData();

        $response = Flight::auth_service()->register($data);
    
        if ($response['success']) {
            Flight::json([
                'message' => 'User registered successfully',
                'data' => $response['data']
            ]);
        } else {
            Flight::json(['error' => $response['error']], 400);
        }
    });
    
    /**
     * @OA\Post(
     *      path="/auth/login",
     *      tags={"auth"},
     *      summary="Login to fitness tracker system",
     *      @OA\Response(
     *           response=200,
     *           description="User data and JWT token"
     *      ),
     *      @OA\RequestBody(
     *          description="Login credentials",
     *          @OA\JsonContent(
     *              required={"email","password"},
     *              @OA\Property(property="email", type="string", example="john.doe@email.com", description="User email address"),
     *              @OA\Property(property="password", type="string", example="password123", description="User password")
     *          )
     *      )
     * )
     */
    Flight::route('POST /login', function() {
        $data = Flight::request()->data->getData();

        $response = Flight::auth_service()->login($data);
    
        if ($response['success']) {
            Flight::json([
                'message' => 'User logged in successfully',
                'data' => $response['data']
            ]);
        } else {
            Flight::json(['error' => $response['error']], 401);
        }
    });

    /**
     * @OA\Get(
     *     path="/auth/profile",
     *     tags={"auth"},
     *     summary="Get current user profile",
     *     security={{"ApiKey": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Current user profile data"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    Flight::route('GET /profile', function() {
        $user = Flight::get('user');
        Flight::json([
            'message' => 'Profile retrieved successfully',
            'data' => $user
        ]);
    });
});
/**
 * @OA\Post(
 *     path="/auth/change-password",
 *     tags={"auth"},
 *     summary="Change user password",
 *     security={{"ApiKey": {}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"current_password", "new_password"},
 *             @OA\Property(property="current_password", type="string", example="oldPassword123"),
 *             @OA\Property(property="new_password", type="string", example="newPassword123")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Password changed successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input or wrong current password"
 *     ),
 *     @OA\Response(
 *         response=401,
 *         description="Unauthorized"
 *     )
 * )
 */
Flight::route('POST /auth/change-password', function() {
    $user = Flight::get('user');
    $data = Flight::request()->data->getData();
    
    // Validate required fields
    if (!isset($data['current_password']) || !isset($data['new_password'])) {
        Flight::json(['error' => 'Current password and new password are required'], 400);
        return;
    }
    
    $response = Flight::auth_service()->changePassword($user['user_id'], $data['current_password'], $data['new_password']);
    
    if ($response['success']) {
        Flight::json(['message' => 'Password changed successfully']);
    } else {
        Flight::json(['error' => $response['error']], 400);
    }
});