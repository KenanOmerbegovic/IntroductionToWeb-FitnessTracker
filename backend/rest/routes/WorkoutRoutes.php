<?php
require_once __DIR__ . '/../../data/Roles.php';

/**
 * @OA\Get(
 *     path="/workouts",
 *     tags={"workouts"},
 *     summary="Get all workouts",
 *     security={{"ApiKey": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="Array of all workouts in the database"
 *     )
 * )
 */
Flight::route('GET /workouts', function() {
    // Only admin can see all workouts
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    Flight::json(Flight::workoutService()->getAll());
});

/**
 * @OA\Get(
 *     path="/workouts/{id}",
 *     tags={"workouts"},
 *     summary="Get workout by ID",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Workout ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the workout with the given ID"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Workout not found"
 *     )
 * )
 */
Flight::route('GET /workouts/@id', function($id) {
    $workout = Flight::workoutService()->getById($id);
    if (!$workout) {
        Flight::json(['error' => 'Workout not found'], 404);
    }
    
    $user = Flight::get('user');
    // Users can view their own workouts, admin can view any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    Flight::json($workout);
});

/**
 * @OA\Get(
 *     path="/workouts/user/{user_id}",
 *     tags={"workouts"},
 *     summary="Get workouts by user ID",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="user_id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of workouts for the specified user"
 *     )
 * )
 */
Flight::route('GET /workouts/user/@user_id', function($user_id) {
    $user = Flight::get('user');
    
    // Users can view their own workouts, admin can view any
    if ($user['user_id'] != $user_id && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $workouts = Flight::workoutService()->getWorkoutsByUser($user_id);
    Flight::json($workouts);
});

/**
 * @OA\Post(
 *     path="/workouts",
 *     tags={"workouts"},
 *     summary="Create a new workout",
 *     security={{"ApiKey": {}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"user_id", "workout_date", "workout_type"},
 *             @OA\Property(property="user_id", type="integer", example=1),
 *             @OA\Property(property="workout_date", type="string", format="date", example="2024-01-15"),
 *             @OA\Property(property="workout_type", type="string", example="chest"),
 *             @OA\Property(property="notes", type="string", example="Great workout today!"),
 *             @OA\Property(property="duration_minutes", type="integer", example=75)
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Workout created successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /workouts', function() {
    $user = Flight::get('user');
    $data = Flight::request()->data->getData();
    
    // Users can only create workouts for themselves, admin can create for anyone
    if (!isset($data['user_id'])) {
        $data['user_id'] = $user['user_id'];
    } else if ($data['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: can only create workouts for yourself']));
    }
    
    try {
        $workout = Flight::workoutService()->createWorkout($data);
        Flight::json($workout, 201);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/workouts/{id}",
 *     tags={"workouts"},
 *     summary="Update an existing workout",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Workout ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="workout_date", type="string", format="date", example="2024-01-16"),
 *             @OA\Property(property="workout_type", type="string", example="legs"),
 *             @OA\Property(property="notes", type="string", example="Updated notes"),
 *             @OA\Property(property="duration_minutes", type="integer", example=80)
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Workout updated successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /workouts/@id', function($id) {
    $workout = Flight::workoutService()->getById($id);
    if (!$workout) {
        Flight::json(['error' => 'Workout not found'], 404);
    }
    
    $user = Flight::get('user');
    // Users can update their own workouts, admin can update any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $data = Flight::request()->data->getData();
    try {
        $updatedWorkout = Flight::workoutService()->update($id, $data);
        Flight::json($updatedWorkout);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/workouts/{id}",
 *     tags={"workouts"},
 *     summary="Delete a workout",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Workout ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Workout deleted successfully"
 *     )
 * )
 */
Flight::route('DELETE /workouts/@id', function($id) {
    $workout = Flight::workoutService()->getById($id);
    if (!$workout) {
        Flight::json(['error' => 'Workout not found'], 404);
    }
    
    $user = Flight::get('user');
    // Users can delete their own workouts, admin can delete any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    Flight::workoutService()->delete($id);
    Flight::json(['message' => 'Workout deleted successfully']);
});

// Keep other GET routes with authorization:
/**
 * @OA\Get(
 *     path="/workouts/user/{user_id}/recent",
 *     tags={"workouts"},
 *     summary="Get recent workouts for user",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="user_id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Parameter(
 *         name="limit",
 *         in="query",
 *         required=false,
 *         description="Number of recent workouts to return",
 *         @OA\Schema(type="integer", example=5)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of recent workouts"
 *     )
 * )
 */
Flight::route('GET /workouts/user/@user_id/recent', function($user_id) {
    $user = Flight::get('user');
    
    // Users can view their own workouts, admin can view any
    if ($user['user_id'] != $user_id && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $limit = Flight::request()->query['limit'] ?? 5;
    $workouts = Flight::workoutService()->getRecentWorkouts($user_id, $limit);
    Flight::json($workouts);
});

/**
 * @OA\Get(
 *     path="/workouts/user/{user_id}/type/{workout_type}",
 *     tags={"workouts"},
 *     summary="Get workouts by type for user",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="user_id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Parameter(
 *         name="workout_type",
 *         in="path",
 *         required=true,
 *         description="Workout type",
 *         @OA\Schema(type="string", example="chest")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of workouts by type"
 *     )
 * )
 */
Flight::route('GET /workouts/user/@user_id/type/@workout_type', function($user_id, $workout_type) {
    $user = Flight::get('user');
    
    // Users can view their own workouts, admin can view any
    if ($user['user_id'] != $user_id && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $workouts = Flight::workoutService()->getWorkoutsByType($user_id, $workout_type);
    Flight::json($workouts);
});