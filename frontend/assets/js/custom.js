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
      
      
      setTimeout(function() {
        if (typeof WorkoutService !== 'undefined') {
          WorkoutService.getUserWorkouts();
        }
        
        
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
            if (typeof WorkoutLogService !== 'undefined') {
                WorkoutLogService.onPageLoad();
            }
        }, 100);
    }
});
  
  app.route({ 
    view: "workout-history", 
    load: "workout-history.html",
    onCreate: function() {
        if (!AuthService.isAuthenticated()) {
            window.location.replace("#login");
            return;
        }
        
        setTimeout(function() {
            
            if (typeof WorkoutHistoryService !== 'undefined') {
                WorkoutHistoryService.init();
            } else {
                console.error("WorkoutHistoryService not loaded");
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
      
      setTimeout(function() {
        const user = AuthService.getCurrentUser();
        if (user && typeof RestClient !== 'undefined') {
          RestClient.get(`personal-records/user/${user.user_id}/recent`, function(records) {
            if (records && records.length > 0) {
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
        console.log("Admin panel page loaded");
        
        if (!AuthService.isAuthenticated()) {
            window.location.replace("#login");
            return;
        }
        
        
        const user = AuthService.getCurrentUser();
        if (!user || user.role?.toLowerCase() !== 'admin') {
            Utils.showToast("Access denied: Admin privileges required", "error");
            window.location.replace("#dashboard");
            return;
        }
        
        
        console.log("Admin access granted");
    }
});

  
  app.run();
  
  
  initializeSPA();
});

function initializeSPA() {
  
  
  setTimeout(function() {
    if (typeof AuthService !== 'undefined') {
      if (AuthService.isAuthenticated()) {
        AuthService.generateMenuItems();
        
        updateActiveNav();
      } else {
        
        const navHtml = `
          <li><a href="#login">Login</a></li>
          <li><a href="#register">Register</a></li>
        `;
        $("#tabs").html(navHtml);
        updateActiveNav();
      }
    }
  }, 500);

  
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
      
      
      if (typeof ExerciseService !== 'undefined') {
        ExerciseService.loadExercises();
      }
  });

  
  $(document).on('click', '.remove-exercise', function() {
      $(this).closest('.exercise-entry').remove();
  });

  
  $(document).on('submit', '#password-form, #profile-form', function(e) {
      e.preventDefault();
      const formId = $(this).attr('id');
      
      if (formId === 'password-form') {
          Utils.showToast("Password change functionality coming soon", "info");
      } else if (formId === 'profile-form') {
          Utils.showToast("Profile update functionality coming soon", "info");
      }
  });

  
  $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    console.error("AJAX Error:", settings.url, thrownError);
    
    
    if (jqxhr.status === 401) {
      Utils.showToast("Session expired. Please login again.", "error");
      AuthService.logout();
    }
    
    
    if (jqxhr.status === 403) {
      Utils.showToast("Access denied. Insufficient privileges.", "error");
    }
  });

  
  function updateActiveNav() {
      const currentHash = window.location.hash.slice(1) || 'dashboard';
      
      document.querySelectorAll('.nav-list a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentHash}`) {
              link.classList.add('active');
          }
      });
  }

  
  window.addEventListener('hashchange', updateActiveNav);
  
  
  $(document).on('click', '.btn-logout', function(e) {
    e.preventDefault();
    if (typeof AuthService !== 'undefined') {
      AuthService.logout();
    }
  });

  
  $(document).on('click', '.tab-nav-item', function() {
      const tabId = $(this).data('tab');
      
      
      $('.tab-nav-item').removeClass('active');
      $('.tab-content').removeClass('active');
      
      
      $(this).addClass('active');
      $(`#${tabId}-tab`).addClass('active');
  });
  
  
  $(document).on('spapp_ready', function(e, view) {
    if (view === 'exercise-library' && typeof ExerciseService !== 'undefined') {
      setTimeout(function() {
        ExerciseService.init();
      }, 200);
    }
    
    if (view === 'workout-log') {
      
      const today = new Date().toISOString().split('T')[0];
      $('#workout-date').val(today);
    }
  });
}


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
