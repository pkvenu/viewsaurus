var ViewsaurusView = require('./views/ViewsaurusView');
var Router = require('./Router');

// Window-scoped viewsaurus object is an event emitter and namespace for public
// API functions (when needed)
module.exports = Backbone.Model.extend({// Initialize model and app
    initialize: function() {
        var self = this;

        // Determine how many steps there are in the tutorial total
        var $steps = $('.saurus-prose .step');
        self.totalSteps = $steps.length;

        // Create main app view
        self.mainView = new ViewsaurusView({
            el: '#viewsaurus',
            app: self
        });

        // Create and start router
        self.router = new Router({ app: self });
        Backbone.history.start();
    },

    // Determine if there is a next step
    hasNext: function() {
        var self = this;
        return self.get('stepIndex')+1 < self.totalSteps;
    },

    // Determine if there is a previous step
    hasPrevious: function() {
        var self = this;
        return self.get('stepIndex') !== 0;
    },

    // Show file explorer (public API)
    showExplorer: function() {
        var self = this;
        self.set('explorerShown', true);
    },

    // Hide file explorer (public API)
    hideExplorer: function() {
        var self = this;
        self.set('explorerShown', false);
    }
});
