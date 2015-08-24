var app = require('app'); 
var BrowserWindow = require('browser-window'); 

//global reference of window object so it isn't JavaScript GCed.
var mainWindow = null;

// method called when Electron has initialized.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1440, 
    height: 900
  });

  //load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/app/index.html');

  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

