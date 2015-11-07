var arduino = require('./js/arduino.js');
var emitter = arduino.emitter;

(function() {
  var green = 'background-color: green';
  var red = 'background-color: red';
  var yellow = 'background-color: yellow';
  var grey = 'background-color: grey';
  var BOARD = false;
  var SCANNING = false;

  Polymer({
    is: 'afm-controls',
    properties: {

      searchButton: {
        type: String,
        value: 'CONNECT',
        notify: true
      },

      serButSty: {
        type: String,
        value: yellow,
        notify: true
      },

      scanButton: {
        type: String,
        value: 'SCAN',
        notify: true
      },
      
      scaButSty: {
        type: String,
        value: grey,
        notify: true
      },

      disabler: {
        type: Boolean,
        value: true,
        notify: true
      },

      scanName: {
        type: String,
        value: "Scan-Name1",
        notify: true
      },
    },              

// define function run when search/connect button pressed
    searchPressed: function() {
      function reconnect(that) {
        that.searchButton = 'CONNECT';
        that.serButSty = yellow;
        that.scaButSty = grey;
      }
      // if button in default state, attempt connection
      if (this.searchButton == 'CONNECT') {
        var that = this;
        arduino.findBoard(function(board) {
          BOARD = board;
          // if connection succeeds set button to 'connected' 
          // and scan button to yellow (active)
          if (BOARD === true) {
            that.searchButton = 'CONNECTED';
            that.serButSty = green;
            that.scaButSty = yellow;
            that.disabler = true;
          } else {
            // if connection fails flash button to 'failed'
            //, then reset it.
            that.searchButton = 'FAILED';
            that.serButSty = red;           
            setTimeout(reconnect, 2500, that);
          }
        });
      } else {
      }
    },

//define function run when scan button pressed
    scanPressed: function() {
      function allowCancel(that) {
        that.scanButton = 'CANCEL';
        that.scaButSty = red;
      }
      function reset(that) {
        that.scanButton = 'SCAN';
        that.scaButSty = yellow;
      }
     if (BOARD === true) {
        if (this.scanButton == 'SCAN') {
       // if board connected and scan not ongoing begin scan
       // and set button to green & 'scannning' temporarily
       // then set to red 'cancel' button
          arduino.startScan(this.scanName, function() {
            console.log('Beginning scan...');
          });

          SCANNING = true;
          this.scanButton = 'SCANNING';
          this.scaButSty = green;

          setTimeout(allowCancel, 2500, this);
        } else {
          // if scan ongoing then button acts as cancel,
          // ending scan session and resetting button to 'scan'
          arduino.endScan()
          this.scanButton = 'SAVING';
          this.scaButSty = yellow;
          setTimeout(reset, 2500, this);
        }
      }
    },

    sizeSelect: function(e) {
      var size = parseInt(e.detail.item.id, 10);
      console.log(size);
    },


    // this function runs as soon as afm-controls loaded
    ready: function() {
      var that = this;
      
      emitter.on('end', function() {
        that.scanButton = 'SCAN';
        that.scaButSty = green;
      }, that);

      function reconnect(that) {
        that.searchButton = 'CONNECT';
        that.serButSty = yellow;
        that.scaButSty = grey;
      }
 
      function isBoard(that){
        if (that.searchButton == 'CONNECTED') {
          arduino.checkBoard(function (board) {
            BOARD = board;
            if (BOARD === false) {
              that.searchButton = 'DISCONNECTED';
              that.serButSty = red;
              that.scaButSty = grey;
              SCANNING = false;
              setTimeout(reconnect, 2500, that);
            }
          });
        }
      }
      // check is board still connected at regular interval
      setInterval(isBoard, 800, that);
    },

  });

})();

