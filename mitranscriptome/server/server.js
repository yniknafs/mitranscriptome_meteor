Meteor.startup(function () {
  // code to run on server at startup
});



Meteor.methods({
    transcript_search: function(query, options) {
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
        var query = Transcripts.find({$or: [{transcript_id: {$regex:  regex+'/i'}},
                                            {gene_id: {$regex:  regex}},
                                            {transcript_name: {$regex:  regex}}
                                           ]}, options).fetch();
        // console.log(query);
        return query;
    },

    getSamples: function() {
      return Samples.find().fetch();
    },
    getExpressionByTranscript: function(transcript_id) {
      // mongo query for one row of expression data
      return Expression.findOne({ key: transcript_id });
    },

    analysis_search: function(query, options) {
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
        var query = Analyses.find({ss_compname: {$regex:  regex}}, options).fetch();
        // console.log(query);
        return query;

      }

});
