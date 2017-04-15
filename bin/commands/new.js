var fs = require('fs');
var path = require('path');
var wrench = require('wrench');
var info = console.log;
var error = require('./util/logger').error;
var warn = require('./util/logger').warn;
var success = require('./util/logger').success;

// Create a new project directory 
function newCommand(options) {
    var configJson = {
        title: options.title,
        repo: options.repo || '<your GitHub username>/<GitHub repo name>',
        description: 'Thanks for writing a tutorial with Viewsaurus! This example tutorial will show you the basic functionality of Viewsaurus. Click the "Start" button below to see how Viewsaurus works.',
        heroku: options.herokuButton
    };

    // Create tutorial directory
    var tutorialDir = path.join(options.project, 'tutorial');
    if (fs.existsSync(tutorialDir)) {
        return error('%s already exists!', tutorialDir);
    }

    // Set up default data
    var jadeTplString = fs.readFileSync(path.join(__dirname, '..', 
        'boilerplate', 'index.jade'), { encoding: 'utf-8' });
    var configJsonString = JSON.stringify(configJson, null, 4);

    // Create default tutorial setup
    wrench.mkdirSyncRecursive(tutorialDir);
    fs.writeFileSync(path.join(tutorialDir, 'index.jade'), jadeTplString, 
        'utf-8');
    fs.writeFileSync(path.join(tutorialDir, 'config.json'), configJsonString,
        'utf-8');

    return success('Viewsaurus tutorial directory created at %s.', tutorialDir);
}

module.exports = newCommand;