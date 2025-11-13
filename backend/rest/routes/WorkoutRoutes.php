<?php
/**
 * @OA\Get(
 *     path="/workouts",
 *     tags={"workouts"},
 *     summary="Get all workouts",
 *     @OA\Response(
 *         response=200,
 *         description="Array of all workouts in the database",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Workout")
 *         )
 *     )
 * )
 */
Flight::route('GET /workouts', function() {
    Flight::json(Flight::workoutService()->getAll());
});

/**
 * @OA\Get(
 *     path="/workouts/{id}",
 *     tags={"workouts"},
 *     summary="Get workout by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Workout ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the workout with the given ID",
 *         @OA\JsonContent(ref="#/components/schemas/Workout")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Workout not found"
 *     )
 * )
 */
Flight::route('GET /workouts/@id', function($id) {
    $workout = Flight::workoutService()->getById($id);
    if ($workout) {
        Flight::json($workout);
    } else {
        Flight::json(['error' => 'Workout not found'], 404);
    }
});

/**
 * @OA\Get(
 *     path="/workouts/user/{user_id}",
 *     tags={"workouts"},
 *     summary="Get workouts by user ID",
 *     @OA\Parameter(
 *         name="user_id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of workouts for the specified user",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Workout")
 *         )
 *     )
 * )
 */
Flight::route('GET /workouts/user/@user_id', function($user_id) {
    $workouts = Flight::workoutService()->getWorkoutsByUser($user_id);
    Flight::json($workouts);
});

/**
 * @OA\Get(
 *     path="/workouts/user/{user_id}/recent",
 *     tags={"workouts"},
 *     summary="Get recent workouts for user",
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
 *         description="Array of recent workouts",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Workout")
 *         )
 *     )
 * )
 */
Flight::route('GET /workouts/user/@user_id/recent', function($user_id) {
    $limit = Flight::request()->query['limit'] ?? 5;
    $workouts = Flight::workoutService()->getRecentWorkouts($user_id, $limit);
    Flight::json($workouts);
});

/**
 * @OA\Post(
 *     path="/workouts",
 *     tags={"workouts"},
 *     summary="Create a new workout",
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
 *         description="Workout created successfully",
 *         @OA\JsonContent(ref="#/components/schemas/Workout")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /workouts', function() {
    $data = Flight::request()->data->getData();
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
 *         description="Workout updated successfully",
 *         @OA\JsonContent(ref="#/components/schemas/Workout")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /workouts/@id', function($id) {
    $data = Flight::request()->data->getData();
    try {
        $workout = Flight::workoutService()->update($id, $data);
        Flight::json($workout);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/workouts/{id}",
 *     tags={"workouts"},
 *     summary="Delete a workout",
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
    Flight::workoutService()->delete($id);
    Flight::json(['message' => 'Workout deleted successfully']);
});

/**
 * @OA\Schema(
 *     schema="Workout",
 *     type="object",
 *     @OA\Property(property="workout_id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="workout_date", type="string", format="date", example="2024-01-15"),
 *     @OA\Property(property="workout_type", type="string", example="chest"),
 *     @OA\Property(property="notes", type="string", example="Great workout today!"),
 *     @OA\Property(property="duration_minutes", type="integer", example=75),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 */
?>