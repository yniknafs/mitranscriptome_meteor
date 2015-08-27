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
