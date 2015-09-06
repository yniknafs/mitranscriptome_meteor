


Template.ssea_table_gene.helpers({
  geneTableSelector: function() {
    if ( !Session.get('selectedGeneId') ) return { gene_id: null };
    return { gene_id: Session.get('selectedGeneId') };
  }
});
