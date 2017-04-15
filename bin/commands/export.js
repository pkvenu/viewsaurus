var path = require('path');
var viewsaurus = require('../..');
var error = require('./util/logger').error;
var success = require('./util/logger').success;

// Export HTML output of a Viewsaurus tutorial
function exportCommand(options) {
    viewsaurus.generate(options, function(err) {
        if (err) return error(err);

        success('Viewsaurus tutorial generated at '
            + path.join(options.outputDirectory, options.outputFileName));
    });
}

module.exports = exportCommand;