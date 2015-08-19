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
      if (this.searchButton == 'CONNECT') {
        console.log('button = connect');
        arduino.findBoard(function(board) {
          console.log(board);
          BOARD = board;
          if (BOARD === true) {
            console.log('still true');
            this.searchButton = 'CONNECTED';
            this.serButSty = green;
            this.scaButSty = yellow;
          } else {
            console.log('still false');
            this.searchButton = 'FAILED';
            this.serButSty = red;           
            function reconnect(that) {
              that.searchButton = 'CONNECT';
              that.serButSty = yellow;
            }
            setTimeout(reconnect, 1000, this);
          }
        });
      } else {
        console.log('button != connect');
      }
    },

    scanPressed: function() {
      if (BOARD === true) {

        if (this.scanButton == 'SCAN') {
          //start recording
          var session = sessionManager.newSession('Session Name');

          currentSession = session;

          session.listener = function() {
            session.data.push(this.raw);
          }

          arduino.addListener(session.listener);
          this.scanButton = 'SCANNING';
          this.scaButSty = green;
          (function () {
            setTimeout(function () {
              this.scanButton = 'CANCEL';
              this.scaButStyle = red;
            }, 1000);
          })();
        } else {
          board.removeListener(currentSession.listener);
          sessionManager.endSession(currentSession);
          currentSession = null;
          this.scanButton = 'SCAN';
          this.scaButSty = green;
        }
      }
    },

  });

})();

