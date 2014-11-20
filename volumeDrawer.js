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
	//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
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

  var hh = this.Max(v.slice(0,Math.min(v.length, (width-leftMargin-rightMargin) / pixels)));
  var ll = this.Min(v.slice(0,Math.min(v.length, (width-leftMargin-rightMargin) / pixels)));
  // improve hh, ll
  var range = hh-ll;
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

  ll = step * Math.floor(ll/step);
  hh = step * Math.ceil(hh/step);


  var upperIndicators = new Array();
  var lowerIndicator = {};



  context.fillStyle = "rgb(240,240,220)";//pale yellow
  context.fillRect(0,0,width-1,height-1);
  context.fillStyle = "rgb(250,250,200)";//pale yellow
  context.fillRect  (leftMargin,topMargin,width-leftMargin-rightMargin,height-topMargin-bottomMargin);

  for (var i=ll; i<=hh; i+=step){
    var y0 = scale(ll,hh,height,topMargin,bottomMargin, i);
    context.moveTo(leftMargin, y0);
    context.lineTo(width-rightMargin, y0);
    context.textBaseline = 'middle';
    context.fillStyle = 'black';
    context.fillText(i, width-rightMargin+2, y0);
  }
  context.strokeStyle = 'rgb(200,200,150)';
  context.stroke();


  // X coordinate - month ticks (for weekly charts, for daily chart use 3 letter for each month)
  context.beginPath();
  var y0 = scale(ll,hh,height, topMargin,bottomMargin, ll);
  var y1 = scale(ll,hh,height, topMargin,bottomMargin, hh);
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
// draw the line

var x=0;
var y=0;

  for (var i=0; i<c.length && i<(width-leftMargin-rightMargin-pixels)/pixels; i++){

    var yv = scale(ll,hh,height, topMargin,bottomMargin, v[i]), x0 = (width-rightMargin) - (i+1)*pixels;

    context.beginPath();

    if(x!=0 && y!=0){
      context.moveTo(x0,height-bottomMargin);
      context.lineTo(x0,yv);
    }
    context.strokeStyle = 'blue';
    context.stroke();
    x=x0;
    y=yv;
  }

//-------------------------------------------------------------------------------------------------------------------
  upperIndicators.push(lowerIndicator);
  this.data = [financialDataObject, upperIndicators];

  function scale(ll, hh, height, topMargin, bottomMargin, y){
    return topMargin+(height-topMargin-bottomMargin)*(1 - (y-ll)/(hh-ll));
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
        , hh = entries[2]
        , ll = entries[3]
        , cc = entries[4]
        , vv = entries[5]
        , adjC = entries[6];


      o.push(Number((oo*1).toFixed(2)));
      h.push(Number((hh*1).toFixed(2)));
      l.push(Number((ll*1).toFixed(2)));
      c.push(Number((cc*1).toFixed(2)));
      v.push(Number((vv/1).toFixed(0)));
    }
    return { d:d, o:o, h:h, l:l, c:c, v:v };
  }
}
