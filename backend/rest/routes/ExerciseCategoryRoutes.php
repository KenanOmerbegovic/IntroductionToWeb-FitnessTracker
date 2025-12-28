<?php
require_once __DIR__ . '/../../data/Roles.php';

/**
 * @OA\Get(
 *     path="/exercise-categories",
 *     tags={"exercise-categories"},
 *     summary="Get all exercise categories",
 *     @OA\Response(
 *         response=200,
 *         description="Array of all exercise categories in the database"
 *     )
 * )
 */
Flight::route('GET /exercise-categories', function() {
    Flight::json(Flight::exerciseCategoryService()->getAll());
});

/**
 * @OA\Get(
 *     path="/exercise-categories/{id}",
 *     tags={"exercise-categories"},
 *     summary="Get exercise category by ID",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Category ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the category with the given ID"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Category not found"
 *     )
 * )
 */
Flight::route('GET /exercise-categories/@id', function($id) {
    $category = Flight::exerciseCategoryService()->getById($id);
    if ($category) {
        Flight::json($category);
    } else {
        Flight::json(['error' => 'Category not found'], 404);
    }
});

/**
 * @OA\Post(
 *     path="/exercise-categories",
 *     tags={"exercise-categories"},
 *     summary="Create a new exercise category",
 *     security={{"ApiKey": {}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"category_name"},
 *             @OA\Property(property="category_name", type="string", example="Cardio"),
 *             @OA\Property(property="description", type="string", example="Exercises focused on cardiovascular health")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Category created successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('POST /exercise-categories', function() {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    
    $data = Flight::request()->data->getData();
    try {
        $category = Flight::exerciseCategoryService()->createExerciseCategory($data);
        Flight::json($category, 201);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Put(
 *     path="/exercise-categories/{id}",
 *     tags={"exercise-categories"},
 *     summary="Update an existing exercise category",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Category ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="category_name", type="string", example="Updated Category Name"),
 *             @OA\Property(property="description", type="string", example="Updated description")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Category updated successfully"
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Invalid input"
 *     )
 * )
 */
Flight::route('PUT /exercise-categories/@id', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    
    $data = Flight::request()->data->getData();
    try {
        $category = Flight::exerciseCategoryService()->update($id, $data);
        Flight::json($category);
    } catch (Exception $e) {
        Flight::json(['error' => $e->getMessage()], 400);
    }
});

/**
 * @OA\Delete(
 *     path="/exercise-categories/{id}",
 *     tags={"exercise-categories"},
 *     summary="Delete an exercise category",
 *     security={{"ApiKey": {}}},
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         required=true,
 *         description="Category ID",
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Category deleted successfully"
 *     )
 * )
 */
Flight::route('DELETE /exercise-categories/@id', function($id) {
    Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
    
    Flight::exerciseCategoryService()->delete($id);
    Flight::json(['message' => 'Category deleted successfully']);
});

/**
 * @OA\Get(
 *     path="/exercise-categories/name/{name}",
 *     tags={"exercise-categories"},
 *     summary="Get exercise category by name",
 *     @OA\Parameter(
 *         name="name",
 *         in="path",
 *         required=true,
 *         description="Category name",
 *         @OA\Schema(type="string", example="Strength Training")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Returns the category with the given name"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Category not found"
 *     )
 * )
 */
Flight::route('GET /exercise-categories/name/@name', function($name) {
    $category = Flight::exerciseCategoryService()->getCategoryByName($name);
    if ($category) {
        Flight::json($category);
    } else {
        Flight::json(['error' => 'Category not found'], 404);
    }
});

/**
 * @OA\Get(
 *     path="/exercise-categories/with-counts",
 *     tags={"exercise-categories"},
 *     summary="Get categories with exercise counts",
 *     @OA\Response(
 *         response=200,
 *         description="Array of categories with exercise counts"
 *     )
 * )
 */
Flight::route('GET /exercise-categories/with-counts', function() {
    $categories = Flight::exerciseCategoryService()->getCategoriesWithExerciseCount();
    Flight::json($categories);
});