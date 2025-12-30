
let AdminService = {
    deleteType: null,
    deleteId: null,

    init: function() {
        console.log("AdminService initialized");
        
        
        const user = AuthService.getCurrentUser();
        if (!user || user.role?.toLowerCase() !== 'admin') {
            Utils.showToast('Access denied. Admin only.', 'error');
            window.location.hash = 'dashboard';
            return;
        }
        
        this.loadAdminData();
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        const self = this;
        
        
        $(document).on('click', '#confirm-delete-item', function() {
            self.executeDelete();
        });
        
        
        $(document).on('click', '#add-user-btn', function() {
            self.showAddUserModal();
        });
        
        
        $(document).on('click', '#add-exercise-btn', function() {
            self.showAddExerciseModal();
        });
        
        
        $(document).on('click', '#add-category-btn', function() {
            self.showAddCategoryModal();
        });
        
        
        $(document).on('click', '#submit-add-user', function() {
            self.addUser();
        });
        
        $(document).on('click', '#submit-add-exercise', function() {
            self.addExercise();
        });
        
        $(document).on('click', '#submit-add-category', function() {
            self.addCategory();
        });
        
        
        $(document).on('keypress', '#add-user-form input, #add-exercise-form input, #add-category-form input', function(e) {
            if (e.which === 13) { 
                e.preventDefault();
                const formId = $(this).closest('form').attr('id');
                switch(formId) {
                    case 'add-user-form':
                        self.addUser();
                        break;
                    case 'add-exercise-form':
                        self.addExercise();
                        break;
                    case 'add-category-form':
                        self.addCategory();
                        break;
                }
            }
        });
    },

    loadAdminData: function() {
        console.log("Loading admin data...");
        this.loadUsers();
        this.loadExercises();
        this.loadCategories();
        this.loadAnalytics();
    },

    loadUsers: function() {
        console.log("Loading users...");
        
        RestClient.get('users', (users) => {
            console.log("Users loaded:", users);
            
            if ($.fn.DataTable.isDataTable('#users-table')) {
                $('#users-table').DataTable().destroy();
            }
            
            $('#users-table').DataTable({
                data: users,
                columns: [
                    { data: 'user_id' },
                    { data: 'full_name' },
                    { data: 'email' },
                    { 
                        data: 'role',
                        render: function(data) {
                            const roles = {
                                'user': '<span class="badge bg-secondary">User</span>',
                                'admin': '<span class="badge bg-danger">Admin</span>',
                                'trainer': '<span class="badge bg-warning">Trainer</span>'
                            };
                            return roles[data] || `<span class="badge bg-light text-dark">${data}</span>`;
                        }
                    },
                    { 
                        data: 'created_at',
                        render: function(data) {
                            return data ? new Date(data).toLocaleDateString() : '—';
                        }
                    },
                    { 
                        data: null,
                        defaultContent: '<span class="badge bg-success">Active</span>'
                    },
                    { 
                        data: 'user_id',
                        render: function(data, type, row) {
                            return `
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-primary" onclick="AdminService.editUser(${data})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger" onclick="AdminService.confirmDelete('user', ${data}, 'user')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                        }
                    }
                ],
                language: {
                    emptyTable: "No users found",
                    info: "Showing _START_ to _END_ of _TOTAL_ users",
                    search: "Search users..."
                },
                order: [[0, 'desc']] 
            });
        }, (error) => {
            console.error("Failed to load users:", error);
            Utils.showToast("Failed to load users", "error");
            
            
            $('#users-table tbody').html(`
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Failed to load users. Please try again.
                    </td>
                </tr>
            `);
        });
    },

    loadExercises: function() {
        console.log("Loading exercises...");
        
        RestClient.get('exercises', (exercises) => {
            console.log("Exercises loaded:", exercises);
            
            if ($.fn.DataTable.isDataTable('#exercises-table')) {
                $('#exercises-table').DataTable().destroy();
            }
            
            $('#exercises-table').DataTable({
                data: exercises,
                columns: [
                    { data: 'exercise_id' },
                    { data: 'exercise_name' },
                    { 
                        data: 'muscle_group',
                        render: function(data) {
                            if (!data) return '—';
                            const groups = {
                                'chest': '<span class="badge bg-danger">Chest</span>',
                                'legs': '<span class="badge bg-success">Legs</span>',
                                'back': '<span class="badge bg-primary">Back</span>',
                                'shoulders': '<span class="badge bg-warning">Shoulders</span>',
                                'arms': '<span class="badge bg-info">Arms</span>',
                                'core': '<span class="badge bg-secondary">Core</span>',
                                'cardio': '<span class="badge bg-dark">Cardio</span>'
                            };
                            return groups[data] || `<span class="badge bg-light text-dark">${data}</span>`;
                        }
                    },
                    { 
                        data: 'category_id',
                        render: function(data) {
                            return data ? `ID: ${data}` : '—';
                        }
                    },
                    { 
                        data: 'created_at',
                        render: function(data) {
                            return data ? new Date(data).toLocaleDateString() : '—';
                        }
                    },
                    { 
                        data: 'exercise_id',
                        render: function(data, type, row) {
                            return `
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-primary" onclick="AdminService.editExercise(${data})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger" onclick="AdminService.confirmDelete('exercise', ${data}, 'exercise')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                        }
                    }
                ],
                language: {
                    emptyTable: "No exercises found",
                    info: "Showing _START_ to _END_ of _TOTAL_ exercises",
                    search: "Search exercises..."
                },
                order: [[0, 'desc']]
            });
        }, (error) => {
            console.error("Failed to load exercises:", error);
            Utils.showToast("Failed to load exercises", "error");
        });
    },

    loadCategories: function() {
        console.log("Loading categories...");
        
        RestClient.get('exercise-categories', (categories) => {
            console.log("Categories loaded:", categories);
            
            if ($.fn.DataTable.isDataTable('#categories-table')) {
                $('#categories-table').DataTable().destroy();
            }
            
            $('#categories-table').DataTable({
                data: categories,
                columns: [
                    { data: 'category_id' },
                    { data: 'category_name' },
                    { 
                        data: 'description',
                        render: function(data) {
                            return data || '—';
                        }
                    },
                    { 
                        data: null,
                        defaultContent: '0'
                    },
                    { 
                        data: 'category_id',
                        render: function(data, type, row) {
                            return `
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-primary" onclick="AdminService.editCategory(${data})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger" onclick="AdminService.confirmDelete('category', ${data}, 'category')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                        }
                    }
                ],
                language: {
                    emptyTable: "No categories found",
                    info: "Showing _START_ to _END_ of _TOTAL_ categories",
                    search: "Search categories..."
                },
                order: [[0, 'desc']]
            });
        }, (error) => {
            console.error("Failed to load categories:", error);
            Utils.showToast("Failed to load categories", "error");
        });
    },

    loadAnalytics: function() {
        console.log("Loading analytics...");
        
        RestClient.get('users', (users) => {
            document.getElementById('total-users').textContent = users.length || 0;
        });
        
        RestClient.get('workouts', (workouts) => {
            document.getElementById('admin-total-workouts').textContent = workouts.length || 0;
            
            RestClient.get('users', (users) => {
                const userCount = users.length || 1;
                const avg = (workouts.length / userCount).toFixed(1);
                document.getElementById('avg-workouts-user').textContent = avg;
            });
        });
        
        
        const today = new Date().toISOString().split('T')[0];
        RestClient.get(`workouts?date=${today}`, (workouts) => {
            document.getElementById('active-today').textContent = workouts.length || 0;
        });
        
        
        this.loadRecentActivity();
    },

    loadRecentActivity: function() {
        
        RestClient.get('workouts?limit=10', (workouts) => {
            const activityContainer = document.getElementById('recent-activity');
            
            if (!workouts || workouts.length === 0) {
                activityContainer.innerHTML = '<div class="text-center p-3 text-muted">No recent activity</div>';
                return;
            }
            
            let activityHtml = '';
            workouts.forEach(workout => {
                const timeAgo = this.getTimeAgo(workout.created_at);
                activityHtml += `
                    <div class="activity-item d-flex align-items-center mb-2 p-2 border-bottom">
                        <div class="flex-grow-1">
                            <strong>Workout #${workout.workout_id}</strong> - ${workout.workout_type}
                            <div class="text-muted small">${timeAgo}</div>
                        </div>
                    </div>
                `;
            });
            
            activityContainer.innerHTML = activityHtml;
        }, (error) => {
            console.error("Failed to load recent activity:", error);
            document.getElementById('recent-activity').innerHTML = 
                '<div class="text-center p-3 text-muted">Unable to load activity</div>';
        });
    },

    getTimeAgo: function(dateString) {
        if (!dateString) return 'Recently';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    },

    showAddUserModal: function() {
        console.log("Showing add user modal");
        const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
        modal.show();
        
        
        document.getElementById('add-user-form').reset();
    },

    addUser: function() {
        console.log("Adding user...");
        
        const form = document.getElementById('add-user-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log("User data:", data);
        
        
        if (!data.full_name || !data.email || !data.password) {
            Utils.showToast("Please fill in all required fields", "error");
            return;
        }
        
        if (data.password.length < 6) {
            Utils.showToast("Password must be at least 6 characters", "error");
            return;
        }
        
        Utils.blockUI("Creating user...");
        
        RestClient.post('auth/register', data, (response) => {
            Utils.unblockUI();
            console.log("User created:", response);
            
            Utils.showToast('User created successfully!', 'success');
            
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            if (modal) modal.hide();
            
            
            form.reset();
            
            
            setTimeout(() => this.loadUsers(), 500);
            
        }, (error) => {
            Utils.unblockUI();
            console.error("Failed to create user:", error);
            
            let errorMsg = "Failed to create user";
            if (error.responseJSON?.error) {
                errorMsg = error.responseJSON.error;
            } else if (error.responseText) {
                errorMsg = error.responseText;
            }
            
            Utils.showToast(errorMsg, "error");
        });
    },

    editUser: function(userId) {
        console.log("Editing user:", userId);
        Utils.showToast(`Edit user ${userId} - Feature coming soon`, 'info');
    },

    showAddExerciseModal: function() {
        console.log("Showing add exercise modal");
        
        
        this.loadCategoriesForExerciseModal();
        
        const modal = new bootstrap.Modal(document.getElementById('addExerciseModal'));
        modal.show();
        
        
        document.getElementById('add-exercise-form').reset();
    },

    loadCategoriesForExerciseModal: function() {
        RestClient.get('exercise-categories', (categories) => {
            const select = document.querySelector('#add-exercise-form select[name="category_id"]');
            if (!select) return;
            
            select.innerHTML = '<option value="">Select category (optional)</option>';
            
            if (categories && categories.length > 0) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_id;
                    option.textContent = category.category_name;
                    select.appendChild(option);
                });
            }
        }, (error) => {
            console.error("Failed to load categories for modal:", error);
        });
    },

    addExercise: function() {
        console.log("Adding exercise...");
        
        const form = document.getElementById('add-exercise-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log("Exercise data:", data);
        
        
        if (!data.exercise_name || !data.muscle_group) {
            Utils.showToast("Please fill in required fields", "error");
            return;
        }
        
        
        if (data.category_id) {
            data.category_id = parseInt(data.category_id);
        }
        
        Utils.blockUI("Creating exercise...");
        
        RestClient.post('exercises', data, (response) => {
            Utils.unblockUI();
            console.log("Exercise created:", response);
            
            Utils.showToast('Exercise created successfully!', 'success');
            
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addExerciseModal'));
            if (modal) modal.hide();
            
            
            form.reset();
            
            
            setTimeout(() => this.loadExercises(), 500);
            
        }, (error) => {
            Utils.unblockUI();
            console.error("Failed to create exercise:", error);
            
            let errorMsg = "Failed to create exercise";
            if (error.responseJSON?.error) {
                errorMsg = error.responseJSON.error;
            } else if (error.responseText) {
                errorMsg = error.responseText;
            }
            
            Utils.showToast(errorMsg, "error");
        });
    },

    editExercise: function(exerciseId) {
        console.log("Editing exercise:", exerciseId);
        Utils.showToast(`Edit exercise ${exerciseId} - Feature coming soon`, 'info');
    },

    showAddCategoryModal: function() {
        console.log("Showing add category modal");
        const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
        modal.show();
        
        
        document.getElementById('add-category-form').reset();
    },

    addCategory: function() {
        console.log("Adding category...");
        
        const form = document.getElementById('add-category-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log("Category data:", data);
        
        
        if (!data.category_name) {
            Utils.showToast("Category name is required", "error");
            return;
        }
        
        Utils.blockUI("Creating category...");
        
        RestClient.post('exercise-categories', data, (response) => {
            Utils.unblockUI();
            console.log("Category created:", response);
            
            Utils.showToast('Category created successfully!', 'success');
            
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
            if (modal) modal.hide();
            
            
            form.reset();
            
            
            setTimeout(() => {
                this.loadCategories();
                this.loadCategoriesForExerciseModal();
            }, 500);
            
        }, (error) => {
            Utils.unblockUI();
            console.error("Failed to create category:", error);
            
            let errorMsg = "Failed to create category";
            if (error.responseJSON?.error) {
                errorMsg = error.responseJSON.error;
            } else if (error.responseText) {
                errorMsg = error.responseText;
            }
            
            Utils.showToast(errorMsg, "error");
        });
    },

    editCategory: function(categoryId) {
        console.log("Editing category:", categoryId);
        Utils.showToast(`Edit category ${categoryId} - Feature coming soon`, 'info');
    },

    confirmDelete: function(type, id, itemName) {
        console.log(`Confirm delete: ${type} ${id}`);
        
        this.deleteType = type;
        this.deleteId = id;
        
        const message = document.getElementById('delete-confirm-message');
        message.textContent = `Are you sure you want to delete this ${itemName}? This action cannot be undone.`;
        
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    },

    executeDelete: function() {
        if (!this.deleteType || !this.deleteId) {
            console.error("No delete type or ID specified");
            return;
        }
        
        console.log(`Executing delete: ${this.deleteType} ${this.deleteId}`);
        
        let endpoint = '';
        let successMessage = '';
        
        switch (this.deleteType) {
            case 'user':
                endpoint = `users/${this.deleteId}`;
                successMessage = 'User deleted successfully';
                break;
            case 'exercise':
                endpoint = `exercises/${this.deleteId}`;
                successMessage = 'Exercise deleted successfully';
                break;
            case 'category':
                endpoint = `exercise-categories/${this.deleteId}`;
                successMessage = 'Category deleted successfully';
                break;
            default:
                console.error("Unknown delete type:", this.deleteType);
                Utils.showToast("Unknown delete type", "error");
                return;
        }
        
        Utils.blockUI("Deleting...");
        
        RestClient.delete(endpoint, null, (response) => {
            Utils.unblockUI();
            Utils.showToast(successMessage, 'success');
            
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
            if (modal) modal.hide();
            
            
            setTimeout(() => {
                switch (this.deleteType) {
                    case 'user':
                        this.loadUsers();
                        break;
                    case 'exercise':
                        this.loadExercises();
                        break;
                    case 'category':
                        this.loadCategories();
                        
                        this.loadCategoriesForExerciseModal();
                        break;
                }
            }, 500);
            
            
            this.deleteType = null;
            this.deleteId = null;
            
        }, (error) => {
            Utils.unblockUI();
            console.error(`Delete ${this.deleteType} failed:`, error);
            
            let errorMsg = `Failed to delete ${this.deleteType}`;
            if (error.responseJSON?.error) {
                errorMsg = error.responseJSON.error;
            } else if (error.responseText) {
                errorMsg = error.responseText;
            }
            
            Utils.showToast(errorMsg, 'error');
            
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
            if (modal) modal.hide();
        });
    }
};


window.AdminService = AdminService;


$(document).on('spapp_ready', function(e, view) {
    if (view === 'admin-panel' && typeof AdminService !== 'undefined') {
        console.log("Admin panel loaded, initializing AdminService");
        AdminService.init();
    }
});