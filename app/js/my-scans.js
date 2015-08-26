var sessionManager = require('./js/p_session_manager.js');
var green = 'background-color: green';
(function() {
  Polymer({
    is: 'my-scans',
    properties: {

      drawButton: {
        type: String,
        value: 'DRAW',
        notify: true
      },

      drawButSty: {
        type: String,
        value: green,
        notify: true
      },

      exportButton: {
        type: String,
        value: 'EXPORT',
        notify: true
      },

      exportButSty: {
        type: String,
        value: green,
        notify: true
      }
    },

    ready: function() {
      this.sessions = [];
      drawScan();
      var that = this;
      (function loop() {
        setTimeout(function () {
          if (sessionManager.sessions.length !== that.sessions.length) {

            that.sessions.forEach(function(uiSession) {
              var existsInUpdated = sessionManager.sessions.filter(function(y) { return y.id == uiSession.id; })[0];
              if (!existsInUpdated) {
                // doesn't exist in updated so remove from UI (file was removed from disk).
                that.pop('sessions', uiSession);
              }
            });

            sessionManager.sessions.forEach(function(updatedSession) {
              var existsInUi = that.sessions.filter(function(y) { return y.id == updatedSession.id; })[0];
              if (!existsInUi) {
                // doesn't exist in ui so add to UI (file was recently added to disk).
                that.push('sessions', updatedSession);
              }
            });

          }
          loop()
        }, 1000);
      }());
    }
  });
})();

function drawScan() {
};
