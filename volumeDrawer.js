// if you modify pixels you can zoom in or out

window.VolumeDrawer = function(canvasID, rawData){

	this.Max = function Max( array ){ 
    return Math.max.apply( Math, array ); 
  }

	this.Min = function Min( array ){ 
    return Math.min.apply( Math, array ); 
  }




  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
      });
    };
  }

	var volumeChart = this;
  var context = document.getElementById(canvasID).getContext("2d");
	var width = context.canvas.width;
	var height = context.canvas.height;

	if (window.devicePixelRatio) {
		context.canvas.style.width = width + "px";
		context.canvas.style.height = height + "px";
		context.canvas.height = height * window.devicePixelRatio;
		context.canvas.width = width * window.devicePixelRatio;
		context.scale(window.devicePixelRatio, window.devicePixelRatio);
	}
  context.translate(0.5, 0.5);

  var financialDataObject = convertCsv(rawData);
  var d = financialDataObject.d
    , o = financialDataObject.o
    , h = financialDataObject.h
    , l = financialDataObject.l
    , c = financialDataObject.c
    , v = financialDataObject.v;

 
  /*
  if (d.length > 10 || d.length <= 14){ // 3 months of input data
    pixels =65;
  } else{
    pixels = 12;
  }
*/

  var topMargin = 8, bottomMargin = 15, leftMargin = 5, rightMargin = 50;

  var pixels = (width-leftMargin-rightMargin)/(d.length+1);

  var high = this.Max(v.slice(0,Math.min(v.length, (width-leftMargin-rightMargin) / pixels)));
  var low = this.Min(v.slice(0,Math.min(v.length, (width-leftMargin-rightMargin) / pixels)));

  var range = high-low;
  
  var step = 1;
  while (range/step > 16){
    if (step<4) {
      step++;
    }else if (step<9){
      step +=2;
    }else if (step<30){
      step +=5;
    }else{
      step +=10;
    }

  }

  low = step * Math.floor(low/step);
  high = step * Math.ceil(high/step);


  var upperIndicators = new Array(); 
  var lowerIndicator = {};



  context.fillStyle = "rgb(240,240,220)";
  context.fillRect(0,0,width-1,height-1);

  context.fillStyle = "rgb(250,250,200)";
  context.fillRect  (leftMargin,topMargin,width-leftMargin-rightMargin,height-topMargin-bottomMargin);

  for (var i=low; i<=high; i+=step){
    var y0 = scale(low,high,height,topMargin,bottomMargin, i);
    context.moveTo(leftMargin, y0);
    context.lineTo(width-rightMargin, y0);
    context.textBaseline = 'middle';
    context.fillStyle = 'black';
    context.fillText(i, width-rightMargin+2, y0);
  }
  context.strokeStyle = 'rgb(200,200,150)';
  context.stroke();

//--------------------------------------------------------------------------------------------------------
  // Creates the monthly marks
  context.beginPath();
  var y0 = scale(low,high,height, topMargin,bottomMargin, low);
  var y1 = scale(low,high,height, topMargin,bottomMargin, high);
  for (var i=0; i<d.length-1 && i<(width-leftMargin-rightMargin-pixels)/pixels; i++){
    if (d[i].getMonth()!=d[i+1].getMonth()){
      var x0 = (width-rightMargin) - (i+1)*pixels -1;
      context.moveTo(x0, y0);
      context.lineTo(x0, y1);
      mm = ['J','F','M','A','M','J','J','A','S','O','N','D'][d[i].getMonth()];
      if (d[i].getMonth()==0) {
        mm = (''+d[i].getFullYear()).substr(2,2);
      }
      context.textBaseline = 'top';
      var metrics = context.measureText(mm);
      context.fillText(mm, x0-metrics.width/2, y0);
    }
  }
  context.strokeStyle = 'rgb(200,200,150)';
  context.stroke();

//-------------------------------------------------------------------------------------------------------------------------------------------------------
// draw the bars

// set the initial second point
var x2=0;
var y2=0;

  for (var i=0; i<c.length && i<(width-leftMargin-rightMargin-pixels)/pixels; i++){

    var y1 = scale(low,high,height, topMargin,bottomMargin, v[i]);
    var x1 = (width-rightMargin) - (i+1)*pixels;

    context.beginPath();

    if(x2!=0 && y2!=0){
      context.moveTo(x1,height-bottomMargin);
      context.lineTo(x1,y1);
    }
    context.strokeStyle = 'blue';
    context.stroke();
    x2=x1;
    y2=y1;
  }

//-------------------------------------------------------------------------------------------------------------------
  upperIndicators.push(lowerIndicator);
  this.data = [financialDataObject, upperIndicators];

  function scale(low, high, height, topMargin, bottomMargin, y){
    return topMargin+(height-topMargin-bottomMargin)*(1 - (y-low)/(high-low));
  }
//------------------------------------------------------------------------------------------------------------------
  function convertCsv(rawData) { // this method takes the raw data and returns an object with all important datatypes
    var allTextLines = rawData.split(/\r\n|\n/);
    allTextLines.pop();
    allTextLines.shift();

    var d=[], o=[], h=[], l=[], c=[], v=[];

    for(var i=0; i<allTextLines.length; i++){
      var entries = allTextLines[i].split(',');
      d.push(new Date(entries[0]));
      var oo = entries[1]
        , high = entries[2]
        , low = entries[3]
        , cc = entries[4]
        , vv = entries[5]
        , adjC = entries[6];


      o.push(Number((oo*1).toFixed(2)));
      h.push(Number((high*1).toFixed(2)));
      l.push(Number((low*1).toFixed(2)));
      c.push(Number((cc*1).toFixed(2)));
      v.push(Number((vv/1).toFixed(0)));
    }
    return { d:d, o:o, h:h, l:l, c:c, v:v };
  }
}
