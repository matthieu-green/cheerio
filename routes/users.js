var express = require('express');
var router = express.Router();
var passport = require('passport');
const cors = require('./cors');

const bodyParser = require('body-parser');
var User = require('../models/user');
var authenticate = require('../authenticate');

router.use(bodyParser.json());
router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )


/* GET users listing. */
router.post('/signup', (req, res, next) =>{
  User.register(new User({username: req.body.username, admin: req.body.admin, address: req.body.address, name: req.body.name}),
    req.body.password, (err, user) =>{
      if(err){
        res.statusCode = 500;
        res.setHeader('Content-type', 'application/json');
        res.json({err: err});
      }
      else{
        passport.authenticate('local')(req, res, () =>{
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        });
      }
    });
});

/* Login with Bearer Token*/

router.post('/login', cors.corsWithOptions, (req, res, next) =>{
  passport.authenticate('local', (err, user, info) =>{
    if(err)
      return next(err);
    if(!user){
      res.statusCode=401;
      res.setHeader('Content-type', 'application/json');
      res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
    }
    req.logIn(user, (err) =>{
      if(err){
        res.statusCode = 401;
        res.setHeader('Content-type', 'application/json');
        re.json({success: false, status: 'Login Unsuccessful!', err: 'Could not login user!'});
      }

      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode=200;
      res.setHeader('Content-type', 'application/json');
      res.json({success: true, status: 'Login Successful', token: token, admin: req.user.admin, name: user.name, address: user.address});
    });
  }) (req, res, next);
})

/* Logout destroy credentials*/


router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if(req.session){
    req.session.destroy();
    req.clearCookie('session-id');
    res.redirect('/');
  }else{
    var error = new Error('You are not logged in!');
    error.status = 403;
    next(error);
  }
})

/* Check Bearer Token validity */

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user});

    }
  }) (req, res);
});


module.exports = router;
