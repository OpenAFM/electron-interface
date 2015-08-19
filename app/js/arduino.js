var serialPort = require("serialport");
var SerialPort = require("serialport").SerialPort;
var arduino;
var dataArray = [];
var connection;
var array = [];
var connected = 0;
var COM;
var first = true;

function findBoard(cb) {
  serialPort.list(function (err, ports) {
    // check ports on computer
    ports.forEach(function(port) {
      COM = port.comName;
      // check to see if arduino plugged in and open connection
      if ((COM.search("cu.usbmodem") != -1) ||
          (COM.search("cu.wchusbserial1410") != -1) ||
          (COM.search("tty.usbmodem") != -1) || 
          (COM.search("COM")) != -1) {
        arduino = port;
        connection = new SerialPort(arduino.comName, {
          baudrate: 9600
        }, false);

        connection.open(function (error) {
          if ( error ) {
            console.log("failed to open: "+ error);
          } else {
            console.log("Arduino Ready");
            cb(true);
          }
        });
      } else {
        if (first === true){
          console.log("Arduino not found.");
          cb(false);
        }
        first = false;
      }
    });
  });
}

function isBoard() {
  serialPort.list(function (err, ports) {
    // check ports on computer
    ports.forEach(function(port) {
      COM = port.comName;
      // check to see if arduino plugged in and open connection
      if ((COM.search("cu.usbmodem") != -1) ||
          (COM.search("cu.wchusbserial1410") != -1) ||
          (COM.search("tty.usbmodem") != -1) || 
          (COM.search("COM")) != -1) {
        connected = true;
      } else {
        connected = false;
      }
    });
  });
}

function checkBoard() {
  isBoard();
  return connected;
}
module.exports = {
  findBoard: findBoard,
  checkBoard : checkBoard
};
