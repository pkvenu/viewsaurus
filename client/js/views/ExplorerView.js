var explorerWidth = -270;
var autoShowExplorer = 1280;

// Helper to generate an HTML string for a leaf file in the explorer
function createFileListItem(fileName, fullPath) {
    // create truncated file name
    var truncFileName = fileName;
    if (truncFileName.length > 30) {
        truncFileName = '...' + fileName.substring(fileName.length-30);
    }
    var html = '<li class="saurus-explorer-file" data-file="' + fullPath + '">';
    html += '<i class="fa fa-fw fa-file-text-o"></i>&nbsp;' 
        + truncFileName + '</li>';
    return html;
}

var ExplorerView = Backbone.View.extend({
    // Mount on the Explorer section
    el: '#viewsaurus .saurus-explorer',

    events: {
        'click .saurus-explorer-file': 'selectFile'
    },

    // Initialize UI
    initialize: function(options) {
        var self = this;

        // Store a reference to main app model
        self.app = options.app;

        // Grab useful DOM chunks
        self.$inner = self.$el.find('.saurus-file-list');
        self.$files = $('#viewsaurus .saurus-file');
        self.$steps = $('#viewsaurus .saurus-content .step');
        
        // Subscribe to model updates
        self.app.on('change:explorerShown', self.toggleExplorer, self);
        self.app.on('change:stepIndex', self.selectCurrent, self);

        // Populate file explorer
        self.createExplorer();

        // Check initial size of Viewsaurus to see if the explorer should be
        // initially open
        _.defer(function() {
            if ($('#viewsaurus').outerWidth() >= autoShowExplorer) {
                self.app.set('explorerShown', true);
            }
        });
    },

    // Create file explorer contents
    createExplorer: function() {
        var self = this;

        // Collect file data
        var folderPaths = [], leafPaths = [], folders = {};
        self.$files.each(function() {
            var $file = $(this);
            var p = $file.attr('data-file');
            var parts = p.split(/[\/\\]/);
            if (parts.length > 1) {
                folderPaths.push(p);
            } else {
                leafPaths.push(p);
            }
        });

        folderPaths.sort();
        leafPaths.sort();

        // collect files into common folders
        for (var i = 0, l = folderPaths.length; i<l; i++) {
            var filePath = folderPaths[i];
            var currentPath = filePath.split(/[\/\\]/);
            var leaf = currentPath.pop();
            var folderPath = currentPath.join('/');
            if (!folders[folderPath]) folders[folderPath] = [];
            folders[folderPath].push({
                fileName: leaf,
                fullPath: filePath
            });
        }

        var html = '<ul>';

        // Iterate folders to create HTML structure
        for (var folder in folders) {
            html += '<li class="saurus-explorer-folder">';
            html += '<i class="fa fa-fw fa-folder-o"></i>';
            html += '&nbsp;' + folder + '<ul>';
            var files = folders[folder];
            for (var i = 0, l = files.length; i<l; i++) {
                var fileData = files[i];
                html += createFileListItem(fileData.fileName, 
                    fileData.fullPath);
            }
            html += '</ul></li>';
        }

        // Iterate leaf files
        for (var i = 0, l = leafPaths.length; i<l; i++) {
            html += createFileListItem(leafPaths[i], leafPaths[i]);
        }

        html += '</ul>';

        self.$inner.html(html);
    },

    // show/hide the explorer
    toggleExplorer: function() {
        var self = this;
        var offset = self.app.get('explorerShown') ? 0 : explorerWidth;
        self.$el.animate({
            right: offset
        });
    },

    // Highlight the currently selected file based on step index
    selectCurrent: function() {
        var self = this;

        // Get file for current step
        var $step = self.$steps.eq(self.app.get('stepIndex'));
        var stepFile = $step.attr('data-file');

        // Highlight current step file or keep current selection
        if (stepFile) {
            var $file = self.$el.find('li[data-file="' + stepFile + '"]');
            self.$el.find('li').removeClass('current');
            $file.addClass('current');
        }
    },

    // Manually select a file from the explorer
    selectFile: function(e) {
        var self = this;
        var $selected = $(e.target);
        self.app.set('currentFile', $selected.attr('data-file'));
        self.$el.find('li').removeClass('current');
        $selected.addClass('current');
    }
});

module.exports = ExplorerView;