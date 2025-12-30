
let WorkoutLogService = {
    exerciseCounter: 1,
    editWorkoutId: null,

    init: function() {
        console.log("WorkoutLogService initialized");
        this.setupEventListeners();
        this.setupPage(); 
    },

    setupEventListeners: function() {
        const self = this; 
        
        
        $(document).on('spapp_ready', (e, view) => {
            if (view === 'workout-log') {
                self.onPageLoad(); 
            }
        });
        
        
        $(document).on('click', '#add-exercise', function() {
            self.addExerciseRow(); 
        });
        
        
        $(document).on('click', '.remove-exercise', function() {
            const $entry = $(this).closest('.exercise-entry');
            if ($entry.siblings('.exercise-entry').length > 0) {
                $entry.remove();
                self.renumberExerciseFields(); 
            } else {
                Utils.showToast('You must have at least one exercise', 'warning');
            }
        });
    },

    setupPage: function() {
        console.log("Setting up workout log page");
        
    },

    onPageLoad: function() {
        console.log("Workout log page loaded");
        
        
        const user = AuthService.getCurrentUser();
        if (!user) {
            window.location.hash = 'login';
            return;
        }
        
        
        this.editWorkoutId = localStorage.getItem('edit_workout_id');
        if (this.editWorkoutId) {
            this.loadWorkoutForEdit(this.editWorkoutId);
            localStorage.removeItem('edit_workout_id'); 
        }
        
        
        const today = new Date().toISOString().split('T')[0];
        $('#workout-date').val(today);
        
        
        this.loadExercises();
        
        
        this.initializeWorkoutForm();
        
        
        if (this.editWorkoutId) {
            $('h2').text('Edit Workout');
        }
    },

    renumberExerciseFields: function() {
        const exerciseEntries = document.querySelectorAll('.exercise-entry');
        exerciseEntries.forEach((entry, index) => {
            
            const inputs = entry.querySelectorAll('[name^="exercises["]');
            inputs.forEach(input => {
                const name = input.getAttribute('name');
                const newName = name.replace(/exercises\[\d+\]/, `exercises[${index}]`);
                input.setAttribute('name', newName);
            });
        });
        this.exerciseCounter = exerciseEntries.length;
    },

    loadExercises: function() {
        RestClient.get('exercises', (exercises) => {
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

    initializeWorkoutForm: function() {
        $('#workout-form').validate({
            rules: {
                workout_date: 'required',
                workout_type: 'required',
                'exercises[0][exercise_id]': 'required',
                'exercises[0][sets]': {
                    required: true,
                    min: 1,
                    max: 20
                },
                'exercises[0][reps]': {
                    required: true,
                    min: 1,
                    max: 50
                }
            },
            messages: {
                workout_date: 'Please select a workout date',
                workout_type: 'Please select a workout type',
                'exercises[0][exercise_id]': 'Please select an exercise',
                'exercises[0][sets]': {
                    required: 'Please enter number of sets',
                    min: 'Minimum 1 set',
                    max: 'Maximum 20 sets'
                },
                'exercises[0][reps]': {
                    required: 'Please enter number of reps',
                    min: 'Minimum 1 rep',
                    max: 'Maximum 50 reps'
                }
            },
            submitHandler: (form) => {
                this.saveWorkout(form);
            }
        });
    },

    addExerciseRow: function() {
        const exerciseHtml = `
            <div class="exercise-entry mb-3 p-3 border rounded">
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label">Exercise *</label>
                            <select class="form-select exercise-name" name="exercises[${this.exerciseCounter}][exercise_id]" required>
                                <option value="">Select exercise...</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="form-group">
                            <label class="form-label">Sets *</label>
                            <input type="number" class="form-input sets" name="exercises[${this.exerciseCounter}][sets]" min="1" max="20" value="3" required>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label">Reps *</label>
                            <input type="number" class="form-input reps" name="exercises[${this.exerciseCounter}][reps]" min="1" max="50" value="10" required>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label class="form-label">Weight (kg)</label>
                            <input type="number" step="0.5" class="form-input weight" name="exercises[${this.exerciseCounter}][weight_kg]" min="0" placeholder="Optional">
                        </div>
                    </div>
                </div>
                <div class="mt-2">
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <input type="text" class="form-input" name="exercises[${this.exerciseCounter}][notes]" placeholder="Notes for this exercise">
                    </div>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-exercise mt-2">Remove Exercise</button>
            </div>
        `;
        
        $('#exercise-section').append(exerciseHtml);
        
        
        const newSelect = $('#exercise-section .exercise-entry:last-child .exercise-name');
        this.loadExercisesForSelect(newSelect);
        
        this.exerciseCounter++;
    },

    loadExercisesForSelect: function(selectElement) {
        RestClient.get('exercises', (exercises) => {
            exercises.forEach(exercise => {
                const option = $('<option></option>');
                option.val(exercise.exercise_id);
                option.text(exercise.exercise_name + (exercise.muscle_group ? ` (${exercise.muscle_group})` : ''));
                selectElement.append(option);
            });
        });
    },

    loadWorkoutForEdit: function(workoutId) {
        console.log("Loading workout for edit:", workoutId);
        Utils.blockUI("Loading workout...");
        
        RestClient.get(`workouts/${workoutId}`, (workout) => {
            if (!workout) {
                Utils.unblockUI();
                Utils.showToast("Workout not found", "error");
                return;
            }
            
            
            $('#workout-date').val(workout.workout_date);
            $('#workout-type').val(workout.workout_type);
            $('#duration-minutes').val(workout.duration_minutes || '');
            $('#workout-notes').val(workout.notes || '');
            
            
            RestClient.get(`workout-exercises/workout/${workoutId}`, (exercises) => {
                Utils.unblockUI();
                
                
                $('.exercise-entry').not(':first').remove();
                this.exerciseCounter = 1;
                
                
                if (exercises && exercises.length > 0) {
                    
                    const firstExercise = exercises[0];
                    $('[name="exercises[0][exercise_id]"]').val(firstExercise.exercise_id);
                    $('[name="exercises[0][sets]"]').val(firstExercise.sets);
                    $('[name="exercises[0][reps]"]').val(firstExercise.reps);
                    $('[name="exercises[0][weight_kg]"]').val(firstExercise.weight_kg || '');
                    $('[name="exercises[0][notes]"]').val(firstExercise.notes || '');
                    
                    
                    for (let i = 1; i < exercises.length; i++) {
                        this.addExerciseRow();
                        const ex = exercises[i];
                        
                        
                        const rowIndex = $('.exercise-entry').length - 1;
                        $(`[name="exercises[${rowIndex}][exercise_id]"]`).val(ex.exercise_id);
                        $(`[name="exercises[${rowIndex}][sets]"]`).val(ex.sets);
                        $(`[name="exercises[${rowIndex}][reps]"]`).val(ex.reps);
                        $(`[name="exercises[${rowIndex}][weight_kg]"]`).val(ex.weight_kg || '');
                        $(`[name="exercises[${rowIndex}][notes]"]`).val(ex.notes || '');
                    }
                }
                
                
                this.editWorkoutId = workoutId;
                
                Utils.showToast("Workout loaded for editing", "success");
            }, (error) => {
                Utils.unblockUI();
                Utils.showToast("Failed to load exercises", "error");
            });
        }, (error) => {
            Utils.unblockUI();
            Utils.showToast("Failed to load workout", "error");
        });
    },

    saveWorkout: function(form) {
    console.log("saveWorkout called, edit mode:", this.editWorkoutId);
    
    const formData = new FormData(form);
    const data = {};
    
    
    for (let [key, value] of formData.entries()) {
        if (key === 'workout_date' || key === 'workout_type' || key === 'notes') {
            data[key] = value;
        } else if (key === 'duration_minutes' && value) {
            data[key] = parseInt(value);
        }
    }
    
    
    const exercises = [];
    const exerciseMap = {};
    
    for (let [key, value] of formData.entries()) {
        const match = key.match(/exercises\[(\d+)\]\[(\w+)\]/);
        if (match) {
            const index = parseInt(match[1]);
            const field = match[2];
            
            if (!exerciseMap[index]) {
                exerciseMap[index] = {};
            }
            
            
            if (['sets', 'reps', 'weight_kg'].includes(field)) {
                exerciseMap[index][field] = value ? parseFloat(value) : null;
            } else if (field === 'exercise_id') {
                exerciseMap[index][field] = parseInt(value);
            } else {
                exerciseMap[index][field] = value;
            }
        }
    }
    
    
    Object.values(exerciseMap).forEach(exercise => {
        if (exercise.exercise_id) {
            exercises.push(exercise);
        }
    });
    
    console.log("Workout data to send:", data);
    console.log("Exercises to send:", exercises);
    
    const user = AuthService.getCurrentUser();
    if (user) {
        data.user_id = user.user_id;
    }
    
    Utils.blockUI("Saving workout...");
    
    if (this.editWorkoutId) {
        
        this.updateWorkout(this.editWorkoutId, data, exercises);
    } else {
        
        this.createWorkout(data, exercises);
    }
},

    createWorkout: function(data) {
        RestClient.post('workouts', data, (response) => {
            const workoutId = response.workout_id || response.data?.workout_id;
            
            if (data.exercises && data.exercises.length > 0 && workoutId) {
                this.saveWorkoutExercises(workoutId, data.exercises);
            } else {
                Utils.unblockUI();
                Utils.showToast("Workout saved successfully!", "success");
                window.location.hash = 'workout-history';
            }
        }, (error) => {
            Utils.unblockUI();
            const errorMsg = error.responseJSON?.error || error.responseText || "Failed to save workout";
            Utils.showToast(errorMsg, "error");
        });
    },

    updateWorkout: function(workoutId, data) {
        
        RestClient.put(`workouts/${workoutId}`, {
            workout_date: data.workout_date,
            workout_type: data.workout_type,
            duration_minutes: data.duration_minutes,
            notes: data.notes
        }, (workoutResponse) => {
            
            RestClient.delete(`workout-exercises/workout/${workoutId}`, null, () => {
                
                if (data.exercises && data.exercises.length > 0) {
                    this.saveWorkoutExercises(workoutId, data.exercises);
                } else {
                    Utils.unblockUI();
                    Utils.showToast("Workout updated successfully!", "success");
                    window.location.hash = 'workout-history';
                }
            }, (error) => {
                Utils.unblockUI();
                Utils.showToast("Failed to update workout exercises", "error");
            });
        }, (error) => {
            Utils.unblockUI();
            const errorMsg = error.responseJSON?.error || error.responseText || "Failed to update workout";
            Utils.showToast(errorMsg, "error");
        });
    },

    saveWorkoutExercises: function(workoutId, exercises) {
        let exercisesSaved = 0;
        const totalExercises = exercises.length;
        
        exercises.forEach((exercise, index) => {
            exercise.workout_id = workoutId;
            
            RestClient.post('workout-exercises', exercise, (exResponse) => {
                exercisesSaved++;
                if (exercisesSaved === totalExercises) {
                    Utils.unblockUI();
                    Utils.showToast(`Workout ${this.editWorkoutId ? 'updated' : 'saved'} with ${totalExercises} exercises!`, "success");
                    window.location.hash = 'workout-history';
                }
            }, (exError) => {
                exercisesSaved++;
                console.warn(`Failed to save exercise ${index + 1}:`, exError);
                if (exercisesSaved === totalExercises) {
                    Utils.unblockUI();
                    Utils.showToast(`Workout ${this.editWorkoutId ? 'updated' : 'saved'}, but some exercises failed`, "warning");
                    window.location.hash = 'workout-history';
                }
            });
        });
    }
};


window.WorkoutLogService = WorkoutLogService;


$(document).ready(function() {
    
    const service = WorkoutLogService;
    
    if (window.location.hash === '#workout-log' || $('#workout-log').length) {
        service.init();
    }
});