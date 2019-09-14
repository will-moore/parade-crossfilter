var ProjectModel = Backbone.Model.extend({});
var ProjectList = Backbone.Collection.extend({
    model: ProjectModel,

    parse: function (response) {
        if (typeof response === 'object' && response !== null &&
            Array.isArray(response.data)) {
                for (var p in response.data) {
                    this.push(new ProjectModel(response.data[p], {parse: true}));
                }
        }

        return this.models;
    }
});
