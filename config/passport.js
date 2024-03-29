const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const Student = require('../models/student');
const Admin = require("../models/admin");

module.exports = function (passport) {
    passport.use("student-local",
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match student
            Student.findOne({ email })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'Email not registered' });
                    }
                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Incorrect Password' });
                        }
                    });
                });
        })
    );

    passport.use("admin-local",
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match admin
            Admin.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'Email not registered' });
                    }
                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Incorrect password' });
                        }
                    });
                });
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        Student.findById(id, function (err, user) {
            if (!user || user.length) {
                Admin.findById(id, function (err, user) {
                    done(err, user);
                });
            } else {
                done(err, user);
            }
        });
    });
};
