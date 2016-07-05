var call_list = {};

function Call(id, emitter) {
  call_list[id] = [];
  this.emitter = emitter;
}

Call.prototype.addUserToList = function(id, name, user_id, email) {
  call_list[id].push({my_id: id, name: name, user_id: user_id, email: email});
};

Call.prototype.removeUserFromList = function(myid, user_id) {
  call_list[myid].filter(function(user) {
    if (parseInt(user.user_id) === parseInt(user_id)) {
      call_list[myid].splice(0,1);
      console.log('splice');
    }
  });
  this.emitter.emit('removed-from-list', myid);
};

Call.prototype.getCallList = function(id) {
  return call_list[id];
};

exports.onRemoveFromList = function() {

};

module.exports = Call;