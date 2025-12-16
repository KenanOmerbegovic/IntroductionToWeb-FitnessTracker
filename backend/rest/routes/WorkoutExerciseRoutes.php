<?php
require_once __DIR__ . '/../../data/Roles.php';

/**
 * @OA\Get(
 *     path="/workout-exercises",
 *     tags={"workout-exercises"},
 *     summary="Get all workout exercises",
 *     security={{"ApiKey": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="Array of all workout exercises in the database"
 *     )
 * )
 */
Flight::route('GET /workout-exercises', function() {
    // Only admin can see all workout exercises
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    Flight::json(Flight::workoutExerciseService()->getAll());
});

/**
 * @OA\Get(
 *     path="/workout-exercises/workout/{workout_id}",
 *     tags={"workout-exercises"},
 *     summary="Get exercises by workout ID",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="workout_id",
 *         in="path",
 *         required=true,
 *         description="Workout ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of exercises for the specified workout"
 *     )
 * )
 */
Flight::route('GET /workout-exercises/workout/@workout_id', function($workout_id) {
    // First get the workout to check ownership
    $workout = Flight::workoutService()->getById($workout_id);
    if (!$workout) {
        Flight::json(['error' => 'Workout not found'], 404);
    }
    
    $user = Flight::get('user');
    // Users can view exercises from their own workouts, admin can view any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $exercises = Flight::workoutExerciseService()->getExercisesByWorkout($workout_id);
    Flight::json($exercises);
});

/**
 * @OA\Post(
 *     path="/workout-exercises",
 *     tags={"workout-exercises"},
 *     summary="Add exercise to workout",
 *     security={{"ApiKey": {}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"workout_id", "exercise_id", "sets", "reps"},
 *             @OA\Property(property="workout_id", type="integer", example=1),
 *             @OA\Property(property="exercise_id", type="integer", example=1),
 *             @OA\Property(property="sets", type="integer", example=4),
 *             @OA\Property(property="reps", type="integer", example=8),
 *             @OA\Property(property="weight_kg", type="number", format="float", example=70.5),
 *             @OA\Property(property="notes", type="string", example="Felt strong today")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Exercise added to workout successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /workout-exercises', function() {
    $user = Flight::get('user');
    $data = Flight::request()->data->getData();
    
    if (!isset($data['workout_id'])) {
        Flight::json(['error' => 'Workout ID is required'], 400);
    }
    
    // Check workout ownership
    $workout = Flight::workoutService()->getById($data['workout_id']);
    if (!$workout) {
        Flight::json(['error' => 'Workout not found'], 404);
    }
    
    // Users can only add exercises to their own workouts, admin can add to any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: can only add exercises to your own workouts']));
    }
    
    try {
        $workout_exercise = Flight::workoutExerciseService()->createWorkoutExercise($data);
        Flight::json($workout_exercise, 201);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/workout-exercises/{id}",
 *     tags={"workout-exercises"},
 *     summary="Update workout exercise",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Workout Exercise ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="sets", type="integer", example=5),
 *             @OA\Property(property="reps", type="integer", example=10),
 *             @OA\Property(property="weight_kg", type="number", format="float", example=75.0),
 *             @OA\Property(property="notes", type="string", example="Increased weight")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Workout exercise updated successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /workout-exercises/@id', function($id) {
    // First get the workout exercise details
    $workout_exercise = Flight::workoutExerciseService()->getWorkoutExerciseDetails($id);
    if (!$workout_exercise) {
        Flight::json(['error' => 'Workout exercise not found'], 404);
    }
    
    // Get the workout to check ownership
    $workout = Flight::workoutService()->getById($workout_exercise['workout_id']);
    
    $user = Flight::get('user');
    // Users can update exercises from their own workouts, admin can update any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $data = Flight::request()->data->getData();
    try {
        $updatedWorkoutExercise = Flight::workoutExerciseService()->update($id, $data);
        Flight::json($updatedWorkoutExercise);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/workout-exercises/{id}",
 *     tags={"workout-exercises"},
 *     summary="Delete workout exercise",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Workout Exercise ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Workout exercise deleted successfully"
 *     )
 * )
 */
Flight::route('DELETE /workout-exercises/@id', function($id) {
    // First get the workout exercise details
    $workout_exercise = Flight::workoutExerciseService()->getWorkoutExerciseDetails($id);
    if (!$workout_exercise) {
        Flight::json(['error' => 'Workout exercise not found'], 404);
    }
    
    // Get the workout to check ownership
    $workout = Flight::workoutService()->getById($workout_exercise['workout_id']);
    
    $user = Flight::get('user');
    // Users can delete exercises from their own workouts, admin can delete any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    Flight::workoutExerciseService()->delete($id);
    Flight::json(['message' => 'Workout exercise deleted successfully']);
});

/**
 * @OA\Delete(
 *     path="/workout-exercises/workout/{workout_id}",
 *     tags={"workout-exercises"},
 *     summary="Delete all exercises from workout",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="workout_id",
 *         in="path",
 *         required=true,
 *         description="Workout ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="All exercises deleted from workout"
 *     )
 * )
 */
Flight::route('DELETE /workout-exercises/workout/@workout_id', function($workout_id) {
    // Get the workout to check ownership
    $workout = Flight::workoutService()->getById($workout_id);
    if (!$workout) {
        Flight::json(['error' => 'Workout not found'], 404);
    }
    
    $user = Flight::get('user');
    // Users can delete exercises from their own workouts, admin can delete any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $count = Flight::workoutExerciseService()->deleteByWorkout($workout_id);
    Flight::json(['message' => "Deleted $count exercises from workout"]);
});

// Keep GET /workout-exercises/{id} with authorization:
/**
 * @OA\Get(
 *     path="/workout-exercises/{id}",
 *     tags={"workout-exercises"},
 *     summary="Get workout exercise details by ID",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Workout Exercise ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the workout exercise with the given ID"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Workout exercise not found"
 *     )
 * )
 */
Flight::route('GET /workout-exercises/@id', function($id) {
    // First get the workout exercise details
    $workout_exercise = Flight::workoutExerciseService()->getWorkoutExerciseDetails($id);
    if (!$workout_exercise) {
        Flight::json(['error' => 'Workout exercise not found'], 404);
    }
    
    // Get the workout to check ownership
    $workout = Flight::workoutService()->getById($workout_exercise['workout_id']);
    
    $user = Flight::get('user');
    // Users can view exercises from their own workouts, admin can view any
    if ($workout['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    Flight::json($workout_exercise);
});