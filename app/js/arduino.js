var serialPort = require('serialport');
var SerialPort = require('serialport').SerialPort;
var pManager = require('../js/p_session_manager.js');
var arduino;
var connection;
var COM;
var currentSession;
var DONE;
var currentLine = '';
var readyCount;


function findBoard(cb) {
  var last = false;
  serialPort.list(function (err, ports) {
    // check ports on computer
    ports.forEach(function(port, i) {
      if (i == ports.length - 1){
        last = true;
      }
 
      COM = port.comName;
      // check to see if arduino plugged in and open connection
      if ((COM.search('cu.usbmodem') != -1) ||
          (COM.search('cu.wchusbserial1410') != -1) ||
          (COM.search('tty.usbmodem') != -1) ||
          (COM.search('cu.usbserial') != -1) ||
          (COM.search('COM')) != -1) {
        arduino = port;
        connection = new SerialPort(arduino.comName, {
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
        if (last === true){
          console.log('Arduino not found!');
          cb(false);
        }
      }
    });
  });
}

function checkBoard(cb) {
  var last = false;
  serialPort.list(function (err, ports) {
    // check ports on computer
    ports.forEach(function(port, i, stop) {
      if (i == ports.length -1){
        last = true;
      }
      COM = port.comName;
      // check to see if arduino plugged in and open connection
      if ((COM.search('cu.usbmodem') != -1) ||
          (COM.search('cu.wchusbserial141') != -1) ||
          (COM.search('tty.usbmodem') != -1) || 
          (COM.search('cu.usbserial') != -1) ||
          (COM.search('COM')) != -1) {
        cb(true);
      } else {
        if (last === true) {
          cb(false);
        }
      }
    });
  });
}

function startScan(name) {
  DONE = false;
  readyCount = 0;
  var session = pManager.newSession(name);
  currentSession = session;
  console.log('Attempting initialisation.');
  connection.write('GO;', function(){
    receiveData();
  });
}

function receiveData() {
  //each time new data is received
  connection.on('data', function(data){
    data = '' + data;
    //check if it contains a semicolon
    var semi = data.search(';');
    // if it doesn't append it to the current data store
    if (semi == -1) {
      currentLine = currentLine + data;
    } 
    // if it does contain a semicolon...
    else {
      //take the data up to the semicolon
      var startData = data.slice(0, semi);
      //if this is GO then send a RDY to start the scan
      if (startData == 'GO') {
        console.log('Go received');
        connection.write('RDY;');
        console.log('Scan started.');
      }
      //if this is RDY then store anything after the semicolon
      else if (startData == 'RDY') {
        realData = data.slice(semi + 1, data.length);
        //if this actual data has a semi colon it is a whole line (or corrupt)
        var nextSemi = realData.search(';');
        if (nextSemi != -1) {
          if (nextSemi == realData.length) {
            currentLine = realData.slice(0, realData.length);
            //TO DO:
            //plotData(currentLine);
            saveData(currentLine, function() {
              checkFinished(function() {
                connection.write('RDY;');
                readyCount += 1;
                console.log('Sent ready command ' + readyCount + ', waiting for new line');
              });
            });
          } else {
            console.log('Start data is corrupted by stray semicolon');
            console.log('Corrupt data: ' + data);
            endScan();
          }
        }
        //otherwise append this data to the current data store
        else {
          currentLine = currentLine + realData;
        }
      }
      //if there is a semicolon but no start text this is the end of a line of actual data
      else {
        if (semi == realData.length) {
          currentLine = currentLine + realData.slice(0, realData.length);
            //TO DO:
            //plotData(currentLine);
            saveData(currentLine, function() {
              checkFinished(function() {
                connection.write('RDY;');
                readyCount += 1;
                console.log('Sent ready command ' + readyCount + ', waiting for new line');
              });
            });
        } else {
          console.log('End data is corrupted by stray semicolon');
          console.log('Corrupt data: ' + data);
          endScan();
        } 
      }
    }
  });
}

function checkFinished(cb) {
  if (DONE === true) {
    console.log('All data received, terminating session');
    endScan();
  } else{
    //if that was the penultimate line
    if (currentSession.data.length == 512 * 255) {
      console.log('This was the penultimate line, preparing to terminate session');
      connection.write('DONE;');
      DONE = true;
      cb();
    } else {
      console.log('Data processed, proceeding');
      cb();
    }
  }
}

function saveData(data, cb) {
  var dataArray = data.split(',');
  function appendCb(dataArray, cb) {
    dataArray.forEach(function(point) {
      currentSession.data.push(parseInt(point, 10));
    });
    cb();
  } 
  if (dataArray.length == 512) {
    console.log('Data length correct!');
    // remove the semi colon at the end
    dataArray = dataArray.slice(0, dataArray.length - 1);
    appendCb(dataArray, cb);
  } else {
    console.log('Error: Data length incorrect, cancelling scan! Data' + data);
    endScan();
  }
}

function endScan() {
  //TO DO:
  //reset the scan button to allow new scan
  //
  pManager.endSession(currentSession, function() {
    currentSession = null;
  });
}

module.exports = {
  findBoard: findBoard,
  checkBoard : checkBoard,
  startScan : startScan
};
