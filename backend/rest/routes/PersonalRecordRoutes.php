<?php
require_once __DIR__ . '/../../data/Roles.php';

/**
 * @OA\Get(
 *     path="/personal-records",
 *     tags={"personal-records"},
 *     summary="Get all personal records",
 *     security={{"ApiKey": {}}},
 *     @OA\Response(
 *         response=200,
 *         description="Array of all personal records in the database"
 *     )
 * )
 */
Flight::route('GET /personal-records', function() {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    Flight::json(Flight::personalRecordService()->getAll());
});

/**
 * @OA\Get(
 *     path="/personal-records/{id}",
 *     tags={"personal-records"},
 *     summary="Get personal record by ID",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Personal Record ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the personal record with the given ID"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Personal record not found"
 *     )
 * )
 */
Flight::route('GET /personal-records/@id', function($id) {
    $record = Flight::personalRecordService()->getById($id);
    if (!$record) {
        Flight::json(['error' => 'Personal record not found'], 404);
    }
    
    $user = Flight::get('user');
    if ($record['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    Flight::json($record);
});

/**
 * @OA\Get(
 *     path="/personal-records/user/{user_id}",
 *     tags={"personal-records"},
 *     summary="Get personal records by user ID",
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
 *         description="Array of personal records for the specified user"
 *     )
 * )
 */
Flight::route('GET /personal-records/user/@user_id', function($user_id) {
    $user = Flight::get('user');
    
    if ($user['user_id'] != $user_id && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $records = Flight::personalRecordService()->getRecordsByUser($user_id);
    Flight::json($records);
});

/**
 * @OA\Post(
 *     path="/personal-records",
 *     tags={"personal-records"},
 *     summary="Create a new personal record",
 *     security={{"ApiKey": {}}},
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
 *         description="Personal record created successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /personal-records', function() {
    $user = Flight::get('user');
    $data = Flight::request()->data->getData();
    
     
    if (!isset($data['user_id'])) {
        $data['user_id'] = $user['user_id'];
    } else if ($data['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: can only create records for yourself']));
    }
    
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
 *     security={{"ApiKey": {}}},
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
 *         description="Personal record updated successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /personal-records/@id', function($id) {
    $record = Flight::personalRecordService()->getById($id);
    if (!$record) {
        Flight::json(['error' => 'Personal record not found'], 404);
    }
    
    $user = Flight::get('user');
    if ($record['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    $data = Flight::request()->data->getData();
    try {
        $updatedRecord = Flight::personalRecordService()->update($id, $data);
        Flight::json($updatedRecord);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/personal-records/{id}",
 *     tags={"personal-records"},
 *     summary="Delete a personal record",
 *     security={{"ApiKey": {}}},
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
    $record = Flight::personalRecordService()->getById($id);
    if (!$record) {
        Flight::json(['error' => 'Personal record not found'], 404);
    }
    
    $user = Flight::get('user');
    if ($record['user_id'] != $user['user_id'] && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
    Flight::personalRecordService()->delete($id);
    Flight::json(['message' => 'Personal record deleted successfully']);
});

/**
 * @OA\Get(
 *     path="/personal-records/user/{user_id}/exercise/{exercise_id}",
 *     tags={"personal-records"},
 *     summary="Get personal record by user and exercise",
 *     security={{"ApiKey": {}}},
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
 *         description="Returns the personal record for the specified user and exercise"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Personal record not found"
 *     )
 * )
 */
Flight::route('GET /personal-records/user/@user_id/exercise/@exercise_id', function($user_id, $exercise_id) {
    $user = Flight::get('user');
    

    if ($user['user_id'] != $user_id && $user['role'] !== Roles::ADMIN) {
        Flight::halt(403, json_encode(['error' => 'Access denied: insufficient privileges']));
    }
    
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
 *         description="Number of recent records to return",
 *         @OA\Schema(type="integer", example=5)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Array of recent personal records"
 *     )
 * )
 */
Flight::route('GET /personal-records/user/@user_id/recent', function($user_id) {
    try {
        $user = Flight::get('user');
        
        // Check authentication - but be careful with the error
        if (!$user || !is_array($user)) {
            Flight::json(['error' => 'Not authenticated'], 401);
            return;
        }
        
        // Users can view their own records, admin can view any
        if ($user['user_id'] != $user_id && $user['role'] !== Roles::ADMIN) {
            Flight::json(['error' => 'Access denied: insufficient privileges'], 403);
            return;
        }
        
        $request = Flight::request();
        $limit = isset($request->query['limit']) ? (int)$request->query['limit'] : 5;
        
        if ($limit <= 0 || $limit > 100) {
            $limit = 5;
        }
        

        $records = Flight::personalRecordService()->getRecentRecords($user_id, $limit);
        
        Flight::json($records);
        
    } catch (Exception $e) {
        error_log("Error in personal-records/recent route: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        Flight::json(['error' => 'Internal server error'], 500);
    }
});