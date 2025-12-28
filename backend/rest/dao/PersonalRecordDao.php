<?php
require_once __DIR__ . '/BaseDao.php';

class PersonalRecordDao extends BaseDao
{
    public function __construct()
    {
        parent::__construct('personal_records');
    }

    public function getRecordsByUser($user_id)
    {
        return $this->query("SELECT pr.*, e.exercise_name 
                           FROM personal_records pr 
                           JOIN exercises e ON pr.exercise_id = e.exercise_id 
                           WHERE pr.user_id = :user_id 
                           ORDER BY pr.achieved_date DESC", 
                           ["user_id" => $user_id]);
    }

    public function getRecordByUserAndExercise($user_id, $exercise_id)
    {
        return $this->query_unique("SELECT * FROM personal_records 
                                  WHERE user_id = :user_id AND exercise_id = :exercise_id 
                                  ORDER BY max_weight_kg DESC, reps_achieved DESC 
                                  LIMIT 1", 
                                  ["user_id" => $user_id, "exercise_id" => $exercise_id]);
    }

public function getRecentRecords($user_id, $limit) {
    try {
        $limit = (int)$limit;
        if ($limit <= 0) {
            $limit = 5;
        }
        
        $query = "SELECT pr.*, e.exercise_name 
                  FROM personal_records pr 
                  JOIN exercises e ON pr.exercise_id = e.exercise_id 
                  WHERE pr.user_id = :user_id 
                  ORDER BY pr.achieved_date DESC 
                  LIMIT " . $limit;  
        
        return $this->query($query, ["user_id" => $user_id]);
        
    } catch (PDOException $e) {
        error_log("Database error in getRecentRecords: " . $e->getMessage());
        return [];
    }
}
}