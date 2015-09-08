Meteor.startup(function(){
  // initializes typeahead instances
  Meteor.typeahead.inject();
  // initialize Session variables
  Meteor.call('getSamples', function(err, res) {
    Session.set('selectedSamples', res);
  });
  Session.setDefault('selectedGeneId', undefined);
  Session.setDefault('selectedGene', undefined);
  Session.setDefault('expressionPlotScale', 'linear');
  Session.setDefault('expressionPlotType', 'box');
  Session.setDefault('selectedIsoform', 'gene');

});


Template.body.onRendered(function () {
  $('.menu .item').tab();

  $('.ui.search')
    .search({
      type: 'standard',
      minCharacters: 2,
      fields: {
        results: 'results',
        title: 'gene_id',
        description: 'alias'
      },
      onSelect: function(result, response) {
        // console.log('onSelect result ' + JSON.stringify(result));
        // console.log('onSelect response ' + JSON.stringify(response));
        Session.set("selectedGeneId", result.gene_id);
        return true;
      },
      apiSettings: {
        // hack to use Meteor instead of semantic api
        mockResponseAsync: function(settings, callback) {
          var query = settings.urlData.query;
          Meteor.call('searchGeneSemantic', query, function(err, res) {
            if (err) {
              console.log(err);
              return;
            }
            var response = { success: true, results: res };
            callback(res);
          });
        },
        onResponse: function(meteorResponse) {
          // console.log('onResponse ' + JSON.stringify(meteorResponse));
          return { results: _.values(meteorResponse) };
        }
      }
    });
});

Template.body.helpers({
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
    Session.set("selectedGeneId", suggestion.obj.gene_id);
  }
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
