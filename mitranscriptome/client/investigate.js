
Tracker.autorun(function () {
  if (! Session.get("selectedGeneId") ) return;

  Meteor.call('selectGene',
    Session.get('selectedGeneId'),
    function(err, res) {
      Session.set('selectedGene', res);
      Session.set('plotId', 'gene');
    }
  );
});

Template.investigate.onRendered(function () {
  $('.ui.checkbox').checkbox();
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
    Session.set("selectedGeneId", suggestion.obj.gene_id);
  }
});

Template.expression_plot.helpers({
  active: function() {
    return Session.get('selectedGene') ? true : false;
  },
  gene: function() {
    return Session.get('selectedGene').gene;
  },
  isoforms: function() {
    if ( !Session.get('selectedGene') ) return [];
    return _.values(Session.get('selectedGene').transcripts);
  },
  scaleIs: function(scale) {
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
  // instantiate semantic ui modules
  $('#dropdown-isoform').dropdown({
    on: 'hover',
    action: 'select',
    onChange: function(val) {
      Session.set('plotId', val);
    }
  });
  $('#dropdown-groupby').dropdown({
    on: 'hover',
    onChange: function(val) {
      Session.set("groupByProps", val.split(","));
    }
  });

  // expression plot
  Tracker.autorun(function () {
    if (! Session.get('selectedSamples') ) return;
    if (! Session.get('selectedGene') ) return;
    // expression data for gene / isoform
    var g = Session.get('selectedGene');
    var plotId = Session.get('plotId')
    var plotTitle;
    var exprData;
    if (plotId === 'gene') {
      exprData = g.expression.gene;
      plotTitle = 'Gene: ' + g.gene.gene_id;
    } else {
      exprData = g.expression.transcripts[plotId];
      plotTitle = 'Isoform: ' + g.transcripts[plotId].transcript_id + ' (' + g.gene.gene_id + ')';
    }
    // currently selected samples
    var samples = Session.get("selectedSamples");
    // sample properties
    var props = Session.get("groupByProps") || [];
    // boxplot - one box for each tissue type
    // fancy d3 to subdivide column metadata into arrays by tissue type
    var nested_data = d3.nest()
      .key(function(d) {
        return props.map(function (el) { return d[el]; }).join();
      })
      .sortKeys(d3.ascending)
      .entries(samples);

    // build one box for each tissue type
    var traces = [];
    nested_data.forEach(function (el1) {
      var vals = el1.values.map(function (el2) {
        return exprData.value[el2._id];
      });

      traces.push({
        'y': vals,
        type: 'box',
        name: el1.key
      });
    });

    // plot layout
    var layout = {
      title: plotTitle,
      yaxis: {
        title: "FPKM",
        autoscale: true,
        type: Session.get("expressionPlotScale")
      }
    };

    // box plot
    Plotly.newPlot('plotly_expression', traces, layout);

    // bar plot
    // var x = samples.map(function(el) { return el.library_id; });
    // var y = exprData.value;
    // var data = [{x: x, y: y, type: 'bar'}]
    // Plotly.newPlot('gene_plot', data);
  });
});

Template.expression_plot.events({
  'click .ui.buttons > .ui.button': function(event) {
    Session.set('expressionPlotScale', event.target.value);
  }
});
