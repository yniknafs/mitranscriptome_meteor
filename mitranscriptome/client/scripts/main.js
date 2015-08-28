// counter starts at 0
Session.setDefault('counter', 0);

Template.hello.helpers({
  counter: function () {
    return Session.get('counter');
  }
});

Template.hello.events({
  'click button': function () {
    // increment the counter when button is clicked
    Session.set('counter', Session.get('counter') + 1);
  }
});

Template.body.helpers({
  transcripts: function () {
    // Show newest tasks at the top
    return Transcripts.find({}, {sort: {createdAt: -1}});
  }
});

Template.geneview.helpers({
  selected_gene: function () {
    return Session.get("selectedGene");
  }
});

Template.geneview.onRendered(function () {
  var x = [];
  var y = [];

  Tracker.autorun(function () {
    if (! Session.get("selectedGene")) return;

    // mongo query for row metadata
    var row = Expression.findOne({ key: Session.get("selectedGene") });
    // mongo query for column metadata
    var cols = Samples.find().fetch();
    console.log(cols)
    // boxplot - one box for each tissue type
    // fancy d3 to subdivide column metadata into arrays by tissue type
    // TODO: this code can be precomputed since DB is not changing
    var nested_data = d3.nest()
      .key(function(d) { return d.tissue; })
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
    console.log(traces);

    // box plot
    Plotly.newPlot('gene_plot', traces);

    // bar plot
    //var data = [{
    //  x:
    //}]
    // for (key in res) {
    //   if (key === "_id" || key === "transcript_id") continue;
    //   x.push(key);
    //   y.push(res[key]);
    // }
    // var data = [{x: x, y: y, type: 'bar'}]
    // Plotly.newPlot('gene_plot', data);
    // console.log(x);
    // console.log(y);
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

Template.typeahead.helpers({
  search: function(query, sync, callback) {
    Meteor.call('search', query, {limit: 10, sort: { transcript_id : 1 }}, function(err, res) {
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
    // TODO your event handler here
    console.log('event: ' + event);
    console.log('suggestion: ' + suggestion);
    console.log('datasetName: ' + datasetName);
    Session.set("selectedGene", suggestion.obj.transcript_id);
  }
});

Meteor.startup(function(){
  // initializes all typeahead instances
  Meteor.typeahead.inject();
});
