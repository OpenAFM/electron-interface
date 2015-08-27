/**
 * Created by yuze on 15/8/21.
 */

function initMatrix() {
    // 画左边的图
    svg = d3.select(document.querySelector("#leftImage")).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin", "0 auto")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 生成模拟随机数矩阵
    var matrix = [];


    // Compute index per node.
    for (var i = 0; i < n; i++) {
        matrix[i] = d3.range(n).map(function (j) {
            return {x: j, y: i, z: 0};
        });
    }

    // Convert links to matrix; count character occurrences.
    formatLinks.forEach(function (link) {
        //        console.log("###"+link.source+link.target+link.value);

        matrix[link.source][link.target].z = link.value;
    });

    // Precompute the orders.
    var orders = {
        defaultorder: d3.range(n).sort(function (a, b) {
            return (a - b);
        })
    };

    // The default sort order.
    x.domain(orders.defaultorder);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    var row = svg.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function (d, i) {
            return "translate(0," + x(i) + ")";
        })
        .each(row);

    var column = svg.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function (d, i) {
            return "translate(" + x(i) + ")rotate(-90)";
        });
    //    row.append("line")
    //            .attr("x2", width);
    //    column.append("line")
    //            .attr("x1", -width);

    var y = 0;
    function row(row) {
        var cell = d3.select(this).selectAll(".cell");
        var int;
        cell.data(row.filter(function (d) {
            return d.z;
        }))
            .enter().append("rect")
            .attr("class", function (d) {
                return "cell"+getID(0, d.y,"z");
            })
            .attr("x", function (d) {
                return x(d.x);
            })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function (d) {
                return 1;
            })
            //.attr("id", function (d) {
            //    return getID(d.x, d.y,"y");
            //})
            .style("fill", function (d) {
                return "#fff";
            });
    }
}

function getID(px,py,flag){
    enumArray = {"0":"a","1":"b","2":"c","3":"d","4":"e","5":"f","6":"g","7":"h","8":"i","9":"j"};
    xStr = px.toString();
    newXstr = "";
    for (var i =0; i < xStr.length;i++){
        newXstr += enumArray[xStr[i]];
    }
    yStr = py.toString();
    newYstr = "";
    for (var i =0; i < yStr.length;i++){
        newYstr += enumArray[yStr[i]];
    }
    newStr = newXstr + flag + newYstr;
    return newStr;
}

//



function rightInitMatrix(){
    // 画右边的图

// 在 rightImage 上添加 svg，定义svg的样式
    rightsvg = d3.select("#rightImage").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin", "0 auto")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 生成模拟随机数矩阵
    var rightmatrix = [];



// 转成绘图需要的数据格式 a-1
// Compute index per node.
    for(var i= 0; i < n; i++){
        rightmatrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    }

// Convert links to matrix; count character occurrences.
    right_formatLinks.forEach(function(link) {
        //        console.log("###"+link.source+link.target+link.value);

        rightmatrix[link.source][link.target].z = link.value;
    });

// 绘出底层方块
    rightsvg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

// 绘出每一行，并在 rightrow 函数中添加cell
    var rightrow = rightsvg.selectAll(".row")
        .data(rightmatrix)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .each(rightrow);

    // 初始化小方块,每一行的 class 一样，可以d3选择器找到
    function rightrow(rightrow) {
        var cell = d3.select(this).selectAll(".cell");
        var int;
        cell.data(rightrow.filter(function (d) {
            return d.z;
        }))
            .enter().append("rect")
            .attr("class", function (d) {
                return "cell"+getID(0, d.y,"z");
            })
            .attr("x", function (d) {
                return x(d.x);
            })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function (d) {
                return 1;
            })
            //.attr("id", function (d) {
            //    return getID(d.x, d.y,"y");
            //})
            .style("fill", function (d) {
                return "#eee";
            });

    }
}

//// 绘制列
//var rightcolumn = rightsvg.selectAll(".column")
//    .data(matrix)
//    .enter().append("g")
//    .attr("class", "column")
//    .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
// 绘制边框
//    rightrow.append("line")
//            .attr("x2", width);
//    rightcolumn.append("line")
//            .attr("x1", -width);


/*
    通过每行的class 逐行绘制
 */
var i = 0;
var right_i = 0;
var j = 0;
var right_j = 0;
var RowInt;
var right_rowIn;
// 每行绘出左边图像
function leftdrawByRow(){
    i = 0;
    svg.selectAll(".cell" + getID(0, j,"z")).each(drawAPointAndSleep);

    //画出一行的折线
    left_imageRow = j;
    leftTick();

    FinishARow(j);
    j += 1;

}

// 每行绘出右边图像
function rightDrawByRow() {
    right_i = 0;
    rightsvg.selectAll(".cell" + getID(0, right_j,"z")).each(rightDrawAPointAndSleep);

    //画出一行的折线
    right_imageRow = right_j;
    rightTick();


    right_j += 1;

}

// 左边 - 绘出每行中的每个点，并且停顿一会
function drawAPointAndSleep() {
    d3.select(this).transition().style("fill", "white")
        .style("fill-opacity", z(randomLinks[i][j])).delay(delayTime*i);
    i++;

}

// 右边 - 绘出每行中的每个点，并且停顿一会
function rightDrawAPointAndSleep() {
    d3.select(this).transition().style("fill","white")
        .style("fill-opacity", z(right_randomLinks[n-1-right_i][right_j])).delay(delayTime*(n-1-right_i));
    right_i++;

}
//画出 折线图的框架


function initAll(len){
    n = len;
    i = 0;
    j = 0;
    right_i = 0;
    right_j = 0;
    for(var i =0; i < n; i++){
        randomLinks[i] = [];
        for(var j =0; j < n; j++){
            randomLinks[i][j] = Math.round(Math.random()*2047);
            singlePoint = {};
            singlePoint["source"] = i;
            singlePoint["target"] = j;
            singlePoint["value"] = randomLinks[i][j];
            formatLinks.push(singlePoint);
        }
    }

    for(var i =0; i < n; i++){
        right_randomLinks[i] = [];
        for(var j =0; j < n; j++){
            right_randomLinks[i][j] = Math.round(Math.random()*2047);
            singlePoint = {};
            singlePoint["source"] = i;
            singlePoint["target"] = j;
            singlePoint["value"] = right_randomLinks[i][j];
            right_formatLinks.push(singlePoint);
        }
    }
    initMatrix();
    rightInitMatrix();
    drawChart("#leftChart", "left", null);

    drawChart("#rightChart", "right", null);
}
var tempIntInter = null;
function drawARow(dataLine, cb){
    if(j >= n){
        if(tempint!= null){
            clearInterval(tempint);
        }
        //alert("matrix is full!");
    }
    for(var iter =0; iter < n; iter++) {
        randomLinks[iter][j] = dataLine[0][iter];
        right_randomLinks[iter][j] = dataLine[1][iter];
    }
    // 画出一行的方块
    leftdrawByRow();
    if(tempIntInter!= null){
        clearInterval(tempIntInter);
    }
    tempIntInter = setInterval(function(){
        rightDrawByRow();
        clearInterval(tempIntInter);
        cb();
    },delayTime*n);
}
