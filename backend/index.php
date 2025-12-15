<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
// Load configuration
require_once __DIR__ . '/config.php';

// Load middleware and roles
require_once __DIR__ . '/data/Roles.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

// Load services
require_once __DIR__ . '/rest/services/AuthService.php';
require_once __DIR__ . '/rest/services/UserService.php';
require_once __DIR__ . '/rest/services/WorkoutService.php';
require_once __DIR__ . '/rest/services/ExerciseService.php';
require_once __DIR__ . '/rest/services/WorkoutExerciseService.php';
require_once __DIR__ . '/rest/services/ExerciseCategoryService.php';
require_once __DIR__ . '/rest/services/PersonalRecordService.php';

// Register services
Flight::register('auth_service', 'AuthService');
Flight::register('userService', 'UserService');
Flight::register('workoutService', 'WorkoutService');
Flight::register('exerciseService', 'ExerciseService');
Flight::register('workoutExerciseService', 'WorkoutExerciseService');
Flight::register('exerciseCategoryService', 'ExerciseCategoryService');
Flight::register('personalRecordService', 'PersonalRecordService');
Flight::register('auth_middleware', 'AuthMiddleware');

// Global middleware for authentication - runs BEFORE the routes
Flight::route('/*', function() {
    // Allow access to these public routes without authentication
    $publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/profile',  // Actually, profile should be protected - removing this
        '/',
        '/docs',
        '/swagger'
    ];
    
    $requestUrl = Flight::request()->url;
    
    // Check if current route is public
    foreach ($publicRoutes as $publicRoute) {
        if (strpos($requestUrl, $publicRoute) === 0) {
            return TRUE;
        }
    }
    
    // For protected routes, check if user is set
    $user = Flight::get('user');
    if (!$user) {
        Flight::halt(401, json_encode(['error' => 'Authentication required']));
    }
    
    return TRUE;
});

// IMPORTANT: Add this BEFORE Flight::start()
// This runs before the application starts and decodes the JWT token
Flight::before('start', function() {
    // Get the Authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if (empty($authHeader) && isset($headers['Authentication'])) {
        $authHeader = $headers['Authentication'];
    }

    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (!empty($authHeader) && preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        try {
           $secretKey = "MyCatSaidMeowWhichMeansHello";
            $decoded = JWT::decode($token, new Key(Config::JWT_SECRET(), 'HS256'));
            
            Flight::set('user', (array)$decoded->user);
            
        } catch (Exception $e) {
            error_log("JWT Decode Error: " . $e->getMessage());
        }
    }
});

// Load routes
require_once __DIR__ . '/rest/routes/AuthRoutes.php';
require_once __DIR__ . '/rest/routes/UserRoutes.php';
require_once __DIR__ . '/rest/routes/WorkoutRoutes.php';
require_once __DIR__ . '/rest/routes/ExerciseRoutes.php';
require_once __DIR__ . '/rest/routes/WorkoutExerciseRoutes.php';
require_once __DIR__ . '/rest/routes/ExerciseCategoryRoutes.php';
require_once __DIR__ . '/rest/routes/PersonalRecordRoutes.php';

// Default route
Flight::route('/', function() {
    echo 'Fitness Tracker API v1.0 - Use /auth/login to authenticate';
});

Flight::start();