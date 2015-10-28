/**
 * Created by yuze on 15/8/26.
 */

//全局变量
var delayTime = 1,
    n = 128;

var margin = {top: 35, right: 0, bottom: 30, left: 80};
var width = 256;
var height = 256;
var d = new Date();
var lastTime = d.getTime();
var leftStartTime = 0;
var rightStartTime = 0;
var svg;
var rightsvg;


var x = d3.scale.ordinal().rangeBands([0, width]),
    z = d3.scale.linear().domain([0, 2047]).clamp(true),
    color = d3.scale.category20c().domain(d3.range(20));



var randomLinks = [];
var formatLinks = [];


var right_randomLinks = [];
var right_formatLinks = [];

