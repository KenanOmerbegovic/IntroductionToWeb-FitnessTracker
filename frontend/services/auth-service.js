var AuthService = {
  init: function () {
    // Check if user is already logged in
    var token = localStorage.getItem("user_token");
    if (token) {
      window.location.replace("#dashboard");
    }
    
    // Login form validation
    $("#login-form").validate({
      rules: {
        email: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 6
        }
      },
      messages: {
        email: {
          required: "Please enter your email",
          email: "Please enter a valid email address"
        },
        password: {
          required: "Please enter your password",
          minlength: "Password must be at least 6 characters"
        }
      },
      submitHandler: function (form) {
        var entity = Object.fromEntries(new FormData(form).entries());
        AuthService.login(entity);
      },
    });
    
    // Register form validation
    $("#register-form").validate({
      rules: {
        email: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 6
        },
        confirm_password: {
          required: true,
          equalTo: "#password"
        },
        full_name: "required",
        fitness_goal: "required",
        experience_level: "required"
      },
      messages: {
        email: {
          required: "Please enter your email",
          email: "Please enter a valid email address"
        },
        password: {
          required: "Please enter your password",
          minlength: "Password must be at least 6 characters"
        },
        confirm_password: {
          required: "Please confirm your password",
          equalTo: "Passwords must match"
        },
        full_name: "Please enter your full name",
        fitness_goal: "Please select a fitness goal",
        experience_level: "Please select your experience level"
      },
      submitHandler: function (form) {
        var entity = Object.fromEntries(new FormData(form).entries());
        AuthService.register(entity);
      },
    });
  },

  login: function (entity) {
    console.log("Login attempt:", entity);
    Utils.blockUI("Logging in...");
    RestClient.post('auth/login', entity, function (response) {
      console.log("Login success:", response);
      localStorage.setItem("user_token", response.data.token);
      Utils.unblockUI();
      Utils.showToast("Login successful!", "success");
      window.location.replace("#dashboard");
      setTimeout(() => window.location.reload(), 100);
    }, function (error) {
      console.error("Login error:", error);
      Utils.unblockUI();
      const errorMsg = error.responseJSON?.error || error.responseText || "Login failed";
      Utils.showToast(errorMsg, "error");
    });
  },

  register: function (entity) {
    const { confirm_password, ...registrationData } = entity;
    Utils.blockUI("Creating account...");
    RestClient.post('auth/register', registrationData, function (response) {
      Utils.unblockUI();
      Utils.showToast("Registration successful! Please login.", "success");
      window.location.replace("#login");
    }, function (error) {
      console.error("Registration error details:");
      console.error("Status:", error.status);
      console.error("Status Text:", error.statusText);
      console.error("Response:", error.responseJSON);
      console.error("Response Text:", error.responseText);
      Utils.unblockUI();
      const errorMsg = error.responseJSON?.error || error.responseText || "Registration failed";
      Utils.showToast(errorMsg, "error");
    });
  },

  logout: function () {
    localStorage.removeItem("user_token");
    Utils.showToast("Logged out successfully", "success");
    window.location.replace("#login");
    setTimeout(() => window.location.reload(), 100);
  },

getCurrentUser: function() {
    const token = localStorage.getItem("user_token");
    const decoded = Utils.parseJwt(token);
    
    if (decoded) {
        if (decoded.user_id) {
            return decoded;
        }
        else if (decoded.user && decoded.user.user_id) {
            return decoded.user;
        }
        else if (decoded.id) {
            return { user_id: decoded.id, ...decoded };
        }
    }
    
    console.warn("Could not parse user from token:", decoded);
    return decoded; // Return whatever we have
},
  isAuthenticated: function() {
    const token = localStorage.getItem("user_token");
    const isAuth = token !== null;
    return isAuth;
  },

  generateMenuItems: function(){
    const token = localStorage.getItem("user_token");
    const user = Utils.parseJwt(token);
    
    
    if (!user) {
      window.location.replace("#login");
      return;
    }

    let nav = "";
    
    // Common items for all authenticated users
    nav += `
      <li><a href="#dashboard">Dashboard</a></li>
      <li><a href="#workout-log">Log Workout</a></li>
      <li><a href="#workout-history">History</a></li>
      <li><a href="#exercise-library">Exercises</a></li>
      <li><a href="#progress-charts">Progress</a></li>
      <li><a href="#profile">Profile</a></li>
    `;
    
    // Admin only items
    if (user.role === Constants.ADMIN_ROLE) {
      nav += '<li><a href="#admin-panel" class="text-warning">Admin Panel</a></li>';
    }
    
    // Logout button
    const userName = user.user?.full_name || user.full_name || 'User';
    nav += `<li><a href="javascript:void(0)" onclick="AuthService.logout()" class="btn-logout">Logout (${userName})</a></li>`;
    
    $("#tabs").html(nav);
  }
};