Flight::route('GET /test/personal-records', function() {
    try {
        // Test database connection
        $dao = new PersonalRecordDao();
        
        // Test the query
        $testQuery = "SHOW TABLES";
        $tables = $dao->query($testQuery, []);
        
        // Check for personal_records table
        $hasTable = false;
        foreach ($tables as $table) {
            if (in_array('personal_records', array_values($table))) {
                $hasTable = true;
                break;
            }
        }
        
        echo "Database connection: OK<br>";
        echo "Tables found: " . count($tables) . "<br>";
        echo "personal_records table exists: " . ($hasTable ? "YES" : "NO") . "<br>";
        
        if ($hasTable) {
            // Try to get count
            $count = $dao->query("SELECT COUNT(*) as count FROM personal_records WHERE user_id = 13", []);
            echo "Records for user 13: " . ($count[0]['count'] ?? 0) . "<br>";
        }
        
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "<br>";
    }
});