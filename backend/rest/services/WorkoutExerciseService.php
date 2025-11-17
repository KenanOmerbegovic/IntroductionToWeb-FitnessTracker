<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/WorkoutExerciseDao.php';

class WorkoutExerciseService extends BaseService {
    public function __construct() {
        $dao = new WorkoutExerciseDao();
        parent::__construct($dao);
    }
    
    public function getExercisesByWorkout($workout_id) {
        return $this->dao->getExercisesByWorkout($workout_id);
    }
    
    public function deleteByWorkout($workout_id) {
        return $this->dao->deleteByWorkout($workout_id);
    }
    
    public function getWorkoutExerciseDetails($workout_exercise_id) {
        return $this->dao->getWorkoutExerciseDetails($workout_exercise_id);
    }
    
    public function createWorkoutExercise($data) {
        if (empty($data['workout_id'])) {
            throw new Exception('Workout ID is required.');
        }
        if (empty($data['exercise_id'])) {
            throw new Exception('Exercise ID is required.');
        }
        if (empty($data['sets'])) {
            throw new Exception('Sets are required.');
        }
        if (empty($data['reps'])) {
            throw new Exception('Reps are required.');
        }
        
        if ($data['sets'] <= 0) {
            throw new Exception('Sets must be a positive number.');
        }
        if ($data['reps'] <= 0) {
            throw new Exception('Reps must be a positive number.');
        }
        if (isset($data['weight_kg']) && $data['weight_kg'] < 0) {
            throw new Exception('Weight cannot be negative.');
        }
        
        return $this->create($data);
    }
}
?>