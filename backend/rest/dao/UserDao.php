<?php
require_once __DIR__ . '/BaseDao.php';

class UserDao extends BaseDao
{
    public function __construct()
    {
        parent::__construct('users');
    }

    public function getByEmail($email)
    {
        return $this->query_unique("SELECT * FROM users WHERE email = :email", ["email" => $email]);
    }

    public function getByFitnessGoal($fitness_goal)
    {
        return $this->query("SELECT * FROM users WHERE fitness_goal = :fitness_goal", ["fitness_goal" => $fitness_goal]);
    }

    public function getUsersByRole($role)
    {
        return $this->query("SELECT * FROM users WHERE role = :role", ["role" => $role]);
    }
}