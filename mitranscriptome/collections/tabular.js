TabularTables = {};

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Analysis = new Tabular.Table({
  name: "AnalysisList",
  collection: SSEAGene,
  columns: [
    {data: "gene_id", title: "Gene ID"},
    {data: "frac", title: "Frac"}
  ]
});
