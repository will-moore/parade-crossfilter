var ProjectsView = Backbone.View.extend({
    el: $("#projects"),

    template: JST["src/templates/projects.html"],

    initialize: function() {
        this.error = null;
        this.ready = false;
        this.projects = new ProjectList();
        this.render();

        this.projects.fetch({
            url: window.PARAMS.WEB_API + "m/projects?limit=10",
            success: function(data) {
                this.ready = true;
                this.render();
            }.bind(this),
            error: function(err) {
                this.ready = true;
                this.error = "failed to retrieve the project list.";
                this.render();
                console.info(err);
            }.bind(this)
        });
    },

    render: function() {
        this.$el.html(this.template({
            "ready": this.ready,
            "error": this.error,
            "projects": this.projects
        }));
    }
});
