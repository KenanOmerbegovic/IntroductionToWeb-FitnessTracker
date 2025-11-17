<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/ExerciseCategoryDao.php';

class ExerciseCategoryService extends BaseService {
    public function __construct() {
        $dao = new ExerciseCategoryDao();
        parent::__construct($dao);
    }
    
    public function getCategoryByName($category_name) {
        return $this->dao->getCategoryByName($category_name);
    }
    
    public function getCategoriesWithExerciseCount() {
        return $this->dao->getCategoriesWithExerciseCount();
    }
    public function createExerciseCategory($data) {
        if (empty($data['category_name'])) {
            throw new Exception('Category name is required.');
        }
        $existingCategory = $this->dao->getCategoryByName($data['category_name']);
        if ($existingCategory) {
            throw new Exception('Exercise category with this name already exists.');
        }
        
        return $this->create($data);
    }
}
?>