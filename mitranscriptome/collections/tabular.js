TabularTables = {};

Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);

TabularTables.Transcripts = new Tabular.Table({
  name: "TranscriptList",
  collection: Transcripts,
  columns: [
    {data: "transcript_id", title: "Transcript ID"},
    {data: "ss_compname", title: "Gene ID"}
  ]
});
