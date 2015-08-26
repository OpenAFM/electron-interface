(function() {
  Polymer({
    is: 'my-afm',
    properties: { },



    ready: function() {
      //        initAll(6);
      //        demoline = [[100,1024,300,200,400,500],[200,300,422,133,222,333]]
      //        drawARow(demoline);
      //
      //        var tempint = setInterval("drawARow(demoline)",delayTime*6*2);

      var n = 256;
      initAll(n);
      var temp = new Array();
      temp = [];
      for(var i= 0 ;i< n; i++){
        temp[i] = i;
      }
      demoline = [temp,temp];
      drawARow(demoline);

      //        var tempint = setInterval("drawARow(demoline)",delayTime*n*2);

    }
  });
})();
