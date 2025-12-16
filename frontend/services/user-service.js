let UserService = {
  init: function () {
    // Profile form validation
    $("#profile-form").validate({
      rules: {
        full_name: "required",
        email: {
          required: true,
          email: true
        }
      },
      submitHandler: function (form) {
        var profileData = Object.fromEntries(new FormData(form).entries());
        UserService.updateProfile(profileData);
      },
    });
    
    // Password form validation
    $("#password-form").validate({
      rules: {
        current_password: "required",
        new_password: {
          required: true,
          minlength: 6
        },
        confirm_new_password: {
          required: true,
          equalTo: "#new_password"
        }
      },
      submitHandler: function (form) {
        var passwordData = Object.fromEntries(new FormData(form).entries());
        UserService.changePassword(passwordData);
      },
    });
    
    // Load user data
    UserService.loadUserProfile();
  },

  loadUserProfile: function() {
    const user = AuthService.getCurrentUser();
    if (!user || !user.user_id) {
        console.error("No user ID available");
        return;
    }
    
    RestClient.get(`users/${user.user_id}`, function(userData) {
        if ($('#profile-full-name').length) {
            $('#profile-full-name').val(userData.full_name || '');
        }
        if ($('#profile-email').length) {
            $('#profile-email').val(userData.email || '');
        }
        if ($('#profile-fitness-goal').length) {
            $('#profile-fitness-goal').val(userData.fitness_goal || 'muscle_gain');
        }
        if ($('#profile-experience-level').length) {
            $('#profile-experience-level').val(userData.experience_level || 'beginner');
        }
        
        // FIX: Handle the date properly
        if ($('#member-since').length) {
            if (userData.created_at) {
                // Parse the date string from database
                let createdDate;
                if (typeof userData.created_at === 'string') {
                    createdDate = new Date(userData.created_at);
                } else if (typeof userData.created_at === 'number') {
                    createdDate = new Date(userData.created_at * 1000); // If it's a Unix timestamp
                } else {
                    createdDate = new Date(); // Fallback
                }
                
                if (!isNaN(createdDate.getTime())) {
                    $('#member-since').text(createdDate.toLocaleDateString());
                } else {
                    $('#member-since').text('Recently');
                }
            } else {
                $('#member-since').text('Recently');
            }
        }
        
        // Update profile stats
        UserService.loadUserStats(user.user_id);
    }, function(error) {
        console.error("Failed to load user profile:", error);
    });
},

  loadUserStats: function(userId) {
    RestClient.get(`workouts/user/${userId}`, function(workouts) {
        
        const totalWorkouts = workouts.length;
        
        // Calculate this month's workouts
        const now = new Date();
        const thisMonth = workouts.filter(w => {
            if (!w.workout_date) return false;
            const workoutDate = new Date(w.workout_date);
            return workoutDate.getMonth() === now.getMonth() && 
                   workoutDate.getFullYear() === now.getFullYear();
        }).length;
        
        // Update UI if elements exist
        if ($('#total-workouts').length) {
            $('#total-workouts').text(totalWorkouts);
        }
        if ($('#workouts-this-month').length) {
            $('#workouts-this-month').text(thisMonth);
        }
        
        // Find favorite exercise
        if (workouts.length > 0 && $('#favorite-exercise').length) {
            // Take the most recent workout type
            const recentWorkout = workouts[0];
            $('#favorite-exercise').text(recentWorkout.workout_type || 'Various');
        } else if ($('#favorite-exercise').length) {
            $('#favorite-exercise').text('No workouts yet');
        }
        
    }, function(error) {
        console.warn("Could not load workouts for stats:", error);
        // Set defaults
        if ($('#total-workouts').length) $('#total-workouts').text('0');
        if ($('#workouts-this-month').length) $('#workouts-this-month').text('0');
        if ($('#favorite-exercise').length) $('#favorite-exercise').text('No data');
    });
    
    // Skip personal records for now - endpoint has issues
    if ($('#current-streak').length) {
        $('#current-streak').text("Track your first PR!");
    }
},

  updateProfile: function(profileData) {
    const user = AuthService.getCurrentUser();
    if (!user) return;
    
    Utils.blockUI("Updating profile...");
    RestClient.put(`users/${user.user_id}`, profileData, function(response) {
      Utils.unblockUI();
      Utils.showToast("Profile updated successfully!", "success");
      
      // Update stored user data
      const token = localStorage.getItem("user_token");
      const decoded = Utils.parseJwt(token);
      localStorage.setItem("user_data", JSON.stringify({...decoded, ...profileData}));
      
    }, function(error) {
      Utils.unblockUI();
      Utils.showToast(error.responseJSON?.error || "Failed to update profile", "error");
    });
  },

  changePassword: function(passwordData) {
    // Note: You'll need to implement a password change endpoint in your backend
    Utils.showToast("Password change endpoint not implemented yet", "info");
  },
  getCurrentUser: function() {
    const token = localStorage.getItem("user_token");
    if (!token) return null;
    try {
        return Utils.parseJwt(token).user;
    } catch (e) {
        console.error("Error parsing token:", e);
        return null;
    }
},

  deleteAccount: function() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const user = AuthService.getCurrentUser();
      if (!user) return;
      
      Utils.blockUI("Deleting account...");
      RestClient.delete(`users/${user.user_id}`, null, function(response) {
        Utils.unblockUI();
        Utils.showToast("Account deleted successfully", "success");
        AuthService.logout();
      }, function(error) {
        Utils.unblockUI();
        Utils.showToast(error.responseJSON?.error || "Failed to delete account", "error");
      });
    }
  }
};