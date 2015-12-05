console.log('running afm-plot script');
var n = 256;
var arduino = require('./js/arduino.js');
var emitter = arduino.emitter;
var contrast = arduino.contrast;

function initialisePlot(n, cb) {
  console.log('Initialising Plot');
  initAll(n, function() {
    if (cb) cb();
  });
}

var log = function() {
  console.log('Plot ready for data');
}

setTimeout('initialisePlot(n, log)', 1000);

emitter.on('line', function(line) {
  console.log('Plot received data: ' + line + ' Plotting now');
  drawARow(line, function() {
    console.log('Data plotted, emittng confirmation.')
      emitter.emit('plotted');
  });
});

emitter.on('clearPlots', function() {
  var n = 256;
  initialisePlot(n);
});

(function() {
  Polymer({
    is: 'afm-plot',
    properties: {

      scaleFactor: {
        type: String,
        value: '1',
        notify: true
      },

      offset: {
        type: String,
        value: '0',
        notify: true
      },

      contrastButton: {
        type: String,
        value: 'GO',
        notify: true
      }
    },

    setContrast: function() {
      arduino.setContrast(this.scaleFactor, this.offset);
    },

    ready: function() {
    }
  });
})();
