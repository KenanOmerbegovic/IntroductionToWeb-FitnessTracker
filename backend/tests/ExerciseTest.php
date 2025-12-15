<?php
use PHPUnit\Framework\TestCase;

class ExerciseTest extends TestCase {
    public function setUp(): void {
        require_once __DIR__ . '/../vendor/autoload.php';
        require_once __DIR__ . '/../index.php';
        Flight::halt(false);
    }
    
    public function testGetAllExercises() {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/exercises';
        ob_start();
        Flight::start();
        $output = ob_get_clean();
        
        $this->assertEquals(200, http_response_code());
        $this->assertJson($output);
    }
    
    public function testGetExerciseById() {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_SERVER['REQUEST_URI'] = '/exercises/1';
        ob_start();
        Flight::start();
        $output = ob_get_clean();
        
        $this->assertEquals(200, http_response_code());
        $this->assertJson($output);
    }
}