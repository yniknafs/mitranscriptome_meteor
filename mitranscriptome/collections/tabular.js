TabularTables = {};

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Analysis = new Tabular.Table({
  name: "AnalysisList",
  collection: SSEATranscript,
  columns: [
    {data: "transcript_id", title: "Transcript ID"},
    {data: "frac", title: "Frac"}
  ]
});
