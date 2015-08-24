var serialPort = require("serialport");
var SerialPort = require("serialport").SerialPort;
var arduino;
var connection;
var COM;


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
        if (last === true){
          console.log("Arduino not found.");
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
      if ((COM.search("cu.usbmodem") != -1) ||
          (COM.search("cu.wchusbserial1410") != -1) ||
          (COM.search("tty.usbmodem") != -1) || 
          (COM.search("COM")) != -1) {
        cb(true);
      } else {
        if (last === true) {
          cb(false);
        }
      }
    });
  });
}

function initialiseBoard() {
  connection.write("IN", function () {
    connection.on('data', function(data) {
      data = "" + data;
      if (data == 'IN') {

      }
    });
  });

}

module.exports = {
  findBoard: findBoard,
  checkBoard : checkBoard
};
