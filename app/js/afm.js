function drawWithTestData() {
  console.log('initialising plot');
  var n = 256;
  initAll(n);
  var temp = [];
  for(var i= 0 ;i< n; i++){
    temp[i] = i;
  }
  demoline = [temp,temp];
  drawARow(demoline);

  //        var tempint = setInterval("drawARow(demoline)",delayTime*n*2);
}

(function() {
  Polymer({
    is: 'my-afm',
    properties: { },



    ready: function() {
      setTimeout("drawWithTestData()", 1000);
    }
  });
})();
