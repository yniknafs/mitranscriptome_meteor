Samples = new Mongo.Collection('Samples');
Aliases = new Mongo.Collection('Aliases');
Transcripts = new Mongo.Collection('Transcripts');
Genes = new Mongo.Collection('Genes');
ExpressionTranscript = new Mongo.Collection('ExpressionTranscript');
ExpressionGene = new Mongo.Collection('ExpressionGene');
SSEATranscript = new Mongo.Collection('SSEATranscript');
SSEAGene = new Mongo.Collection('SSEAGene');
Analyses = new Mongo.Collection('Analyses');

// meteor-tabular init code
TabularTables = {};
Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Gene = new Tabular.Table({
  name: "SSEAGeneTable",
  collection: SSEAGene,
  columns: [
    { data: "analysis_id", title: "Analysis Id" },
    { data: "best_dn.transcript_id", title: "Best Dn Isoform" },
    { data: "best_dn.frac", title: "Best Dn Frac", searchable: false },
    { data: "best_dn.fdr", title: "Best Dn FDR", searchable: false },
    { data: "best_up.transcript_id", title: "Best Up Isoform" },
    { data: "best_up.frac", title: "Best Up Frac", searchable: false },
    { data: "best_up.fdr", title: "Best Up FDR", searchable: false }
  ],
  extraFields: ['gene_id', 'best_dn', 'best_up']
});

TabularTables.Transcript = new Tabular.Table({
  name: "SSEATranscriptTable",
  collection: SSEATranscript,
  columns: [
    { data: "transcript_id", title: "Transcript ID"},
    { data: "analysis_id", title: "Analysis" },
    { data: "frac", title: "Frac" },
    { data: "fdr", title: "FDR" }
  ]
});

TabularTables.Analysis = new Tabular.Table({
  name: "AnalysisList",
  collection: SSEAGene,
  columns: [
    { data: "analysis_id", title: "Analysis Id" },
    { data: "analysis_tissue", title: "Tissue" },
    { data: "gene_id", title: "Gene ID" },
    { data: "best_dn.transcript_id", title: "Best Dn Isoform" },
    { data: "best_dn.frac", title: "Best Dn Frac" },
    { data: "best_dn.fdr", title: "Best Dn FDR" },
    { data: "best_up.transcript_id", title: "Best Up Isoform" },
    { data: "best_up.frac", title: "Best Up Frac" },
    { data: "best_up.fdr", title: "Best Up FDR" }
  ]
});
