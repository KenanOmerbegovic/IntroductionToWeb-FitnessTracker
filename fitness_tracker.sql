use fitness_tracker;

CREATE TABLE exercise_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercises (
    exercise_id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_name VARCHAR(180) NOT NULL,
    description TEXT,
    muscle_group VARCHAR(50),
    category_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES exercise_categories(category_id)
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(180) NOT NULL,
    fitness_goal VARCHAR(50),
    experience_level VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE workouts (
    workout_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    workout_date DATE NOT NULL,
    workout_type VARCHAR(50) NOT NULL,
    notes TEXT,
    duration_minutes INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE workout_exercises (
    workout_exercise_id INT PRIMARY KEY AUTO_INCREMENT,
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT NOT NULL,
    reps INT NOT NULL,
    weight_kg DECIMAL(5,2),
    notes TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);

CREATE TABLE personal_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    max_weight_kg DECIMAL(5,2) NOT NULL,
    reps_achieved INT NOT NULL,
    achieved_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_personal_records_user_date ON personal_records(user_id, achieved_date);
CREATE INDEX idx_exercises_category ON exercises(category_id);


INSERT INTO exercise_categories (category_name, description) VALUES
('Strength Training', 'Exercises focused on building muscle and strength'),
('Cardio', 'Exercises focused on improving cardiovascular health'),
('Flexibility', 'Exercises focused on improving range of motion and flexibility');

INSERT INTO exercises (exercise_name, description, muscle_group, category_id) VALUES
('Barbell Bench Press', 'Flat bench press using a barbell', 'Chest', 1),
('Barbell Squat', 'Full depth squat with barbell on back', 'Legs', 1),
('Deadlift', 'Lifting barbell from floor to standing position', 'Back', 1),
('Running', 'Outdoor or treadmill running', 'Cardio', 2),
('Pull-ups', 'Bodyweight pulling exercise', 'Back', 1),
('Yoga', 'Various yoga poses and flows', 'Full Body', 3);

INSERT INTO users (email, password_hash, full_name, fitness_goal, experience_level, role) VALUES
('john.doe@email.com', '$2y$10$ExampleHash123', 'John Doe', 'Build Muscle', 'Intermediate', 'user'),
('jane.smith@email.com', '$2y$10$ExampleHash456', 'Jane Smith', 'Lose Weight', 'Beginner', 'user'),
('coach.mike@email.com', '$2y$10$ExampleHash789', 'Mike Johnson', 'Maintain Fitness', 'Advanced', 'trainer');

INSERT INTO workouts (user_id, workout_date, workout_type, notes, duration_minutes) VALUES
(1, '2024-01-15', 'Upper Body', 'Focused on chest and back', 75),
(1, '2024-01-17', 'Lower Body', 'Leg day with squats', 60),
(2, '2024-01-16', 'Cardio', 'Morning run in the park', 45),
(2, '2024-01-18', 'Full Body', 'Beginner full body workout', 50);

INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, notes) VALUES
(1, 1, 4, 8, 70.0, 'Felt strong today'),
(1, 5, 3, 10, NULL, 'Bodyweight only'),
(2, 2, 5, 5, 100.0, 'Heavy squat session'),
(2, 3, 3, 5, 120.0, 'Form felt good'),
(3, 4, 1, 1, NULL, '5km run in 25 minutes'),
(4, 1, 3, 12, 30.0, 'Light weight for form'),
(4, 2, 3, 10, 40.0, 'Learning proper technique');

INSERT INTO personal_records (user_id, exercise_id, max_weight_kg, reps_achieved, achieved_date, notes) VALUES
(1, 1, 85.5, 3, '2024-01-15', 'New bench press PR!'),
(1, 2, 120.0, 2, '2024-01-17', 'Heaviest squat yet'),
(1, 3, 140.0, 1, '2024-01-10', 'Deadlift PR'),
(2, 1, 40.0, 8, '2024-01-18', 'First time benching'),
(2, 4, 85.0, 1, '2024-01-16', 'Ran 5km without stopping');
