#!/usr/bin/env node
var path = require('path');
var colors = require('colors');
var parser = require('nomnom');
var pkgInfo = require('../package.json');

// Setup nomnom CLI option parser
parser.script('saurus');
parser.option('project', {
    abbr: 'p',
    help: 'Code walkthrough project directory',
    default: process.cwd()
});
parser.option('version', {
    help: 'print version and exit',
    flag: true,
    callback: function() {
        return pkgInfo.version
    }
});

// Start up a simple dev server to use during development
parser.command('author')
    .help('run a local dev server to preview tutorials')
    .option('port', {
        abbr: 'P',
        help: 'HTTP port for the dev server',
        default: 8080
    })
    .callback(require('./commands/author'));

// Export a Viewsaurus tutorial
// Start up a simple dev server to use during development
parser.command('export')
    .help('export a Viewsaurus tutorial')
    .option('outputFileName', {
        abbr: 'n',
        help: 'File name for output HTML document',
        default: 'index.html'
    })
    .option('outputDirectory', {
        abbr: 'o',
        help: 'Write output HTML, CSS, and JavaScript to this directory',
        default: process.cwd()
    })
    .option('inline', {
        flag: true,
        abbr: 'i',
        help: 'Inline JavaScript and CSS in exported HTML'
    })
    .option('minify', {
        flag: true,
        abbr: 'm',
        help: 'Minify generated JavaScript and CSS'
    })
    .option('pretty', {
        flag: true,
        abbr: 'P',
        help: 'Make output prettier',
        default: true
    })
    .option('skipCss', {
        flag: true,
        abbr: 'C',
        help: 'Don\'t generate CSS'
    })
    .option('skipJavaScript', {
        flag: true,
        abbr: 'J',
        help: 'Don\'t generate JavaScript'
    })
    .option('noWrapper', {
        flag: true,
        abbr: 'W',
        help: 'Don\'t wrap output HTML in a container page'
    })
    .callback(require('./commands/export'));

// Create a new viewsaurus tutorial
parser.command('new')
    .help('create a new Viewsaurus tutorial folder')
    .option('title', {
        abbr: 't',
        help: 'the title of your tutorial',
        default: 'Learn You ' + path.basename(process.cwd()) + ' For Much Win'
    })
    .option('repo', {
        abbr: 'r',
        help: 'the GitHub username/repo for this project, ' 
            + 'e.g. "twilio/twilio-ruby" or "substack/node-browserify"'
    })
    .option('herokuButton', {
        abbr: 'B',
        help: 'whether or not this project supports instant deployment with '
            + 'the "Heroku Button"',
        default: false
    })
    .callback(require('./commands/new'));

// Release the hounds!
var cliOptions = parser.parse();