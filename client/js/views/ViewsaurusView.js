var ProseView = require('./ProseView');
var CodeView = require('./CodeView');
var ExplorerView = require('./ExplorerView');

// Main Viewsaurus app view
var ViewsaurusView = Backbone.View.extend({
    // Initialize UI
    initialize: function(options) {
        // Store a reference to main app model
        this.app = options.app;

        // Create sub views
        self.proseView = new ProseView({ app: options.app });
        self.codeView = new CodeView({ app: options.app });
        self.explorerView = new ExplorerView({ app: options.app });
    }
});

module.exports = ViewsaurusView;