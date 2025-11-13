<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/ExerciseDao.php';

class ExerciseService extends BaseService {
    public function __construct() {
        $dao = new ExerciseDao();
        parent::__construct($dao);
    }
    
    public function getByMuscleGroup($muscle_group) {
        return $this->dao->getByMuscleGroup($muscle_group);
    }
    
    public function getByCategory($category_id) {
        return $this->dao->getByCategory($category_id);
    }
    
    public function searchExercises($search_term) {
        return $this->dao->searchExercises($search_term);
    }
    
    public function getExercisesWithCategory() {
        return $this->dao->getExercisesWithCategory();
    }

    public function createExercise($data) {
        if (empty($data['exercise_name'])) {
            throw new Exception('Exercise name is required.');
        }
        if (empty($data['muscle_group'])) {
            throw new Exception('Muscle group is required.');
        }
        
        $valid_muscle_groups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];
        if (!in_array($data['muscle_group'], $valid_muscle_groups)) {
            throw new Exception('Invalid muscle group.');
        }
        
        return $this->create($data);
    }
}
?>