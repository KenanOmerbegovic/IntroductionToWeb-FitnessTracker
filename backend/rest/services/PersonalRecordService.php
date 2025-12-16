<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/PersonalRecordDao.php';

class PersonalRecordService extends BaseService {
    public function __construct() {
        $dao = new PersonalRecordDao();
        parent::__construct($dao);
    }
    
    public function getRecordsByUser($user_id) {
        return $this->dao->getRecordsByUser($user_id);
    }
    
    public function getRecordByUserAndExercise($user_id, $exercise_id) {
        return $this->dao->getRecordByUserAndExercise($user_id, $exercise_id);
    }
    
    public function getRecentRecords($user_id, $limit = 5) {
    try {
        $records = $this->dao->getRecentRecords($user_id, $limit);
        return is_array($records) ? $records : [];
    } catch (Exception $e) {
        error_log("Service error in getRecentRecords: " . $e->getMessage());
        return [];
    }
}
    public function createPersonalRecord($data) {
        if (empty($data['user_id'])) {
            throw new Exception('User ID is required.');
        }
        if (empty($data['exercise_id'])) {
            throw new Exception('Exercise ID is required.');
        }
        if (empty($data['max_weight_kg'])) {
            throw new Exception('Max weight is required.');
        }
        if (empty($data['reps_achieved'])) {
            throw new Exception('Reps achieved is required.');
        }
        if (empty($data['achieved_date'])) {
            throw new Exception('Achieved date is required.');
        }
        
        if ($data['max_weight_kg'] <= 0) {
            throw new Exception('Max weight must be positive.');
        }
        if ($data['reps_achieved'] <= 0) {
            throw new Exception('Reps achieved must be positive.');
        }
        
        return $this->create($data);
    }
}
?>