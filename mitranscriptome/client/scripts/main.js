Tracker.autorun(function () {
  if (! Session.get("selectedGene") ) return;
  Meteor.call('getExpressionByGene',
              Session.get("selectedGene"),
              function(err, res) {
                Session.set("selectedGeneExpr", res);
              });
});

Tracker.autorun(function () {
  Meteor.call('getSamples', function(err, res) {
    Session.set("selectedSamples", res);
  });
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
    Session.set("selectedGene", rowData.transcript_id);
  }
});

Template.geneview.onRendered(function () {
  var x = [];
  var y = [];

  Tracker.autorun(function () {
    if (! Session.get("selectedGeneExpr")) return;
    if (! Session.get("selectedSamples")) return;

    // expression data for gene
    var row = Session.get("selectedGeneExpr");
    // currently selected samples
    var cols = Session.get("selectedSamples");

    // boxplot - one box for each tissue type
    // fancy d3 to subdivide column metadata into arrays by tissue type
    // TODO: this code can be precomputed since DB is not changing
    var nested_data = d3.nest()
      .key(function(d) { return d.tissue_type; })
      .entries(cols);

    // build one box for each tissue type
    var traces = [];
    nested_data.forEach(function (el1) {
      var vals = el1.values.map(function (el2) {
        return row.value[el2._id];
      });

      traces.push({
        'y': vals,
        type: 'box',
        name: el1.key
      });
    });

    // box plot
    Plotly.newPlot('gene_plot', traces);

    // bar plot
    // var x = cols.map(function(el) { return el.library_id; });
    // var y = row.value;
    // var data = [{x: x, y: y, type: 'bar'}]
    // Plotly.newPlot('gene_plot', data);

  });
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

Template.gene_typeahead.helpers({
  search: function(query, sync, callback) {
    Meteor.call('searchGene', query, {limit: 100, sort: { alias : 1 }}, function(err, res) {
      if (err) {
        console.log(err);
        return;
      }
      callback(res.map(function(v){ return {value: v.gene_id, obj: v}; }));
    });
  },
  selected: function(event, suggestion, datasetName) {
    // event - the jQuery event object
    // suggestion - the suggestion object
    // datasetName - the name of the dataset the suggestion belongs to
    Session.set("selectedGene", suggestion.obj.gene_id);
  }
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

Meteor.startup(function(){
  // initializes all typeahead instances
  Meteor.typeahead.inject();
});
