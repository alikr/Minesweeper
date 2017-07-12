import './style.less';

//各单元内周围雷的数量
var NUM = {};

//已生成的地雷
var MINES = {};

//是否已点击地雷
var status = 1;

//各级别对应的地雷数量
var mineTypes = [
	{"type":"9_9","value":10},
	{"type":"16_16","value":40},
	{"type":"16_30","value":99}
];

const padding = 10;
var unitWidth = 50;
var unitHeight = 50;

//当前级别
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
canvas.style.cssText = 'margin: ' + margin + 'px';

const _delay = 60;
var _timeout;
var _clickTimeout;
var _timeHeader = 0;

//已翻开的单元格
const _checked = {};

//已标记的地雷
const _markMines = {};

start();

//切换扫雷级别
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

//右键标记地雷
canvas.addEventListener('contextmenu',function(e){
	e.preventDefault();
	var temp = getColRowByEvent(e);
	var col = temp[0];
	var row = temp[1];
	var num = temp[2];
	var key = col + '_' + row;
	if(!_checked[key]){
		setFill(col, row, '#f00');
		_markMines[key] = true;
		if(checkMarked()){
			setTip(true, '胜利！');
		}
	}
});

//双击取消地雷标记
canvas.addEventListener('dblclick',function(e){
	var temp = getColRowByEvent(e);
	var col = temp[0];
	var row = temp[1];
	var num = temp[2];
	var key = col + '_' + row;
	if(_markMines[key]){
		delete _markMines[key];
		setFill(col, row, '#6DBFFF');
	}
});

//点击扫雷
canvas.addEventListener('click',function(e){
	if(status!=1)return;
	var temp = getColRowByEvent(e);
	var col = temp[0];
	var row = temp[1];
	var num = temp[2];
	var key = col + '_' + row;
	if(_markMines[key])return;
	setFill(col, row, '#ccc');
	setText(col, row, num);
	_checked[key] = true;

	//地雷
	if(num=='B'){
		status = 0;
		setFill(col, row, '#f00');
		setText(col, row, 'B');
		setTip(true);
		return;
	}

	//已检查的单元格
	var tempObj = {};
	checkClick(col, row, tempObj);
	tempObj = null;
	_timeHeader = 0;
	if(checkWin()){
		setTip(true, '胜利！');
	}
});

function checkWin(){
	var cr = getCR(TYPE);
	var cols = cr[0];
	var rows = cr[1];
	var size = getMineSize(TYPE);
	var _size = 0;
	for(var i = 0;i < cols; i++){
		for(var j = 0;j < rows; j++){
			var key = i + '_' + j;
			if(!_checked[key]){
				_size++;
			}
		}
	}
	return _size === size;
}

function checkMarked(){
	var size = getMineSize(TYPE);
	var _size = 0;
	for(var key in _markMines){
		if(_markMines[key] === MINES[key]){
			_size++;
		}else{
			_size--;
			return false;
		}
	}
	return _size === size;
}

function setTip(show, msg){
	tip.className = show ? 'show' : '';
	if(msg)tip.innerHTML = msg;
	if(show){
		clearTimeout(_clickTimeout);
		_clickTimeout = setTimeout(start,2000);
	}
}

//获取点击时的单元格
function getColRowByEvent(e){
	var uw = unitWidth + padding;
	var uh = unitHeight + padding;
	var x = e.offsetX;
	var y = e.offsetY;
	var col = Math.floor(x / uw);
	var row = Math.floor(y / uh);
	var num = NUM[col + '_' + row];
	return [col, row, num];
}

//清空并开始
function start(){
	clearObj(_markMines, _checked, NUM, MINES);
	setTip(false);
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

//检查第1层的8个位置
//   \ | /
//  —— O ——
//   / | \
function checkClick(col, row, tempObj){
	var num = NUM[col + '_' + row];
	setFill(col, row, '#ccc');
	setText(col, row, num);
	if(num>0 || num==undefined)return;
	var list = [
		[col - 1,row],
		[col + 1,row],
		[col - 1,row - 1],
		[col,row - 1],
		[col + 1,row - 1],
		[col - 1,row + 1],
		[col,row + 1],
		[col + 1,row + 1]
	];
	checkTask(list, tempObj);
}

function checkTask(list, tempObj){
	var i = list.length;
	while(i--){
		var d = list[i];
		if(!_markMines[d[0] + '_' + d[1]])checkClickRound(d[0], d[1], tempObj);
	}
}

//检查2层外的4个位置
//     |
//  —— O ——
//     |
function checkClickRound(col, row, tempObj){
	var key = col + '_' + row;
	var num = NUM[col + '_' + row];
	if(tempObj[key])return;
	tempObj[key] = true;
	if(num==undefined)return;
	
	delay_time(function(){
		setFill(col, row, '#ccc');
		setText(col, row, num);
	});
	_checked[key] = true;
	
	if(num==0){
		var list = [
			[col - 1,row],
			[col + 1,row],
			[col,row - 1],
			[col,row + 1]
		];
		checkTask(list, tempObj);
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

//获取当前单元格周围的雷数量
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
	setMine(cols, rows, size);
}

function setMine(cols, rows, size){
	while(size--){
		var rx = random(cols)
		var ry = random(rows);
		var tempKey = rx + '_' + ry;
		if(!MINES[tempKey]){
			MINES[tempKey] = true;
		}else{
			setMine(cols, rows, size+1);
			break;
		}
	}
}

//在m列n行中随机生成地雷
function random(){
	var m = 0,
			n = arguments[0];
	if(arguments.length == 2){
		m = arguments[0];
		n = arguments[1];
	}
	return Math.floor(m + Math.random() * n);
}

//延时执行
function delay_time(callback){
	if(_timeHeader === 0){
		_timeHeader = _delay;
		callback();
		return;
	}
	_timeHeader += _delay;
	_timeout = setTimeout(function(){
		clearTimeout(_timeout);
		callback();
	}, _timeHeader + _delay);
}

function clearObj(){
	var objs = Array.prototype.slice.call(arguments,0);
	var i = objs.length;
	while(i--){
		for(var key in objs[i]){
			delete objs[i][key];
		}
	}
}