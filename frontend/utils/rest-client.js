let RestClient = {
    get: function (url, callback, error_callback) {
      $.ajax({
        url: Constants.PROJECT_BASE_URL + url,
        type: "GET",
        beforeSend: function (xhr) {
          const token = localStorage.getItem("user_token");
          if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
          }
        },
        success: function (response) {
          if (callback) callback(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("GET Error:", url, jqXHR.status, textStatus, errorThrown);
          if (error_callback) error_callback(jqXHR);
        },
      });
    },
    
    request: function (url, method, data, callback, error_callback) {
      $.ajax({
        url: Constants.PROJECT_BASE_URL + url,
        type: method,
        beforeSend: function (xhr) {
          const token = localStorage.getItem("user_token");
          if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
          }
          xhr.setRequestHeader("Content-Type", "application/json");
        },
        data: JSON.stringify(data),
        dataType: "json",
      })
        .done(function (response, status, jqXHR) {
          console.log(`${method} Success:`, url, response);
          if (callback) callback(response);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.error(`${method} Error:`, url, jqXHR.status, textStatus, errorThrown);
          console.error("Response:", jqXHR.responseText);
          if (error_callback) {
            error_callback(jqXHR);
          } else {
            const errorMsg = jqXHR.responseJSON?.error || jqXHR.responseText || 'Error';
            Utils.showToast(errorMsg, "error");
          }
        });
    },
    
    post: function (url, data, callback, error_callback) {
      RestClient.request(url, "POST", data, callback, error_callback);
    },
    
    delete: function (url, data, callback, error_callback) {
      RestClient.request(url, "DELETE", data, callback, error_callback);
    },
    
    patch: function (url, data, callback, error_callback) {
      RestClient.request(url, "PATCH", data, callback, error_callback);
    },
    
    put: function (url, data, callback, error_callback) {
      RestClient.request(url, "PUT", data, callback, error_callback);
    },
  };