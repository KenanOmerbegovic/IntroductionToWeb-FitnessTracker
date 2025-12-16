<?php
require_once 'BaseService.php';
require_once __DIR__ . '/../dao/AuthDao.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthService extends BaseService {
    public function __construct() {
        $dao = new AuthDao();
        parent::__construct($dao);
    }

    public function get_user_by_email($email){
        return $this->dao->get_user_by_email($email);
    }

    public function register($entity) {   
        
        if (empty($entity['email']) || empty($entity['password'])) {
            return ['success' => false, 'error' => 'Email and password are required.'];
        }

        if (!filter_var($entity['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'error' => 'Invalid email format.'];
        }

        $email_exists = $this->get_user_by_email($entity['email']);
        if($email_exists){
            return ['success' => false, 'error' => 'Email already registered.'];
        }

        $entity['password_hash'] = password_hash($entity['password'], PASSWORD_BCRYPT);
        unset($entity['password']); // Remove plain password
        
        // Set default role if not provided
        if (!isset($entity['role'])) {
            $entity['role'] = 'user';
        }

        // Don't set created_at/updated_at - they should be auto-set by MySQL
        // since you have DEFAULT CURRENT_TIMESTAMP

        // Use create() method from BaseService
        try {
            $user = $this->create($entity);
            
            if ($user) {
                // Remove password hash from response
                unset($user['password_hash']);
                return ['success' => true, 'data' => $user];
            } else {
                return ['success' => false, 'error' => 'Failed to create user'];
            }
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
                   
    }

    public function login($entity) {   
        if (empty($entity['email']) || empty($entity['password'])) {
            return ['success' => false, 'error' => 'Email and password are required.'];
        }

        $user = $this->get_user_by_email($entity['email']);
        if(!$user){
            return ['success' => false, 'error' => 'Invalid email or password.'];
        }

        if(!password_verify($entity['password'], $user['password_hash'])) {
            return ['success' => false, 'error' => 'Invalid email or password.'];
        }

        unset($user['password_hash']);
        
        $jwt_payload = [
            'user' => $user,
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24) // valid for 24 hours
        ];

        $token = JWT::encode(
            $jwt_payload,
            Config::JWT_SECRET(),
            'HS256'
        );

        return ['success' => true, 'data' => array_merge($user, ['token' => $token])];              
    }
}