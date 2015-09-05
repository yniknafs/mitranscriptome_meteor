Meteor.startup(function(){
  // initializes typeahead instances
  Meteor.typeahead.inject();

  // initialize Session variables
  Meteor.call('getSamples', function(err, res) {
    Session.set("selectedSamples", res);
  });
  Session.setDefault('selectedGene', undefined);
  Session.setDefault('expressionPlotScale', 'linear');
});

Template.body.onRendered(function () {
  $('.menu .item').tab();
});

Template.analysis_table.helpers({
  selector: function() {
    return {analysis_id: Session.get("selectedAnalysis")};
  }
});

Template.analysis_table.events({
  'click tbody > tr': function (event) {
    var dataTable = $(event.target).closest('table').DataTable();
    var rowData = dataTable.row(event.currentTarget).data();
    Session.set("selectedGene", rowData.gene_id);
  }
});

Template.heatmap.onRendered(function () {
  var divid = this.data.divid;
  var data = [
    {
      z: [[1, 20, 30], [20, 1, 60], [30, 60, 1]],
      colorscale: 'Picnic',
      type: 'heatmap'
    }
  ];
  var layout = {title: 'Picnic'};
  Plotly.newPlot(divid, data);
});

Template.analysis_typeahead.helpers({
  search: function(query, sync, callback) {
    Meteor.call('searchAnalysis', query, {limit: 100}, function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      callback(res.map(function(v){ return {value: v.analysis_id, obj: v}; }));
    });
  },
  selected: function(event, suggestion, datasetName) {
    // event - the jQuery event object
    // suggestion - the suggestion object
    // datasetName - the name of the dataset the suggestion belongs to
    Session.set("selectedAnalysis", suggestion.obj.analysis_id);
  }
});
