$(function(){
    // Override 'Backbone.sync'...
    Backbone.ajaxSync = Backbone.sync;
    var view = new ProjectsView();
});
