<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/UserDao.php';

class UserService extends BaseService {
    public function __construct() {
        $dao = new UserDao();
        parent::__construct($dao);
    }
    
    public function getByEmail($email) {
        return $this->dao->getByEmail($email);
    }
    
    public function getByFitnessGoal($fitness_goal) {
        return $this->dao->getByFitnessGoal($fitness_goal);
    }
    
    public function getUsersByRole($role) {
        return $this->dao->getUsersByRole($role);
    }

    public function createUser($data) {
        if (empty($data['email'])) {
            throw new Exception('Email is required.');
        }
        if (empty($data['password_hash'])) {
            throw new Exception('Password is required.');
        }
        if (empty($data['full_name'])) {
            throw new Exception('Full name is required.');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }
        
        $existingUser = $this->dao->getByEmail($data['email']);
        if ($existingUser) {
            throw new Exception('User with this email already exists.');
        }
        
        return $this->create($data);
    }
    
    public function updateUser($id, $data) {
        if (isset($data['email'])) {
            $existingUser = $this->dao->getByEmail($data['email']);
            if ($existingUser && $existingUser['user_id'] != $id) {
                throw new Exception('Another user already has this email.');
            }
        }
        
        return $this->update($id, $data);
    }
    
    // Override getById to remove password hash
    public function getById($id) {
        $user = parent::getById($id);
        if ($user) {
            unset($user['password_hash']);
        }
        return $user;
    }
    
    // Override getAll to remove password hashes
    public function getAll() {
        $users = parent::getAll();
        foreach ($users as &$user) {
            unset($user['password_hash']);
        }
        return $users;
    }
}