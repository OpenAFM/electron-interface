var fs = require('fs');
var sessionType = require('./session.js');
var SESSION_FOLDER = __dirname + '/../sessions/';
var EXTENSION = '.json';
var SESSIONS = [];

function loadAllSessions() {
  fs.readdir(SESSION_FOLDER, function(err, files) {
    if (err) { throw err; }
    files.forEach(function(file) {
      fs.readFile(SESSION_FOLDER + file, 'utf-8', function(err, data) {
        if (err) { throw err; }
        var session = JSON.parse(data);
        var existing = SESSIONS.filter(function(x) { return x.id == session.id; })[0];
        if (!existing) {
          SESSIONS.push(session); 
        }
      });
    });
  });
};

loadAllSessions();

function newSession(name) {
  var session = sessionType.createSession(name);
  session.startTime = Date.now();
  return session;
}

function endSession(session) {
  session.endTime = Date.now();
  fs.writeFile(SESSION_FOLDER + session.id, JSON.stringify(session), function(err) {
    if (err) { throw err; }
    console.log("Session Saved.");
    loadAllSessions();
  });  
}

module.exports = {
  newSession: newSession,
  endSession: endSession,
  sessions: SESSIONS
};
