import './style.less';
var NUM = {};
var MINES = {};
var status = 0;
var mineTypes = [
	{"type":"9_9","value":10},
	{"type":"16_16","value":40},
	{"type":"16_30","value":99}
];
const padding = 10;
var unitWidth = 50;
var unitHeight = 50;

var TYPE = 0;
const NUM_REG = /\d{1,2}/g;
var tip = document.querySelector('#tip');
var tool = document.querySelector('#tool');
const canvas = document.querySelector('#view');
const ctx = canvas.getContext('2d');
const width = window.innerWidth;
const height = window.innerHeight;
const margin = 20;
const square = Math.min(width,height) - margin * 2;

tool.addEventListener('click',function(e){
	var t = e.target;
	t.className = 'sel';
	var key = t.getAttribute('key');
	tool.querySelectorAll('li').forEach(function(e){
		if(e!=t){
			e.className = '';
		}
	});
	TYPE = key;
	start();
});
canvas.style.cssText = 'margin: '+margin+'px';

start();

canvas.addEventListener('click',function(e){
	if(status!=1)return;
	var uw = unitWidth + padding;
	var uh = unitHeight + padding;
	var x = e.offsetX;
	var y = e.offsetY;
	var col = Math.floor(x / uw);
	var row = Math.floor(y / uh);
	var num = NUM[col + '_' + row];
	setFill(col, row, '#ccc');
	setText(col, row, num);
	if(num=='B'){
		status = 2;
		setFill(col, row, '#f00');
		setText(col, row, 'B');
		tip.className = 'show';
		setTimeout(start,3000);
		return;
	}
	checkClick(col, row);
});


function start(){
	var cr = getCR(TYPE);
	var cols = cr[0];
	var rows = cr[1];
	unitWidth = unitHeight = 50;
	var cw = cols * (unitWidth + padding);
	var ch = rows * (unitHeight + padding);
	if(cw > width - margin * 2){
		cw = width - margin * 2;
		unitWidth = Math.floor(cw / cols) - padding;
	}
	if(ch > height - margin * 2){
		ch = height - margin * 2;
		unitHeight = Math.floor(ch / rows) - padding;
	}
	canvas.width = cw;
	canvas.height = ch;
	ctx.clearRect(0,0,cw,ch);
	ctx.fillStyle = '#6DBFFF';
	ctx.font = "20px Arial";
	if(unitWidth<20 || unitHeight<20){
		ctx.font = "14px Arial";
	}
	tip.className = '';
	NUM = {};
	MINES = {};
	ctx.fillStyle = '#6DBFFF';
	status = 1;
	mines(cols, rows);
	for(var i = 0;i < cols; i++){
		for(var j = 0;j < rows; j++){
			setFill(i, j);
		}
	}
	for(var i = 0;i < cols; i++){
		for(var j = 0;j < rows; j++){
			var num = getNum(i, j);
			NUM[i + '_' + j] = num;
			// setText(i, j, num);
		}
	}
}


function checkClick(col, row){
	var num = NUM[col + '_' + row];
	setFill(col, row, '#ccc');
	setText(col, row, num);
	if(num>0 || num==undefined)return;
	checkQueue([
		[col - 1,row],
		[col + 1,row],
		[col - 1,row - 1],
		[col,row - 1],
		[col + 1,row - 1],
		[col - 1,row + 1],
		[col,row + 1],
		[col + 1,row + 1]
	]);
}

function checkQueue(list,obj){
	var obj = obj || {};
	if(list==undefined || list.length==0)return;
	var cr = list.pop();
	checkClick2(cr[0],cr[1],obj);
	checkQueue(list,obj);
	obj = null;
}

function checkClick2(col, row, obj){
	var num = NUM[col + '_' + row];
	if(obj[col + '_' + row])return;
	obj[col + '_' + row] = true;
	if(num==undefined)return;
	
	setFill(col, row, '#ccc');
	setText(col, row, num);
	if(num==0){
		checkQueue([
			[col - 1,row],
			[col + 1,row],
			[col,row - 1],
			[col,row + 1]
		],obj);
	}
}

function setFill(col, row, color){
	var _fx = col * (unitWidth + padding);
	var _fy = row * (unitHeight + padding);
	if(color)ctx.fillStyle = color;
	ctx.fillRect(_fx, _fy, unitWidth, unitHeight);
}

function setText(col,row,txt){
	ctx.fillStyle = '#000';
	var _fx = col * (unitWidth + padding);
	var _fy = row * (unitHeight + padding);
	ctx.fillText(txt, _fx + unitWidth/2 - ctx.measureText(txt).width/2, _fy + unitHeight - unitHeight/2 + 5);
}

function getMineSize(i) {
	return mineTypes[i] ? mineTypes[i].value : 10;
}

function getNum(col,row){
	var tempKey = col + '_' + row;
	if(MINES[tempKey])return 'B';
	var row1 = row - 1;
	var row2 = row + 1;
	var col1 = col - 1;
	var col2 = col + 1;
	var items = [
		col1 + '_' + row1, col1 + '_' + row, col1 + '_' + row2,
		col + '_' + row1, col + '_' + row, col + '_' + row2,
		col2 + '_' + row1, col2 + '_' + row, col2 + '_' + row2
	];
	var num = 0;
	var size = items.length;
	while(size--){
		if(MINES[items[size]]){
			num+=1;
		}
	}
	return num;
}

function getCR(i){
	var type = mineTypes[i].type;
	var nums = type.match(NUM_REG);
	var col = +nums[0];
	var row = +nums[1];
	return [col, row];
}

function mines(cols, rows){
	var size = getMineSize(TYPE);
	getMine(cols, rows, size);
}
function getMine(cols, rows, size){
	while(size--){
		var rx = random(cols)
		var ry = random(rows);
		var tempKey = rx + '_' + ry;
		if(!MINES[tempKey]){
			MINES[tempKey] = true;
		}else{
			getMine(cols, rows, size+1);
			break;
		}
	}
}

function random(){
	var m = 0,
			n = arguments[0];
	if(arguments.length == 2){
		m = arguments[0];
		n = arguments[1];
	}
	return Math.floor(m + Math.random() * n);
}
