const admin = require('firebase-admin');
admin.initializeApp();

exports.onCreateUser = require('./triggers/onCreateUser').onCreateUser;
