(function ($) {
  $.spapp = function (options) {
    var config,
      routes = {};

    config = $.extend(
      {
        defaultView: $("main#spapp > section:last-child").attr("id"),
        templateDir: "./views/",
        pageNotFound: false,
      },
      options
    );

    $("main#spapp > section").each(function (k, e) {
      var elm = $(this);
      routes[elm.attr("id")] = {
        view: elm.attr("id"),
        load: elm.data("load"),
        onCreate: function () {},
        onReady: function () {},
      };
    });
    
    this.route = function (options) {
      $.extend(routes[options.view], options);
    };
    
    var routeChange = function () {
      var id = location.hash.slice(1);
      var route = routes[id];
      var elm = $("#" + id);

      
      $("main#spapp > section").hide();
      
      if (!elm || !route) {
        if (config.pageNotFound) {
          window.location.hash = config.pageNotFound;
          return;
        }
        console.log(id + " not defined");
        return;
      }

      
      elm.show();
      
      if (!route.load) {
        
        route.onCreate();
        route.onReady();
      } else {
        
        $.get(config.templateDir + route.load)
          .done(function (data) {
            elm.html(data);
            route.onCreate();
            route.onReady();
          })
          .fail(function (xhr, status, error) {
            console.error("Error loading view: " + route.load, error);
            elm.html('<div class="alert alert-danger"><h4>Error Loading Page</h4><p>Could not load ' + route.load + '</p><a href="#dashboard" class="btn btn-primary">Return to Dashboard</a></div>');
          });
      }
    };
    
    this.run = function () {
      window.addEventListener("hashchange", function () {
        routeChange();
      });
      
      if (!window.location.hash) {
        window.location.hash = config.defaultView;
      } else {
        routeChange();
      }
    };

    return this;
  };
})(jQuery);