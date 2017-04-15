var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var browserify = require('browserify');
var uglify = require('uglify-js');
var jade = require('jade');

// File paths
var CLIENT = path.join(__dirname, '..', '..', 'client');
var STATIC_DIR = path.join(CLIENT, 'js', 'static');

// Add files that should skip browserify here
var STATIC = [
    'featherlight.js',
    'base64.js'
].map(function(file) {
    return path.join(STATIC_DIR, file);
});

// Create viewsaurus.js based on options
module.exports = function(options, callback) {
    var opts = _.defaults(options||{}, { 
        minify: false,
        clientDir: CLIENT
    });

    // Create browsifier
    var b = browserify();
    b.add(path.join(opts.clientDir, 'js', 'main.js'));

    // Generate bundle for application code
    b.bundle(function(err, src) {
        if (err) {
            console.error(err.stack);
            callback(err);
            return;
        }

        // Application source, browserified
        var stringSrc = src.toString();

        // Prepend globals from static/js
        var statics = '';
        try {
            STATIC.forEach(function(filePath) {
                statics += fs.readFileSync(filePath, { encoding:'utf-8' })+'\n';
            });
        } catch(e) {
            console.error('problem reading static files');
            console.error(e.stack);
            callback(e);
            return;
        }

        // Minify if requested
        if (opts.minify) {
            try {
                stringSrc = uglify.minify(stringSrc, {
                    fromString: true
                }).code;
            } catch(e) {
                console.error('problem minifying source');
                console.error(e.stack);
                callback(e);
                return;
            }
        }

        // Prepend statics (should be pre-minified)
        stringSrc = statics+'\n'+stringSrc;

        // return the goods
        callback(null, stringSrc);
    });
};