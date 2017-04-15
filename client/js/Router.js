var Router = Backbone.Router.extend({
    routes: {
        ':stepIndex': 'doRoute'
    },

    // Initialize router with handle to Viewsaurus model
    initialize: function(options) {
        var self = this;
        self.app = options.app;
    },

    // Handle step route
    doRoute: function(stepIndex) {
        var self = this;
        var si = Number(stepIndex);
        if (si < 0) {
            si = 0;
        } else if (si >= self.app.totalSteps) {
            si = self.app.totalSteps - 1;
        }
        self.app.set('stepIndex', si);
    }
});

module.exports = Router;