var sessionManager = require('./js/session_manager.js');
var arduino = require('./js/arduino.js');
(function() {
  var green = 'background-color: green';
  var red = 'background-color: red';
  var yellow = 'background-color: yellow';
  var grey = 'background-color: grey';
  var currentSession;
  var BOARD = false;
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
      }
    },              

    searchPressed: function() {
      function reconnect(that) {
        that.searchButton = 'CONNECT';
        that.serButSty = yellow;
        that.scaButSty = grey;
      }
      if (this.searchButton == 'CONNECT') {
        var that = this;
        arduino.findBoard(function(board) {
          BOARD = board;
          if (BOARD === true) {
            that.searchButton = 'CONNECTED';
            that.serButSty = green;
            that.scaButSty = yellow;
          } else {
            that.searchButton = 'FAILED';
            that.serButSty = red;           
            setTimeout(reconnect, 2500, that);
          }
        });
      } else {
      }
    },

    scanPressed: function() {
      function allowCancel(that) {
        that.scanButton = 'CANCEL';
        that.scaButStyle = red;
      }
      if (BOARD === true) {
        if (this.scanButton == 'SCAN') {
          //start scan
          var session = sessionManager.newSession('Session Name');
          currentSession = session;

          session.listener = function() {
            session.data.push(this.raw);
          };

          arduino.addListener(session.listener);

          this.scanButton = 'SCANNING';
          this.scaButSty = green;
          setTimeout(allowCancel, 2500, that);
        } else {
          board.removeListener(currentSession.listener);
          sessionManager.endSession(currentSession);
          currentSession = null;
          this.scanButton = 'SCAN';
          this.scaButSty = green;
        }
      }
    },

    ready: function() {
      var that = this;

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
              setTimeout(reconnect, 2500, that);
            }
          });
        }
      }

      setInterval(isBoard, 800, that);
    },

  });

})();

