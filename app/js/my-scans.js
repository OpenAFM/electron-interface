var sessionManager = require('./js/afm_session_manager.js');

(function() {
  var green = 'background-color: green';
  var red = 'background-color: green';
  var yellow = 'background-color: green';
  var grey = 'background-color: green';
  var SELECTED_SCAN;

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
        value: grey,
        notify: true
      },

      exportButton: {
        type: String,
        value: 'EXPORT',
        notify: true
      },

      exportButSty: {
        type: String,
        value: grey,
        notify: true
      },

      deleteButton: {
        type: String,
        value: 'DELETE',
        notify: true
      },

      deleteButSty: {
        type: String,
        value: grey,
        notify: true
      },

    },

    scanSelect: function(e) {
      console.log('triggered scan select function');
      SELECTED_SCAN = e;
      console.log(e.detail.item.id);
      console.log('you saw e right?');
    },

    drawPressed: function() {},

    exportPressed: function() {
      //sessionManager.exportSession(sessionId);
      //takes a session id so will have to load id of session selected in my scans page menu
    },

    deletePressed: function() {},




    ready: function() {
      this.sessions = [];
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
