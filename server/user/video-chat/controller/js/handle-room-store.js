var Q = require('q');
var store = {};

function Room(room, ids) {
  store[room] = ids;
  return {
    getRoom: function() {
      return 2;
    }
  };
}

Room.getRoom = function(room) {
  var deferred = Q.defer();
  Object.keys(Room).forEach(function(key) {
    return deferred.resolve(key);
  });
};

module.exports = Room;