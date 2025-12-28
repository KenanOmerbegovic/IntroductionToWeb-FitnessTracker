let PersonalRecordService = {
    
    getUserRecords: function(callback, error_callback) {
        const user = AuthService.getCurrentUser();
        if (!user) {
            if (error_callback) error_callback({ message: "User not authenticated" });
            return;
        }
        
        RestClient.get(`personal-records/user/${user.user_id}`, 
            function(records) {
                if (callback) callback(records);
            }, 
            function(error) {
                console.error("Error fetching user records:", error);
                if (error_callback) error_callback(error);
            }
        );
    },
    
    getRecentRecords: function(limit = 5, callback, error_callback) {
        
        const user = AuthService.getCurrentUser();
        
        if (!user) {
            console.error("No user authenticated");
            if (error_callback) error_callback({ message: "User not authenticated" });
            return;
        }
        
        const userId = user.user_id;
        
        const url = `personal-records/user/${userId}/recent?limit=${limit}`;
        
        RestClient.get(url, 
            function(records) {
                if (callback) {
                    callback(records);
                }
            }, 
            function(error) {
                console.error("ERROR - Request failed:");
                console.error("Error status:", error.status);
                console.error("Error status text:", error.statusText);
                console.error("Error response:", error.responseJSON);
                console.error("Error response text:", error.responseText);
                
                if (error_callback) {
                    error_callback(error);
                } else {
                    toastr.error("Failed to load personal records");
                }
            }
        );
    },
    
    getRecordByExercise: function(exercise_id, callback, error_callback) {
        const user = AuthService.getCurrentUser();
        if (!user) {
            if (error_callback) error_callback({ message: "User not authenticated" });
            return;
        }
        
        RestClient.get(`personal-records/user/${user.user_id}/exercise/${exercise_id}`, 
            function(record) {
                if (callback) callback(record);
            }, 
            function(error) {
                console.error("Error fetching exercise record:", error);
                if (error_callback) error_callback(error);
            }
        );
    },
    
    createRecord: function(recordData, callback, error_callback) {
        RestClient.post('personal-records', recordData, 
            function(response) {
                if (callback) callback(response);
                Utils.showToast("Personal record saved!", "success");
            }, 
            function(error) {
                console.error("Error creating record:", error);
                if (error_callback) error_callback(error);
                else Utils.showToast("Failed to save personal record", "error");
            }
        );
    },
    
    updateRecord: function(record_id, recordData, callback, error_callback) {
        RestClient.put(`personal-records/${record_id}`, recordData, 
            function(response) {
                if (callback) callback(response);
                Utils.showToast("Personal record updated!", "success");
            }, 
            function(error) {
                console.error("Error updating record:", error);
                if (error_callback) error_callback(error);
                else Utils.showToast("Failed to update personal record", "error");
            }
        );
    },
    
    deleteRecord: function(record_id, callback, error_callback) {
        RestClient.delete(`personal-records/${record_id}`, null,
            function(response) {
                if (callback) callback(response);
                Utils.showToast("Personal record deleted!", "success");
            }, 
            function(error) {
                console.error("Error deleting record:", error);
                if (error_callback) error_callback(error);
                else Utils.showToast("Failed to delete personal record", "error");
            }
        );
    },
    
    
    extractBestSetsFromWorkouts: function(workouts, exercise_id) {
        let bestSets = [];
        
        if (!workouts || workouts.length === 0) return bestSets;
        
        workouts.forEach(workout => {
            if (workout.workout_exercises) {
                workout.workout_exercises.forEach(we => {
                    if (we.exercise_id == exercise_id && we.sets) {
                        we.sets.forEach(set => {
                            if (set.weight_kg && set.reps) {
                                bestSets.push({
                                    date: workout.workout_date,
                                    weight_kg: parseFloat(set.weight_kg),
                                    reps: parseInt(set.reps),
                                    workout_id: workout.workout_id
                                });
                            }
                        });
                    }
                });
            }
        });
        
        
        bestSets.sort((a, b) => {
            if (b.weight_kg !== a.weight_kg) {
                return b.weight_kg - a.weight_kg;
            }
            return b.reps - a.reps;
        });
        
        return bestSets;
    }
};