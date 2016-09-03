// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;

// var UserSchema = new Schema({
//   facebookId: String,
//   token: String,
//   socketid: String,
//   name: String,
//   firstName: String,
//   lastName: String,
//   picture: String,
//   isOnline: {type: Boolean, default: false},
//   email: String,
//   inCall: {type: Boolean, default: false},
//   gender: String,
//   status: String,
//   orientation: String,
//   age: {type: Number},
//   birthday: String,
//   userTaken: {type: Boolean, default: false},
//   created_at: {type: Date, default: Date.now},
//   distance: {type: Number},
//   inMatching: {type: Boolean, default: false},
//   block_list: [
//     {
//       name: String,
//       user_id: String,
//       created_at: {type: Date, default: Date.now}
//     }
//   ],
//   people_met: [
//     {
//       name: String, user_id: String, liked: {type: Boolean, default: false}, created_at: {type: Date, default: Date.now}, mutual: {type: Boolean, default: false},
//       games_played: {
//         losses: {type: Number, default: 0},
//         wins: {type: Number, default: 0}
//       }
//     },
//   ],



//   pending_calls: [
//     {
//       name: String,
//       user_id: String,
//       created_at: {type: Date, default: Date.now}
//     }
//   ],

//   upcoming_calls: [
//     {user_id: String, name: String}
//   ],

//   total_likes: {type: Number, default: 0},
  
//   preferences: {
//     iWantToMeet: String,
//     age: {
//       lt: Number,
//       gt: Number
//     }
//   },

//   location: { 
//     type: {type: String, default: 'Point'},
//     coordinates: [Number]
//     // This is a length 2 array with longitude, latitude
//   },
//   message: {type: Schema.Types.ObjectId, ref: 'Message'},
// });

// UserSchema.index({location: '2dsphere'});

// module.exports = mongoose.model('User', UserSchema);


// /*
//   use navigator in browser to grab users lat & lon
//   store in db after user logs in
// */