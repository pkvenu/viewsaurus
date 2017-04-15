// Get Title for a step either from a data attribute or the first title tag
function titleForStep($e) {
    var title = $e.attr('data-title');
    if (!title) title = $e.find('h1, h2, h3, h4, h5').first().text();
    return title;
}

// Represent UI state for prose view
var ProseModel = Backbone.Model.extend({
    defaults: {
        overviewShown: false
    }
});

// Prose View - manages currently visible prose and tutorial overview
var ProseView = Backbone.View.extend({
    // Mount on the prose section
    el: '#viewsaurus .saurus-prose',

    // track if start event was fired
    startFired: false,

    // track whether or not the last step has been reached
    lastStepReached: false,

    // UI events
    events: {
        'click .nav-overview': 'toggleOverview',
        'click .saurus-overview a': 'toggleOverview',
        'click .saurus-start a': 'hideStart',
        'click .saurus-content img': 'showLightbox',
        'click .nav-previous': 'previous',
        'click .nav-next': 'next' 
    },

    // Initialize UI
    initialize: function(options) {
        var self = this;

        // Store a reference to main app model and create view model
        self.app = options.app;
        self.model = new ProseModel();

        // Grab references to useful nodes
        self.$next = self.$el.find('.nav-next');
        self.$previous = self.$el.find('.nav-previous');
        self.$overviewNav = self.$el.find('.nav-overview i');
        self.$content = self.$el.find('.saurus-content');
        self.$overviewContent = self.$el.find('.saurus-overview');
        self.$total = self.$el.find('.total');
        self.$title = self.$el.find('.step-title');
        self.$overviewList = self.$el.find('.saurus-overview ul');
        self.$progressBar = self.$el.find('.saurus-progress-bar');
        self.$nextTitle = self.$el.find('.next-title-inner');
        self.$start = self.$el.find('.saurus-start');

        // Populate overview from tutorial data in the dom
        self.populateOverview();

        // Determine the initial next step title
        self.showNextStep(1);

        // On any history event, we want to hide the start screen
        Backbone.history.on('all', self.hideStart, self);
    
        // Subscribe to model updates
        self.app.on('change:stepIndex', self.stepChanged, self);
        self.model.on('change:overviewShown', self.overviewChanged, self);
    },

    // Analytics - fire event on main app for next/previous
    next: function() {
        var self = this;
        self.app.trigger('next');
    },

    previous: function() {
        var self = this;
        self.app.trigger('previous');
    },

    // Show a lightbox when an image is clicked
    showLightbox: function(e) {
        var $img = $(e.currentTarget);
        $.featherlight($img.attr('src'));
    },

    // Hide the initial start prompt
    hideStart: function() {
        var self = this;
        if (!self.startFired) {
            // Defer to allow page listeners to register
            _.defer(function() {
                self.app.trigger('start');
            });
            self.startFired = false;
        }
        self.$start.fadeOut();
    },

    // Show the next step title
    showNextStep: function(index) {
        var self = this;
        var text = "You did it! Good for you :)";
        if (index < self.app.totalSteps) {
            var $next = self.$content.find('.step').eq(index);
            var truncated = titleForStep($next).substring(0,35);
            if (truncated.length > 34) {
                truncated += '...';
            }
            text = 'Next: ' + truncated;
        }
        self.$nextTitle.html(text);
    },

    // toggle overview shown on view model on button click
    toggleOverview: function() {
        var self = this;
        if (!self.model.get('overviewShown')) {
            self.app.trigger('show_overview');
        }
        self.model.set('overviewShown', !self.model.get('overviewShown'));
    },

    // Handle an updated step
    stepChanged: function() {
        var self = this;
        var stepIndex = self.app.get('stepIndex');
        var $step = self.$el.find('.step').eq(stepIndex);

        // Update next step text
        self.showNextStep(stepIndex+1);

        // Hide overview if it is showing
        self.model.set('overviewShown', false);

        // Update progress bar
        self.$progressBar.animate({
            width: (((stepIndex+1) / self.app.totalSteps) * 100) + '%'
        });

        // Update to the proper prose section
        self.$el.find('.step').hide();
        $step.show();
        self.$content.scrollTop(0);

        // Update section title
        // self.$title.html($step.attr('data-title'));

        // Update current link in overview
        self.$overviewList.find('li').removeClass('current');
        self.$overviewList.find('li[data-step="' + stepIndex + '"]')
            .addClass('current');

        // Update next nav link
        if (self.app.hasNext()) {
            self.$next.addClass('clickable')
                .find('a').attr('href', '#' + (self.app.get('stepIndex')+1));
        } else {
            // If there's no next step, we've reached the end for the first time
            if (!self.lastStepReached) {
                self.lastStepReached = true;
                self.app.trigger('project_completed');
            }
            self.$next.removeClass('clickable')
                .find('a').attr('href', '#' + self.app.get('stepIndex'));
        }

        // Update previous nav link
        if (self.app.hasPrevious()) {
            self.$previous.addClass('clickable')
                .find('a').attr('href', '#' + (self.app.get('stepIndex')-1));
        } else {
            self.$previous.removeClass('clickable')
                .find('a').attr('href', '#0');
        }
    },

    // Handle overview show/hide
    overviewChanged: function() {
        var self = this;
        var shown = self.model.get('overviewShown');

        if (shown) {
            self.$overviewContent.animate({
                left:0
            });
            self.$overviewNav.addClass('fa-close')
                .removeClass('fa-list');
        } else {
            self.$overviewContent.animate({
                left:'-100%'
            });
            self.$overviewNav.removeClass('fa-close')
                .addClass('fa-list');
        }
    },

    // populate overview from data in the DOM
    populateOverview: function() {
        var self = this;
        var html = '';
        var firstChapter = true;
        var stepIndex = 0;

        // Iterate over chapters, extract data, build overview HTML
        self.$content.find('.chapter, .step').each(function() {
            var $thing = $(this);
            if ($thing.hasClass('chapter')) {
                if (!firstChapter) {
                    // end previous chapter
                    html += '</ul></li>';
                }
                firstChapter = false;
                html += '<li class="chapter"><span>';
                html += $thing.attr('data-title') + '</span><ul>';
            } else {
                html += '<li data-step="' + stepIndex + '">';
                html += '<a href="#' + stepIndex + '">';
                html += titleForStep($thing) + '</a></li>';
                stepIndex++;
            }
        });

        // close off final chapter li
        html += '</ul></li>';

        // Append generated overview HTML
        self.$overviewList.html(html);
    }
});

module.exports = ProseView;