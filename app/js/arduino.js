var serialPort = require('serialport');
var SerialPort = require('serialport').SerialPort;
var pManager = require('./js/p_session_manager.js');
var arduino;
var connection;
var COM;
var current_session;
var DONE;

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
          (COM.search('COM')) != -1) {
        arduino = port;
        connection = new SerialPort(arduino.comName, {
          baudrate: 9600
        }, false);

        connection.open(function (error) {
          if ( error ) {
            console.log('failed to open: '+ error);
          } else {
            console.log('Arduino Ready');
            cb(true);
          }
        });
      } else {
        if (last === true){
          console.log('Arduino not found.');
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

function initialiseBoard(cb) {
  confirmReady(function(){
    console.log('Device Initialised');
  });
}
      
function scanProfilo(name) {
  DONE = false;
  var session = pManger.newSession(name);
  currentSession = session;
  connection.on('data', function(data) {
    data = "" + data;
    if (data != 'RDY') {
      saveProfilo(data, function() {
        console.log('Data Received');
        if (DONE == true) {
          endProfilo();
        }
        //if this in penultimate line
        if (currentSession.data.length == 512 * 255) {
            connection.write('DONE;');
            DONE = true;
        } else {
          confirmReady(function() {
            return;
          });
        }
      });   
    }
  });
}

function saveProfilo(data, cb) {
  var dataArray = data.split(',');
  if (dataArray.length == 513) {
    console.log('Data length correct!');
    // remove the semi colon at the end
    dataArray = dataArray.slice(0, dataArray.length() - 1);
    dataArray.forEach(function(point) {
      currentSession.data.push(point);
    }, cb);
  } else {
    console.log('Error: Data length incorrect, cancelling scan!', endProfilo);
  }
}

function confirmReady(cb) {
  connection.write('RDY;', function(){
    connection.on('data', function(data) {
      if (data == 'RDY') {
        cb();
      } else {
        console.log('Error: Did not receive ready confirmation'); 
      }
    });
  });
}

function endProfilo() {
  pMangager.endSession(currentSession);
  currentSession = null;
}

module.exports = {
  findBoard: findBoard,
  checkBoard : checkBoard
};
