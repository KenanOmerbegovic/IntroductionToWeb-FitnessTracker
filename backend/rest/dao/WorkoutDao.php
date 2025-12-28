<?php
require_once __DIR__ . '/BaseDao.php';

class WorkoutDao extends BaseDao
{
    public function __construct()
    {
        parent::__construct('workouts', 'workout_id');
    }

    public function getWorkoutsByUser($user_id)
    {
        return $this->query("SELECT * FROM workouts WHERE user_id = :user_id ORDER BY workout_date DESC", ["user_id" => $user_id]);
    }

    public function getWorkoutsByDateRange($user_id, $start_date, $end_date)
    {
        return $this->query("SELECT * FROM workouts WHERE user_id = :user_id AND workout_date BETWEEN :start_date AND :end_date ORDER BY workout_date DESC", 
            ["user_id" => $user_id, "start_date" => $start_date, "end_date" => $end_date]);
    }

    public function getWorkoutsByType($user_id, $workout_type)
    {
        return $this->query("SELECT * FROM workouts WHERE user_id = :user_id AND workout_type = :workout_type ORDER BY workout_date DESC", 
            ["user_id" => $user_id, "workout_type" => $workout_type]);
    }

    public function getRecentWorkouts($user_id, $limit) {
        $limit = (int)$limit;
        $query = "SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC LIMIT ?";
        return $this->query($query, [$user_id, $limit]);
    }
}