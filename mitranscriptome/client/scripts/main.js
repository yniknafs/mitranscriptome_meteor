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
  },
  expression_data: function() {
    var res = Expression.findOne({ transcript_id: Session.get("selectedGene") });
    x = [];
    y = [];
    for (key in res) {
      if (key === "_id" || key === "transcript_id") continue;
      x.push(key);
      y.push(res[key]);
    }
    var data = [{x: x, y: y, type: 'bar'}]
    Plotly.newPlot('gene_plot', data);
    console.log(x);
    console.log(y);
  }
});

// Template.boxplot.onRendered(function () {
//   var divid = this.data.divid;
//   var y0 = [];
//   var y1 = [];
//
//   var gene_id = Session.get("selectedGene");
//
//   for (var i = 0; i < 50; i++) {
//   	y0[i] = Math.random();
//   	y1[i] = Math.random() + 1;
//   }
//   var trace1 = {
//     y: y0,
//     type: 'box'
//   };
//   var trace2 = {
//     y: y1,
//     type: 'box'
//   };
//   var data = [trace1, trace2];
//
//   Plotly.newPlot(divid, data);
//   // var graphOptions = {filename: "hello", fileopt: "overwrite"};
//   // Plotly.newPlot(divid, data, graphOptions, function (err, msg) {
//   //     console.log(msg);
//   // });
// });

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
  selected: function(event, suggestion, Transcripts) {
    // event - the jQuery event object
    // suggestion - the suggestion object
    // datasetName - the name of the dataset the suggestion belongs to
    // TODO your event handler here
    Session.set("selectedGene", suggestion.obj.transcript_id);
  }
});

Meteor.startup(function(){
  // initializes all typeahead instances
  Meteor.typeahead.inject();
});
