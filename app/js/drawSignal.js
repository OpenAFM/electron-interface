/**
 * Created by yuze on 15/8/24.
 */

var leftPath, rightPath;
var t = 0;
var rightT = 0;
var line;
var leftData, rightData;

var left_imageCol = 0;
var left_imageRow = 0;

var right_imageCol = 0;
var right_imageRow = 0;
//左边画出一个点
function leftTickAPoint(){
    // 左边数据赋值
    if(left_imageCol >= n){
        return;
    }
    //console.log(left_imageRow+"_"+left_imageCol);
    td = new Date()
    time = td.getTime();
    //console.log(time-lastTime);
    lastTime = time;
    offset = time - leftStartTime;
    offset = offset/delayTime;
    //console.log(offset);
    //console.log(left_imageCol);
    //这一行画完，结束
    for(var iter = left_imageCol; iter < n && iter < Math.round(offset); iter ++) {
        leftData[iter] = randomLinks[iter][left_imageRow];
    }
    left_imageCol = Math.round(offset);

    // redraw the line, and slide it to the left
    leftPath
        .attr("d", leftline)
        .attr("transform", null)
        .transition()
        .duration(delayTime)
//                      .attr("transform", "translate(" + x(1) + ",0)")
    .each("end",leftTickAPoint);

}

function leftTick() {
    //变为平线
    for(var iter = 0; iter < n; iter ++) {
        leftData[iter] = 0;
    }
    //从最小的值开始
    left_imageCol = 0;
    leftStartTime = new Date().getTime();
    leftTickAPoint();

}

//右边画出一个点
function rightTickAPoint(){
    // 右边数据赋值
    if(right_imageCol >= n){
        return;
    }
    //console.log(right_imageRow+"_"+right_imageCol);
    td = new Date()
    time = td.getTime();
    //console.log(time-lastTime);
    lastTime = time;
    offset = time - rightStartTime;
    offset = offset/delayTime;
    //console.log(offset);
    //console.log(right_imageCol);
    //这一行画完，结束
    for(var iter = right_imageCol; iter < n && iter < Math.round(offset); iter ++) {
        rightData[n-1-iter] = randomLinks[n-1-iter][right_imageRow];
    }
    right_imageCol = Math.round(offset);

    // redraw the line, and slide it to the right
    rightPath
        .attr("d", rightline)
        .attr("transform", null)
        .transition()
        .duration(delayTime)
//                      .attr("transform", "translate(" + x(1) + ",0)")
        .each("end",rightTickAPoint);

}

function rightTick() {
    //变为平线
    for(var iter = 0; iter < n; iter ++) {
        rightData[iter] = 0;
    }
    //从最小的值开始
    right_imageCol = 0;
    rightStartTime = new Date().getTime();
    rightTickAPoint();

}


function drawChart(container, direction) {
//              random = d3.random.normal(0, 10);
//              data = d3.range(n).map(random);
    // 用于初始化所有数据
    data = d3.range(n).map(function(){return 0;});

    var margin = {top: 20, right: 20, bottom: 20, left: 40},
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain([0, n - 1])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, 2047])
        .range([height, 0]);

    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).orient("left"));

    if(direction == "left") {
        leftline = d3.svg.line()
            .x(function (d, i) {
                return x(i);
            })
            .y(function (d, i) {
                return y(d);
            });

        leftPath = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", leftline);

        // 初始化左边数据
        leftData = data;
        //leftTick();

    }else{
        rightline = d3.svg.line()
            .x(function (d, i) {
                return x(i);
            })
            .y(function (d, i) {
                return y(d);
            });

        rightPath = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", rightline);

        // 初始化右边数据
        rightData = data;
        //rightTick();
    }
}

