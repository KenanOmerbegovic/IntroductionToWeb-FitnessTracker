<?php
require_once __DIR__ . '/BaseDao.php';

class ExerciseCategoryDao extends BaseDao
{
    public function __construct()
    {
        parent::__construct('exercise_categories');
    }

    public function getCategoryByName($category_name)
    {
        return $this->query_unique("SELECT * FROM exercise_categories WHERE category_name = :category_name", ["category_name" => $category_name]);
    }

    public function getCategoriesWithExerciseCount()
    {
        return $this->query("SELECT ec.*, COUNT(e.exercise_id) as exercise_count 
                           FROM exercise_categories ec 
                           LEFT JOIN exercises e ON ec.category_id = e.category_id 
                           GROUP BY ec.category_id 
                           ORDER BY ec.category_name", []);
    }
}