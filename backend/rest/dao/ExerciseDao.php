<?php
require_once __DIR__ . '/BaseDao.php';

class ExerciseDao extends BaseDao
{
    public function __construct()
    {
        parent::__construct('exercises');
    }

    public function getByMuscleGroup($muscle_group)
    {
        return $this->query("SELECT * FROM exercises WHERE muscle_group = :muscle_group ORDER BY exercise_name", ["muscle_group" => $muscle_group]);
    }

    public function getByCategory($category_id)
    {
        return $this->query("SELECT * FROM exercises WHERE category_id = :category_id ORDER BY exercise_name", ["category_id" => $category_id]);
    }

    public function searchExercises($search_term)
    {
        return $this->query("SELECT * FROM exercises WHERE exercise_name LIKE :search_term OR description LIKE :search_term ORDER BY exercise_name", 
            ["search_term" => "%" . $search_term . "%"]);
    }

    public function getExercisesWithCategory()
    {
        return $this->query("SELECT e.*, ec.category_name 
                           FROM exercises e 
                           LEFT JOIN exercise_categories ec ON e.category_id = ec.category_id 
                           ORDER BY ec.category_name, e.exercise_name", []);
    }
}