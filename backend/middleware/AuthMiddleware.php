<?php
class AuthMiddleware {

    public function verifyToken($token){
        $user = Flight::get('user');
        if (!$user) {
            Flight::halt(401, "Authentication required");
        }
        return TRUE;
    }

    public function authorizeRole($requiredRole) {
        $user = Flight::get('user');
        if (!$user || $user['role'] !== $requiredRole) {
            Flight::halt(403, 'Access denied: insufficient privileges');
        }
    }

    public function authorizeRoles($roles) {
        $user = Flight::get('user');
        if (!$user || !in_array($user['role'], $roles)) {
            Flight::halt(403, 'Forbidden: role not allowed');
        }
    }
}