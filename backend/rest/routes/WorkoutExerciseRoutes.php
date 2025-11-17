<?php
/**
 * @OA\Get(
 *     path="/workout-exercises",
 *     tags={"workout-exercises"},
 *     summary="Get all workout exercises",
 *     @OA\Response(
 *         response=200,
 *         description="Array of all workout exercises in the database",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/WorkoutExercise")
 *         )
 *     )
 * )
 */
Flight::route('GET /workout-exercises', function() {
    Flight::json(Flight::workoutExerciseService()->getAll());
});

/**
 * @OA\Get(
 *     path="/workout-exercises/workout/{workout_id}",
 *     tags={"workout-exercises"},
 *     summary="Get exercises by workout ID",
 *     @OA\Parameter(
 *         name="workout_id",
 *         in="path",
 *         required=true,
 *         description="Workout ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of exercises for the specified workout",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/WorkoutExerciseWithDetails")
 *         )
 *     )
 * )
 */
Flight::route('GET /workout-exercises/workout/@workout_id', function($workout_id) {
    $exercises = Flight::workoutExerciseService()->getExercisesByWorkout($workout_id);
    Flight::json($exercises);
});

/**
 * @OA\Get(
 *     path="/workout-exercises/{id}",
 *     tags={"workout-exercises"},
 *     summary="Get workout exercise details by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Workout Exercise ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the workout exercise with the given ID",
 *         @OA\JsonContent(ref="#/components/schemas/WorkoutExerciseWithDetails")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Workout exercise not found"
 *     )
 * )
 */
Flight::route('GET /workout-exercises/@id', function($id) {
    $workout_exercise = Flight::workoutExerciseService()->getWorkoutExerciseDetails($id);
    if ($workout_exercise) {
        Flight::json($workout_exercise);
    } else {
        Flight::json(['error' => 'Workout exercise not found'], 404);
    }
});

/**
 * @OA\Post(
 *     path="/workout-exercises",
 *     tags={"workout-exercises"},
 *     summary="Add exercise to workout",
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
 *         description="Exercise added to workout successfully",
 *         @OA\JsonContent(ref="#/components/schemas/WorkoutExercise")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /workout-exercises', function() {
    $data = Flight::request()->data->getData();
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
 *         description="Workout exercise updated successfully",
 *         @OA\JsonContent(ref="#/components/schemas/WorkoutExercise")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /workout-exercises/@id', function($id) {
    $data = Flight::request()->data->getData();
    try {
        $workout_exercise = Flight::workoutExerciseService()->update($id, $data);
        Flight::json($workout_exercise);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/workout-exercises/{id}",
 *     tags={"workout-exercises"},
 *     summary="Delete workout exercise",
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
    Flight::workoutExerciseService()->delete($id);
    Flight::json(['message' => 'Workout exercise deleted successfully']);
});

/**
 * @OA\Delete(
 *     path="/workout-exercises/workout/{workout_id}",
 *     tags={"workout-exercises"},
 *     summary="Delete all exercises from workout",
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
    $count = Flight::workoutExerciseService()->deleteByWorkout($workout_id);
    Flight::json(['message' => "Deleted $count exercises from workout"]);
});

/**
 * @OA\Schema(
 *     schema="WorkoutExercise",
 *     type="object",
 *     @OA\Property(property="workout_exercise_id", type="integer", example=1),
 *     @OA\Property(property="workout_id", type="integer", example=1),
 *     @OA\Property(property="exercise_id", type="integer", example=1),
 *     @OA\Property(property="sets", type="integer", example=4),
 *     @OA\Property(property="reps", type="integer", example=8),
 *     @OA\Property(property="weight_kg", type="number", format="float", example=70.5),
 *     @OA\Property(property="notes", type="string", example="Felt strong today")
 * )
 */

/**
 * @OA\Schema(
 *     schema="WorkoutExerciseWithDetails",
 *     type="object",
 *     @OA\Property(property="workout_exercise_id", type="integer", example=1),
 *     @OA\Property(property="workout_id", type="integer", example=1),
 *     @OA\Property(property="exercise_id", type="integer", example=1),
 *     @OA\Property(property="sets", type="integer", example=4),
 *     @OA\Property(property="reps", type="integer", example=8),
 *     @OA\Property(property="weight_kg", type="number", format="float", example=70.5),
 *     @OA\Property(property="notes", type="string", example="Felt strong today"),
 *     @OA\Property(property="exercise_name", type="string", example="Bench Press"),
 *     @OA\Property(property="muscle_group", type="string", example="chest")
 * )
 */
?>