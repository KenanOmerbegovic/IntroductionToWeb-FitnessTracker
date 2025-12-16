const workoutManager = {
    saveWorkout: function(workoutData) {
        return Promise.resolve({ success: true });
    },
    
    getWorkoutHistory: function() {
        return Promise.resolve([]);
    },
    
    getExercises: function() {
        return Promise.resolve([
            { id: 1, name: 'Bench Press', category: 'Chest' },
            { id: 2, name: 'Squats', category: 'Legs' },
            { id: 3, name: 'Deadlifts', category: 'Back' }
        ]);
    }
};