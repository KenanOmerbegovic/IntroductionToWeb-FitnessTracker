<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/WorkoutDao.php';

class WorkoutService extends BaseService {
    public function __construct() {
        $dao = new WorkoutDao();
        parent::__construct($dao);
    }
    
    public function getWorkoutsByUser($user_id) {
        return $this->dao->getWorkoutsByUser($user_id);
    }
    
    public function getWorkoutsByDateRange($user_id, $start_date, $end_date) {
        return $this->dao->getWorkoutsByDateRange($user_id, $start_date, $end_date);
    }
    
    public function getWorkoutsByType($user_id, $workout_type) {
        return $this->dao->getWorkoutsByType($user_id, $workout_type);
    }
    
    public function getRecentWorkouts($user_id, $limit = 5) {
        return $this->dao->getRecentWorkouts($user_id, $limit);
    }
    
    public function createWorkout($data) {
        if (empty($data['user_id'])) {
            throw new Exception('User ID is required.');
        }
        if (empty($data['workout_date'])) {
            throw new Exception('Workout date is required.');
        }
        if (empty($data['workout_type'])) {
            throw new Exception('Workout type is required.');
        }
        
        $workout_date = new DateTime($data['workout_date']);
        $today = new DateTime();
        if ($workout_date > $today) {
            throw new Exception('Workout date cannot be in the future.');
        }
        
        return $this->create($data);
    }
}
?>