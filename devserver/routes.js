var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var express = require('express');
var genScript = require('../lib/generators/script');
var genStyle = require('../lib/generators/style');
var genContent = require('../lib/generators/content');
var genViewsaurus = require('../lib/generators/viewsaurus');

// Constants
var FIXTURES_DIR = path.join(__dirname, '..', 'test', 'fixtures');

// Create a server to render pages that contain viewsaurus assets
var app = express();
app.set('views', path.join(__dirname, '..', 'client', 'templates'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

// Home Page displays list of test fixtures
app.get('/', function(request, response) {
    var dirs = fs.readdirSync(FIXTURES_DIR);
    var fixtures = [];

    // Only list directories
    dirs.forEach(function(dir) {
        if (fs.statSync(path.join(FIXTURES_DIR, dir)).isDirectory()) {
            fixtures.push(dir);
        }
    });

    // Render fixture index page
    response.render('dev_home', {
        fixtures: fixtures
    });
});

// Individual test page displays a full page tutorial generated from the
// requested test fixture
app.get('/tests/:fixture', function(request, response) {
    var fx = request.params.fixture;

    // Run the tutorial parser on the requested fixture
    var fixturePath = path.join(FIXTURES_DIR, fx);
    var p = path.resolve(fixturePath);

    var tutorialOptions = require(path.join(p, 'tutorial', 'config.json'));
    tutorialOptions.project = p;

    genContent(tutorialOptions, function(err, content) {
        if (err) return response.send(err);

        // Generate viewsaurus from content
        tutorialOptions.content = content;
        var html = genViewsaurus(tutorialOptions);

        // Render inside of dev template
        var renderContext = {
            content: html,
            type: request.query.min ? 'min' : 'dev'
        };
        response.render('dev_wrapper', renderContext);
    });
});

// Generate dev JS
function js(request, response, min) {
    genScript({
        minify: min
    }, function(err, src) {
        if (!err) {
            response.type('application/javascript');
            response.send(src);
        } else {
            console.log(err);
            response.status(500).send(err);
        }
    });
}
app.get('/viewsaurus.dev.js', function(request, response) {
    js(request, response, false);
});
app.get('/viewsaurus.min.js', function(request, response) {
    js(request, response, true);
});

// Generate dev CSS
function css(request, response, min) {
    genStyle({
        minify: min
    }, function(err, src) {
        if (!err) {
            response.type('text/css');
            response.send(src);
        } else {
            console.log(err);
            response.status(500).send(err);
        }
    });
}
app.get('/viewsaurus.dev.css', function(request, response) {
    css(request, response, false);
});
app.get('/viewsaurus.min.css', function(request, response) {
    css(request, response, true);
});

// Export express app as module interface
module.exports = app;