let WorkoutService = {
  init: function () {
    
    $("#workout-form").validate({
      rules: {
        "workout_date": "required",
        "workout_type": "required"
      },
      submitHandler: function (form) {
        var workout = Object.fromEntries(new FormData(form).entries());
        WorkoutService.saveWorkout(workout);
      },
    });
    
    WorkoutService.loadExercisesForDropdown();
    
    WorkoutService.getUserWorkouts();
  },
  getWorkoutById: function(workoutId, callback, error_callback) {
    RestClient.get(`workouts/${workoutId}`, 
        function(workout) {
            if (callback) callback(workout);
        }, 
        function(error) {
            console.error("Error fetching workout:", error);
            if (error_callback) error_callback(error);
            else Utils.showToast("Failed to load workout", "error");
        }
    );
},
viewWorkout: function(workoutId) {
    Utils.blockUI("Loading workout details...");
    
    RestClient.get(`workouts/${workoutId}`, function(workout){
        RestClient.get(`workout-exercises/workout/${workoutId}`, function(exercises) {
            Utils.unblockUI();
            
            let exercisesHtml = '';
            if (exercises && exercises.length > 0) {
                exercisesHtml = '<h4>Exercises:</h4><div class="list-group">';
                exercises.forEach(ex => {
                    exercisesHtml += `
                        <div class="list-group-item">
                            <strong>${ex.exercise_name}</strong>: ${ex.sets}x${ex.reps} 
                            ${ex.weight_kg ? '@ ' + ex.weight_kg + 'kg' : '(Bodyweight)'}
                            ${ex.notes ? '<br><small>' + ex.notes + '</small>' : ''}
                        </div>
                    `;
                });
                exercisesHtml += '</div>';
            }
            
            $('#workout-details').html(`
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">${workout.workout_type} - ${new Date(workout.workout_date).toLocaleDateString()}</h3>
                        <button type="button" class="btn-close" onclick="$('#workout-details').hide()"></button>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Duration:</strong> ${workout.duration_minutes || 'N/A'} minutes</p>
                                <p><strong>Type:</strong> ${workout.workout_type}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Created:</strong> ${new Date(workout.created_at).toLocaleString()}</p>
                                <p><strong>Exercises:</strong> ${exercises ? exercises.length : 0}</p>
                            </div>
                        </div>
                        <hr>
                        <p><strong>Notes:</strong></p>
                        <p class="mb-3">${workout.notes || 'No notes'}</p>
                        ${exercisesHtml}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-warning" onclick="WorkoutService.editWorkout(${workout.workout_id})">
                            <i class="fas fa-edit"></i> Edit Workout
                        </button>
                        <button class="btn btn-danger" onclick="WorkoutService.deleteWorkout(${workout.workout_id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="btn btn-secondary" onclick="$('#workout-details').hide()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            `).show();
        }, (error) => {
            Utils.unblockUI();
            Utils.showToast("Failed to load exercises", "error");
        });
    }, (error) => {
        Utils.unblockUI();
        Utils.showToast("Failed to load workout details", "error");
    });
},

updateWorkout: function(workoutId, workoutData, callback, error_callback) {
    RestClient.put(`workouts/${workoutId}`, workoutData, 
        function(response) {
            if (callback) callback(response);
            Utils.showToast("Workout updated successfully!", "success");
        }, 
        function(error) {
            console.error("Error updating workout:", error);
            if (error_callback) error_callback(error);
            else Utils.showToast("Failed to update workout", "error");
        }
    );
},

deleteWorkout: function(workoutId, callback, error_callback) {
    RestClient.delete(`workouts/${workoutId}`, null,
        function(response) {
            if (callback) callback(response);
            Utils.showToast("Workout deleted successfully!", "success");
        }, 
        function(error) {
            console.error("Error deleting workout:", error);
            if (error_callback) error_callback(error);
            else Utils.showToast("Failed to delete workout", "error");
        }
    );
},

  loadExercisesForDropdown: function() {
    RestClient.get('exercises', function(exercises) {
      const options = exercises.map(ex => 
        `<option value="${ex.exercise_id}">${ex.exercise_name} (${ex.muscle_group})</option>`
      ).join('');
      
      
      $('.exercise-name').each(function() {
        if ($(this).find('option').length <= 1) { 
          $(this).html(`<option value="">Select exercise...</option>${options}`);
        }
      });
    });
  },

 saveWorkout: function (workout) {
    const user = AuthService.getCurrentUser();
    if (!user) {
        window.location.replace("#login");
        return;
    }
    const workoutData = {
        user_id: user.user_id,
        workout_date: workout.workout_date,
        workout_type: workout.workout_type || 'custom',
        notes: workout.notes || null,
        duration_minutes: parseInt(workout.duration_minutes) || 60
    };
    const exercises = [];
    let exerciseIndex = 0;
    
    
    Object.keys(workout).forEach(key => {
        
        const match = key.match(/exercises\[(\d+)\]\[(\w+)\]/);
        if (match) {
            const index = parseInt(match[1]);
            const field = match[2];
            const value = workout[key];
            
            
            if (!exercises[index]) {
                exercises[index] = {};
            }
            
            exercises[index][field] = field === 'exercise_id' || field === 'sets' || field === 'reps' 
                ? parseInt(value) || 0 
                : field === 'weight_kg' 
                    ? parseFloat(value) || null 
                    : value;
        }
    });
    
    const validExercises = exercises.filter(ex => ex && ex.exercise_id);
    Utils.blockUI("Saving workout...");
    RestClient.post('workouts', workoutData, function(response){
        const workoutId = response.workout_id || response.data?.workout_id;
        
        if (validExercises.length > 0 && workoutId) {
            
            let exercisesSaved = 0;
            const totalExercises = validExercises.length;
            
            validExercises.forEach((exercise, index) => {
                exercise.workout_id = workoutId;
                RestClient.post('workout-exercises', exercise, function(exResponse) {
                    exercisesSaved++;
                    if (exercisesSaved === totalExercises) {
                        Utils.unblockUI();
                        Utils.showToast(`Workout saved with ${totalExercises} exercises!`, "success");
                        window.location.replace("#workout-history");
                    }
                }, function(exError) {
                    exercisesSaved++;
                    console.warn(`Failed to save exercise ${index + 1}:`, exError);
                    if (exercisesSaved === totalExercises) {
                        Utils.unblockUI();
                        Utils.showToast("Workout saved, but some exercises failed", "warning");
                        window.location.replace("#workout-history");
                    }
                });
            });
        } else {
            Utils.unblockUI();
            Utils.showToast("Workout saved!", "success");
            window.location.replace("#workout-history");
        }
        
    }, function(error){
        console.error("Workout save error details:", error);
        console.error("Error response:", error.responseJSON);
        console.error("Error text:", error.responseText);
        Utils.unblockUI();
        const errorMsg = error.responseJSON?.error || error.responseText || "Failed to save workout";
        Utils.showToast(errorMsg, "error");
    });
},

  getUserWorkouts: function(){
    const user = AuthService.getCurrentUser();
    if (!user) return;
    
    RestClient.get(`workouts/user/${user.user_id}`, function(workouts){
      WorkoutService.updateDashboard(workouts.slice(0, 3));
      WorkoutService.populateHistoryTable(workouts);
      WorkoutService.calculateWorkoutStats(workouts);
    }, function(error) {
      console.error("Failed to load workouts:", error);
    });
  },

  updateDashboard: function(recentWorkouts) {
    let html = '';
    if (recentWorkouts.length === 0) {
      html = '<div class="text-muted">No workouts yet. <a href="#workout-log">Log your first workout!</a></div>';
    } else {
      recentWorkouts.forEach(workout => {
        html += `
          <div class="workout-item">
            <strong>${workout.workout_type}</strong> - ${new Date(workout.workout_date).toLocaleDateString()}
            <span class="badge">${workout.duration_minutes || 0} min</span>
          </div>
        `;
      });
    }
    $('.recent-workouts').html(html);
  },

  populateHistoryTable: function(workouts) {
    const tableBody = $('#workout-history table tbody');
    if (!tableBody.length) return;
    
    tableBody.empty();
    
    if (workouts.length === 0) {
      tableBody.html(`
        <tr>
          <td colspan="5" class="text-center">
            No workouts found. <a href="#workout-log">Log your first workout!</a>
          </td>
        </tr>
      `);
      return;
    }
    
    workouts.forEach(workout => {
      const row = `
        <tr>
          <td>${new Date(workout.workout_date).toLocaleDateString()}</td>
          <td><span class="badge">${workout.workout_type}</span></td>
          <td>${workout.notes || 'No notes'}</td>
          <td>${workout.duration_minutes || 'N/A'} min</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="WorkoutService.viewWorkout(${workout.workout_id})">View</button>
            <button class="btn btn-sm btn-danger" onclick="WorkoutService.deleteWorkout(${workout.workout_id})">Delete</button>
          </td>
        </tr>
      `;
      tableBody.append(row);
    });
  },

  calculateWorkoutStats: function(workouts) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekWorkouts = workouts.filter(w => 
      new Date(w.workout_date) >= oneWeekAgo
    ).length;
    
    const totalExercises = workouts.length * 3;
    const totalWorkouts = workouts.length; 
    
    
    $('#total-workouts-count').text(totalWorkouts);
    $('#this-week-count').text(thisWeekWorkouts);
    $('#total-exercises').text(totalExercises);
    $('#active-days').text(thisWeekWorkouts + "/7");
  },

  viewWorkout: function(id) {
    Utils.blockUI("Loading workout details...");
    RestClient.get(`workouts/${id}`, function(workout){
      
      RestClient.get(`workout-exercises/workout/${id}`, function(exercises) {
        Utils.unblockUI();
        
        let exercisesHtml = '';
        if (exercises.length > 0) {
          exercisesHtml = '<h4>Exercises:</h4><ul>';
          exercises.forEach(ex => {
            exercisesHtml += `<li>${ex.exercise_name}: ${ex.sets}x${ex.reps} @ ${ex.weight_kg || 'Bodyweight'} kg</li>`;
          });
          exercisesHtml += '</ul>';
        }
        
        
        $('#workout-details').html(`
          <div class="card">
            <h3>${workout.workout_type} - ${new Date(workout.workout_date).toLocaleDateString()}</h3>
            <p><strong>Duration:</strong> ${workout.duration_minutes || 'N/A'} minutes</p>
            <p><strong>Notes:</strong> ${workout.notes || 'No notes'}</p>
            ${exercisesHtml}
            <button class="btn btn-secondary mt-3" onclick="$('#workout-details').hide()">Close</button>
          </div>
        `).show();
      });
    }, function(error) {
      Utils.unblockUI();
      Utils.showToast("Failed to load workout details", "error");
    });
  },

  deleteWorkout: function(id) {
    if (confirm("Are you sure you want to delete this workout?")) {
      Utils.blockUI("Deleting workout...");
      RestClient.delete(`workouts/${id}`, null, function(response) {
        Utils.unblockUI();
        Utils.showToast("Workout deleted successfully", "success");
        WorkoutService.getUserWorkouts(); 
      }, function(error) {
        Utils.unblockUI();
        Utils.showToast(error.responseJSON?.error || "Failed to delete workout", "error");
      });
    }
  }
};
