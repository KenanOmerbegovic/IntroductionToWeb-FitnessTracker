let Utils = {
    datatable: function (table_id, columns, data, pageLength=15) {
        if ($.fn.dataTable.isDataTable("#" + table_id)) {
          $("#" + table_id)
            .DataTable()
            .destroy();
        }
    
        $("#" + table_id).DataTable({
          data: data,
          columns: columns,
          pageLength: pageLength,
          lengthMenu: [2, 5, 10, 15, 25, 50, 100, "All"],
        });
      },
      
      parseJwt: function(token) {
        if (!token) return null;
        try {
          const payload = token.split('.')[1];
          const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          return JSON.parse(decoded);
        } catch (e) {
          console.error("Invalid JWT token:", e);
          return null;
        }
      },
      
      // Helper to show toast messages
      showToast: function(message, type = 'success') {
        
        // Create simple toast notification
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
          <div id="${toastId}" class="toast-notification toast-${type}" 
               style="position:fixed; top:20px; right:20px; padding:15px; background:${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'}; color:white; border-radius:5px; z-index:9999;">
            ${message}
          </div>
        `;
        
        $('body').append(toastHtml);
        
        // Remove after 3 seconds
        setTimeout(() => {
          $('#' + toastId).fadeOut(300, function() {
            $(this).remove();
          });
        }, 3000);
      },
      
      // Block/Unblock UI
      blockUI: function(message = 'Loading...') {
        $('body').append(`
          <div id="block-ui" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">
            <div style="background:white;padding:20px;border-radius:10px;text-align:center;">
              <div class="spinner" style="border:4px solid #f3f3f3;border-top:4px solid #667eea;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 10px;"></div>
              <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              </style>
              <h3 style="margin:0;">${message}</h3>
            </div>
          </div>
        `);
      },
      
      unblockUI: function() {
        $('#block-ui').fadeOut(200, function() {
          $(this).remove();
        });
      },
      
      // Debug helper
      debug: function(label, data) {
        console.log(`[DEBUG ${label}]`, data);
      }
}