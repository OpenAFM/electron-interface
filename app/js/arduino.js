var serialPort = require('serialport');
var SerialPort = require('serialport').SerialPort;
var pManager = require('../js/p_session_manager.js');
var arduino;
var connection;
var COM;
var currentSession;
var DONE;
var currentLine;
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





function getData(cb) {
  var currentData = '';
  connection.on('data', function(data){
    data = '' + data;
    if (data.slice(0,4) == 'RDY;') {
      console.log('Receiving new line.');
      currentData = '';
      currentData = currentData + data.slice(4, data.length);
    } else {
      currentData = currentData + data;
    }
    var semi = currentData.search(';');
    //there is a semi colon in the data
    if (semi != -1) {
      if (semi == currentData.length -1 ) {
        console.log('Line Received: ' + data);
        cb(currentData);
        return;
      } else {
        console.log('Stray semi-colon in data: ' + currentData);
        return;
      }
    }
  });
}



function initialiseBoard(cb) {
  readyCount = 0;
  var session = pManager.newSession(name);
  currentSession = session;
  console.log('Attempting initialisation.');
  connection.write('GO;', function(){
    connection.on('data', function(data) {
      data = '' + data;
      if (data == 'GO;') {
        console.log('Device initialised.');
        confirmReady(cb);
      }
    });
  });
}
      
function scanProfilo(name) {
  console.log('Scan Started');
  DONE = false;
  getData(function(currentLine) {
    saveProfilo(currentLine, function() {
      if (DONE === true) {
        console.log('All data received, terminating session');
        endProfilo();
      } else{
        //if that was the penultimate line
        if (currentSession.data.length == 512 * 255) {
          console.log('This was the penultimate line, preparing to terminate session');
          connection.write('DONE;');
          DONE = true;
        } else {
          console.log('Data processed, proceeding');
          confirmReady(function() {});
        }
      }
    });
  });
}

function saveProfilo(data, cb) {
  var dataArray = data.split(',');
  function appendCb(dataArray, cb) {
    dataArray.forEach(function(point) {
      currentSession.data.push(point);
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
    endProfilo();
  }
}

function confirmReady(cb) {
  readyCount += 1;
  connection.write('RDY;', function(){
    console.log('Sent ready signal' + readyCount + '.');
    cb();
  });
}

function endProfilo() {
  pManager.endSession(currentSession, function() {
    currentSession = null;
  });
}

module.exports = {
  findBoard: findBoard,
  checkBoard : checkBoard,
  initialiseBoard : initialiseBoard,
  scanProfilo : scanProfilo,
  endProfilo : endProfilo
};
