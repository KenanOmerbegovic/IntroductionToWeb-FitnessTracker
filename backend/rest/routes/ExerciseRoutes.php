<?php
/**
 * @OA\Get(
 *     path="/exercises",
 *     tags={"exercises"},
 *     summary="Get all exercises",
 *     @OA\Response(
 *         response=200,
 *         description="Array of all exercises in the database",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Exercise")
 *         )
 *     )
 * )
 */
Flight::route('GET /exercises', function() {
    Flight::json(Flight::exerciseService()->getAll());
});

/**
 * @OA\Get(
 *     path="/exercises/{id}",
 *     tags={"exercises"},
 *     summary="Get exercise by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Exercise ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the exercise with the given ID",
 *         @OA\JsonContent(ref="#/components/schemas/Exercise")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Exercise not found"
 *     )
 * )
 */
Flight::route('GET /exercises/@id', function($id) {
    $exercise = Flight::exerciseService()->getById($id);
    if ($exercise) {
        Flight::json($exercise);
    } else {
        Flight::json(['error' => 'Exercise not found'], 404);
    }
});

/**
 * @OA\Get(
 *     path="/exercises/muscle/{muscle_group}",
 *     tags={"exercises"},
 *     summary="Get exercises by muscle group",
 *     @OA\Parameter(
 *         name="muscle_group",
 *         in="path",
 *         required=true,
 *         description="Muscle group",
 *         @OA\Schema(type="string", example="chest")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of exercises for the specified muscle group",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Exercise")
 *         )
 *     )
 * )
 */
Flight::route('GET /exercises/muscle/@muscle_group', function($muscle_group) {
    $exercises = Flight::exerciseService()->getByMuscleGroup($muscle_group);
    Flight::json($exercises);
});

/**
 * @OA\Get(
 *     path="/exercises/search",
 *     tags={"exercises"},
 *     summary="Search exercises",
 *     @OA\Parameter(
 *         name="q",
 *         in="query",
 *         required=true,
 *         description="Search term",
 *         @OA\Schema(type="string", example="bench")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of exercises matching the search term",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/Exercise")
 *         )
 *     )
 * )
 */
Flight::route('GET /exercises/search', function() {
    $search_term = Flight::request()->query['q'] ?? '';
    $exercises = Flight::exerciseService()->searchExercises($search_term);
    Flight::json($exercises);
});

/**
 * @OA\Get(
 *     path="/exercises/with-categories",
 *     tags={"exercises"},
 *     summary="Get exercises with category information",
 *     @OA\Response(
 *         response=200,
 *         description="Array of exercises with category details",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/ExerciseWithCategory")
 *         )
 *     )
 * )
 */
Flight::route('GET /exercises/with-categories', function() {
    $exercises = Flight::exerciseService()->getExercisesWithCategory();
    Flight::json($exercises);
});

/**
 * @OA\Post(
 *     path="/exercises",
 *     tags={"exercises"},
 *     summary="Create a new exercise",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"exercise_name", "muscle_group"},
 *             @OA\Property(property="exercise_name", type="string", example="Bench Press"),
 *             @OA\Property(property="description", type="string", example="Flat bench press using a barbell"),
 *             @OA\Property(property="muscle_group", type="string", example="chest"),
 *             @OA\Property(property="category_id", type="integer", example=1)
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Exercise created successfully",
 *         @OA\JsonContent(ref="#/components/schemas/Exercise")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /exercises', function() {
    $data = Flight::request()->data->getData();
    try {
        $exercise = Flight::exerciseService()->createExercise($data);
        Flight::json($exercise, 201);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/exercises/{id}",
 *     tags={"exercises"},
 *     summary="Update an existing exercise",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Exercise ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="exercise_name", type="string", example="Updated Exercise Name"),
 *             @OA\Property(property="description", type="string", example="Updated description"),
 *             @OA\Property(property="muscle_group", type="string", example="back"),
 *             @OA\Property(property="category_id", type="integer", example=2)
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Exercise updated successfully",
 *         @OA\JsonContent(ref="#/components/schemas/Exercise")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /exercises/@id', function($id) {
    $data = Flight::request()->data->getData();
    try {
        $exercise = Flight::exerciseService()->update($id, $data);
        Flight::json($exercise);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/exercises/{id}",
 *     tags={"exercises"},
 *     summary="Delete an exercise",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Exercise ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Exercise deleted successfully"
 *     )
 * )
 */
Flight::route('DELETE /exercises/@id', function($id) {
    Flight::exerciseService()->delete($id);
    Flight::json(['message' => 'Exercise deleted successfully']);
});

/**
 * @OA\Schema(
 *     schema="Exercise",
 *     type="object",
 *     @OA\Property(property="exercise_id", type="integer", example=1),
 *     @OA\Property(property="exercise_name", type="string", example="Bench Press"),
 *     @OA\Property(property="description", type="string", example="Flat bench press using a barbell"),
 *     @OA\Property(property="muscle_group", type="string", example="chest"),
 *     @OA\Property(property="category_id", type="integer", example=1),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 */

/**
 * @OA\Schema(
 *     schema="ExerciseWithCategory",
 *     type="object",
 *     @OA\Property(property="exercise_id", type="integer", example=1),
 *     @OA\Property(property="exercise_name", type="string", example="Bench Press"),
 *     @OA\Property(property="description", type="string", example="Flat bench press using a barbell"),
 *     @OA\Property(property="muscle_group", type="string", example="chest"),
 *     @OA\Property(property="category_id", type="integer", example=1),
 *     @OA\Property(property="category_name", type="string", example="Strength Training"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 */
?>