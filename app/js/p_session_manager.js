var fs = require('fs');
var sessionType = require('./profilometer_session.js');
var SESSION_FOLDER = __dirname + '/../sessions/profilometer/';
var EXTENSION = '.json';
var SESSIONS = [];

function loadAllSessions() {
  fs.readdir(SESSION_FOLDER, function(err, files) {
    if (err) { throw err; }
    // for each file in sessions folder
    files.forEach(function(file) {
      fs.readFile(SESSION_FOLDER + file, 'utf-8', function(err, data) {
        if (err) { throw err; }
        //read file to session object
        var session = JSON.parse(data);
        //see if this session already in sessions array
        var existing = SESSIONS.filter(function(x) { return x.id == session.id; })[0];
        //if it isn't already there add it to the array
        if (!existing) {
          SESSIONS.push(session); 
        }
      });
    });
  });
}

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
