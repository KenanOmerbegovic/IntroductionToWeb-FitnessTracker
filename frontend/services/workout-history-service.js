let WorkoutHistoryService = {
    workoutsTable: null,
    allWorkouts: [],
    currentWorkoutId: null,

    init: function() {
        console.log("WorkoutHistoryService initialized");
        
        
        $(document).ready(() => {
            $('#search-button').off('click').click(() => this.filterWorkouts());
            $('#workout-search').off('keyup').keyup((e) => {
                if (e.key === 'Enter') this.filterWorkouts();
            });
            $('#workout-filter').off('change').change(() => this.filterWorkouts());
            $('#confirm-delete').off('click').click(() => this.confirmDeleteWorkout());
        });
        
        
        this.onPageLoad();
    },

    onPageLoad: function() {
        console.log('Workout history page loaded');
        
        
        const user = UserService.getCurrentUser();
        if (!user) {
            window.location.hash = 'login';
            return;
        }
        
        
        this.loadWorkouts();
    },

   loadWorkouts: function() {
    console.log("Loading workouts...");
    
    const user = AuthService.getCurrentUser();
    if (!user) {
        console.error("No user found - redirecting to login");
        Utils.showToast('Please log in to view workout history', 'error');
        window.location.hash = 'login';
        return;
    }
    
    console.log("Current user ID:", user.user_id);
    
    
    Utils.blockUI("Loading workouts...");
    console.log("UI Blocked for loading workouts");
    
    
    RestClient.get(`workouts/user/${user.user_id}`, 
        (workouts) => {
            console.log("Workouts API Response received");
            console.log("Workouts:", workouts);
            console.log("Is array?", Array.isArray(workouts));
            
            
            Utils.unblockUI();
            console.log("UI Unblocked");
            
            if (!workouts) {
                console.error("No workouts data received");
                this.showNoWorkoutsMessage();
                return;
            }
            
            this.allWorkouts = Array.isArray(workouts) ? workouts : [];
            console.log("Processed workouts:", this.allWorkouts.length, "workouts");
            
            if (this.allWorkouts.length === 0) {
                this.showNoWorkoutsMessage();
            } else {
                this.initializeDataTable();
            }
        }, 
        (error) => {
            console.error('Error loading workouts:', error);
            
            
            Utils.unblockUI();
            console.log("UI Unblocked after error");
            
            Utils.showToast('Failed to load workouts', 'error');
            this.showNoWorkoutsMessage();
        }
    );
},

    showNoWorkoutsMessage: function() {
        $('#workouts-table tbody').html(`
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        No workouts found. 
                        <a href="#workout-log" class="alert-link">Log your first workout!</a>
                    </div>
                </td>
            </tr>
        `);
        $('#workout-count').text('No workouts found');
    },

    initializeDataTable: function() {
        console.log("Initializing DataTable with", this.allWorkouts.length, "workouts");
        
        if (this.workoutsTable && $.fn.DataTable.isDataTable('#workouts-table')) {
            this.workoutsTable.destroy();
        }
        
        this.workoutsTable = $('#workouts-table').DataTable({
            data: this.allWorkouts,
            columns: [
                { 
                    data: 'workout_date',
                    title: 'Date',
                    render: (data) => {
                        if (!data) return 'N/A';
                        try {
                            return new Date(data).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                        } catch (e) {
                            return data;
                        }
                    }
                },
                { 
                    data: 'workout_type',
                    title: 'Type',
                    render: (data) => {
                        const types = {
                            chest: '<span class="badge bg-primary">Chest Day</span>',
                            legs: '<span class="badge bg-success">Leg Day</span>',
                            back: '<span class="badge bg-warning">Back Day</span>',
                            shoulders: '<span class="badge bg-info">Shoulders Day</span>',
                            arms: '<span class="badge bg-danger">Arms Day</span>',
                            cardio: '<span class="badge bg-secondary">Cardio</span>',
                            full_body: '<span class="badge bg-dark">Full Body</span>',
                            custom: '<span class="badge bg-light text-dark">Custom</span>'
                        };
                        return types[data] || `<span class="badge bg-secondary">${data || 'Custom'}</span>`;
                    }
                },
                { 
                    data: 'duration_minutes',
                    title: 'Duration',
                    render: (data) => {
                        return data ? `${data} min` : 'N/A';
                    }
                },
                { 
                 data: null,
                  title: 'Exercises',
                 render: (data, type, row) => {
                  return '—';
                 }
                },
                { 
                    data: 'notes',
                    title: 'Notes',
                    render: (data) => {
                        if (!data || data.trim() === '') return '—';
                        return data.length > 50 ? 
                            `<span title="${data}">${data.substring(0, 47)}...</span>` : 
                            data;
                    }
                },
                { 
                    data: 'workout_id',
                    title: 'Actions',
                    render: (data, type, row) => {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-primary" onclick="WorkoutHistoryService.viewWorkoutDetails(${data})" 
                                    title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-warning" onclick="WorkoutHistoryService.editWorkout(${data})"
                                    title="Edit Workout">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger" onclick="WorkoutHistoryService.deleteWorkout(${data})"
                                    title="Delete Workout">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                    },
                    orderable: false,
                    searchable: false
                }
            ],
            pageLength: 10,
            lengthMenu: [5, 10, 25, 50],
            order: [[0, 'desc']],
            responsive: true,
            dom: '<"top"lf>rt<"bottom"ip><"clear">',
            language: {
                emptyTable: "No workouts found",
                search: "Search:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ workouts",
                infoEmpty: "Showing 0 to 0 of 0 workouts",
                infoFiltered: "(filtered from _MAX_ total workouts)",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            },
            initComplete: () => {
                this.updateWorkoutCount();
                console.log("DataTable initialized successfully");
            }
        });
        
        this.workoutsTable.on('draw.dt', () => {
            this.updateWorkoutCount();
        });
    },

    filterWorkouts: function() {
        if (!this.workoutsTable) {
            console.error("DataTable not initialized");
            return;
        }
        
        const searchTerm = $('#workout-search').val().toLowerCase();
        const filterValue = $('#workout-filter').val();
        
        this.workoutsTable.search('');
        this.workoutsTable.columns().search('');
        
        if (searchTerm) {
            this.workoutsTable.search(searchTerm);
        }
        
        if (filterValue && filterValue !== 'all') {
            this.workoutsTable.column(1).search(filterValue);
        }
        
        this.workoutsTable.draw();
    },

    updateWorkoutCount: function() {
        if (!this.workoutsTable) return;
        
        const totalRecords = this.workoutsTable.rows().count();
        const filteredRecords = this.workoutsTable.rows({ search: 'applied' }).count();
        
        let countText = '';
        if (filteredRecords === totalRecords) {
            countText = `Showing ${totalRecords} workout${totalRecords !== 1 ? 's' : ''}`;
        } else {
            countText = `Showing ${filteredRecords} of ${totalRecords} workout${totalRecords !== 1 ? 's' : ''}`;
        }
        
        $('#workout-count').text(countText);
    },

    viewWorkoutDetails: function(workoutId) {
    this.currentWorkoutId = workoutId;
    
    Utils.blockUI("Loading workout details...");
    
    RestClient.get(`workouts/${workoutId}`, 
        (workout) => {
            if (!workout) {
                Utils.unblockUI();
                Utils.showToast("Workout not found", "error");
                return;
            }
            
            
            RestClient.get(`workout-exercises/workout/${workoutId}`, 
                (exercises) => {
                    Utils.unblockUI();
                    
                    
                    let exercisesHtml = '';
                    if (exercises && exercises.length > 0) {
                        exercisesHtml = `
                            <h5 class="mt-3">Exercises:</h5>
                            <div class="table-responsive">
                                <table class="table table-sm table-hover">
                                    <thead>
                                        <tr>
                                            <th>Exercise</th>
                                            <th>Sets</th>
                                            <th>Reps</th>
                                            <th>Weight</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${exercises.map(exercise => `
                                            <tr>
                                                <td>${exercise.exercise_name || 'Unknown Exercise'}</td>
                                                <td>${exercise.sets || 0}</td>
                                                <td>${exercise.reps || 0}</td>
                                                <td>${exercise.weight_kg ? exercise.weight_kg + ' kg' : '—'}</td>
                                                <td>${exercise.notes || '—'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    } else {
                        exercisesHtml = '<p class="text-muted">No exercises recorded for this workout.</p>';
                    }
                    
                    
                    const editButton = `<button class="btn btn-warning mt-3" onclick="WorkoutHistoryService.editWorkout(${workoutId})">
                        <i class="fas fa-edit"></i> Edit Workout
                    </button>`;
                    
                    
                    $('#workout-detail-content').html(`
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Date:</strong> ${new Date(workout.workout_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                                <p><strong>Type:</strong> <span class="badge bg-primary">${workout.workout_type}</span></p>
                                <p><strong>Duration:</strong> ${workout.duration_minutes ? workout.duration_minutes + ' minutes' : 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Created:</strong> ${new Date(workout.created_at).toLocaleString()}</p>
                                ${workout.updated_at ? `<p><strong>Last Updated:</strong> ${new Date(workout.updated_at).toLocaleString()}</p>` : ''}
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <h5>Workout Notes:</h5>
                            <div class="card">
                                <div class="card-body">
                                    ${workout.notes ? workout.notes : '<p class="text-muted mb-0">No notes provided.</p>'}
                                </div>
                            </div>
                        </div>
                        
                        ${exercisesHtml}
                        
                        <div class="mt-4">
                            ${editButton}
                            <button type="button" class="btn btn-secondary mt-3 ms-2" data-bs-dismiss="modal">Close</button>
                        </div>
                    `);
                    
                    
                    const modal = new bootstrap.Modal(document.getElementById('workoutDetailModal'));
                    modal.show();
                },
                (error) => {
                    Utils.unblockUI();
                    console.error("Failed to load exercises:", error);
                    
                    
                    $('#workout-detail-content').html(`
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i> Could not load exercises for this workout.
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Date:</strong> ${new Date(workout.workout_date).toLocaleDateString()}</p>
                                <p><strong>Type:</strong> <span class="badge bg-primary">${workout.workout_type}</span></p>
                                <p><strong>Duration:</strong> ${workout.duration_minutes ? workout.duration_minutes + ' minutes' : 'N/A'}</p>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h5>Workout Notes:</h5>
                            <div class="card">
                                <div class="card-body">
                                    ${workout.notes ? workout.notes : '<p class="text-muted mb-0">No notes provided.</p>'}
                                </div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <button class="btn btn-warning" onclick="WorkoutHistoryService.editWorkout(${workoutId})">
                                <i class="fas fa-edit"></i> Edit Workout
                            </button>
                            <button type="button" class="btn btn-secondary mt-3 ms-2" data-bs-dismiss="modal">Close</button>
                        </div>
                    `);
                    
                    const modal = new bootstrap.Modal(document.getElementById('workoutDetailModal'));
                    modal.show();
                }
            );
        },
        (error) => {
            Utils.unblockUI();
            Utils.showToast("Failed to load workout details", "error");
            console.error("Error loading workout:", error);
        }
    );
},

    editWorkout: function(workoutId) {
        localStorage.setItem('edit_workout_id', workoutId);
        window.location.hash = 'workout-log';
    },

    deleteWorkout: function(workoutId) {
    console.log("=== DELETE WORKOUT START ===");
    console.log("Workout ID:", workoutId);
    
    
    this.currentWorkoutId = workoutId;
    
    
    const deleteInput = document.getElementById('workout-to-delete');
    if (deleteInput) {
        deleteInput.value = workoutId;
    }
    
    
    const modalElement = document.getElementById('deleteWorkoutModal');
    
    
    modalElement.style.position = 'fixed';
    modalElement.style.top = '0';
    modalElement.style.left = '0';
    modalElement.style.width = '100%';
    modalElement.style.height = '100%';
    modalElement.style.zIndex = '99999';
    modalElement.style.display = 'none';
    modalElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
    
    
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade';
        document.body.appendChild(backdrop);
    }
    
    
    modalElement.style.display = 'block';
    modalElement.classList.add('show');
    backdrop.classList.add('show');
    document.body.classList.add('modal-open');
    
    
    const modalDialog = modalElement.querySelector('.modal-dialog');
    if (modalDialog) {
        modalDialog.style.margin = 'auto';
        modalDialog.style.marginTop = '20vh';
    }
    
    console.log("=== DELETE WORKOUT END ===");
},

confirmDeleteWorkout: function() {
    const workoutId = $('#workout-to-delete').val();
    
    if (!workoutId) {
        Utils.showToast("No workout selected for deletion", "error");
        return;
    }
    
    console.log("Confirming deletion of workout:", workoutId);
    
    Utils.blockUI("Deleting workout...");
    
    RestClient.delete(`workouts/${workoutId}`, null, 
        (response) => {
            Utils.unblockUI();
            console.log("Delete successful:", response);
            
            
            const modalElement = document.getElementById('deleteWorkoutModal');
            if (modalElement) {
                
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                    
                    
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                    document.body.classList.remove('modal-open');
                }
            }
            
            
            this.allWorkouts = this.allWorkouts.filter(w => w.workout_id != workoutId);
            
            
            if (this.workoutsTable && $.fn.DataTable.isDataTable('#workouts-table')) {
                this.workoutsTable.clear();
                this.workoutsTable.rows.add(this.allWorkouts);
                this.workoutsTable.draw();
                this.updateWorkoutCount();
            }
            
            Utils.showToast('Workout deleted successfully', 'success');
        }, 
        (error) => {
            Utils.unblockUI();
            console.error("Delete failed:", error);
            
            const errorMsg = error.responseJSON?.error || error.responseText || 'Failed to delete workout';
            Utils.showToast(errorMsg, 'error');
        }
    );
},

    setupPage: function() {
        console.log("Setting up workout history page");
        this.init();
    }
};

$(document).ready(() => {
    if (window.location.hash === '#workout-history' || $('#workout-history').length) {
        WorkoutHistoryService.setupPage();
    }
});