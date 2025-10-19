$(document).ready(function () {
  var app = $.spapp({
    pageNotFound: "error_404",
    templateDir: "./views/",
    defaultView: "dashboard",
  });

  // Define all routes
  app.route({ view: "dashboard", load: "dashboard.html" });
  app.route({ view: "workout-log", load: "workout-log.html" });
  app.route({ view: "workout-history", load: "workout-history.html" });
  app.route({ view: "exercise-library", load: "exercise-library.html" });
  app.route({ view: "progress-charts", load: "progress-charts.html" });
  app.route({ view: "profile", load: "profile.html" });
  app.route({ view: "login", load: "login.html" });
  app.route({ view: "register", load: "register.html" });
  app.route({ view: "admin-panel", load: "admin-panel.html" });

  // Run app
  app.run();
  
  // Initialize dynamic functionality
  initializeSPA();
});

function initializeSPA() {
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
                              <option>Bench Press</option>
                              <option>Incline Dumbbell Press</option>
                              <option>Cable Flyes</option>
                              <option>Push-ups</option>
                              <option>Squats</option>
                              <option>Deadlifts</option>
                              <option>Shoulder Press</option>
                              <option>Bicep Curls</option>
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
  });

  // Exercise removal functionality
  $(document).on('click', '.remove-exercise', function() {
      $(this).closest('.exercise-entry').remove();
  });

  // Form submissions
  $(document).on('submit', '#login-form, #register-form, #profile-form, #workout-form', function(e) {
      e.preventDefault();
      const formId = $(this).attr('id');
      alert(`${formId.replace('-form', '')} functionality will be implemented with backend in later milestones`);
      
      // Redirect appropriately
      if (formId === 'login-form') {
          window.location.hash = 'dashboard';
      } else if (formId === 'register-form') {
          window.location.hash = 'login';
      }
  });

  // Set today's date as default in workout log when page loads
  $(document).on('spapp_ready', function() {
      const today = new Date().toISOString().split('T')[0];
      $('#workout-date').val(today);
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
}