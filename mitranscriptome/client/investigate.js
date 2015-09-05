Tracker.autorun(function () {
  if (! Session.get("selectedGene") ) return;
  Meteor.call('getExpressionByGene',
              Session.get("selectedGene"),
              function(err, res) {
                Session.set("selectedGeneExpr", res);
              });
});

Template.investigate.onRendered(function () {
  // instantiate semantic ui modules
  $('.ui.dropdown').dropdown({
    on: 'hover',
    onChange: function(val) {
      Session.set("groupByProps", val.split(","));
    }
  });
});

Template.investigate.helpers({
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

Template.expression_plot.helpers({
  scaleIs: function(scale) {
    console.log("hello");
    console.log(Session.get("expressionPlotScale"));
    return Session.get("expressionPlotScale") === scale;
  },
  properties: function() {
    return [
      { "prop_id": "sample_type", "name": "Sample Type" },
      { "prop_id": "tissue_type", "name": "Tissue" },
      { "prop_id": "cancer_progression", "name": "Cancer" }
    ];
  }
});

Template.expression_plot.onRendered(function () {
  // expression plot
  Tracker.autorun(function () {
    if (! Session.get("selectedGeneExpr")) return;
    if (! Session.get("selectedSamples")) return;

    // expression data for gene
    var row = Session.get("selectedGeneExpr");
    // currently selected samples
    var cols = Session.get("selectedSamples");
    // sample properties
    var props = Session.get("groupByProps") || [];
    // boxplot - one box for each tissue type
    // fancy d3 to subdivide column metadata into arrays by tissue type
    var nested_data = d3.nest()
      .key(function(d) {
        return props.map(function (el) { return d[el]; }).join();
      })
      .sortKeys(d3.ascending)
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

    // plot layout
    var layout = {
      title: Session.get("selectedGene"),
      yaxis: {
        title: "FPKM",
        autoscale: true,
        type: Session.get("expressionPlotScale")
      }
    };

    // box plot
    Plotly.newPlot('plotly_expression', traces, layout);

    // bar plot
    // var x = cols.map(function(el) { return el.library_id; });
    // var y = row.value;
    // var data = [{x: x, y: y, type: 'bar'}]
    // Plotly.newPlot('gene_plot', data);
  });
});

Template.expression_plot.events({
  'click .ui.buttons > .ui.button': function(event) {
    Session.set('expressionPlotScale', event.target.value);
  }
});