<?php
$base_path = __DIR__;

$files = [
    $base_path . '/UserService.php',
    $base_path . '/WorkoutService.php',
    $base_path . '/ExerciseService.php'
];

foreach ($files as $file) {
    if (!file_exists($file)) {
        die("File not found: $file\n");
    }
    if (!is_readable($file)) {
        die("File not readable: $file\n");
    }
    require_once $file;
    echo "Successfully included: $file\n";
}
echo "All files included successfully!\n\n";
echo "Testing UserService:\n";
$userService = new UserService();

try {
    $users = $userService->getAll();
    echo "All users: " . count($users) . " found\n";
    
    $testUser = [
        'email' => 'test@example.com',
        'password_hash' => password_hash('test123', PASSWORD_DEFAULT),
        'full_name' => 'Test User',
        'fitness_goal' => 'muscle_gain',
        'experience_level' => 'intermediate',
        'role' => 'user'
    ];
    
    $createdUser = $userService->createUser($testUser);
    echo "Created user with ID: " . $createdUser['user_id'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nTesting WorkoutService:\n";
$workoutService = new WorkoutService();

try {
    $workouts = $workoutService->getAll();
    echo "All workouts: " . count($workouts) . " found\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nTesting ExerciseService:\n";
$exerciseService = new ExerciseService();

try {
    $exercises = $exerciseService->getAll();
    echo "All exercises: " . count($exercises) . " found\n";
    
    $chestExercises = $exerciseService->getByMuscleGroup('chest');
    echo "Chest exercises: " . count($chestExercises) . " found\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nService testing completed!\n";
?>