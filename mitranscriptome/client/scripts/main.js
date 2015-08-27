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

	Template.typeahead.helpers({
		search: function(query, sync, callback) {
			Meteor.call('search', query, {limit: 10, sort: { transcript_id : 1 }}, function(err, res) {
				if (err) {
					console.log(err);
					return;
				}
				callback(res.map(function(v){ return {value: v.transcript_id + '(' + v.gene_id + ')'}; }));
			});
		}
	});

  Meteor.startup(function(){
		// initializes all typeahead instances
		Meteor.typeahead.inject();

	});
