<?php
require_once __DIR__ . '/../../data/Roles.php';

/**
 * @OA\Get(
 *     path="/users",
 *     tags={"users"},
 *     summary="Get all users",
 *     security={{"ApiKey": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="Array of all users in the database"
 *     )
 * )
 */
Flight::route('GET /users', function() {
    // Only admin can see all users
    $user = Flight::get('user');
    if (!$user || $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    Flight::json(Flight::userService()->getAll());
});

/**
 * @OA\Get(
 *     path="/users/{id}",
 *     tags={"users"},
 *     summary="Get user by ID",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the user with the given ID"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="User not found"
 *     )
 * )
 */
Flight::route('GET /users/@id', function($id) {
    $user = Flight::get('user');
    
    // Users can view their own profile, admin can view any
    if ($user['user_id'] != $id && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $userData = Flight::userService()->getById($id);
    if ($userData) {
        // Remove password hash from response
        unset($userData['password_hash']);
        Flight::json($userData);
    } else {
        Flight::json(['error' => 'User not found'], 404);
    }
});

/**
 * @OA\Delete(
 *     path="/users/{id}",
 *     tags={"users"},
 *     summary="Delete a user",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User deleted successfully"
 *     )
 * )
 */
Flight::route('DELETE /users/@id', function($id) {
    // Only admin can delete users
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    Flight::userService()->delete($id);
    Flight::json(['message' => 'User deleted successfully']);
});

/**
 * @OA\Get(
 *     path="/users/email/{email}",
 *     tags={"users"},
 *     summary="Get user by email",
 *     @OA\Parameter(
 *         name="email",
 *         in="path",
 *         required=true,
 *         description="User email address",
 *         @OA\Schema(type="string", format="email", example="john@example.com")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the user with the given email",
 *         @OA\JsonContent(ref="#/components/schemas/User")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="User not found"
 *     )
 * )
 */
Flight::route('GET /users/email/@email', function($email) {
    $user = Flight::userService()->getByEmail($email);
    if ($user) {
        Flight::json($user);
    } else {
        Flight::json(['error' => 'User not found'], 404);
    }
});

/**
 * @OA\Post(
 *     path="/users",
 *     tags={"users"},
 *     summary="Create a new user",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"email", "password_hash", "full_name"},
 *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *             @OA\Property(property="password_hash", type="string", example="$2y$10$hashedpassword123"),
 *             @OA\Property(property="full_name", type="string", example="John Doe"),
 *             @OA\Property(property="fitness_goal", type="string", example="muscle_gain"),
 *             @OA\Property(property="experience_level", type="string", example="intermediate"),
 *             @OA\Property(property="role", type="string", example="user")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="User created successfully",
 *         @OA\JsonContent(ref="#/components/schemas/User")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /users', function() {
    $data = Flight::request()->data->getData();
    try {
        $user = Flight::userService()->createUser($data);
        Flight::json($user, 201);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/users/{id}",
 *     tags={"users"},
 *     summary="Update an existing user",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="email", type="string", format="email", example="updated@example.com"),
 *             @OA\Property(property="full_name", type="string", example="Updated Name"),
 *             @OA\Property(property="fitness_goal", type="string", example="weight_loss"),
 *             @OA\Property(property="experience_level", type="string", example="advanced")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="User updated successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /users/@id', function($id) {
    $user = Flight::get('user');
    
    // Users can update their own profile, admin can update any
    if ($user['user_id'] != $id && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $data = Flight::request()->data->getData();
    try {
        // Don't allow role change unless admin
        if ($user['role'] !== Roles::ADMIN && isset($data['role'])) {
            unset($data['role']);
        }
        
        // Don't allow password update through this endpoint
        if (isset($data['password'])) {
            unset($data['password']);
        }
        
        $updatedUser = Flight::userService()->updateUser($id, $data);
        Flight::json($updatedUser);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});


/**
 * @OA\Get(
 *     path="/users/goal/{goal}",
 *     tags={"users"},
 *     summary="Get users by fitness goal",
 *     @OA\Parameter(
 *         name="goal",
 *         in="path",
 *         required=true,
 *         description="Fitness goal",
 *         @OA\Schema(type="string", example="muscle_gain")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of users with the specified fitness goal",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/User")
 *         )
 *     )
 * )
 */
Flight::route('GET /users/goal/@goal', function($goal) {
    $users = Flight::userService()->getByFitnessGoal($goal);
    Flight::json($users);
});

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="password_hash", type="string", example="$2y$10$hashedpassword123"),
 *     @OA\Property(property="full_name", type="string", example="John Doe"),
 *     @OA\Property(property="fitness_goal", type="string", example="muscle_gain"),
 *     @OA\Property(property="experience_level", type="string", example="intermediate"),
 *     @OA\Property(property="role", type="string", example="user"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */

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
Flight::route('GET /auth/profile', function() {
    $user = Flight::get('user');
    Flight::json([
        'message' => 'Profile retrieved successfully',
        'data' => $user
    ]);
});
?>