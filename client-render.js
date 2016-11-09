


"use strict";
var mouseState = 0;
var mouseBeenUnclicked = true;
var direction = 1;
var playerIds = [];
var users = {};
var collects = [];
var camerax = 0;
var cameray = 0;
var mouseposx = 0;
var mouseposy = 0;
var canvascenterx = 480;
var canvascentery = 270;
var zoom = 1;
var lasers = [];
var frame = 0;
var damaged = [];
var controls = 3; //1 = mouse + space bar , 2 = mouse + auto move , 3 = mouse + wasd
var ctx;
var lastCalledTime;
var fps = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var delta;
var myId = "j";
var spectate = false;
var spectateId;
var mapHeight = 10000;
var mapWidth = 10000;
var receivedId = false;
var messages = [];
var lastPingTimeSent;
var particles = [];


socket.on('inital handshake', function (data) {
    socket.emit('new player request');
  });

socket.on('init', function (data) {
    myId = data.id;
	playerIds = data.otherPlayerIds;
	playerIds.push(myId);
	frame = data.frame;
	receivedId = true;
	startGame();
  });

socket.on('update', function (data) {
    collects = data.collects;
	users = data.users;
	lasers = data.lasers;
	playerIds = data.playerIds;
  });

/*socket.on('update collects', function (data) {
    collects = data;
  });
  
socket.on('update users', function (data) {
    users = data;
	//console.log('users updated')
  });

socket.on('update lasers', function (data) {
    lasers = data;
  });*/

socket.on('new user', function (data) {
	if (playerIds.indexOf(data) == -1) {
    	playerIds.push(data);
	}
  });

socket.on('user left', function (data) {
    playerIds.splice(playerIds.indexOf(data),1);
  });

socket.on('death', function (data) {
	spectateId = data;
    spectate = true;
	messages.push('You were killed by ' + data, 100);
  });

socket.on('you killed', function (data) {
    messages.push('You killed ' + data , 100);
  });

socket.on('ping', function (data) {
    console.log(Date.now() - lastPingTimeSent);
  });


var myGamePiece;


function startGame() {
    myGameArea.start();
	
    //myGamePiece = new component(30, 30, "blue", 10, 120);
}

var myGameArea = {
    canvas : document.createElement("canvas"),
	
    start : function() {
        this.canvas.width = canvascenterx * 2;
        this.canvas.height = canvascentery * 2;
		this.canvas.id = "canvas";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 1000/60);		//changed from setInterval
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");            
        })
    }, 
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}



function drawRotatedRect(x, y, width, height, degrees, color) {
	ctx = myGameArea.context;
	// first save the untranslated/unrotated context
	ctx.save();

	ctx.beginPath();
	// move the rotation point to the center of the rect
	//ctx.translate(x + width / 2, y + height / 2);
	ctx.translate(x, y);
	// rotate the rect
	ctx.rotate(degrees * Math.PI / 180);

	// draw the rect on the transformed context
	// Note: after transforming [0,0] is visually [x,y]
	//       so the rect needs to be offset accordingly when drawn
	//ctx.rect(-width / 2, -height / 2, width, height);
	ctx.rect(-width / 2, -height, width, height);

	ctx.fillStyle = color;
	ctx.fill();

	// restore the context to its untranslated/unrotated state
	ctx.restore();
}

function drawRotatedImage(image, x, y, xsize, ysize, angle) { 

	// save the current co-ordinate system 
	// before we screw with it
	ctx.save(); 

	// move to the middle of where we want to draw our image
	ctx.translate(x, y);

	// rotate around that point, converting our 
	// angle from degrees to radians 
	ctx.rotate(angle * Math.PI/180);

	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image, -(xsize/2), -(ysize/2),xsize,ysize);

	// and restore the co-ords to how they were when we began
	ctx.restore(); 
}

function ping() {
	lastPingTimeSent = Date.now();
	socket.emit('ping');
}


function component(width, height, color, x, y) {
    this.gamearea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;   
	this.v = 0;
    this.update = function() {
        /*ctx = myGameArea.context;
		ctx.save();
        ctx.fillStyle = color;
		ctx.rotate(direction*Math.PI/180);
        ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.restore();*/
		drawRotatedRect(camerax - this.x, cameray - this.y, this.width, this.height, direction, color);
		
		
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }    
}

function updateGameArea() {
	myGameArea.clear();
	
	frame += 1;
	
	

	
	
	
	
	/*function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }*/
      var canvas = document.getElementById('canvas');
      var context = canvas.getContext('2d');
	
      /*canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        mouseposx = mousePos.x
		mouseposy = mousePos.y
      }, false);*/
	
	document.onmousemove = function(e) {
    	var event = e || window.event;
		window.mouseX = event.clientX;
		window.mouseY = event.clientY;
		mouseposx = window.mouseX;
		mouseposy = window.mouseY;
	}

	function mousemov() {
		document.getElementById("canvas").style.left = window.mouseX;
	}

	window.onload = function() {
		setInterval(mousemov, 1000);
	}
	
	
	
	
	
	
	//mouse state
	document.getElementById("body").onmousedown = function() {mouseDown()};
	document.getElementById("body").onmouseup = function() {mouseUp()};
	
	function mouseDown() {
		mouseState = 1;
	}
	
	function mouseUp() {
		mouseState = 0;
	}
	
	
	
	function getDirection(deltaX,deltaY)  {
		return (Math.atan2(deltaY, deltaX)*(180/Math.PI))+90;
	
	}
	
	
	function getDistance(deltaX,deltaY)  {
		return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	
	}
	
	function getSquareOfDistance(deltaX,deltaY)  {
		return Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
	
	}
	
	
	
	//myGamePiece.v = myGamePiece.v * 0.9;
	//direction += myGamePiece.speedX * 0.5;
	//direction = (180 + getDirection(mouseposx - canvascenterx,mouseposy - canvascentery)) ; 
	
	
	

/*	deltaX = mousex(event) - myGamePiece.x;
	deltaY = 1 - myGamePiece.y;
	deg = Math.atan2(deltaY, deltaX)*180/Math.PI;*/
	
	
	
	
	
	
	
	function toRadians (angle) {
		return angle * (Math.PI / 180);
	}
	
	if (!spectate) {
		var clientData = {};
		clientData.Hoz = 0;
		clientData.Vert = 0;
		if (myGameArea.keys && myGameArea.keys[87]) { //w
			clientData.Vert += 1;
		}
		if (myGameArea.keys && myGameArea.keys[83]) { //s
			clientData.Vert -= 1;
		}
		if (myGameArea.keys && myGameArea.keys[65]) { //a
			clientData.Hoz += 1;
		}
		if (myGameArea.keys && myGameArea.keys[68]) { //d
			clientData.Hoz -= 1;
		}
		clientData.mouseX = camerax - mouseposx / zoom;
		clientData.mouseY = cameray - mouseposy / zoom;
		clientData.mouseState = mouseState;
		socket.emit('client data',  clientData);
		users[myId].clientData = clientData; //so all laser fires aren't processed client side
		users[myId].clientData.mouseState = 0;
		
	}
	
	
	// Zooming controls
	if (myGameArea.keys && myGameArea.keys[48]) {zoom = zoom / 1.1; }
	if (myGameArea.keys && myGameArea.keys[57]) {zoom = zoom * 1.1; }
	
	

	if (myGameArea.keys && myGameArea.keys[73]) {spawnCell(myId,camerax - mouseposx / zoom,cameray - mouseposy / zoom,20,20,2,0,0); } 
	if (myGameArea.keys && myGameArea.keys[80]) {initPlayer((new Date()).getTime() + '' + playerIds.length); }
	if (myGameArea.keys && myGameArea.keys[49]) {addcollect(camerax - mouseposx / zoom , cameray - mouseposy / zoom,  8 + Math.random() * 5 ); } 
	if (myGameArea.keys && myGameArea.keys[50]) {createcollects(camerax - mouseposx / zoom , cameray - mouseposy / zoom,  100,0 ); } 
	
	//+ canvascenterx / zoom
	
	function rendercollects () {
		var i = 0;
		while (i < collects.length) {
			var collectx = collects[i];
			var collecty = collects[i + 1];
			var collectsize = collects[i + 2];
			/*var collectcolor;
			if (collects[i + 3] == 1) {
				collectcolor = "red";
			}
			if (collects[i + 3] == 2) {
				collectcolor = "orange";
			}
			if (collects[i + 3] == 3) {
				collectcolor = "yellow";
			}
			if (collects[i + 3] == 4) {
				collectcolor = "blue";
			}
			if (collects[i + 3] == 5) {
				collectcolor = "lime";
			}
			if (collects[i + 3] == 6) {
				collectcolor = "purple";
			}*/

			//collectcolor = collects[i + 3];
			i += 6;
			ctx = myGameArea.context;
			/*ctx.fillStyle = collectcolor;
			//ctx.fillRect(100 ,100 ,5 ,5);


			ctx.fillRect((camerax - collectx) * zoom ,(cameray - collecty) * zoom ,collectsize  * zoom,collectsize * zoom);
			*/

			ctx.beginPath();
			ctx.arc((camerax - collectx) * zoom, (cameray - collecty) * zoom, collectsize  * zoom, 0 , 2*Math.PI);
			//ctx.fillStyle = collectcolor;
			var grd = ctx.createRadialGradient((camerax - collectx) * zoom, (cameray - collecty) * zoom, collectsize  * zoom*0.1, (camerax - collectx) * zoom, (cameray - collecty) * zoom, collectsize  * zoom);
			grd.addColorStop(0, "white");
			grd.addColorStop(1, "#00001a");
			ctx.fillStyle = grd;
			ctx.fill();
			ctx.closePath();

		}
	}
	
	
	function renderships () {
	var i = 0;
	while (i < (ships.length - 1)) {
		var shipx = ships[i];
		var shipy = ships[i + 1];
		var shipsize = ships[i + 3];
		var shipdir = ships[i + 4];
		var shiptype = ships[i + 5];
		var shipid = ships[i + 11];
		var shipcolor = ships[i + 14]

		
		i += 15;
		ctx = myGameArea.context;
		ctx.beginPath();
		ctx.arc((camerax - shipx) * zoom, (cameray - shipy) * zoom, shipsize * zoom, 0 , 2*Math.PI);
		if (shipid == 1) {
			ctx.fillStyle = "red";
		} else {
			if (shipcolor == 1) {
				ctx.fillStyle = "aqua";
			}
			if (shipcolor == 2) {
				ctx.fillStyle = "orange";
			}
			if (shipcolor == 3) {
				ctx.fillStyle = "yellow";
			}
			if (shipcolor == 4) {
				ctx.fillStyle = "blue";
			}
			if (shipcolor == 5) {
				ctx.fillStyle = "lime";
			}
			if (shipcolor == 6) {
				ctx.fillStyle = "purple";
			}
			if (shipcolor == 7) {
				ctx.fillStyle = "Fuchsia";
			}
			if (shipcolor == 8) {
				ctx.fillStyle = "#00cc66";
			}
		
		}
		ctx.fill();
		context.lineWidth = (shipsize/5 + 5) * zoom;
		if (shipid == 1) {
		  ctx.strokeStyle = '#800000';
		} else {
			if (shipcolor == 1) {
				ctx.strokeStyle = "rgb(0, 191, 191)";
			}
			if (shipcolor == 2) {
				ctx.strokeStyle = "rgb(191, 124, 0)";
			}
			if (shipcolor == 3) {
				ctx.strokeStyle = "rgb(191, 191, 0)";
			}
			if (shipcolor == 4) {
				ctx.strokeStyle = "rgb(0, 0, 191)";
			}
			if (shipcolor == 5) {
				ctx.strokeStyle = "rgb(0, 191, 0)";
			}
			if (shipcolor == 6) {
				ctx.strokeStyle = "rgb(96, 0, 96)";
			}
			if (shipcolor == 7) {
				ctx.strokeStyle = "rgb(191, 0, 191)";
			}
			if (shipcolor == 8) {
				ctx.strokeStyle = "rgb(0, 153, 77)";
			}
		}
		ctx.stroke();
		ctx.closePath();
        
		/*var image = new Image() ;
		if (shiptype == 1) {
			if (shipid == 1) {
				image.src = "images/ship1-red.png" ;
			} else {
				image.src = "images/ship1-blue.png" ;
			}
			drawRotatedImage(image,(camerax - shipx) * zoom,(cameray - shipy) * zoom, shipsize*2*zoom, shipsize*2*zoom, shipdir);
		}
		if (shiptype == 2) {
			if (shipid == 1) {
				image.src = "images/ship2-red.png" ;
			} else {
				image.src = "images/ship2-blue.png" ;
			}
			drawRotatedImage(image,(camerax - shipx) * zoom,(cameray - shipy) * zoom, shipsize*2*zoom, shipsize*2*zoom, shipdir);
		}
		if (shiptype == 3) {
			if (shipid == 1) {
				image.src = "images/ship1-red.png" ;
			} else {
				image.src = "images/ship1-blue.png" ;
			}
			drawRotatedImage(image,(camerax - shipx) * zoom,(cameray - shipy) * zoom, shipsize*2*zoom, shipsize*2*zoom, shipdir);
		}
		if (shiptype == 4) {
			if (shipid == 1) {
				image.src = "images/ship3.svg" ;
			} else {
				image.src = "images/ship3-blue.svg" ;
			}
			drawRotatedImage(image,(camerax - shipx) * zoom,(cameray - shipy) * zoom, shipsize*2*zoom, shipsize*3*zoom, shipdir);
		}*/
		
	}
	}
	
	
	
	function renderCells () {
		
		var i;
		for (i = 0; i < playerIds.length; i++) {
			var cellcolor = users[playerIds[i]].color;
			
			var i2;
			for (i2 = 0; i2 < users[playerIds[i]].cells.length; i2++) {
				var cellx = users[playerIds[i]].cells[i2].x;
				var celly = users[playerIds[i]].cells[i2].y;
				var cellsize = users[playerIds[i]].cells[i2].size;
				var celldir = users[playerIds[i]].cells[i2].dir;
				var cellgundir = users[playerIds[i]].cells[i2].gunDir;
				var celltype = users[playerIds[i]].cells[i2].type;
				ctx = myGameArea.context;
				var image = new Image() ;
				if (celltype == 1) {
					if (playerIds[i] == myId) {
						image.src = "images/shipv2-red.svg" ;
					} else {
						image.src = "images/shipv2-blue.svg" ;
					}
					drawRotatedImage(image,(camerax - cellx) * zoom,(cameray - celly) * zoom, cellsize*4*zoom, cellsize*4*zoom, celldir);
					//drawRotatedRect((camerax - cellx) * zoom,(cameray - celly) * zoom,cellsize*zoom/2,cellsize*1.5*zoom,cellgundir,'white')
					
				}
				if (celltype == "minion-collector") {
					if (playerIds[i] == myId) {
						image.src = "images/shipv2-red.svg" ;
					} else {
						image.src = "images/shipv2-blue.svg" ;
					}
					drawRotatedImage(image,(camerax - cellx) * zoom,(cameray - celly) * zoom, cellsize*4*zoom, cellsize*4*zoom, celldir);
				}
				
				if (celltype == 2) {
					if (playerIds[i] == myId) {
						image.src = "images/ship2-red.png" ;
					} else {
						image.src = "images/ship2-blue.png" ;
					}
					drawRotatedImage(image,(camerax - cellx) * zoom,(cameray - celly) * zoom, cellsize*2*zoom, cellsize*2*zoom, celldir);
				}
				if (celltype == 3) {
					if (playerIds[i] == myId) {
						image.src = "images/ship1-red.png" ;
					} else {
						image.src = "images/ship1-blue.png" ;
					}
					drawRotatedImage(image,(camerax - cellx) * zoom,(cameray - celly) * zoom, cellsize*2*zoom, cellsize*2*zoom, celldir);
				}
				if (celltype == 4) {
					if (playerIds[i] == myId) {
						image.src = "images/ship3.svg" ;
					} else {
						image.src = "images/ship3-blue.svg" ;
					}
				drawRotatedImage(image,(camerax - cellx) * zoom,(cameray - celly) * zoom, cellsize*2*zoom, cellsize*3*zoom, celldir);

	
				}
			}
		}
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	function cellPhysics () {
		var i;
		for (i = 0; i < playerIds.length; i++) {
			var move = false;
			var shoot = false;
			/*if (playerIds[i] == myId) {
				
				var targetX = camerax - mouseposx / zoom;
				var targetY = cameray - mouseposy / zoom;
				
				if (controls == 1) {
					if (mouseState == 1) {
						move = true;
					}
					if (myGameArea.keys && myGameArea.keys[32]) {
						shoot = true;
					}
				}
				if (controls == 2) {
					move = true;
					if (mouseState == 1) {
						shoot = true;
					}
				}
				if (controls == 3) {
					if (mouseState == 1) {
						shoot = true;
					}
				}
			} else {
				targetX = 0;
				targetY = 0;
				
				var nearestColDist = 999999999999999999;
				var nearestColIndex = -1;
				var mainCellx = users[playerIds[i]].cells[0].x;
				var mainCelly = users[playerIds[i]].cells[0].y;
				for (i2 = 0; i2 < collects.length; i2 += 4) {
					if (getSquareOfDistance(mainCellx - collects[i2] , mainCelly - collects[i2 + 1]) < nearestColDist) {
						nearestColDist = getSquareOfDistance(mainCellx - collects[i2] , mainCelly - collects[i2 + 1]);
						nearestColIndex = i2;
					}
				}
				targetX = collects[nearestColIndex];
				targetY = collects[nearestColIndex + 1];//*//*
				move = true;
				shoot = true;
			}*/
			
			var targetX = users[playerIds[i]].clientData.mouseX;
			var targetY = users[playerIds[i]].clientData.mouseY;
			shoot = users[playerIds[i]].clientData.mouseState == 1;
			
			var i2;
			for (i2 = 0; i2 < users[playerIds[i]].cells.length; i2++) {
				
				
				var cellx = users[playerIds[i]].cells[i2].x;
				var celly = users[playerIds[i]].cells[i2].y;
				var cellv = users[playerIds[i]].cells[i2].v;
				var cellsize = users[playerIds[i]].cells[i2].size;
				var celldir = users[playerIds[i]].cells[i2].dir;
				var cellgundir = users[playerIds[i]].cells[i2].gunDir;
				var celltype = users[playerIds[i]].cells[i2].type;
				var cellxv = users[playerIds[i]].cells[i2].xv;
				var cellyv = users[playerIds[i]].cells[i2].yv;
				var cellx = users[playerIds[i]].cells[i2].x;
				var cellframesSinceFired = users[playerIds[i]].cells[i2].frameSinceFired + 1; //increase by 1 each frame
				var cellmovement = users[playerIds[i]].clientData;  //0 - still | 1 - up/w | 2 - down/w | 3 - left/a | 4 - right/d
				var cellupgrades = users[playerIds[i]].upgrades;
				if (controls == 3) {
					if (cellmovement.Vert == 1) { //w
						//cellyv += 1 + 5 / Math.sqrt(cellsize) + cellupgrades.moveSpeed/3;
						cellv += 0.2+(cellupgrades.moveSpeed/10);
					}
					if (cellmovement.Vert == -1) { //s
						//cellyv -= 1 + 5 / Math.sqrt(cellsize) + cellupgrades.moveSpeed/3;
					}
					if (cellmovement.Hoz == 1) { //a
						celldir -= 5;
						//cellxv += 1 + 5 / Math.sqrt(cellsize) + cellupgrades.moveSpeed/3;
					}
					if (cellmovement.Hoz == -1) { //d
						celldir += 5;
						//cellxv -= 1 + 5 / Math.sqrt(cellsize) + cellupgrades.moveSpeed/3;
					}
				}

				
				var targetdir = getDirection(users[playerIds[i]].cells[i2].x - targetX, users[playerIds[i]].cells[i2].y - targetY) % 360;
				/* spin towards direction script */
				if (cellgundir == targetdir) {
				} else {
					if ((targetdir - cellgundir) > 180) {
						targetdir += -360;
					} else {
						if ((targetdir - cellgundir) < -180) {
							targetdir += 360;
						}
					}
					if (targetdir > cellgundir + 20) {
						cellgundir += 20;
					} else {
						if (targetdir < cellgundir - 20) {
							cellgundir += -20;
						} else {
							cellgundir = (0.7 * cellgundir) + (0.3 * targetdir);
						}
					}
				}
				/* end of spin towards script */
				
				
				if (move) {
					cellv += 1 + 5 / Math.sqrt(cellsize);
				}
				/*cellx += cellv * (Math.sin(toRadians(celldir))) * -1 + cellxv;
				celly += cellv * (Math.cos(toRadians(celldir))) + cellyv;*/
				cellx += cellxv;
				celly += cellyv;
				cellv = cellv * 0.9;
				cellxv = cellxv * 0.95 + cellv * (Math.sin(toRadians(celldir))) * -1;
				cellyv = cellyv * 0.95 + cellv * (Math.cos(toRadians(celldir)));
				createParticle(cellx,celly,Math.sin(toRadians(celldir)) * (cellv+10) ,Math.cos(toRadians(celldir)) * (cellv-10), cellsize * Math.random() * 0.6 ,Math.round(3 + Math.random() * 6));
		
				var i3;
				var collength = collects.length;
				for (i3 =0; i3 < (collength - 1); i3+=6) {
			
					if (getDistance(cellx - collects[i3] , celly - collects[i3 + 1]) < (cellsize/2 + collects[i3 + 2])*2)  {
				
				
						cellsize = Math.sqrt((Math.pow(cellsize, 2)) + Math.pow(collects[i3 + 2] , 2)/10);
						if (i2 != 0) {
							users[playerIds[i]].cells[0].size = Math.sqrt((Math.pow(users[playerIds[i]].cells[0].size, 2)) + Math.pow(collects[i3 + 2] , 2));
						}
						collects.splice(i3, 6);
				
					} else {
			
						if (getDistance(cellx - collects[i3] , celly - collects[i3 + 1]) < (cellsize/2 + collects[i3 + 2]/2)*2 + 40)   {
							var dirtocol = getDirection(collects[i3] - cellx, collects[i3+1] - celly);
                   			collects[i3] -= Math.sin(toRadians(dirtocol)) * 20;
							collects[i3 + 1] += Math.cos(toRadians(dirtocol)) * 20;
                
						}
					}
				}
				if (shoot) {
					if (celltype == 1) {					
						if (cellframesSinceFired > 30) {
							createlaser(cellx, celly, celldir * (Math.PI/-180),  40 ,playerIds[i],50,100,cellsize/3); 
							
							cellxv += Math.sin(toRadians(celldir)) * 50 * 0.1;  // the '50's are placeholders for the damage
							cellyv += Math.cos(toRadians(celldir)) * 50 * -0.1;
							cellframesSinceFired = 0;
						}
					}
				}
				
				
				
				users[playerIds[i]].cells[i2].x = cellx;
				users[playerIds[i]].cells[i2].y = celly;
				users[playerIds[i]].cells[i2].v = cellv;
				users[playerIds[i]].cells[i2].size = cellsize;
				users[playerIds[i]].cells[i2].dir = celldir;
				users[playerIds[i]].cells[i2].type = celltype;
				users[playerIds[i]].cells[i2].xv = cellxv;
				users[playerIds[i]].cells[i2].yv = cellyv;
				users[playerIds[i]].cells[i2].frameSinceFired = cellframesSinceFired;
						
			}
		}
				
		
		
		for (i = 0; i < playerIds.length; i++) {
			var playerAlive = true;
			for (i2 = 0;  playerAlive && i2 < users[playerIds[i]].cells.length; i2++) {
				var cellAlive = true;
				var cellx = users[playerIds[i]].cells[i2].x;
				var celly = users[playerIds[i]].cells[i2].y;
				var cellv = users[playerIds[i]].cells[i2].v;
				var celldir = users[playerIds[i]].cells[i2].dir;
				var cellsize = users[playerIds[i]].cells[i2].size;
				var celltype = users[playerIds[i]].cells[i2].type;
				var cellxv = users[playerIds[i]].cells[i2].xv;
				var cellyv = users[playerIds[i]].cells[i2].yv;
				
				for (i3 = 0; i3 < playerIds.length && cellAlive && playerAlive; i3++) {
					
					var i4;
					for (i4 = 0; cellAlive && playerAlive && i4 < users[playerIds[i3]].cells.length ; i4++) {
						
						var cellBx = users[playerIds[i3]].cells[i4].x;
						var cellBy = users[playerIds[i3]].cells[i4].y;
						var cellBv = users[playerIds[i3]].cells[i4].v;
						var cellBsize = users[playerIds[i3]].cells[i4].size;
						var cellBdir = users[playerIds[i3]].cells[i4].dir;
						var cellBtype = users[playerIds[i3]].cells[i4].type;
						var cellBxv = users[playerIds[i3]].cells[i4].xv;
						var cellByv = users[playerIds[i3]].cells[i4].yv;
						if (i !== i3 || i2 !== i4) {
							
							var distToCell = getDistance(cellx - cellBx, celly - cellBy);
							if (distToCell < cellsize + cellBsize) {
								var dirFromCell = getDirection(cellx - cellBx, celly - cellBy);
								cellxv += Math.sin(toRadians(dirFromCell)) * 5 / Math.sqrt(cellsize/cellBsize);
								cellyv += Math.cos(toRadians(dirFromCell)) * 5 / Math.sqrt(cellsize/cellBsize);
								
								
								/*if (i != i3) {
									if (cellsize < cellBsize) {
										if (users[playerIds[i]].cells[i2].inContactWith.ids.indexOf(playerIds[i3]) != -1) {
											users[playerIds[i]].cells[i2].inContactWith[playerIds[i3]] += cellBsize / 10;
											if (users[playerIds[i]].cells[i2].inContactWith[playerIds[i3]] > cellsize) {
												if (users[playerIds[i]].cells[i2].type == 1) {
													var i5;
													for (i5 = 0; i5 < users[playerIds[i]].cells.length; i5++) {
														if (i5 != i2) {
															users[playerIds[i3]].cells.push(users[playerIds[i]].cells[i5]);
															users[playerIds[i]].cells.splice(i5,1);
															i5 -= 1;
														} else {
															users[playerIds[i]].cells[i2].type = 2;
															users[playerIds[i3]].cells.push(users[playerIds[i]].cells[i5]);
															users[playerIds[i]].cells.splice(i5,1);
															i5 -= 1;
														}
													}
													if (playerIds[i] == myId) { //if my cell is killed, switch to spectate
														spectate = true;
														spectateId = playerIds[i3];
													} else {
														if (playerIds[i] == spectateId && spectate){
															spectateId = playerIds[i3];
														}
													}
													
													
													playerIds.splice(playerIds.indexOf(playerIds[i]),1);
													i -= 1;
													
													
													playerAlive = false;
													
													
												} else {
													users[playerIds[i3]].cells.push(users[playerIds[i]].cells[i2]);
													users[playerIds[i]].cells.splice(i2,1);
													i2 -= 1;
													/*if (i2<i4) {
														i4 -= 1;
													}*//*
												}
												
												cellAlive = false;
												
												
											}
										} else {
											users[playerIds[i]].cells[i2].inContactWith[playerIds[i3]] = 1;
											users[playerIds[i]].cells[i2].inContactWith.ids.push(playerIds[i3]);

										}
									}
								}*/
							}
						}
					}
				}
				if (cellAlive) {
					users[playerIds[i]].cells[i2].xv = cellxv;
					users[playerIds[i]].cells[i2].yv = cellyv;
				}
			}
		}
	}
	
	
	
	
	
	
	
	
	
	
	
	
	function shipphysics () {
	var i = 0;
	while (i < (ships.length - 1)) {
		var shipx = ships[i];
		var shipy = ships[i + 1];
		var shipv = ships[i + 2];
		var shipsize = ships[i + 3];
		var shipdir = ships[i + 4] % 360;
		var shiptype = ships[i + 5];
		var shiphealth = ships[i + 6];
		var shipdamage = ships[i + 7];
		var shipdefence = ships[i + 8];
		var shipxv = ships[i + 9];
		var shipyv = ships[i + 10];
		var shipid = ships[i + 11];
		var shipframessinceshot = ships[i + 12];
		var shipframesshooting = ships[i + 13];
		var shipcolor = ships[i + 14];
        var shoot = 0; // 0 = don't shoot, 1 = shoot
		var move = 0;
		
		
		
		
		
		if (shipid == 1) {
			var targetdir = (getDirection(mouseposx -((camerax - shipx) * zoom),mouseposy - ((cameray - shipy) * zoom))) % 360;
			
			//averagemyshipx += shipx;		
			//averagemyshipy += shipy; 
			//totalmyships += 1; 
			
			
		
		
			/*if (shipdir == dirtomouse) {
			} else {
				var targetdir = dirtomouse;
				if ((dirtomouse - shipdir) > 180) {
					targetdir += -360;
				} else {
					if ((dirtomouse - shipdir) < -180) {
					targetdir += 360;
				}
				}
				if (targetdir > shipdir + 20) {
					shipdir += 20;
				} else {
					if (targetdir < shipdir - 20) {
						shipdir += -20;
					} else {
						shipdir = (0.7 * shipdir) + (0.3 * targetdir);
					}
				}	
			}*/
		
		
			if (controls == 1) {
				if (mouseState == 1) {
					move = 1;
					//shipv += 3.5 / Math.sqrt(shipsize);
				}
			} else {
				move = 1;
				//shipv += 3.5 / Math.sqrt(shipsize);
			}
		
		}
		
		
		if (shipid[0] == "a") {
			targetdir = shipdir;
			var i2 = 0;
			var shipslength = ships.length;
			var targetingship = 0;
			while (i2 < (shipslength - 1)) {
				if (shipid == ships[i2+11]) {} else {
					if (getSquareOfDistance(shipx - ships[i2], shipy - ships[i2+1]) <  Math.pow(shipsize * 10,2) /*1000000*/) {
						targetingship = 1;
						if (shipsize > ships[i2 + 3]) {
							targetdir = 180 - getDirection(shipx - ships[i2], shipy - ships[i2+1]);
						} else {
							targetdir = getDirection(shipx - ships[i2], shipy - ships[i2+1]);
						}
						shoot = 1;
						if (getSquareOfDistance(shipx - ships[i2], shipy - ships[i2+1]) < Math.pow(shipsize * 4,2) /*360000*/) {
							
						} else {
							move = 1;
							//shipv += 3.5 / Math.sqrt(shipsize);
						}
						
						
					}
				}
			i2 += 15;
			}
			if (targetingship == 1) {} else {
				var i2 = 0;
				var collength = collects.length;
				var nearestcoldist = 999999999;
				var nearestcolindex = 0;
				while (i2 < (collength - 1)) {
					if (getSquareOfDistance(shipx - collects[i2] , shipy - collects[i2 + 1]) < nearestcoldist) {
						nearestcoldist = getSquareOfDistance(shipx - collects[i2] , shipy - collects[i2 + 1]);
						nearestcolindex = i2;
					}
					i2 += 4;
				}
				targetdir = getDirection(shipx - collects[nearestcolindex],shipy - collects[nearestcolindex+1]);
				move = 1;
				move = 1;
			}
		}
		
		/* spin towards direction script */
		if (shipdir == targetdir) {
		} else {
			if ((targetdir - shipdir) > 180) {
				targetdir += -360;
			} else {
				if ((targetdir - shipdir) < -180) {
					targetdir += 360;
				}
			}
			
			if (targetdir > shipdir + 20) {
				shipdir += 20;
			} else {
				if (targetdir < shipdir - 20) {
					shipdir += -20;
				} else {
					shipdir = (0.7 * shipdir) + (0.3 * targetdir);
				}
			}
		}
		/* end of spin towards script */	
		
		if (move == 1) {
			shipv += 1 + 3.5 / Math.sqrt(shipsize);
		}
		
		
		shipv = shipv * 0.9;
		shipxv = shipxv * 0.9;
		shipyv = shipyv * 0.9;
		
		
		shipx += shipv * (Math.sin(toRadians(shipdir))) * -1 + shipxv;
		shipy += shipv * (Math.cos(toRadians(shipdir))) + shipyv;
		
		var i2 = 0;
		var collength = collects.length;
		while (i2 < (collength - 1)) {
			
			if (getDistance(shipx - collects[i2] , shipy - collects[i2 + 1]) < (shipsize/2 + collects[i2 + 2])*2)  {
				
				
				shipsize = Math.sqrt((Math.pow(shipsize, 2)) + Math.pow(collects[i2 + 2] , 2)) ;
				collects.splice(i2, 4);
				
			} else {
			
				if (getDistance(shipx - collects[i2] , shipy - collects[i2 + 1]) < (shipsize/2 + collects[i2 + 2]/2)*2 + 40)   {
                    var dirtocol = getDirection(collects[i2] - shipx, collects[i2+1] - shipy);
                   
                    
                    collects[i2] -= Math.sin(toRadians(dirtocol)) * 20;
					collects[i2 + 1] += Math.cos(toRadians(dirtocol)) * 20;
                
                    
					/*collects[i2] = collects[i2] - ((collects[i2]-shipx)/3);
					collects[i2 + 1] = collects[i2+1] - ((collects[i2+1]-shipy)/3);*/
				}
			}
			
			
			i2 +=4
		
		
		}
		
		
		var i2 = 0;
		while (i2 < (ships.length - 1)) {
			if (i2 == i) {
			} else {
			if (getDistance(shipx - ships[i2], shipy - ships[i2 + 1]) < (shipsize + ships[i2 + 3]) ) {
				
				var dirfromship = getDirection(shipx - ships[i2], shipy - ships[i2 + 1]);
				var impactforce = 0.5 + (0.1 * Math.sqrt((Math.abs(Math.sin(toRadians(shipdir)) * (1 + shipv) - Math.sin(toRadians(ships[i2 + 4])))) * (1 + ships[i2+2]) +(Math.abs(Math.cos(toRadians(shipdir)) * (1 + shipv) - Math.cos(toRadians(ships[i2 + 4])) * (1 + ships[i2+2])))));
				
				ships[i2 + 9]  += Math.sin(toRadians(dirfromship)) * ((shipsize / ships[i2 + 3]) * impactforce * -1);
				ships[i2 + 10] += Math.cos(toRadians(dirfromship)) * ((shipsize / ships[i2 + 3]) * impactforce * -1);
				
				shipxv += Math.sin(toRadians(dirfromship)) * ((shipsize / ships[i2 + 3]) * impactforce);
				shipyv -= Math.cos(toRadians(dirfromship)) * ((shipsize / ships[i2 + 3]) * impactforce);
				
				if (shipid == ships[i2+11]) {
				} else {
					if (shipsize > ships[i2+3]) {
						ships[i2+11] = shipid;
						ships[i2+14] = shipcolor;
					} else {
						shipid = ships[i2+11];
						shipcolor = ships[i2+14];
					}					
					/*shiphealth -=  ships[i2+3] / shipsize;
					ships[i2+6]	-= shipsize / ships[i2+3];
					shipframessinceshot = 0;
					damaged.push(i,80);*/
				}
				
				
			}
			}
			
			
			
			
			
		i2 +=15;
		}
		
        
        
		i2 = 0;
		
		while (i2 < (lasers.length - 1)) {
			if (lasers[i2+8] == shipid) { } else {
                if (getDistance(shipx - lasers[i2+4], shipy - lasers[i2 + 5]) < shipsize + lasers[i2+11]) {
                    if (lasers[i2 + 9] - shipdefence < 0) {
                        
                    } else {
						shiphealth -= Math.sqrt(lasers[i2+9] - shipdefence) ;
                        //shiphealth -= (Math.sqrt(lasers[i2+9] - shipdefence)) / 10 ;
						shipframessinceshot = 0;
                        damaged.push(i,80);
                    }
			        if (lasers[i2+10] > 10) {
						lasers[i2+10] = 10;
					}
                    //lasers.splice(i2,11);
				
                }	
            }
            i2 +=12;
		}
		
		
		
		if (shipid == 1) {
			
				if (controls == 1) {
					if (myGameArea.keys && myGameArea.keys[32]) {
						shoot = 1;
					}
                } else {
					if (mouseState == 1) {
						shoot = 1;
					}
				}
            
		}
		
		
		shipdamage = Math.sqrt(shipsize)*2 + shipsize/5 -7;
		shipdefence = 0;//shipdamage / 2;
		if (shipsize*4 > shiphealth) {
			if (shipframessinceshot > 80) {
				shiphealth += 2;
			}
			
		} else {
			shiphealth = shipsize * 4;			
		}
		
		
        /*if (shoot == 1) {
			if (shiptype == 1) {
				if (shipframesshooting % (Math.ceil(Math.sqrt(shipsize*4))+5) == 0) { //(frame % (Math.ceil(Math.sqrt(shipsize*4))+5) == 0) {
					createlaser(shipx, shipy, shipdir * (Math.PI/-180), Math.sqrt(shipsize) * 2 ,shipid ,shipdamage,100,shipdamage); 
					shipxv = Math.sin(toRadians(shipdir)) * shipdamage * 0.3;
					shipyv = Math.cos(toRadians(shipdir)) * shipdamage * -0.3;
				}
			}
			if (shiptype == 2) {
				if (frame % (Math.ceil(Math.sqrt(shipsize*4))+5) == 0) {
					createlaser(shipx, shipy, shipdir * (Math.PI/-180), Math.sqrt(shipsize) * 2 ,shipid ,shipdamage,100,shipdamage); 
				}
				if (frame % (Math.ceil(Math.sqrt(shipsize*4))+5) == Math.ceil((Math.ceil(Math.sqrt(shipsize*4))+5)/2) ) {
					createlaser(shipx, shipy, (shipdir- 180) * (Math.PI/-180), Math.sqrt(shipsize) * 2 ,shipid ,shipdamage,100,shipdamage); 
				}
			}
			if (shiptype == 3) {
				if (frame % Math.ceil(Math.sqrt(shipsize*4+5)/4) == 0) {
					createlaser(shipx, shipy, (shipdir + Math.random() * 20 - 10) * (Math.PI/-180) , Math.sqrt(shipsize) * 2 ,shipid ,shipdamage/2,100,shipdamage*0.8); 
					shipxv = Math.sin(toRadians(shipdir)) * shipdamage * 0.2;
					shipyv = Math.cos(toRadians(shipdir)) * shipdamage * -0.2;
				}
			}
			if (shiptype == 4) {
				if (shipframesshooting % Math.ceil(((Math.sqrt(shipsize*4))+5) * 1.4) == 0) { //(frame % (Math.ceil(Math.sqrt(shipsize*4))+5) == 0) {
					createlaser(shipx, shipy, shipdir * (Math.PI/-180), 20 + Math.sqrt(shipsize/10) ,shipid ,shipdamage * 40,10 * Math.sqrt(shipsize) ,shipdamage * 1.3); 
					shipxv = Math.sin(toRadians(shipdir)) * shipdamage * 0.3;
					shipyv = Math.cos(toRadians(shipdir)) * shipdamage * -0.3;
				}
			}
        }
		
        //damaged.push(i,40);
        
		if (shoot == 1) {
			shipframesshooting += 1;
		} else {
			if (shiptype == 1) {
				if ((shipframesshooting % (Math.ceil(Math.sqrt(shipsize*4))+5)) - (Math.ceil(Math.sqrt(shipsize*4))+5) < 0) {
					shipframesshooting = 0;
				} else {
					shipframesshooting = shipframesshooting - (Math.ceil(Math.sqrt(shipsize*4))+5);
				}
			}
			if (shiptype == 2) {
				if ((shipframesshooting % (Math.ceil(Math.sqrt(shipsize*4))+5)) - (Math.ceil(Math.sqrt(shipsize*4))+5) < 0) {
					shipframesshooting = 0;
				} else {
					shipframesshooting = shipframesshooting - (Math.ceil(Math.sqrt(shipsize*4))+5);
				}
			}
			if (shiptype == 2) {
				if ((shipframesshooting % (Math.ceil(Math.sqrt(shipsize*4+5)/4))) - (Math.ceil(Math.sqrt(shipsize*4+5)/4)) < 0) {
					shipframesshooting = 0;
				} else {
					shipframesshooting = shipframesshooting - (Math.ceil(Math.sqrt(shipsize*4+5)/4));
				}
			}
		}*/
		
		
		
		
		
		ships[i] = shipx;
		ships[i+1] = shipy;
		ships[i+2] = shipv;
		ships[i+3] = shipsize;
		ships[i+4] = shipdir;
		ships[i+6] = shiphealth;
		ships[i+7] = shipdamage;
		ships[i+8] = shipdefence;
		ships[i+9] = shipxv;
		ships[i+10] = shipyv;
		ships[i+12] = shipframessinceshot + 1;
		ships[i+13] = shipframesshooting;
		
		
		if (shiphealth < 0) {
			var i2 = 0;
			while (i2 < damaged.length) {
				if (damaged[i2] == i) {
					damaged.splice(i2,2);
				} else {
					if (damaged[i2] > i) {
						damaged[i2] -= 15;
					}
					i2 += 2;
				}
				
			}
            createcollects(shipx,shipy,Math.pow(shipsize/30,2) + 10,shipsize*2);
			ships.splice(i,15);
		} else {		
		  i += 15;
		}
		
	}
	}
	
	
	function laserphysics () {
		var i = 0;
		
		while (i < (lasers.length - 1)) {
			lasers[i] += lasers[i+2];
			lasers[i+1] += lasers[i+3];
			lasers[i+4] += lasers[i+6];
			lasers[i+5] += lasers[i+7];
			lasers[i+10] -= 1;
			if (lasers[i+10] < 0) {
				lasers.splice(i, 12);
			}
			i += 12;
		}
	}
	
	
	function renderlasers () {
		var i = 0;
		var laserslength = lasers.length;
		while (i < (laserslength - 1)) {
			ctx = myGameArea.context;
			ctx.save();
			if (lasers[i+10] < 9) {
				ctx.globalAlpha = lasers[i+10]/10 + 0.1;
			}
			ctx.beginPath();
			ctx.moveTo((camerax - lasers[i]) * zoom, (cameray - lasers[i+1]) * zoom);
			ctx.lineTo((camerax - lasers[i+4]) * zoom, (cameray - lasers[i+5]) * zoom);
			ctx.lineWidth= lasers[i+11] * zoom;
			ctx.lineCap = 'round';
			if (lasers[i+8] == myId) {
				ctx.strokeStyle = '#800000';
			} else {
				ctx.strokeStyle = '#000099';
			}
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo((camerax - lasers[i]) * zoom, (cameray - lasers[i+1]) * zoom);
			ctx.lineTo((camerax - lasers[i+4]) * zoom, (cameray - lasers[i+5]) * zoom);
			ctx.lineWidth= lasers[i+11] * zoom * 0.8;
			ctx.lineCap = 'round';
			if (lasers[i+8] == myId) {
				ctx.strokeStyle = 'red';
			} else {
				ctx.strokeStyle = 'blue';
			}

			ctx.stroke();
			ctx.restore();

			i += 12;
		}
	}
	
	function renderhealthbar (x,y,size,health) {
		ctx = myGameArea.context;
		
		ctx.beginPath();
		ctx.moveTo(x - size*4, y);
		ctx.lineTo(x + size*4, y);
		ctx.lineWidth = size;
		ctx.strokeStyle = '#808080';
		context.lineCap = 'round';
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x - size*3.8, y);
		ctx.lineTo(x - size*3.8 + size*7.6*(health/100), y);
		ctx.lineWidth = size * 0.7;
		ctx.strokeStyle = 'red';
		context.lineCap = 'round';
		ctx.stroke();
	}
	
	function renderhealthbars () {
		var i = 0;
		while (damaged.length -1 > i) {
			damaged[i+1] -= 1;
			if (damaged[i+1] < 19) {
				ctx = myGameArea.context;
				ctx.save();
				ctx.globalAlpha =  (damaged[i+1]+1) / 20;
				renderhealthbar((camerax - ships[damaged[i]]) * zoom, (cameray - ships[damaged[i]+1] ) * zoom - 50, 20, (ships[damaged[i]+6] / ships[damaged[i]+3]*4) * 6);
				ctx.restore();
			} else {
				renderhealthbar((camerax - ships[damaged[i]]) * zoom, (cameray - ships[damaged[i]+1]) * zoom - 50, 20, (ships[damaged[i]+6] / ships[damaged[i]+3]*4) * 6) ;
			}
			if (damaged[i+1] < 0) {
				damaged.splice(i,2);
			} else {
				i += 2;
			}
		}	
	}
	
	function particlePhysics () {
		var i;
		for (i=0;i<particles.length;i+=6) {
			particles[i] += particles[i+2];
			particles[i+1] += particles[i+3];
			particles[i+4] = particles[i+4]  * 0.95 - 0.5;
			if (particles[i+4] < 0) {
				particles.splice(i,6);
			}
		}
	}
	
	function renderParticles () {
		var i;
		for (i=0;i<particles.length;i+=6) {
			ctx = myGameArea.context;
			ctx.beginPath();
			//ctx.arc(100, 100,  100  * zoom, 0 , 2*Math.PI);	
			ctx.arc((camerax - particles[i]) * zoom, (cameray -  particles[i+1]) * zoom,  particles[i+4]  * zoom, 0 , 2*Math.PI);			
			ctx.fillStyle = particles[i+5];
			ctx.fill();
			ctx.closePath();
		}
	}
	
	
	
	function createParticle(x,y,xv,yv,size,number) {
		if (number == 'undefined') {
			particles.push(x+(Math.random()*xv*2),y+(Math.random()*yv*2),xv*(0.7+Math.random()*0.3),yv*(0.7+Math.random()*0.3),size,'rgba(' + (225 + Math.round(Math.random() * 30)) + ','+ (100 + Math.round(Math.random() * 150)) + ', 0,0.5)');
		} else {
			var i;
			for (i=0; i<number; i++) {
				particles.push(x+(Math.random()*xv*2),y+(Math.random()*yv*2),xv*(0.7+Math.random()*0.3),yv*(0.7+Math.random()*0.3),size,'rgba(' + (225 + Math.round(Math.random() * 30)) + ','+ (100 + Math.round(Math.random() * 150)) + ', 0,0.5)');
			}
		}
	}
	
	
	function collectPhysics () {
		var i;
		for (i=0;i<collects.length;i+=6) {
			collects[i] += collects[i+4];
			collects[i+1] += collects[i+5]
			collects[i+4] *= 0.9;
			collects[i+5] *= 0.9;
		}
	}
	
	
	/*function spawnship (shx,shy,shv, shsize, shdir, shtype, shhealth, shdamage, shdefence, shid) {
		ships.push(shx,shy,shv, shsize, shdir, shtype, shhealth, shdamage, shdefence, 0 ,0, shid, 0, 0, Math.ceil(Math.random() * 8)); // x, y, v, size, dir, type, health, damage, defence, xv, yv, id, frames since shot, frames mouse down, ship colour
	}*/
	
	
	 //* @param {Number} height The height of the rectangle
	 //* @param {Number} [radius = 5] The corner radius; It can also be an object 
	 //*                 to specify different radii for corners
	 //* @param {Number} [radius.tl = 0] Top left
	 //* @param {Number} [radius.tr = 0] Top right
	 //* @param {Number} [radius.br = 0] Bottom right
	 // * @param {Number} [radius.bl = 0] Bottom left
	 //* @param {Boolean} [fill = false] Whether to fill the rectangle.
	 //* @param {Boolean} [stroke = true] Whether to stroke the rectangle.
	 //http://js-bits.blogspot.co.uk/2010/07/canvas-rounded-corner-rectangles.html / http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
	function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
		if (typeof stroke == "undefined" ) {
			stroke = true;
		}
		if (typeof radius === "undefined") {
			radius = 5;
		}
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		if (stroke) {
			ctx.stroke();
		}
		if (fill) {
			ctx.fill();
		}        
	}
	
	function roundRectRightCornersOnly(ctx, x, y, width, height, radius, fill, stroke) {
		if (typeof stroke == "undefined" ) {
			stroke = true;
		}
		if (typeof radius === "undefined") {
			radius = 5;
		}
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x, y + height);
		ctx.lineTo(x, y);
		ctx.closePath();
		if (stroke) {
			ctx.stroke();
		}
		if (fill) {
			ctx.fill();
		} 
	}
	
	function roundRectLeftCornersOnly(ctx, x, y, width, height, radius, fill, stroke) {
		if (typeof stroke == "undefined" ) {
			stroke = true;
		}
		if (typeof radius === "undefined") {
			radius = 5;
		}
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + width, y);
		ctx.lineTo(x + width, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		if (stroke) {
			ctx.stroke();
		}
		if (fill) {
			ctx.fill();
		}        
	}
	
	
	
	function spawnCell (playerid,shx,shy,shv, shsize, shtype, shxv, shyv) {		
		var cellSpawnObject = {
			x: shx,
			y: shy,
			v: shv,
			size: shsize,
			dir: 0,
			gunDir : 0,
			type: shtype,
			xv: shxv,
			yv: shyv,
			inContactWith: {ids:[]},
			frameSinceFired: 0,
			health : shhealth,
		}
		users[playerid].cells.push(cellSpawnObject);
		
		
	}

	
	function initPlayer (playerid) {
		if (playerIds.indexOf(playerid) == -1) {
			playerIds.push(playerid);
		}
		users[playerid] =  {
			color: Math.ceil(Math.random() * 8),
			cells: []
		};
		spawnCell(playerid,Math.random() * mapWidth,Math.random() * mapHeight,20,40,1,0,0);
		
	}
	
	function createlaser (x,y,ldir,v,id,damage, range, size) {
		var xv = Math.sin(ldir) * v;
		var yv = Math.cos(ldir) * v;
		var xd = Math.sin(ldir) * (size * 4 + 6);
		var yd = Math.cos(ldir) * (size * 4 + 6) ;
		lasers.push(x,y,xv, yv, x + xd, y + yd, xv, yv, id, damage, range,size);
	}

	
	function addcollect (colx, coly , colsize) {
			collects.push(colx, coly, colsize , Math.ceil(Math.random() * 6),0,0);
	}
	
	/*if (collects.length < 99) {
		addcollect(Math.random() * 1000 , Math.random() * 1000,5, "red");
	}*/
	
	
	
	function createcollects (colx,coly,number,area) {
		var coli = 0;
		while (coli < number) {
		addcollect(colx + (Math.random()*area), coly + (Math.random()*area), 10 + Math.random() * 5);
		coli += 1;
	}
	}
	
	/*if (collects.length < 4000) {
		addcollect(Math.pow(Math.random() * 20 ,3) * (Math.floor(Math.random()*2)*2-1) + mapWidth/2, Math.pow(Math.random() * 20 ,3) * (Math.floor(Math.random()*2)*2-1) + mapHeight/2, 5 + Math.random() * 5);
		
		//addcollect(Math.random() * mapWidth , Math.random() * mapHeight, 5 + Math.random() * 5);
	}*/
	

	if (frame == 1) {
		//spawnship(1,1,1,20,45,2,100,1,1,1,0);
		/*spawnship(1,100,1,20,45,100,1,1,1,1);
		spawnship(100,1,1,20,45,100,1,1,1,1);*/
		
		initPlayer(myId); // init player with my ID
		/*spawnCell(myId,1,1,20,20,2,0,0);
		spawnCell(myId,1,1,20,20,2,0,0);
		spawnCell(myId,1,1,20,20,2,0,0);
		spawnCell(myId,1,1,20,20,2,0,0);*/
		
		
		/*initPlayer("a");
		spawnCell("a",1,1,20,20,2,0,0);
		spawnCell("a",1,1,20,20,2,0,0);
		spawnCell("a",1,1,20,20,2,0,0);
		spawnCell("a",1,1,20,20,2,0,0);
		// random player ID initPlayer((new Date()).getTime() + '' + playerIds.length);*/
	}

	
	//addcollect(100,100,5, "red");
	

	//createlaser(ships[0],ships[1],ships[4],10,1,1);
	
	//shipphysics ();
	
	cellPhysics();
	laserphysics ();
	collectPhysics();
	particlePhysics();
	
    
	
	
	canvascenterx = window.innerWidth / 2;
	canvascentery = window.innerHeight / 2;
	myGameArea.canvas.width = canvascenterx * 2;
	myGameArea.canvas.height = canvascentery * 2;
	//camerax = ships[0] + canvascenterx / zoom ;
	//cameray = ships[1] + canvascentery / zoom;
	//camerax = canvascenterx / zoom;
	//cameray = canvascentery / zoom;
	if (spectate) {
		camerax = users[spectateId].cells[0].x + canvascenterx / zoom;
		cameray = users[spectateId].cells[0].y + canvascentery / zoom;
	} else {
		camerax = users[myId].cells[0].x + canvascenterx / zoom;
		cameray = users[myId].cells[0].y + canvascentery / zoom;
	}
    
   
    
	
    
	
	

	
	rendercollects();
	renderParticles();
	renderlasers();
	//renderships();
	renderCells();
	renderhealthbars();
	
    //myGamePiece.newPos();    
    //myGamePiece.update();
	
	//camerax = (camerax - ((camerax - (averagemyshipx / totalmyships + canvascenterx / zoom)) / 5)) ;
	//cameray = (cameray - ((cameray - (averagemyshipy / totalmyships + canvascentery / zoom)) / 5)) ;
	//update camera position at the end so everything uses the same values
	
	/*document.getElementById("x").innerHTML = "av y   " + averagemyshipx;
	document.getElementById("y").innerHTML = "av x   " + averagemyshipy;
	//document.getElementById("v").innerHTML = "v   " + Math.round(myGamePiece.v);
	document.getElementById("m").innerHTML = "mouse   " + mouseState;
	document.getElementById("mx").innerHTML = "mouse X   " + mouseposx;
	document.getElementById("my").innerHTML = "mouse Y   " + mouseposy;
	document.getElementById("d").innerHTML = "dir   " +  direction;
	document.getElementById("cx").innerHTML = "cx   " + camerax;
	document.getElementById("cy").innerHTML = "cy   " +  cameray;
	document.getElementById("lsr").innerHTML = "lasers   " +  lasers;
	document.getElementById("frame").innerHTML = "frame   " +  frame;*/
	
	
	delta = (Date.now() - lastCalledTime)/1000;
  	lastCalledTime = Date.now();
	
	
	for (i = 0; i < messages.length; i+=2) {
		ctx.font = "30px Arial";
		if (messages[i+1] < 1) {
			messages.splice(i,2);
		} else {
			if (messages[i+1] < 50) {
				ctx.fillStyle = 'rgba(255, 255, 255,'  + (0.02 + messages[i+1]/50) + ')';
			} else {
				ctx.fillStyle = 'rgb(255, 255, 255)';
			}
			ctx.fillText(messages[i],canvascenterx-200,50);
			messages[i+1] -= 1;
		}
	}
	
	
	
	
	
	fps.splice(0, 1);
  	fps.push(1/delta);
	
	var averagefps = 0;
	var i = 0;
	while(i < 30) {
		averagefps += fps[i];
		i++;
	}
	
	
	ctx.font = "30px Arial";
	ctx.fillStyle = "white";
	ctx.fillText(Math.round(averagefps/30),10,50);
	if (!spectate) {
		ctx.fillText(Math.round(users[myId].score),10,canvascentery*2-50);
	}
	
	function renderUpgradeBar (x,y,text,number,upgrades,maxUpgrades) {
		ctx.fillStyle = "rgba(150, 150, 150, .5)";
		roundRect(ctx, x, y, 160, 18, 10, true,false);
		if (upgradeHoveredOver == number) {
			ctx.fillStyle = "rgb(220, 55, 55)";
		} else {
			ctx.fillStyle = "rgb(200, 50, 50)";
		}
		roundRectRightCornersOnly(ctx, x+130, y+2, 28, 14, 8, true,false);
		if (maxUpgrades == 10) {
			if (upgrades > 0) {
				ctx.fillStyle = "rgb(220, 55, 55)";
				roundRectLeftCornersOnly(ctx, x+2, y+2, 14, 14, 8, true,false);
				var i;
				for (i=1; i<upgrades; i++) { // starts at 1 because we render one already above with curved corners
					ctx.fillRect(x+2+i*16, y+2, 14, 14);
				}
			}
		}
		if (maxUpgrades == 1) {
			if (upgrades == 'true') {
				ctx.fillStyle = "rgb(220, 55, 55)";
				roundRectLeftCornersOnly(ctx, x+2, y+2, 126, 14, 8, true,false);
			}
		}
		
		ctx.fillStyle = "black";
		ctx.fillRect(x+136, y+6.5, 14, 5);
		ctx.fillRect(x+140.5, y+3, 5, 12);
		ctx.font = "12px Arial";
		ctx.fillStyle = "white";
		ctx.fillText(text, x+10, y+13);
		ctx.fillText('(' + number + ')',x+110,y+13);
	}
	if (mouseState == 0) {
		mouseBeenUnclicked = true;
	}
	
	
	if (mouseposx > 140 && mouseposx < 168) {
		if (mouseposy > 400 && mouseposy < 582 ) {
			var upgradeHoveredOver = Math.ceil((mouseposy-400)/21)
			
			if (mouseState == 1 && mouseBeenUnclicked) {
				mouseBeenUnclicked = false;
				if (upgradeHoveredOver == 1) {
					socket.emit('upgrade',  'regen');
				}
				if (upgradeHoveredOver == 2) {
					socket.emit('upgrade',  'maxHealth');
				}
				if (upgradeHoveredOver == 3) {
					socket.emit('upgrade',  'bodyDam');
				}
				if (upgradeHoveredOver == 4) {
					socket.emit('upgrade',  'laserSpeed');
				}
				if (upgradeHoveredOver == 5) {
					socket.emit('upgrade',  'laserPen');
				}
				if (upgradeHoveredOver == 6) {
					socket.emit('upgrade',  'laserDam');
				}
				if (upgradeHoveredOver == 7) {
					socket.emit('upgrade',  'reload');
				}
				if (upgradeHoveredOver == 8) {
					socket.emit('upgrade',  'moveSpeed');
				}
				if (upgradeHoveredOver == 9) {
					socket.emit('upgrade',  'minion-collector');
				}
			}
		}
	}
	renderUpgradeBar(10, 400, 'Health Regen', 1, users[myId].upgrades.regen,10);
	renderUpgradeBar(10, 421, 'Max Health', 2, users[myId].upgrades.maxHealth,10);
	renderUpgradeBar(10, 442, 'Body Damage', 3, users[myId].upgrades.bodyDam,10);
	renderUpgradeBar(10, 463, 'Laser Speed', 4, users[myId].upgrades.laserSpeed,10);
	renderUpgradeBar(10, 484, 'Laser Penetration', 5, users[myId].upgrades.laserPen,10);
	renderUpgradeBar(10, 505, 'Laser Damage', 6, users[myId].upgrades.laserDam,10);
	renderUpgradeBar(10, 526, 'Reload', 7, users[myId].upgrades.reload,10);
	renderUpgradeBar(10, 547, 'Movement Speed', 8, users[myId].upgrades.moveSpeed,10);
	renderUpgradeBar(10, 568, 'Collector Ship', 9, users[myId].upgrades.hasMinion,1);
	
	
	
	
	//setTimeout(updateGameArea, 1000/60);
	


}
