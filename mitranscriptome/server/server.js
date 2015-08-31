Meteor.startup(function () {
  // code to run on server at startup
});

Meteor.methods({
  getSamples: function() {
    return Samples.find().fetch();
  },
  getExpressionByGene: function(gene_id) {
    // mongo query for one row of expression data
    return ExpressionGene.findOne({ key: gene_id });
  },
  getExpressionByTranscript: function(transcript_id) {
    // mongo query for one row of expression data
    return ExpressionTranscript.findOne({ key: transcript_id });
  },
  searchGene: function(query, options) {
    options = options || {};
    // guard against client-side DOS: hard limit to 50
    if (options.limit) {
      options.limit = Math.min(50, Math.abs(options.limit));
    } else {
      options.limit = 50;
    }

    var regex = new RegExp(query);
    var query = Aliases.find({$or: [
        { alias: {$regex: regex } },
        { gene_id: {$regex:  regex} }]
      }, options).fetch();

    return query;
  },
  searchAnalysis: function(query, options) {
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
    var query = Analyses.find({name: {$regex:  regex}}, options).fetch();
    // console.log(query);
    return query;
  }
});
