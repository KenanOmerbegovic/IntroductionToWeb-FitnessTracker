// frontend/services/progress-service.js
let ProgressService = {
    
    init: function() {
       
    },

    onCreate: function() {
    
    this.loadData();
    
    setTimeout(() => {
        const container = $('#personal-records-list');
        const containerHtml = container.html();
        
        if (containerHtml.includes('Loading') || containerHtml.includes('Loading')) {
            this.loadPersonalRecords();
        }
    }, 2000);
},

    loadData: function() {

    if (!AuthService.isAuthenticated()) {
        window.location.hash = 'login';
        return;
    }

    this.updateGreeting();
   
    
    WorkoutService.getUserWorkouts((workouts) => {
        this.updateWorkoutStatistics(workouts);
        setTimeout(() => {
            this.loadPersonalRecords();
        }, 500);
        
    }, (error) => {
        console.error('Error loading workouts:', error);
        Utils.showToast('Failed to load workouts', 'error');
    });
},

    updateGreeting: function() {
        const user = AuthService.getCurrentUser();
        if (user && user.full_name) {
            $('#progress-greeting').text(`Progress overview for ${user.full_name}`);
        }
    },

    updateWorkoutStatistics: function(workouts) {
        if (!workouts || workouts.length === 0) {
            this.setDefaultStatistics();
            return;
        }
        
        $('#total-workouts-count').text(workouts.length);
        
        const thisWeekWorkouts = this.getThisWeekWorkouts(workouts);
        $('#this-week-count').text(thisWeekWorkouts);
        
        const totalExercises = this.getTotalUniqueExercises(workouts);
        $('#total-exercises').text(totalExercises);
        
        const activeDays = thisWeekWorkouts; 
        $('#active-days').text(activeDays + "/7");
    },

    getThisWeekWorkouts: function(workouts) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday start
        startOfWeek.setHours(0, 0, 0, 0);
        
        const thisWeekWorkouts = workouts.filter(workout => {
            const workoutDate = new Date(workout.workout_date);
            return workoutDate >= startOfWeek;
        });
        
        return thisWeekWorkouts.length;
    },

    getTotalUniqueExercises: function(workouts) {
        const uniqueExercises = new Set();
        
        workouts.forEach(workout => {
            if (workout.workout_exercises) {
                workout.workout_exercises.forEach(we => {
                    if (we.exercise_id) {
                        uniqueExercises.add(we.exercise_id);
                    }
                });
            }
        });
        
        return uniqueExercises.size;
    },

    

    loadPersonalRecords: function() {
    
    // Use the exact same code that worked in the test
    if (!PersonalRecordService || typeof PersonalRecordService.getRecentRecords !== 'function') {
        console.error("❌ PersonalRecordService.getRecentRecords not available!");
        this.displayPersonalRecords([]);
        return;
    }
    
    PersonalRecordService.getRecentRecords(10, 
        // Success callback
        (records) => {
            this.displayPersonalRecords(records);
        },
        // Error callback
        (error) => {
            this.displayPersonalRecords([]);
        }
    );
},

    displayPersonalRecords: function(records) {
    
    const container = $('#personal-records-list');

    
    if (!records || !Array.isArray(records) || records.length === 0) {
        container.html(`
            <div class="text-center p-3">
                <i class="fas fa-trophy fa-3x text-muted mb-3"></i>
                <h4>No Personal Records Yet</h4>
                <p class="text-muted">Complete some workouts to set your first personal records!</p>
            </div>
        `);
        return;
    }
    let simpleHtml = `<p>Found ${records.length} records:</p><ul>`;
    
    records.forEach((record, index) => {
        simpleHtml += `<li>${record.exercise_name || 'Unknown'} - ${record.max_weight_kg}kg x ${record.reps_achieched}</li>`;
    });
    
    simpleHtml += '</ul>';
    container.html(simpleHtml);
    
    // If simple works, then try the table
    setTimeout(() => {
        let html = '<div class="table-responsive"><table class="table table-hover table-sm">';
        html += '<thead class="table-light"><tr><th>Exercise</th><th>Record</th><th>Date</th><th>Notes</th></tr></thead><tbody>';
        
        records.forEach(record => {
            const exerciseName = record.exercise_name || 'Unknown Exercise';
            const maxWeight = record.max_weight_kg || '0';
            const reps = record.reps_achieved || '0';
            const notes = record.notes || '-';
            
            let dateStr = 'Unknown';
            if (record.achieved_date) {
                try {
                    const date = new Date(record.achieved_date);
                    dateStr = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                } catch (e) {
                    console.error("Date parsing error:", e);
                }
            }
            
            html += `
                <tr>
                    <td><strong>${exerciseName}</strong></td>
                    <td>
                        <span class="badge bg-success">${maxWeight} kg</span> 
                        × 
                        <span class="badge bg-info">${reps} reps</span>
                    </td>
                    <td>${dateStr}</td>
                    <td><small class="text-muted">${notes}</small></td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        
        container.html(html);
    }, 1000);
    
},
};

// Initialize when document is ready
$(document).ready(() => {
    ProgressService.init();
});