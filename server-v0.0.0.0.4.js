"use strict";
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/client-render.js', function(req, res){
  res.sendFile(__dirname + '/client-render.js');
});

app.get('/images/ship1-red.png', function(req, res){
  res.sendFile(__dirname + '/images/ship1-red.png');
});

app.get('/images/ship1-blue.png', function(req, res){
  res.sendFile(__dirname + '/images/ship1-blue.png');
});

app.get('/images/shipv2-red.svg', function(req, res){
  res.sendFile(__dirname + '/images/shipv2-red.svg');
});

app.get('/images/shipv2-blue.svg', function(req, res){
  res.sendFile(__dirname + '/images/shipv2-blue.svg');
});

app.get('/socket.io-1.2.0.js', function(req, res){
  res.sendFile(__dirname + '/socket.io-1.2.0.js');
});

app.get('/v0.0.0.0.1', function(req, res){
  res.sendFile(__dirname + '/v0.0.0.0.1.html');
});



var serverPort = process.env.PORT || 80;

http.listen(serverPort, function(){
  console.log('listening on *:80');
});

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    if (arr[i] !== undefined) rv[i] = arr[i];
  return rv;
}



"use strict";
var mouseState = 0;
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
var lastCalledTime;
var fps = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var delta;
var mapHeight = 10000;
var mapWidth = 10000;
var botIds = [];
var numberOfBots = 10;
var maxCollects = 220;
var viewDistance = 5000;


function initPlayer (playerid) {
	playerIds.push(playerid);
	users[playerid] =  {
		color: Math.ceil(Math.random() * 8),
		cells: [],
		clientData : {Vert : 0, Hoz : 0, mouseX : 0, mouseY : 0, mouseState : 0},
		score : 0,
		upgrades: {regen:0,maxHealth:0,bodyDam:0,laserSpeed:0,laserPen:0,laserDam:0,reload:0,moveSpeed:0, hasMinion : false,},
	};
	spawnCell(playerid,Math.random() * mapWidth,Math.random() * mapHeight,0,40,1,0,0,100);
		
}

function spawnCell (playerid,shx,shy,shv, shsize, shtype, shxv, shyv, shhealth) {		
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

function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
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

function createBot() {
	botIds.push('Bot ' + Math.random());
	initPlayer(botIds[botIds.length-1]);
}

var i;
for (i=0;i<numberOfBots;i++) {
	createBot();
}


function updateGameArea() {
	
	
	frame += 1;

	function getDirection(deltaX,deltaY)  {
		return (Math.atan2(deltaY, deltaX)*(180/Math.PI))+90;
	
	}
	
	
	function getDistance(deltaX,deltaY)  {
		return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	
	}
	
	function getSquareOfDistance(deltaX,deltaY)  {
		return Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
	
	}

	
	
	
	
	
	
	function toRadians (angle) {
		return angle * (Math.PI / 180);
	}

	function cellPhysics () {
		var i;
		for (i = 0; i < playerIds.length; i++) {
			var move = false;
			var shoot = false;
			var playerScore = users[playerIds[i]].score;
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
			if (botIds.indexOf(playerIds[i]) != -1) {
				var nearestColDist = 999999999999999999;
				var nearestColIndex = -1;
				var mainCellx = users[playerIds[i]].cells[0].x;
				var mainCelly = users[playerIds[i]].cells[0].y;
				for (i2 = 0; i2 < collects.length; i2 += 6) {
					if (getSquareOfDistance(mainCellx - collects[i2] , mainCelly - collects[i2 + 1]) < nearestColDist) {
						nearestColDist = getSquareOfDistance(mainCellx - collects[i2] , mainCelly - collects[i2 + 1]);
						nearestColIndex = i2;
					}
				}
				users[playerIds[i]].clientData.mouseX = collects[nearestColIndex];
				users[playerIds[i]].clientData.mouseY = collects[nearestColIndex+1];
				/*users[playerIds[i]].clientData.Vert = 1;
				var targetdir = getDirection(mainCellx - collects[nearestColIndex], mainCelly - collects[nearestColIndex+1]) % 360;
				if (users[playerIds[i]].cells[0].dir == targetdir) {
				} else {
					if ((targetdir - users[playerIds[i]].cells[0].dir) > 180) {
						targetdir += -360;
					} else {
						if ((targetdir - users[playerIds[i]].cells[0].dir) < -180) {
							targetdir += 360;
						}
					}
					if (targetdir > users[playerIds[i]].cells[0].dir + 5) {
						users[playerIds[i]].clientData.Hoz = -1;
					} else {
						if (targetdir < users[playerIds[i]].cells[0].dir - 5) {
							users[playerIds[i]].clientData.Hoz = 1;
						}
					}
				}*/
				if (mainCellx < collects[nearestColIndex]) {
					users[playerIds[i]].clientData.Hoz = 1;
				} else {
					users[playerIds[i]].clientData.Hoz = -1;
				}
				if (mainCelly < collects[nearestColIndex+1]) {
					users[playerIds[i]].clientData.Vert = 1;
				} else {
					users[playerIds[i]].clientData.Vert = -1;
				}
				
			}
			
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
				
				if (celltype == "minion-collector") {
					cellmovement = {Vert : 0, Hoz : 0, mouseX : 0, mouseY : 0, mouseState : 0};
					var nearestColDist = 999999999999999999;
					var nearestColIndex = -1;
					var i3;
					for (i3 = 0; i3 < collects.length; i3 += 6) {
						if (getSquareOfDistance(cellx - collects[i3] , celly - collects[i3 + 1]) < nearestColDist) {
							nearestColDist = getSquareOfDistance(cellx - collects[i3] , celly - collects[i3 + 1]);
							nearestColIndex = i3;
						}
					}
					/*cellmovement.Vert = 1;
					if (getDistance(users[playerIds[i]].cells[0].x - cellx, users[playerIds[i]].cells[0].y - celly) > 2000) {
						var targetdir = getDirection(cellx - users[playerIds[i]].cells[0].x, celly - users[playerIds[i]].cells[0].y) % 360;
					} else {
						var targetdir = getDirection(cellx - collects[nearestColIndex], celly - collects[nearestColIndex+1]) % 360;
					}
					if (celldir == targetdir) {
					} else {
						if ((targetdir - celldir) > 180) {
							targetdir += -360;
						} else {
							if ((targetdir - celldir) < -180) {
								targetdir += 360;
							}
						}
						if (targetdir > celldir + 5) {
							cellmovement.Hoz = -1;
						} else {
							if (targetdir < celldir - 5) {
								cellmovement.Hoz = 1;
							}
						}
					}*/
					if (getDistance(users[playerIds[i]].cells[0].x - cellx, users[playerIds[i]].cells[0].y - celly) > 2000) {
						if (cellx < users[playerIds[i]].cells[0].x) {
							cellmovement.Hoz = 1;
						} else {
							cellmovement.Hoz = -1;
						}
						if (celly < users[playerIds[i]].cells[0].y) {
							cellmovement.Vert = 1;
						} else {
							cellmovement.Vert = -1;
						}
					} else {
						if (cellx < collects[nearestColIndex]) {
							cellmovement.Hoz = 1;
						} else {
							cellmovement.Hoz = -1;
						}
						if (celly < collects[nearestColIndex+1]) {
							cellmovement.Vert = 1;
						} else {
							cellmovement.Vert = -1;
						}
					}
				}
				
				
				
				
				
				if (controls == 3) {
					var moveX = 0;
					var moveY = 0;
					if (cellmovement.Vert == 1) { //w
						cellyv += 1 + 5 / Math.sqrt(cellsize) + cellupgrades.moveSpeed/3;
						moveY -= 1;
						//cellv += 0.2+(cellupgrades.moveSpeed/30)
					}
					if (cellmovement.Vert == -1) { //s
						cellyv -= 1 + 5 / Math.sqrt(cellsize) + cellupgrades.moveSpeed/3;
						moveY += 1;
					}
					if (cellmovement.Hoz == 1) { //a
						//celldir -= 5;
						cellxv += 1 + 5 / Math.sqrt(cellsize) + cellupgrades.moveSpeed/3;
						moveX -= 1;
					}
					if (cellmovement.Hoz == -1) { //d
						//celldir += 5;
						cellxv -= 1 + 5 / Math.sqrt(cellsize) + cellupgrades.moveSpeed/3;
						moveX += 1;
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
				if (moveX != 0 || moveY != 0) {
					var targetdir = getDirection(moveX, moveY) % 360;
					/* spin towards direction script */
					if (celldir == targetdir) {
					} else {
						if ((targetdir - celldir) > 180) {
							targetdir += -360;
						} else {
							if ((targetdir - celldir) < -180) {
								targetdir += 360;
							}
						}
						if (targetdir > celldir + 20) {
							celldir += 20;
						} else {
							if (targetdir < celldir - 20) {
								celldir += -20;
							} else {
								celldir = (0.7 * celldir) + (0.3 * targetdir);
							}
						}
					}
					/* end of spin towards script */
				}
				
				
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
		
		
				var i3;
				var collength = collects.length;
				for (i3 =0; i3 < collength; i3+=6) {
			
					if (getDistance(cellx - collects[i3] , celly - collects[i3 + 1]) < (cellsize/2 + collects[i3 + 2])*2)  {
				
						if (celltype != "minion-collector") {
							
						} else {
							cellsize = Math.sqrt((Math.pow(cellsize, 2)) + Math.pow(collects[i3 + 2] , 2)/10);
						}
						playerScore += collects[i3+2];
						if (i2 != 0) {
							users[playerIds[i]].cells[0].size = Math.sqrt((Math.pow(users[playerIds[i]].cells[0].size, 2)) + Math.pow(collects[i3 + 2] , 2));
						}
						collects.splice(i3, 6);
						if (collects.length/6 <= maxCollects) {
							addRandomCollect();
						}
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
							createlaser(cellx, celly, cellgundir * (Math.PI/-180),  40 ,playerIds[i],50,100,cellsize/3); 
							
							cellxv += Math.sin(toRadians(cellgundir)) * 50 * 0.1;  // the '50's are placeholders for the damage
							cellyv += Math.cos(toRadians(cellgundir)) * 50 * -0.1;
							cellframesSinceFired = 0;
						}
					}
				}
				
				
				
				users[playerIds[i]].cells[i2].x = cellx;
				users[playerIds[i]].cells[i2].y = celly;
				users[playerIds[i]].cells[i2].v = cellv;
				users[playerIds[i]].cells[i2].size = cellsize;
				users[playerIds[i]].cells[i2].dir = celldir;
				users[playerIds[i]].cells[i2].gunDir = cellgundir;
				users[playerIds[i]].cells[i2].type = celltype;
				users[playerIds[i]].cells[i2].xv = cellxv;
				users[playerIds[i]].cells[i2].yv = cellyv;
				users[playerIds[i]].cells[i2].frameSinceFired = cellframesSinceFired;
						
			}
			users[playerIds[i]].score = playerScore
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
		for (i = 0; i < playerIds.length; i++) {
			playerAlive = true;
			for (i2 = 0; playerAlive && i2 < users[playerIds[i]].cells.length; i2++) {
				var cellAlive = true;
				var cellx = users[playerIds[i]].cells[i2].x;
				var celly = users[playerIds[i]].cells[i2].y;
				var cellsize = users[playerIds[i]].cells[i2].size;
				for (i3 = 0; cellAlive && i3 < lasers.length; i3+=12) {
					if (lasers[i3+8] != playerIds[i]) {
						if (getDistance(cellx - lasers[i3], celly - lasers[i3+1]) < cellsize + lasers[i3+11]) {
							users[playerIds[i]].cells[i2].health -= lasers[i3+9];
							if (users[playerIds[i]].cells[i2].health < 0) {
								createcollects(cellx,celly,cellsize/6,cellsize/10)
								if (i2 == 0) {
									if (botIds.indexOf(playerIds[i]) == -1) {
										io.sockets.connected[playerIds[i]].emit('death', lasers[i3+8]);
									}
									if (botIds.indexOf(lasers[i3+8]) == -1) {
										io.sockets.connected[lasers[i3+8]].emit('you killed', playerIds[i]);
									}
								} else {
									users[playerIds[i]].upgrades.hasMinion = false;
								}
								//if (users[playerIds[i]].cells.length == 1) {
									io.emit('user left',  playerIds[i]);
									delete users[playerIds[i]];
									playerIds.splice(playerIds.indexOf(playerIds[i]),1);
									playerAlive = false;
									i -= 1;
								/*} else {
									users[playerIds[i]].cells.splice(i2,1);
								}*/
								cellAlive = false;
								
							}
						}
					}
				}
			}
		}
	}

	function emitData () {
		var i;
		for (i = 0; i < playerIds.length; i++) {
			if (botIds.indexOf(playerIds[i]) == -1) {
				var dataToEmit = {};
				dataToEmit.users = {};
				dataToEmit.playerIds = [];
				dataToEmit.collects = [];
				dataToEmit.users[playerIds[i]] = users[playerIds[i]];
				var i2;
				for (i2 = 0; i2 < playerIds.length; i2++) {
					if (Math.abs(users[playerIds[i]].cells[0].x - users[playerIds[i2]].cells[0].x) < viewDistance) {
						if (Math.abs(users[playerIds[i]].cells[0].y) - Math.abs(users[playerIds[i2]].cells[0].y) < viewDistance) {
							dataToEmit.users[playerIds[i2]] = users[playerIds[i2]];
							dataToEmit.playerIds.push(playerIds[i2]);
						}
					}
				}
				var i2;
				for (i2 = 0; i2 < collects.length; i2+=6) {
					if (Math.abs(users[playerIds[i]].cells[0].x - collects[i2]) < viewDistance) {
						if (Math.abs(users[playerIds[i]].cells[0].y - collects[i2+1]) < viewDistance) {
							dataToEmit.collects.push(collects[i2],collects[i2+1],collects[i2+2],collects[i2+3],collects[i2+4],collects[i2+5])
						}
					}
				}
				io.sockets.connected[playerIds[i]].emit('update',  {collects : dataToEmit.collects, users : dataToEmit.users, lasers : lasers, frame : frame, playerIds : dataToEmit.playerIds});
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

	function collectPhysics () {
		var i;
		for (i=0;i<collects.length;i+=6) {
			collects[i] += collects[i+4];
			collects[i+1] += collects[i+5]
			collects[i+4] *= 0.9;
			collects[i+5] *= 0.9;
		}
	}
	
	
	function createlaser (x,y,ldir,v,id,damage, range, size) {
		var xv = Math.sin(ldir) * v;
		var yv = Math.cos(ldir) * v;
		var xd = Math.sin(ldir) * (size * 4 + 6);
		var yd = Math.cos(ldir) * (size * 4 + 6) ;
		lasers.push(x,y,xv, yv, x + xd, y + yd, xv, yv, id, damage, range,size);
	}

	
	function addcollect (colx, coly , colsize) {
			collects.push(colx, coly, colsize , Math.ceil(Math.random() * 6), 0,0);
	}
	
	/*if (collects.length < 99) {
		addcollect(Math.random() * 1000 , Math.random() * 1000,5, "red");
	}*/
	
	
	
	function createcollects (colx,coly,number,area) {
		var coli = 0;
		while (coli < number) {
			collects.push(colx, coly, 10 + number/4 + (2 + Math.random() * 1)*Math.sqrt(number) , Math.ceil(Math.random() * 6), Math.sin(toRadians(coli/number*360)) * (1+Math.random()*4) * area ,Math.cos(toRadians(coli/number*360)) * (1+Math.random()*4) * area);
			coli += 1;
		}
	}
	function addRandomCollect () {
		addcollect(Math.pow(Math.random() * 100 ,2) * (Math.floor(Math.random()*2)*2-1) + mapWidth/2, Math.pow(Math.random() * 100 ,2) * (Math.floor(Math.random()*2)*2-1) + mapHeight/2, 20 + Math.random() * 10);	
	}
	
	/*if (collects.length < 900) {
		addcollect(Math.pow(Math.random() * 100 ,2) * (Math.floor(Math.random()*2)*2-1) + mapWidth/2, Math.pow(Math.random() * 100 ,2) * (Math.floor(Math.random()*2)*2-1) + mapHeight/2, 20 + Math.random() * 10);		
		//addcollect(Math.random() * mapWidth , Math.random() * mapHeight, 5 + Math.random() * 5);
	}*/
	

	if (frame == 1) {
		var i;
		for(i=0; i<maxCollects; i++) {
			addRandomCollect();
		}
	}
	//addRandomCollect();
	
	//addcollect(100,100,5, "red");
	

	//createlaser(ships[0],ships[1],ships[4],10,1,1);
	
	//shipphysics ();
	cellPhysics();
	laserphysics ();
	collectPhysics();
	cellPhysics();
	laserphysics ();
	collectPhysics();
	

	//if (frame % 1 == 0) {
		/*io.emit('update collects',  collects);
		io.emit('update users',  users);
		io.emit('update lasers',  lasers);*/
		//io.emit('update',  {collects : collects, users : users, lasers : lasers, frame : frame});
	emitData();
	//}
	
	
	delta = (Date.now() - lastCalledTime)/1000;
  	lastCalledTime = Date.now();
	
	fps.splice(29, 1);
  	fps.splice(0,0, 1/delta);
	
	var averagefps = 0;
	var i = 0;
	while(i < 30) {
		averagefps += fps[i];
		i++;
	}
	//console.log(averagefps/30)
	
}


io.on('connection', function(socket){
	socket.emit('inital handshake');
	socket.on('new player request', function (data) {
		io.emit('new user',  socket.id);
		socket.emit('init', {id :socket.id, otherPlayerIds : playerIds, frame : frame});
		initPlayer(socket.id);
		console.log('user ' + socket.id + ' joined');
		console.log('Total players : ' + playerIds.length);
	});
	
	socket.on('client data', function (data) {
		function fakeLatency () {
			if (data.Vert == -1 || data.Vert == 0 || data.Vert == 1 || data.Hoz == -1 || data.Hoz == 0 || data.Hoz == 1) {
				if (isNumber(data.mouseX) && isNumber(data.mouseY)) {
					if (playerIds.indexOf(socket.id) != -1) {
						users[socket.id].clientData = data;
					}
				}
			}
		}
		setTimeout(fakeLatency, 0);
	});
	socket.on('upgrade', function (data) {
		if (data == 'regen' || data == 'maxHealth' || data == 'bodyDam' || data == 'laserSpeed' || data == 'laserPen' || data == 'laserDam' || data == 'reload' || data == 'moveSpeed') {
			if (users[socket.id].upgrades[data] < 11) {
				users[socket.id].upgrades[data] += 1;
			}
		} else {
			if (data == 'minion-collector') {
				if (users[socket.id].upgrades.hasMinion == false) {
					users[socket.id].upgrades.hasMinion = true;
					spawnCell(socket.id, users[socket.id].cells[0].x +  100-Math.random()*200, users[socket.id].cells[0].y +  100-Math.random()*200, 0,30,'minion-collector',0,0,100);
				}
			}
		}
	});
	socket.on('ping', function (data) {
		socket.emit('ping');
	});
	socket.on('disconnect', function() {
		io.emit('user left',  socket.id);
		playerIds.splice(playerIds.indexOf(socket.id),1);
		delete users[socket.id];
		console.log('user ' + socket.id + ' left')
		console.log('Total players : ' + playerIds.length);
	});
});

/*******************************************************/
/*                 for reference only                  */
/*******************************************************/
//io.emit('update collect array',  game.collects);

/*
socket.on('update collect array', function (data) {
	collects = data;
});
*/
/********************************************************/



setInterval(updateGameArea, 1000/30);

