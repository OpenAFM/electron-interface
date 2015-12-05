var serialPort = require('serialport');
var SerialPort = require('serialport').SerialPort;
var pManager = require('../js/afm_session_manager.js');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var arduino;
var connection;
var COM;
var currentSession;
var DONE;
var currentLine = '';
var readyCount;
var lineLength = 256;
var STOP = true;
var receiveCount = 0;
var scale_factor = 1;
var scale_offset = 0;

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
          (COM.search('cu.wchusbserial') != -1) ||
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
          (COM.search('cu.wchusbserial') != -1) ||
          (COM.search('tty.usbmodem') != -1) || 
          (COM.search('cu.usbserial') != -1) ||
          (COM.search('COM') != -1)) {
        cb(true);
      } else {
        if (last === true) {
          connection.close();
          cb(false);
        }
      }
    });
  });
}

function startScan(name) {
  //clear the plots
  ['leftImage', 'rightImage', 'leftChart', 'rightChart'].forEach(function(id) {
    document.getElementById(id).innerHTML = '';
  });
  emitter.emit('clearPlots');
  
  STOP = false;
  DONE = false;
  readyCount = 0;
  var session = pManager.newSession(name);
  currentSession = session;
  console.log('Attempting initialisation.');
  connection.write('GO;', function(){
    receiveData();
  });
}

/* incomplete rewrite of receiveData and checkFinished
 * because sometimes with non arduino micros, i will try to plot 'RDY'
 * instead of a line of data, using the current parser
 * ===========================================
 * receiveData gets connections and sends data to parseData
 * parseData gets data, forms currentLine, then send line to readLine
 * currentLine includes the closing semicolon
 *
 *
 * THIS BASICALLY WORKS I THINK BUT SOMETHING WRONG WITH THE LAST DATA POINT
*/
function receiveData() {
  //each time new serial data is received
  connection.on('data', function(data){
    //console.log('Serial data received: ' + data);
    //take data as string
    data = '' + data;
    parseData(data);
  });
}

function parseData(data) { 
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
    //if the first semi is at the end of data
    if (semi == len - 1) {
      //data is the end of a message 
      //so add it to line and read it
      currentLine = currentLine + data  
      readLine(currentLine, function() {
        currentLine = '';
      });
    } 
    else {
      //take upto(including) and after the semi
      var startData = data.slice(0, semi + 1);
      var endData = data.slice(semi + 1, len);
      //add the first part to the line and read it
      currentLine = currentLine + startData;
      readLine(currentLine, function() {
        currentLine = '';
        parseData(endData);
      });          
    }
  }
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
    //actually lets drop that semi
    line = line
    plotData(line, function() {
      saveData(line, function() {
        // either bring the scan to an end or continue it
        checkFinished();
      });
    });
  }
  cb()
}

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
//=========================================
//old version below, buggy but meh
/*
function receiveData() {
  //each time new data is received
  receiveCount += 1;
  if (receiveCount > 1) {
    return;
  } else {
    connection.on('data', function(data){
      if (STOP === false) {
        data = '' + data;
        //console.log('Serial data received: ' + data);
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
            readyCount += 1;
            console.log('Scan started.');
          }
          //if this is RDY then store anything after the semicolon
          else if ((startData == 'RDY') || (startData == 'DONE')) {
            realData = data.slice(semi + 1, data.length);
            //if this actual data has a semi colon it is a whole line (or corrupt)
            var nextSemi = realData.search(';');
            if (nextSemi != -1) {
              if (nextSemi == realData.length) {
                console.log('Data line reveived');
                currentLine = realData.slice(0, realData.length);
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
            //otherwise append this data to the current data store
            else {
              currentLine = currentLine + realData;
            }
          }
          //if there is a semicolon but no start text this is the end of a line of actual data
          else {
            if (semi == startData.length) {
              console.log('Data line reveived');
              currentLine = currentLine + startData.slice(0, startData.length);
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
      }
    });
  }
}

function checkFinished(cb) {
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
      cb();
    }
  }
}
*/

function setContrast(scale, offset){
  scale_factor = parseFloat(scale);
  scale_offset = parseFloat(offset);
  console.log('Contrast set.');
}

//hack to fix reversed colours in plot - send them reversed data!
function reverseSet(set, max){
  console.log(set)
  set.forEach(function(n, i) {
    set[i] = ((scale_factor * (max - n)) + scale_offset);
    //this is only necessary because of parsing mess
    //...top science
    if (isNaN(set[i])) {
      set[i] = set[i-1]
    }
  });
  console.log('SF: ', scale_factor, 'Of: ', scale_offset, 'Result: ', set.slice(1,5))
}

function plotData(lineStr, cb){
  var lineForward = lineStr.split(',').slice(0, lineLength);
  var lineBack = lineStr.split(',').slice(lineLength, lineStr.length);
  reverseSet(lineForward, 2047);
  reverseSet(lineBack, 2047);
  var line = [];
  line.push(lineForward);
  line.push(lineBack);
  console.log('Attempting to emit data to plot.');
  emitter.emit('line', line);
  //console.log('Emitted data to plot: ' + line);
  emitter.once('plotted', function() {
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
  if (DONE == false) {
    connection.write('DONE;');
  }

  STOP = true;
  emitter.emit('end');

  if (currentSession) {
    pManager.endSession(currentSession, function() {
      currentSession = null;
    });
  }

}

module.exports = {
  findBoard: findBoard,
  checkBoard : checkBoard,
  emitter : emitter,
  startScan : startScan,
  endScan : endScan,
  setContrast: setContrast
};
