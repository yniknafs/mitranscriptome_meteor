Meteor.startup(function () {
  // code to run on server at startup
});

Meteor.methods({
  getSamples: function() {
    return Samples.find().fetch();
  },
  selectGene: function(gene_id) {
    // get gene aliases
    aliases = Aliases.find({ gene_id: gene_id }, { fields: { _id: 0, alias: 1 } }).fetch();
    aliases = _.map(aliases, function(a) { return a.alias; });
    // get gene metadata
    gene = Genes.findOne({ gene_id: gene_id }, { fields: { _id: 0 } });
    // get gene expression
    exprGene = ExpressionGene.findOne({ key: gene_id }, { fields: { _id: 0 } });
    // get transcript metadata
    transcripts = Transcripts.find({ gene_id: gene_id }, { fields: { _id: 0 } }).fetch();
    transcripts = _.indexBy(transcripts, 'transcript_id');
    // get transcript expression
    exprTranscript = ExpressionTranscript.find({
      key: { $in: gene.transcript_ids }
    }, {
      fields: { _id: 0 }
    }).fetch();
    exprTranscript = _.indexBy(exprTranscript, 'key');
    return {
      aliases: aliases,
      gene: gene,
      transcripts: transcripts,
      expression: {
        gene: exprGene,
        transcripts: exprTranscript
      }
    };
  },
  searchGeneSemantic: function(query) {
    var regex = new RegExp(query);
    return Aliases.find({ alias: {$regex: regex} }).fetch();
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
    var query = Aliases.find({ alias: {$regex: regex} }).fetch();
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
