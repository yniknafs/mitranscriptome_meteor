


Template.ssea_table_gene.helpers({
  selector: function() {
    if ( !Session.get('selectedGeneId') ) return { gene_id: null };
    return { gene_id: Session.get('selectedGeneId') };
  }
});

Template.ssea_table_transcript.helpers({
  selector: function() {
    if ( !Session.get('selectedGeneId') )
      return { gene_id: null };
    var s = { gene_id: Session.get('selectedGeneId') };
    if ( Session.get('selectedIsoformId') != 'gene' ) {
      s.transcript_id =  Session.get('selectedIsoformId');
    }
    return s;
  }
});
