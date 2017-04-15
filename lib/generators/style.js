var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var less = require('less');
var CleanCSS = require('clean-css');

// File paths for client side assets
var CLIENT = path.join(__dirname, '..', '..', 'client');
var STATIC = [];

module.exports = function(options, callback) {
    
    var opts = _.defaults(options||{}, { 
        minify: false,
        clientDir: CLIENT
    });

    // Read in initial less source
    try {
        var lessSrc = fs.readFileSync(path.join(opts.clientDir, 'less', 
            'main.less'), 'utf8');
    } catch(e) {
        console.error('problem reading main less file');
        console.error(e.stack);
        callback(e);
        return;
    }

    // Less parse codewalker styles
    var lessParser = new less.Parser({
        paths: [path.join(opts.clientDir, 'less')],
        optimization: 1,
        filename: 'wrapper.less'
    });
    lessParser.parse(lessSrc, function(lesse, cssTree) {
        if (lesse) {
            console.error('problem parsing less source');
            console.error(lesse.stack);
            callback(lesse);
            return;
        }

        // Get CSS src
        try {
            var theCss = cssTree.toCSS();
            // Minify if requested
            if (opts.minify) {
                theCss = new CleanCSS({
                    noAdvanced: true
                }).minify(theCss);
            }

            // Return CSS string in callback
            callback(null, theCss);
        } catch(e) { 
            console.error('problem minifying compiled CSS');
            console.error(e.stack);
            callback(e);
            return;
        }
    });
};