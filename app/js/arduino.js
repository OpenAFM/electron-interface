/* Created by Angus
 To do:
 - have lineLength set by user and saved to session when scan initalised
 - trigger reset when scan finished
 - does currentLine still need to be global?
 */

var serialPort = require('serialport');
var SerialPort = require('serialport').SerialPort;
var sessManager = require('../js/afm_session_manager.js');
var EventEmitter = require('events').EventEmitter;

var ARDUINO;
var connection;
var COM;
var currentSession;
var DONE;
var readyCount;
var currentLine = '';
var lineLength = 256;
var lineEmitter = new EventEmitter();


function checkPorts(cb) {
  var last = false;
  serialPort.list(function (err, ports) {
    // check ports on computer
    ports.forEach(function(port, i, stop) {
      if (i == ports.length -1){
        last = true;
      }
      COM = port.comName;
      // check to see if arduino on port
      // this should be made less brittle somehow...
      if ((COM.search('cu.usbmodem') != -1) ||
          (COM.search('cu.wchusbserial') != -1) ||
          (COM.search('tty.usbmodem') != -1) || 
          (COM.search('cu.usbserial') != -1) ||
          (COM.search('COM') != -1)) {
        var arduino = port;
        cb(true, arduino);
      } else {
        if (last === true) {
          cb(false, port);
        }
      }
    });
  });
}

function findBoard(cb) {
  checkPorts(function(found, arduino) {
    if (found === true) {
      ARDUINO = arduino;
      connection = new SerialPort(ARDUINO.comName, {
        baudrate: 9600
      }, false);
      connection.open(function (error) {
        if ( error ) {
          console.log('failed to open: '+ error);
        } else {
          console.log('Arduino ready!');
          cb(true);
        }
      });
    } else {
      console.log('Arduino not found!');
      cb(false);
    }
  });
}

function checkBoard(cb) {
  checkPorts(function(found, arduino) {
    if (arduino == ARDUINO) {
      cb(true);
    } else {
      cb(false);
    }
  });
}

function startScan(name) {
  //to do:
  //receive linelength from ui
  //and set globally and in session
  DONE = false;
  readyCount = 0;
  var session = sessManager.newSession(name);
  currentSession = session;
  console.log('Attempting initialisation.');
  connection.write('GO;', function(){
    receiveData();
  });
}

function receiveData() {
  //each time new serial data is received
  connection.on('data', function(data){
    //console.log('Serial data received: ' + data);
    //take data as string
    data = '' + data;

    //semi is the position of the first semi colon in data (-1 if none)
    var semi = data.search(';');

    // if there is no semi colon in data
    if (semi == -1) {
      //console.log("No semicolon in data");
      // data is just part of a message
      //add it to the currently recording line 
      currentLine = currentLine + data;
    }

    // if data does contain a semicolon 
    else {
      var len = data.length;
      //if the semi is at the end of data
      if (semi == len - 1) {
        //data is the end of a message 
        //so add it to line and read it
        currentLine = currentLine + data  
        readLine(currentLine, function() {
          currentLine = '';
        });
      } else {
        //take the upto (including) and after the semi
        var startData = data.slice(0, semi + 1);
        var endData = data.slice(semi + 1, len);
        //add the first part to the line and read it
        currentLine = currentLine + startData;
        readLine(currentLine, function() {
          var nextSemi = endData.search(';');
          //if no more semis in data
          if (nextSemi == -1) {
            //data is a whole message and just part of the next
            //so start a new line with that part
            currentLine = endData
          }
          //otherwise endData should be a complete message
          else if (nextSemi == endData.length - 1) {
            //make a line of it and read it
            currentLine = endData;
            readLine(currentLine, function() {
              currentLine = '';
            });
          } else {
            console.log('Stray semi-colon, data corrupt!');
          }
        });
      }
    }
  });
}



function readLine(line, cb) {
  //line can be: GO; RDY; DONE; or actual datas
  if (line == 'GO;') {
    console.log('Go received');
    currentLine = '';
    connection.write('RDY;');
    readyCount += 1;
    console.log('Scan started.');
  } else if (line == 'RDY;') {
    //do nothing, real data in next line
  } else if (line == 'DONE;'){
    //set flag for final data in next line
    DONE = true;
  } else {
    //this is a line of data. maybe check its length?
    //then plot and save it
    plotData(line, function() {
      saveData(line, function() {
        // either bring the scan to an end or continue it
        checkFinished();
      });
    });
  }
  cb()
}

 
/*    


      //if this startData is RDY or DONE then store anything after the semicolon as afterData
      else if ((startData == 'RDY') || (startData == 'DONE')) {
            console.log('Whole data line received');
            //so append it to the current line, without the semicolon
            currentLine = afterData.slice(0, afterData.length - 1);
            // currentLine is now this full line of data, so process it
            plotData(currentLine, function() {
              saveData(currentLine, function() {
                checkFinished(function() {
                  connection.write('RDY;');
                  readyCount += 1;
                  console.log('Sent ready command ' + readyCount + ', waiting for new line');
                });
              });
            });
          } else {
            console.log('Start data is corrupted by stray semicolon');
            console.log('Corrupt data: ' + data);
            endScan();
          }
        }
        //if there is no semicolon after 'RDY;' or 'DONE;' 
        //then start a new current line with the data after it
        else {
          currentLine = afterData + '';
        }
      }
      //if there is a semicolon but no start text this is the end of a line of actual data
      else {

        //check the semicolon is at the end, or data must be corrupt.
        if (semi == startData.length) {
          console.log('Data line completed');
          //append this end of data line data to the currentLine
          currentLine = currentLine + startData.slice(0, startData.length);
          //currentLine now complete so process it
            plotData(currentLine, function(){
              saveData(currentLine, function() {
                checkFinished(function() {
                  //currentLine used so wipe it
                  currentLine = '';
                  connection.write('RDY;');
                  readyCount += 1;
                  console.log('Sent ready command ' + readyCount + ', waiting for new line');
                });
              });
            });
        } else {
          console.log('Current line: ' + currentLine + '. Length: ' + currentLine.length);
          console.log('End data is corrupted by stray semicolon');
          console.log('Corrupt data: ' + data);
          endScan();
        } 
      }
    }
  });
}*/





function checkFinished() {
  if (DONE === true) {
    console.log('All data received, terminating session');
    if (currentSession.data.length == lineLength * lineLength * 2) {
      console.log('Image dataset looks good.');
    } else {
      console.log('Image dataset length does noot look correct. Length: ' + currentSession.data.length);
    }
    endScan();
  } else{
    //if that was the penultimate line
    if (readyCount == 255) {
      console.log('This was the penultimate line, preparing to terminate session');
      connection.write('DONE;');
      DONE = true;
      cb();
    } else {
      console.log('Data processed, proceeding');
      connection.write('RDY;');
      readyCount += 1;
      console.log('Sent ready command ' + readyCount + ', waiting for new line');
    }
  }
}

//hack to fix reversed colours in plot - send them reversed data!
function reverseSet(set, max){
  set.forEach(function(n, i) {
    if (typeof n != 'number') {
      set[i] = 404;
      console.log('N was not a number');
    }
    set[i] = max - n;
  });
}

function plotData(lineStr, cb){
  var lineForward = lineStr.split(',').slice(0, lineLength);
  console.log('I am an: ' + (typeof lineForward) + "Can't you tell: " + lineForward);
  var lineBack = lineStr.split(',').slice(lineLength, lineStr.length);
  if (lineForward.length == 512) {
    reverseSet(lineForward, 2047);
  } else { console.log("Forward scan data length incorrect: " + lineForward.length);}
  if (lineBack.length == 512) {
    reverseSet(lineBack, 2047);
  } else { console.log("Forward scan data length incorrect: " + lineBack.length);}
  var line = [[lineForward],[lineBack]];
  //line.push(lineForward);
  //line.push(lineBack);
  console.log('Attempting to emit data to plot.');
  console.log('Emitting: ' + line);
  lineEmitter.emit('line', line);
  console.log('Emitted data to plot: ' + line);
  lineEmitter.once('plotted', function() {
    console.log('Received plotted confirmation, continuing');
    cb(); 
  });
}

function saveData(data, cb) {
  var dataArray = data.split(',');
  function appendCb(dataArray, cb) {
    dataArray.forEach(function(point) {
      if (parseInt(point, 10) === null) {
        console.log('Got null datapoint: ' + point);
        currentSession.data.push(0);
      } else {
        currentSession.data.push(parseInt(point, 10));
      }
    });
    cb();
  } 
  if (dataArray.length == lineLength * 2) {
    console.log('Data length correct!');
    appendCb(dataArray, cb);
  } else {
    console.log('Error: Data length incorrect, cancelling scan! Data' + dataArray);
    endScan();
  }
}

function endScan() {
  //TO DO:
  //reset the scan button to allow new scan
  //
  sessManager.endSession(currentSession, function() {
    currentSession = null;
  });
}


//Allow export of arduino interface functions and line data emitter
module.exports = {
  findBoard: findBoard,
  checkBoard : checkBoard,
  startScan : startScan,
  endScan : endScan,
  lineEmitter : lineEmitter
};
