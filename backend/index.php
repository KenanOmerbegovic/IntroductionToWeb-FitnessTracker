<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, Access-Control-Allow-Headers, Origin, Accept");
header("Access-Control-Expose-Headers: Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/config.php';


require_once __DIR__ . '/data/Roles.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

require_once __DIR__ . '/rest/services/AuthService.php';
require_once __DIR__ . '/rest/services/UserService.php';
require_once __DIR__ . '/rest/services/WorkoutService.php';
require_once __DIR__ . '/rest/services/ExerciseService.php';
require_once __DIR__ . '/rest/services/WorkoutExerciseService.php';
require_once __DIR__ . '/rest/services/ExerciseCategoryService.php';
require_once __DIR__ . '/rest/services/PersonalRecordService.php';

Flight::register('auth_service', 'AuthService');
Flight::register('userService', 'UserService');
Flight::register('workoutService', 'WorkoutService');
Flight::register('exerciseService', 'ExerciseService');
Flight::register('workoutExerciseService', 'WorkoutExerciseService');
Flight::register('exerciseCategoryService', 'ExerciseCategoryService');
Flight::register('personalRecordService', 'PersonalRecordService');
Flight::register('auth_middleware', 'AuthMiddleware');


Flight::route('/*', function() {
    $publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/auth/profile',  
        '/',
        '/docs',
        '/swagger'
    ];
    
    $requestUrl = Flight::request()->url;
    
    foreach ($publicRoutes as $publicRoute) {
        if (strpos($requestUrl, $publicRoute) === 0) {
            return TRUE;
        }
    }
    
    $user = Flight::get('user');
    if (!$user) {
        Flight::halt(401, json_encode(['error' => 'Authentication required']));
    }
    
    return TRUE;
});

Flight::before('start', function() {
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


require_once __DIR__ . '/rest/routes/AuthRoutes.php';
require_once __DIR__ . '/rest/routes/UserRoutes.php';
require_once __DIR__ . '/rest/routes/WorkoutRoutes.php';
require_once __DIR__ . '/rest/routes/ExerciseRoutes.php';
require_once __DIR__ . '/rest/routes/WorkoutExerciseRoutes.php';
require_once __DIR__ . '/rest/routes/ExerciseCategoryRoutes.php';
require_once __DIR__ . '/rest/routes/PersonalRecordRoutes.php';

Flight::route('/', function() {
    echo 'Fitness Tracker API v1.0 - Use /auth/login to authenticate';
});

Flight::start();