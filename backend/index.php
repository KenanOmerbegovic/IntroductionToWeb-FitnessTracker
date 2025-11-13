<?php
require_once 'vendor/autoload.php';

require_once __DIR__ . '/rest/services/UserService.php';
require_once __DIR__ . '/rest/services/WorkoutService.php';
require_once __DIR__ . '/rest/services/ExerciseService.php';
require_once __DIR__ . '/rest/services/WorkoutExerciseService.php';
require_once __DIR__ . '/rest/services/ExerciseCategoryService.php';
require_once __DIR__ . '/rest/services/PersonalRecordService.php';

Flight::register('userService', 'UserService');
Flight::register('workoutService', 'WorkoutService');
Flight::register('exerciseService', 'ExerciseService');
Flight::register('workoutExerciseService', 'WorkoutExerciseService');
Flight::register('exerciseCategoryService', 'ExerciseCategoryService');
Flight::register('personalRecordService', 'PersonalRecordService');

require_once __DIR__ . '/rest/routes/UserRoutes.php';
require_once __DIR__ . '/rest/routes/WorkoutRoutes.php';
require_once __DIR__ . '/rest/routes/ExerciseRoutes.php';
require_once __DIR__ . '/rest/routes/WorkoutExerciseRoutes.php';
require_once __DIR__ . '/rest/routes/ExerciseCategoryRoutes.php';
require_once __DIR__ . '/rest/routes/PersonalRecordRoutes.php';

Flight::route('/', function() {
    echo 'Hello from Fitness Tracker API!';
});

Flight::start();
?>