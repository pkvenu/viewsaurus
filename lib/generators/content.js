var fs = require('fs');
var path = require('path');
var jade = require('jade');
var marked = require('supermarked');
var cheerio = require('cheerio');
var uglify = require('uglify-js');
var modelist = require('./modelist');

var CLIENT = path.join(__dirname, '..', '..', 'client');
var STATIC_DIR = path.join(CLIENT, 'js', 'static');

// Manually define supermarked filter, because built-in jade filter isn't
// finding supermarked
jade.filters.markdown = function(html) {
    return marked(html, {
        theme: 'monokai'
    });
};

// Generate an HTML representation of walkthrough content based on the
// project configuration and export options
module.exports = function(options, callback) {
    // Get tutorial data
    var tutorialDir = path.join(options.project, 'tutorial');
    var tutorialConfig = require(path.join(tutorialDir, 'config.json'));
    var indexJadePath = path.join(tutorialDir, 'index.jade');
    var tutorialContent, jsSource, cssSource;

    // Load tutorial contents
    try {
        tutorialContent = jade.renderFile(indexJadePath, options);
    } catch(e) {
        return callback(e);
    }

    // Look for any files associated with the content
    var $ = cheerio.load(tutorialContent);
    var files = {}, fileModes = {}, fileReadError;
    $('[data-file]').each(function(i, elem) {
        var file = $(this).attr('data-file');
        var mode = $(this).attr('data-mode');

        // if the data-file attribute is blank, nbd
        if (!file) return;

        if (!files[file]) {
            var fullPath = path.join(options.project, file);
            if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
                fileReadError = new Error('Project parse error - no file found '
                    + 'at ' + fullPath + '. Check your "data-file" attributes '
                    + 'for "' + file + '" and make sure that file exists in'
                    + 'your code project.');
                return false;
            }

            files[file] = {
                content: fs.readFileSync(fullPath, 'utf-8')
            };

            // Store any Ace modes we'll need to add to our content
            if (!mode) {
                // try and guess mode from the file extension
                var modeInfo = modelist.getModeForPath(file);
                mode = modeInfo.name;
            }

            files[file].mode = mode;
        }
    });

    if (fileReadError) 
        return callback(fileReadError);

    // Create textareas for all code files
    var codeHtml = '\n<div class="saurus-files" style="display:none;">';
    Object.keys(files).forEach(function(file) {
        // Encode content to preserve formatting with any HTML minimizing/
        // compression jazz
        var fileContent = new Buffer(files[file].content).toString('base64');

        // Create text area HTML
        var taHtml = '<textarea class="saurus-file" data-file="'
            + file + '" data-mode="' + files[file].mode + '">' 
            + fileContent + '</textarea>\n';
        codeHtml += taHtml;
    });
    codeHtml += '</div>\n';

    // Append files to tutorial content
    tutorialContent += codeHtml;

    // Suspect this will become async at one point, defer callback execution
    process.nextTick(function() {
        callback(null, tutorialContent);
    });
};