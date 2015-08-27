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

Template.boxplot.onRendered(function () {
  var divid = this.data.id;
  var x = [];
  var y0 = [];

  for (var i = 0; i < 6503; i++ ) {
    x[i] = i;
    y0[i] = i + Math.random();
  }
  var trace1 = { x: x, y: y0, type: 'bar' };
  Plotly.newPlot(divid, [trace1]);

  // var data = [trace1, trace2];
  // var graphOptions = {filename: "hello", fileopt: "overwrite"};
  // Plotly.newPlot(divid, data, graphOptions, function (err, msg) {
  //     console.log(msg);
  // });
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
    Session.set("selectedGene", suggestion.obj.gene_id);
    console.log(Session.get("selectedGene"))
  }
  // opened:
});



Meteor.startup(function(){
  // initializes all typeahead instances
  Meteor.typeahead.inject();
});
