var Range = ace.require('ace/range').Range;
var explorerWidth = 270;

// Generate HTML string for breadcrumbs
function breadcrumbHtml(filePath) {
    var separator = '&nbsp;/&nbsp;';
    var filePieces = filePath.split(/[\/\\]/);
    var html = separator;
    for (var i = 0, l = filePieces.length; i<l; i++) {
        html += '<span>' + filePieces[i] + '</span>';
        if (i+1 < l) {
            html += separator;
        }
    }
    return html;
}

var CodeView = Backbone.View.extend({
    // Mount on the Code section
    el: '#viewsaurus .saurus-code',

    events: {
        'click .file-path i': 'toggleExplorer'
    },

    // Initialize UI
    initialize: function(options) {
        var self = this;
        // Store a reference to main app model
        self.app = options.app;
        
        // Create editor widget
        var ta = self.$el.find('.saurus-editor').get(0);
        self.editor = ace.edit(ta);
        self.editor.setFontSize(14);
        self.editor.setAnimatedScroll(true);
        self.editor.setReadOnly(true);
        self.editor.setHighlightActiveLine(false);
        self.editor.setShowPrintMargin(false);
        self.editor.$blockScrolling = Infinity;
        self.editor.setBehavioursEnabled(false);
        self.editor.setWrapBehavioursEnabled(false);
        self.editor.setTheme('ace/theme/monokai');
        self.editor.renderer.setScrollMargin(0,8, 0, 8);
        self.editor.getSession().setWrapLimitRange();
        // Disable syntax checker
        self.editor.getSession().setUseWorker(false);

        // Grab useful DOM references
        self.$steps = $('#viewsaurus .saurus-content .step');
        self.$files = $('#viewsaurus .saurus-file');
        self.$breadcrumbs = self.$el.find('.file-path .crumb-container');
        self.$editor = self.$el.find('.saurus-editor');
        self.$folder = self.$el.find('.file-path i');

        // listen for update events
        self.app.on('change:stepIndex', self.stepChange, self);
        self.app.on('change:currentFile', self.currentFileChange, self);
        self.app.on('change:explorerShown', self.showExplorer, self);
        self.app.on('resize', function() {
            self.editor.resize(true);
        });

        // Initialize with the first code file
        self.showFile(self.$files.first());
    },

    // Change the contents of the editor if the current file is changed
    // elsewhere
    currentFileChange: function() {
        var self = this;
        var currentFile = self.app.get('currentFile');
        var $file = $('.saurus-file[data-file="' + currentFile + '"]');
        self.showFile($file);
    },

    // Get current step index and update code
    stepChange: function() {
        var self = this;

        // Get file for current step
        var $step = self.$steps.eq(self.app.get('stepIndex'));
        var stepFile = $step.attr('data-file');
        var highlightString = $step.attr('data-highlight');
        if (stepFile) {
            var $file = $('.saurus-file[data-file="' + stepFile + '"]');
            self.showFile($file, highlightString);
        } else {
            // Remove highlighting if no file, and force redraw
            self.editor.getSession().setActiveLines('');
            self.editor.setValue(self.editor.getValue());
            self.editor.clearSelection();
        }
    },

    // Toggle file explorer
    toggleExplorer: function() {
        var self = this;
        var shown = self.app.get('explorerShown');
        // analytics
        if (!shown) {
            self.app.trigger('show_explorer');
        }
        self.app.set('explorerShown', !shown);
    },

    // Show/hide file explorer
    showExplorer: function() {
        var self = this;
        var shown = self.app.get('explorerShown');
        var offset = shown ? explorerWidth : 0;
        var addedClass = shown ? 'fa-folder-open' : 'fa-folder';
        var removedClass = !shown ? 'fa-folder-open' : 'fa-folder';

        self.$folder.removeClass(removedClass).addClass(addedClass);
        self.$el.animate({
            right: offset
        }, function() {
            self.editor.resize(true);
        });
    },

    // Show the given file, optionally applying a highlight and scrolling
    // to the first line of the highlight.
    showFile: function($file, highlightString) {
        var self = this;
        var mode = $file.attr('data-mode');
        var filePath = $file.attr('data-file');

        // Update editor content and editing mode
        self.app.set({
            currentFile: filePath
        });
        self.editor.getSession().setMode('ace/mode/'+mode);

        // Update file breadcrumbs
        self.$breadcrumbs.html(breadcrumbHtml(filePath));

        // Handle highlight
        self.editor.getSession().setActiveLines(highlightString);

        // Update content
        var src = Base64.decode($file.val()).trim();
        self.editor.setValue(src);
        self.editor.clearSelection();

        // Manually trigger resize to fix scroll bar locations
        self.editor.resize();

        // helper to scroll to a line
        function scrollTo(line, animated) {
            // Give file time to render before attempting scroll to prevent 
            // scrolling from beyond the top of the document (just trust me,
            // without this files short enough to have no scroll slide in 
            // weird from the top)
            setTimeout(function() {
                self.editor.scrollToLine(line, false, animated);
            },50);
        }

        // If there was no highlight, we're done
        if (!highlightString) {
            scrollTo(0, false);
            return self.$editor.removeClass('saurus-highlighted');
        }

        // Scroll to the first highlighted line
        self.$editor.addClass('saurus-highlighted');
        var highlightParts = highlightString.split(',');
        var firstLine = Number(highlightParts[0].split('-')[0])-4;
        if (firstLine < 0) firstLine = 0;
        scrollTo(firstLine, true);
    }
});

module.exports = CodeView;