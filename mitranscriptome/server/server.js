Meteor.startup(function () {
  // code to run on server at startup
});

Meteor.methods({
    search: function(query, options) {
        options = options || {};
        // guard against client-side DOS: hard limit to 50
        if (options.limit) {
            options.limit = Math.min(50, Math.abs(options.limit));
        } else {
            options.limit = 50;
        }
        // console.log(options);
        // TODO fix regexp to support multiple tokens
        var regex = new RegExp(query);
        var query = Transcripts.find({$or: [{transcript_id: {$regex:  regex}},
                                            {gene_id: {$regex:  regex}}]}, options).fetch();
        // console.log(query);
        return query;
    }
});
