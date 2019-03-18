const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const { jwtSecret } = require('../configs/general')



const { User } = require('../sequelize.js');
const { generateHash, matchHash } = require('../shared/common.js');

module.exports = (passport) => { 

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
    function (req, email, password, done) {
      process.nextTick(() => {
        User.findOne({ where: { 'email': email } }).then((user) => {
          if (user) {
            return done(null, false, 'User already exits');
          } else {
            const newUser = new User();
            newUser.email = req.body.email;
            newUser.password = generateHash(req.body.password);
            newUser.firstName = req.body.firstName;
            newUser.lastName = req.body.lastName;
            newUser.gender = req.body.gender;
                      
            return newUser.save().then((user) => {
              return done(null, user);
            }).catch((err) => {
              return done(err);
            });
          }
        }).catch((err) => {
          return done(err);
        });

      });
    }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
    function (req,email, password, done) {         
      User.findOne({ where: { 'email': email } }).then((user) => {
        if (!user) {
          return done(null, false, 'User doesn\'t exists');
        }
        if (!matchHash(password, user.password)) {
          return done(null, false, 'Invalid Password.');
        } else {
          return done(null, user);
        }
      }).catch((err) => {
        return done(err);
      });
    }));


  passport.use(new JWTstrategy({
    secretOrKey: jwtSecret,
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
  }, async (token, done) => {
    try {
      return done(null, token.email);
    } catch (error) {
      done(error);
    }
  }));

};