$(document).ready(function () {
  var app = $.spapp({
    pageNotFound: "error_404",
    templateDir: "./views/",
    defaultView: "dashboard",
  });
  app.route({ 
    view: "dashboard", 
    load: "dashboard.html",
    onCreate: function() {
      if (!AuthService.isAuthenticated()) {
        window.location.replace("#login");
        return;
      }
      
      // Update dashboard with user data
      setTimeout(function() {
        if (typeof WorkoutService !== 'undefined') {
          WorkoutService.getUserWorkouts();
        }
        
        // Load user profile
        const user = AuthService.getCurrentUser();
        if (user) {
          $('#user-greeting').text(`Welcome back, ${user.full_name || 'User'}!`);
        }
      }, 100);
    }
  });
  
  app.route({ 
    view: "workout-log", 
    load: "workout-log.html",
    onCreate: function() {
      if (!AuthService.isAuthenticated()) {
        window.location.replace("#login");
        return;
      }
      
      setTimeout(function() {
        if (typeof WorkoutService !== 'undefined') {
          WorkoutService.init();
        }
        if (typeof ExerciseService !== 'undefined') {
          ExerciseService.init();
        }
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        $('#workout-date').val(today);
      }, 100);
    }
  });
  
  app.route({ 
    view: "workout-history", 
    load: "workout-history.html",
    onCreate: function() {
       if (typeof WorkoutHistoryService !== 'undefined') {
        WorkoutHistoryService.onPageLoad();}
      /*if (!AuthService.isAuthenticated()) {
        window.location.replace("#login");
        return;
      }*/
      
      setTimeout(function() {
        if (typeof WorkoutService !== 'undefined') {
          WorkoutService.getUserWorkouts();
        }
      }, 100);
    }
  });
  
  app.route({ 
    view: "exercise-library", 
    load: "exercise-library.html",
    onCreate: function() {
      if (!AuthService.isAuthenticated()) {
        window.location.replace("#login");
        return;
      }
      
      setTimeout(function() {
        if (typeof ExerciseService !== 'undefined') {
          ExerciseService.init();
        }
      }, 100);
    }
  });
  
  app.route({ 
    view: "progress-charts", 
    load: "progress-charts.html",
    onCreate: function() {
      ProgressService.onCreate();
      if (!AuthService.isAuthenticated()) {
        window.location.replace("#login");
        return;
      }
      
      // Load progress data
      setTimeout(function() {
        const user = AuthService.getCurrentUser();
        if (user && typeof RestClient !== 'undefined') {
          RestClient.get(`personal-records/user/${user.user_id}/recent`, function(records) {
            if (records && records.length > 0) {
              // Update the table with real data
              const tableBody = $('#progress-charts table tbody');
              tableBody.empty();
              
              records.forEach(record => {
                const row = `
                  <tr>
                    <td>${record.exercise_name || 'Exercise'}</td>
                    <td>${record.max_weight_kg} kg</td>
                    <td>${record.reps_achieved}</td>
                    <td>${new Date(record.achieved_date).toLocaleDateString()}</td>
                    <td><span class="badge badge-success">PR</span></td>
                  </tr>
                `;
                tableBody.append(row);
              });
            }
          });
        }
      }, 100);
    }
  });
  
  app.route({ 
    view: "profile", 
    load: "profile.html",
    onCreate: function() {
      if (!AuthService.isAuthenticated()) {
        window.location.replace("#login");
        return;
      }
      
      setTimeout(function() {
        const user = AuthService.getCurrentUser();
        if (user) {
          $('#profile-full-name').val(user.full_name || '');
          $('#profile-email').val(user.email || '');
          $('#profile-fitness-goal').val(user.fitness_goal || '');
          $('#profile-experience-level').val(user.experience_level || '');
          

          if ($.fn.validate && $('#profile-form').length) {
            $("#profile-form").validate({
              submitHandler: function (form) {
                var profileData = Object.fromEntries(new FormData(form).entries());
                // TODO: Implement profile update
                Utils.showToast("Profile update will be implemented", "info");
              },
            });
          }
        }
      }, 100);
    }
  });
  
  app.route({ 
    view: "login", 
    load: "login.html",
    onCreate: function() {
      console.log("Login page loaded");
      if (AuthService.isAuthenticated()) {
        window.location.replace("#dashboard");
        return;
      }
      
      setTimeout(function() {
        if (typeof AuthService !== 'undefined') {
          AuthService.init();
        }
      }, 100);
    }
  });
  
  app.route({ 
    view: "register", 
    load: "register.html",
    onCreate: function() {
      if (AuthService.isAuthenticated()) {
        window.location.replace("#dashboard");
        return;
      }
      
      setTimeout(function() {
        if (typeof AuthService !== 'undefined') {
          AuthService.init();
        }
      }, 100);
    }
  });
  
  app.route({ 
    view: "admin-panel", 
    load: "admin-panel.html",
    onCreate: function() {
      console.log("Admin panel loaded");
      if (!AuthService.isAuthenticated()) {
        window.location.replace("#login");
        return;
      }
      
      // Check if user is admin
      const user = AuthService.getCurrentUser();
      if (!user || user.role !== Constants.ADMIN_ROLE) {
        Utils.showToast("Access denied: Admin privileges required", "error");
        window.location.replace("#dashboard");
        return;
      }
      
      setTimeout(function() {
        if (typeof RestClient !== 'undefined') {
          RestClient.get('users', function(users) {
          });
        }
      }, 100);
    }
  });

  // Run app
  app.run();
  
  // Initialize dynamic functionality
  initializeSPA();
});

function initializeSPA() {
  
  // Check authentication on page load
  setTimeout(function() {
    if (typeof AuthService !== 'undefined') {
      if (AuthService.isAuthenticated()) {
        AuthService.generateMenuItems();
        // Update active nav link
        updateActiveNav();
      } else {
        // Show only login/register
        const navHtml = `
          <li><a href="#login">Login</a></li>
          <li><a href="#register">Register</a></li>
        `;
        $("#tabs").html(navHtml);
        updateActiveNav();
      }
    }
  }, 500);

  // Exercise adding functionality
  $(document).on('click', '#add-exercise', function() {
      const exerciseHtml = `
          <div class="exercise-entry">
              <div class="row">
                  <div class="col-md-4">
                      <div class="form-group">
                          <label class="form-label">Exercise</label>
                          <select class="form-select exercise-name">
                              <option value="">Select exercise...</option>
                              <!-- Options will be populated by ExerciseService -->
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
      
      // If ExerciseService is loaded, populate the dropdown
      if (typeof ExerciseService !== 'undefined') {
        ExerciseService.loadExercises();
      }
  });

  // Exercise removal functionality
  $(document).on('click', '.remove-exercise', function() {
      $(this).closest('.exercise-entry').remove();
  });

  // Form submissions (for forms without specific handlers)
  $(document).on('submit', '#password-form, #profile-form', function(e) {
      e.preventDefault();
      const formId = $(this).attr('id');
      
      if (formId === 'password-form') {
          Utils.showToast("Password change functionality coming soon", "info");
      } else if (formId === 'profile-form') {
          Utils.showToast("Profile update functionality coming soon", "info");
      }
  });

  // Global error handler for AJAX calls
  $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    console.error("AJAX Error:", settings.url, thrownError);
    
    // Handle 401 Unauthorized
    if (jqxhr.status === 401) {
      Utils.showToast("Session expired. Please login again.", "error");
      AuthService.logout();
    }
    
    // Handle 403 Forbidden
    if (jqxhr.status === 403) {
      Utils.showToast("Access denied. Insufficient privileges.", "error");
    }
  });

  // Update active nav link based on current hash
  function updateActiveNav() {
      const currentHash = window.location.hash.slice(1) || 'dashboard';
      
      document.querySelectorAll('.nav-list a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentHash}`) {
              link.classList.add('active');
          }
      });
  }

  // Update nav on hash change
  window.addEventListener('hashchange', updateActiveNav);
  
  // Global logout handler
  $(document).on('click', '.btn-logout', function(e) {
    e.preventDefault();
    if (typeof AuthService !== 'undefined') {
      AuthService.logout();
    }
  });

  // Tab functionality for admin panel
  $(document).on('click', '.tab-nav-item', function() {
      const tabId = $(this).data('tab');
      
      // Remove active class from all tabs and content
      $('.tab-nav-item').removeClass('active');
      $('.tab-content').removeClass('active');
      
      // Add active class to clicked tab and corresponding content
      $(this).addClass('active');
      $(`#${tabId}-tab`).addClass('active');
  });
  
  // Load exercises when exercise library page loads
  $(document).on('spapp_ready', function(e, view) {
    if (view === 'exercise-library' && typeof ExerciseService !== 'undefined') {
      setTimeout(function() {
        ExerciseService.init();
      }, 200);
    }
    
    if (view === 'workout-log') {
      // Set today's date as default when page loads
      const today = new Date().toISOString().split('T')[0];
      $('#workout-date').val(today);
    }
  });
}

// Global utility functions accessible from HTML
function showToast(message, type = 'info') {
  if (typeof Utils !== 'undefined' && Utils.showToast) {
    Utils.showToast(message, type);
  } else {
    alert(`${type}: ${message}`);
  }
}

function logout() {
  if (typeof AuthService !== 'undefined') {
    AuthService.logout();
  } else {
    localStorage.removeItem("user_token");
    window.location.replace("#login");
    window.location.reload();
  }
}