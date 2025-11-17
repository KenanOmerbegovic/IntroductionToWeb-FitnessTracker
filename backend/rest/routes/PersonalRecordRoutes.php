<?php
/**
 * @OA\Get(
 *     path="/personal-records",
 *     tags={"personal-records"},
 *     summary="Get all personal records",
 *     @OA\Response(
 *         response=200,
 *         description="Array of all personal records in the database",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/PersonalRecord")
 *         )
 *     )
 * )
 */
Flight::route('GET /personal-records', function() {
    Flight::json(Flight::personalRecordService()->getAll());
});

/**
 * @OA\Get(
 *     path="/personal-records/{id}",
 *     tags={"personal-records"},
 *     summary="Get personal record by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Personal Record ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the personal record with the given ID",
 *         @OA\JsonContent(ref="#/components/schemas/PersonalRecord")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Personal record not found"
 *     )
 * )
 */
Flight::route('GET /personal-records/@id', function($id) {
    $record = Flight::personalRecordService()->getById($id);
    if ($record) {
        Flight::json($record);
    } else {
        Flight::json(['error' => 'Personal record not found'], 404);
    }
});

/**
 * @OA\Get(
 *     path="/personal-records/user/{user_id}",
 *     tags={"personal-records"},
 *     summary="Get personal records by user ID",
 *     @OA\Parameter(
 *         name="user_id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of personal records for the specified user",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/PersonalRecordWithExercise")
 *         )
 *     )
 * )
 */
Flight::route('GET /personal-records/user/@user_id', function($user_id) {
    $records = Flight::personalRecordService()->getRecordsByUser($user_id);
    Flight::json($records);
});

/**
 * @OA\Get(
 *     path="/personal-records/user/{user_id}/exercise/{exercise_id}",
 *     tags={"personal-records"},
 *     summary="Get personal record by user and exercise",
 *     @OA\Parameter(
 *         name="user_id",
 *         in="path",
 *         required=true,
 *         description="User ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Parameter(
 *         name="exercise_id",
 *         in="path",
 *         required=true,
 *         description="Exercise ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the personal record for the specified user and exercise",
 *         @OA\JsonContent(ref="#/components/schemas/PersonalRecord")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Personal record not found"
 *     )
 * )
 */
Flight::route('GET /personal-records/user/@user_id/exercise/@exercise_id', function($user_id, $exercise_id) {
    $record = Flight::personalRecordService()->getRecordByUserAndExercise($user_id, $exercise_id);
    if ($record) {
        Flight::json($record);
    } else {
        Flight::json(['error' => 'Personal record not found'], 404);
    }
});

/**
 * @OA\Get(
 *     path="/personal-records/user/{user_id}/recent",
 *     tags={"personal-records"},
 *     summary="Get recent personal records for user",
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
 *         description="Number of recent records to return",
 *         @OA\Schema(type="integer", example=5)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of recent personal records",
 *         @OA\JsonContent(
 *             type="array",
 *             @OA\Items(ref="#/components/schemas/PersonalRecordWithExercise")
 *         )
 *     )
 * )
 */
Flight::route('GET /personal-records/user/@user_id/recent', function($user_id) {
    $limit = Flight::request()->query['limit'] ?? 5;
    $records = Flight::personalRecordService()->getRecentRecords($user_id, $limit);
    Flight::json($records);
});

/**
 * @OA\Post(
 *     path="/personal-records",
 *     tags={"personal-records"},
 *     summary="Create a new personal record",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"user_id", "exercise_id", "max_weight_kg", "reps_achieved", "achieved_date"},
 *             @OA\Property(property="user_id", type="integer", example=1),
 *             @OA\Property(property="exercise_id", type="integer", example=1),
 *             @OA\Property(property="max_weight_kg", type="number", format="float", example=85.5),
 *             @OA\Property(property="reps_achieved", type="integer", example=3),
 *             @OA\Property(property="achieved_date", type="string", format="date", example="2024-01-15"),
 *             @OA\Property(property="notes", type="string", example="New bench press PR!")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Personal record created successfully",
 *         @OA\JsonContent(ref="#/components/schemas/PersonalRecord")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /personal-records', function() {
    $data = Flight::request()->data->getData();
    try {
        $record = Flight::personalRecordService()->createPersonalRecord($data);
        Flight::json($record, 201);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/personal-records/{id}",
 *     tags={"personal-records"},
 *     summary="Update an existing personal record",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Personal Record ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="max_weight_kg", type="number", format="float", example=90.0),
 *             @OA\Property(property="reps_achieved", type="integer", example=4),
 *             @OA\Property(property="achieved_date", type="string", format="date", example="2024-01-16"),
 *             @OA\Property(property="notes", type="string", example="Increased weight and reps")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Personal record updated successfully",
 *         @OA\JsonContent(ref="#/components/schemas/PersonalRecord")
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /personal-records/@id', function($id) {
    $data = Flight::request()->data->getData();
    try {
        $record = Flight::personalRecordService()->update($id, $data);
        Flight::json($record);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/personal-records/{id}",
 *     tags={"personal-records"},
 *     summary="Delete a personal record",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Personal Record ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Personal record deleted successfully"
 *     )
 * )
 */
Flight::route('DELETE /personal-records/@id', function($id) {
    Flight::personalRecordService()->delete($id);
    Flight::json(['message' => 'Personal record deleted successfully']);
});

/**
 * @OA\Schema(
 *     schema="PersonalRecord",
 *     type="object",
 *     @OA\Property(property="record_id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="exercise_id", type="integer", example=1),
 *     @OA\Property(property="max_weight_kg", type="number", format="float", example=85.5),
 *     @OA\Property(property="reps_achieved", type="integer", example=3),
 *     @OA\Property(property="achieved_date", type="string", format="date", example="2024-01-15"),
 *     @OA\Property(property="notes", type="string", example="New bench press PR!"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 */

/**
 * @OA\Schema(
 *     schema="PersonalRecordWithExercise",
 *     type="object",
 *     @OA\Property(property="record_id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="exercise_id", type="integer", example=1),
 *     @OA\Property(property="max_weight_kg", type="number", format="float", example=85.5),
 *     @OA\Property(property="reps_achieved", type="integer", example=3),
 *     @OA\Property(property="achieved_date", type="string", format="date", example="2024-01-15"),
 *     @OA\Property(property="notes", type="string", example="New bench press PR!"),
 *     @OA\Property(property="exercise_name", type="string", example="Bench Press"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 */
?>