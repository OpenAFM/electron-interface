var fs = require('fs');
var sessionType = require('./afm_session.js');
var SESSION_FOLDER = __dirname + '/../sessions/afm/';
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
  session.dims = [256,256];
  session.startTime = Date.now();
  return session;
}

function endSession(session, cb) {
  session.endTime = Date.now();
  fs.writeFile(SESSION_FOLDER + session.id, JSON.stringify(session), function(err) {
    if (err) { throw err; }
    console.log("Session Saved.");
    loadAllSessions();
    cb();
  });  
}


function exportSession(sessionId) {
  var fileName = sessionId
  var lineSize = session.dims[0];
  var data = fs.readFileSync(__dirname + '/' + fileName,'utf8');
  var file = __dirname + '/' + fileName + '-parsed.txt';
  fs.writeFile(file, "x,y,z1,z2\n");

  function inputData(file, data, lineSize){
    var newData = "x,y,z1,z2\n"; var location = 0;
    for (var x=0; x < lineSize; x++){
      for (var y = 0; y < lineSize; y++){
        newData += x + "," + y + "," + data[y + location] + ',' + data[y + lineSize - 1 + location] + '\n'; 
      }
      location += lineSize - 1;
    }
    fs.writeFile(file,newData)
  }

  function createNewFile(data, file, cb){
    var parseData = JSON.parse(data);
    var id = parseData.id;
    var zValues = parseData.data;
    console.log(typeof zValues);
    fs.writeFile(file, "");
    cb(file, zValues, lineSize);
  }

  createNewFile(data, file, inputData, lineSize);
};

function deleteSession(session) {
  //maybe fs.unlink or preferable .remove etc
};

module.exports = {
  newSession: newSession,
  endSession: endSession,
  exportSession: exportSession,
  deleteSession: deleteSession,
  sessions: SESSIONS
};
