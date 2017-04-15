var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var jade = require('jade');

var TPL = path.resolve(path.join(__dirname, '..', '..', 'client', 
    'templates'));

// Generate Viewsaurus UI
module.exports = function(options) {
    // Get tutorial components
    var contentHtml = options.content;

    // Parse helpful rendering data from tutorial content
    var renderContext = _.clone(options);

    // Render tutorial into a viewsaurus wrapper element
    return jade.renderFile(path.join(TPL, 'viewsaurus.jade'), renderContext);
};