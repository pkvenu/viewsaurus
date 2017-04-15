var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var jade = require('jade');
var wrench = require('wrench');

// Generators for components of the tutorial
var generateContent = require('./generators/content');
var generateJavaScript = require('./generators/script');
var generateCss = require('./generators/style');
var generateViewsaurus = require('./generators/viewsaurus');

// Generate a Viewsaurus tutorial with the given options
exports.generate = function(options, callback) {
    // Parse in tutorial config
    var tutorialDir = path.join(options.project, 'tutorial');
    var tutorialConfig = require(path.join(tutorialDir, 'config.json'));
    options = _.extend(options, tutorialConfig);

    // create a set of async operations to execute to generate tutorial
    var operations = {};

    // Content markup always needs to be generated
    operations.content = function(asyncCallback) {
        generateContent(options, function(err, htmlString) {
            if (err) return asyncCallback(err);
            asyncCallback(null, htmlString);
        });
    };

    // Unless JS is skipped, generate JS
    if (!options.skipJavaScript) {
        operations.javascript = function(asyncCallback) {
            generateJavaScript(options, function(err, jsString) {
                if (err) return asyncCallback(err);
                asyncCallback(null, jsString);
            });
        };
    }

    // Unless CSS is skipped, generate CSS
    if (!options.skipCss) {
        operations.css = function(asyncCallback) {
            generateCss(options, function(err, cssString) {
                if (err) return asyncCallback(err);
                asyncCallback(null, cssString);
            });
        };
    }

    // Execute generators in parallel
    async.parallel(operations, function(err, results) {
        if (err) return callback(err);

        try {
            // Create Viewsaurus markup from content
            var finalHtml = '';
            options = _.extend(options, results);
            var viewsaurusMarkup = generateViewsaurus(options);

            // Wrap in stand-alone Jade wrapper unless directed not to
            if (options.noWrapper) {
                finalHtml = viewsaurusMarkup;
            } else {
                var templatePath = path.join(__dirname, '..', 'client', 
                    'templates', 'wrapper.jade');
                templatePath = path.resolve(templatePath);
                var wrapperJade = fs.readFileSync(templatePath, 'utf-8');

                // Render content into wrapper template
                options.viewsaurusContent = viewsaurusMarkup;
                finalHtml = jade.render(wrapperJade, options);
            }

            // Render and write to filesystem based on passed options
            var mainFile = path.join(options.outputDirectory, 
                options.outputFileName);
            if (!fs.existsSync(options.outputDirectory)) {
                wrench.mkdirSyncRecursive(options.outputDirectory);
            }
            fs.writeFileSync(mainFile, finalHtml);

            // If necessary, write out external javascript and CSS
            if (!options.inline && !options.skipCss) {
                var cssPath = path.join(options.outputDirectory, 
                    'viewsaurus.css');
                fs.writeFileSync(cssPath, results.css);
            }
            if (!options.inline && !options.skipJavaScript) {
                var jsPath = path.join(options.outputDirectory, 
                    'viewsaurus.js');
                fs.writeFileSync(jsPath, results.javascript);
            }

            // Copy over Ace editor - should be used to lazy-load
            if (!options.skipJavaScript) {
                var acePath = path.join(__dirname, '..', 'client', 'js', 
                    'static', 'ace');
                var aceDest = path.join(options.outputDirectory, 'ace');
                wrench.copyDirSyncRecursive(acePath, aceDest, {
                    forceDelete: true
                });
            }

            // Bamf! That should do it. No data to pass callback, null error
            // should serve.
            callback();
        } catch(e) {
            // Pass any I/O or similar exception to callback
            callback(e);
        }
    });
};