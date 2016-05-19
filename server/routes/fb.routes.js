// module.exports = function(app, passport) {

//   app.get('/auth/facebook', passport.authenticate('facebook', {session: true}));

//   // handle the callback after facebook has authenticated the user
//   app.get('/auth/facebook/callback',
//     passport.authenticate('facebook', {
//       successRedirect : '/#settings',
//       failureRedirect : '/'
//     }));
// };

// // route middleware to make sure a user is logged in
//  function isLoggedIn(req, res, next) {
  
//   // if user is authenticated in the session, carry on
//   // if (req.isAuthenticated())
//   //   return next();

//   // // if they aren't redirect them to the home page
//   // res.redirect('/');
// }