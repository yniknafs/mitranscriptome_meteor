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
    var res = Expression.findOne({ transcript_id: Session.get("selectedGene") });
    console.log('res: ' + res);
    for (key in res) {
      if (key === "_id" || key === "transcript_id") continue;
      x.push(key);
      y.push(res[key]);
    }
    var data = [{x: x, y: y, type: 'bar'}]
    Plotly.newPlot('gene_plot', data);
    console.log(x);
    console.log(y);
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
