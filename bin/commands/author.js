var express = require('express');
var viewsaurus = require('../..');

// Run a local dev server to serve up tutorial HTML and watch the current
// directory for code changes to recompile the tutorial
function authorCommand(options) {
    // Create express app to serve the current directory
    var app = express();
    // Generate content fresh on every request, but skip CSS/JS
    app.use(function(request, response, next) {
        options.skipJavascript = true;
        options.skipCss = true;
        viewsaurus.generate(options, function(err) {
            if (err) return response.status(500).send(err);
            // If all is generated well, let content be served
            next();
        });
    });
    // Serve static content out of current directory
    app.use(express.static(options.project));

    // Generate with initial options, generate CSS and JS
    options.outputDirectory = options.outputDirectory || process.cwd();
    options.outputFileName = options.outputFileName || 'index.html';
    viewsaurus.generate(options, function(err) {
        if (err) {
            console.error(err.stack);
            return console.error('problem starting authoring server :('.red);
        }

        app.listen(options.port);
        console.log('Viewsaurus authoring server listening on *:'
            + options.port);
    });
}

module.exports = authorCommand;