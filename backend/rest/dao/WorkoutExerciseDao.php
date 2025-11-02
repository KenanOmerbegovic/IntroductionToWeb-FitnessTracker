<?php
require_once __DIR__ . '/BaseDao.php';

class WorkoutExerciseDao extends BaseDao
{
    public function __construct()
    {
        parent::__construct('workout_exercises');
    }

    public function getExercisesByWorkout($workout_id)
    {
        return $this->query("SELECT we.*, e.exercise_name, e.muscle_group 
                           FROM workout_exercises we 
                           JOIN exercises e ON we.exercise_id = e.exercise_id 
                           WHERE we.workout_id = :workout_id 
                           ORDER BY we.workout_exercise_id", 
                           ["workout_id" => $workout_id]);
    }

    public function deleteByWorkout($workout_id)
    {
        $stmt = $this->connection->prepare("DELETE FROM workout_exercises WHERE workout_id = :workout_id");
        $stmt->bindValue(':workout_id', $workout_id);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function getWorkoutExerciseDetails($workout_exercise_id)
    {
        return $this->query_unique("SELECT we.*, e.exercise_name, e.muscle_group, e.description 
                                  FROM workout_exercises we 
                                  JOIN exercises e ON we.exercise_id = e.exercise_id 
                                  WHERE we.workout_exercise_id = :workout_exercise_id", 
                                  ["workout_exercise_id" => $workout_exercise_id]);
    }
}