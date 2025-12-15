let ExerciseService = {
  init: function () {
    this.loadExercises();
    this.loadCategories();
    
    // Setup search functionality
    $('#exercise-search').on('keyup', function() {
      const searchTerm = $(this).val().toLowerCase();
      ExerciseService.filterExercises(searchTerm);
    });
  },
  

  loadExercises: function() {
    RestClient.get('exercises', function(exercises) {
      const grouped = {};
      exercises.forEach(ex => {
        const muscleGroup = ex.muscle_group || 'Other';
        if (!grouped[muscleGroup]) grouped[muscleGroup] = [];
        grouped[muscleGroup].push(ex);
      });
      ExerciseService.updateExerciseLibrary(grouped);
      ExerciseService.allExercises = exercises;
    });
  },

  loadCategories: function() {
    RestClient.get('exercise-categories', function(categories) {
      ExerciseService.categories = categories;
    });
  },
   getUserWorkouts: function(callback, error_callback) {
    const user = AuthService.getCurrentUser();
    if (!user) {
      if (error_callback) error_callback({ message: "User not authenticated" });
      return;
    }
    
    RestClient.get(`workouts/user/${user.user_id}`, 
      function(workouts) {
        if (callback) callback(workouts);
      }, 
      function(error) {
        console.error("Error fetching user workouts:", error);
        if (error_callback) error_callback(error);
      }
    );
  },

  updateExerciseLibrary: function(groupedExercises) {
    // Clear existing content
    $('.exercise-category-section').remove();
    
    // Create sections for each muscle group
    Object.keys(groupedExercises).forEach(muscleGroup => {
      const sectionId = muscleGroup.toLowerCase().replace(/\s+/g, '-');
      const exercisesHtml = groupedExercises[muscleGroup].map(ex => 
        `<div class="exercise-item p-2" data-exercise-id="${ex.exercise_id}">
          <strong>${ex.exercise_name}</strong>
          <div class="text-muted text-small">${ex.description || 'No description'}</div>
          <button class="btn btn-sm btn-outline-primary mt-1" onclick="ExerciseService.addToWorkout(${ex.exercise_id})">
            Add to Workout
          </button>
        </div>`
      ).join('');
      
      const section = `
        <div class="col-md-6 exercise-category-section">
          <div class="card">
            <div class="card-header">
              <h3>${muscleGroup}</h3>
            </div>
            <div class="card-body">
              ${exercisesHtml}
            </div>
          </div>
        </div>
      `;
      
      $('#exercise-library .row').first().append(section);
    });
  },

  filterExercises: function(searchTerm) {
    if (!ExerciseService.allExercises) return;
    
    $('.exercise-item').each(function() {
      const exerciseText = $(this).text().toLowerCase();
      $(this).toggle(exerciseText.includes(searchTerm));
    });
    
    // Also hide/show entire sections if empty
    $('.exercise-category-section').each(function() {
      const hasVisible = $(this).find('.exercise-item:visible').length > 0;
      $(this).toggle(hasVisible);
    });
  },

    getAllExercises: function(callback, error_callback) {
    
    RestClient.get('exercises', 
      function(exercises) {
        if (callback) callback(exercises);
      }, 
      function(error) {
        console.error("❌ Error loading exercises:", error);
        if (error_callback) error_callback(error);
        else Utils.showToast("Failed to load exercises", "error");
      }
    );
  },

  addToWorkout: function(exerciseId) {
    // Find the exercise
    const exercise = ExerciseService.allExercises.find(e => e.exercise_id == exerciseId);
    if (!exercise) return;
    
    Utils.showToast(`Added ${exercise.exercise_name} to workout`, "success");
    
    // If on workout log page, auto-add it
    if (window.location.hash === '#workout-log') {
      // Add a new exercise entry with this exercise pre-selected
      const exerciseHtml = `
        <div class="exercise-entry">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label">Exercise</label>
                <select class="form-select exercise-name">
                  <option value="${exercise.exercise_id}" selected>${exercise.exercise_name}</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label class="form-label">Sets</label>
                <input type="number" class="form-input sets" min="1" value="3">
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label">Reps</label>
                <input type="number" class="form-input reps" min="1" value="10">
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label class="form-label">Weight (kg)</label>
                <input type="number" class="form-input weight" min="0" value="50">
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-danger btn-sm remove-exercise">Remove Exercise</button>
        </div>
      `;
      
      $('#exercise-section').append(exerciseHtml);
    }
  },

  // Admin functions
  addExercise: function(exerciseData) {
    Utils.blockUI("Adding exercise...");
    RestClient.post('exercises', exerciseData, function(response) {
      Utils.unblockUI();
      Utils.showToast("Exercise added successfully", "success");
      ExerciseService.loadExercises(); // Refresh list
    }, function(error) {
      Utils.unblockUI();
      Utils.showToast(error.responseJSON?.error || "Failed to add exercise", "error");
    });
  }
};