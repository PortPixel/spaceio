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

app.get('/socket.io-1.2.0.js', function(req, res){
  res.sendFile(__dirname + '/socket.io-1.2.0.js');
});

app.get('/v0.0.0.0.1', function(req, res){
  res.sendFile(__dirname + '/v0.0.0.0.1.html');
});





http.listen(3000, function(){
  console.log('listening on *:3000');
});

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    if (arr[i] !== undefined) rv[i] = arr[i];
  return rv;
}

var game = {};
game.collects = [];
var mapHeight = 10000;
var mapWidth = 10000;


function addCollect (colx, coly , colsize) {
			game.collects.push(colx, coly, colsize , Math.ceil(Math.random() * 6));
}

function gamePhysicsLoop() {
	if (game.collects.length < 1000) {
		addCollect(Math.pow(Math.random() * 20 ,3) * (Math.floor(Math.random()*2)*2-1) + mapWidth/2, Math.pow(Math.random() * 20 ,3) * (Math.floor(Math.random()*2)*2-1) + mapHeight/2, 5 + Math.random() * 5);
	}
	io.emit('update collect array',  game.collects);
	
}

//setInterval(updateGameArea, 1000/60);


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


function initPlayer (playerid) {
	playerIds.push(playerid);
	users[playerid] =  {
		color: Math.ceil(Math.random() * 8),
		cells: [],
		clientData : {Vert : 0, Hoz : 0, mouseX : 0, mouseY : 0, mouseState : 0},
	};
	spawnCell(playerid,Math.random() * mapWidth,Math.random() * mapHeight,20,40,1,0,0,100);
		
}

function spawnCell (playerid,shx,shy,shv, shsize, shtype, shxv, shyv, shhealth) {		
	var cellSpawnObject = {
		x: shx,
		y: shy,
		v: shv,
		size: shsize,
		dir: 0,
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
				var celltype = users[playerIds[i]].cells[i2].type;
				var cellxv = users[playerIds[i]].cells[i2].xv;
				var cellyv = users[playerIds[i]].cells[i2].yv;
				var cellx = users[playerIds[i]].cells[i2].x;
				var cellframesSinceFired = users[playerIds[i]].cells[i2].frameSinceFired + 1; //increase by 1 each frame
				var cellmovement = users[playerIds[i]].clientData;  //0 - still | 1 - up/w | 2 - down/w | 3 - left/a | 4 - right/d
				if (controls == 3) {
					if (cellmovement.Vert == 1) { //w
						cellyv += 1 + 5 / Math.sqrt(cellsize);
					}
					if (cellmovement.Vert == -1) { //s
						cellyv -= 1 + 5 / Math.sqrt(cellsize);
					}
					if (cellmovement.Hoz == 1) { //a
						cellxv += 1 + 5 / Math.sqrt(cellsize);
					}
					if (cellmovement.Hoz == -1) { //d
						cellxv -= 1 + 5 / Math.sqrt(cellsize);
					}
				}

				
				var targetdir = getDirection(users[playerIds[i]].cells[i2].x - targetX, users[playerIds[i]].cells[i2].y - targetY) % 360;
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
				
				
				if (move) {
					cellv += 1 + 5 / Math.sqrt(cellsize);
				}
				cellx += cellv * (Math.sin(toRadians(celldir))) * -1 + cellxv;
				celly += cellv * (Math.cos(toRadians(celldir))) + cellyv;
				cellv = cellv * 0.9;
				cellxv = cellxv * 0.95;
				cellyv = cellyv * 0.95;
		
		
				var i3;
				var collength = collects.length;
				for (i3 =0; i3 < (collength - 1); i3+=4) {
			
					if (getDistance(cellx - collects[i3] , celly - collects[i3 + 1]) < (cellsize/2 + collects[i3 + 2])*2)  {
				
				
						cellsize = Math.sqrt((Math.pow(cellsize, 2)) + Math.pow(collects[i3 + 2] , 2));
						if (i2 != 0) {
							users[playerIds[i]].cells[0].size = Math.sqrt((Math.pow(users[playerIds[i]].cells[0].size, 2)) + Math.pow(collects[i3 + 2] , 2));
						}
						collects.splice(i3, 4);
				
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
			for (i2 = 0; i2 < users[playerIds[i]].cells.length; i2++) {
				var cellAlive = true;
				var cellx = users[playerIds[i]].cells[i2].x;
				var celly = users[playerIds[i]].cells[i2].y;
				var cellsize = users[playerIds[i]].cells[i2].size;
				for (i3 = 0; cellAlive && i3 < lasers.length; i3+=12) {
					if (lasers[i3+8] != playerIds[i]) {
						if (getDistance(cellx - lasers[i3], celly - lasers[i3+1]) < cellsize + lasers[i3+11]) {
							users[playerIds[i]].cells[i2].health -= lasers[i3+9];
							if (users[playerIds[i]].cells[i2].health < 0) {
								io.sockets.connected[playerIds[i]].emit('death', lasers[i3+8]); // tell the client that they have been killed,                                                                      and the id of the player that killed them
								io.sockets.connected[lasers[i3+8]].emit('you killed', playerIds[i]);
								
								users[playerIds[i]].cells.splice(i2,1);
								cellAlive = false;
							}
						}
					}
				}
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

	
	
	/*function spawnship (shx,shy,shv, shsize, shdir, shtype, shhealth, shdamage, shdefence, shid) {
		ships.push(shx,shy,shv, shsize, shdir, shtype, shhealth, shdamage, shdefence, 0 ,0, shid, 0, 0, Math.ceil(Math.random() * 8)); // x, y, v, size, dir, type, health, damage, defence, xv, yv, id, frames since shot, frames mouse down, ship colour
	}*/
	
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

	
	
	
	function createlaser (x,y,ldir,v,id,damage, range, size) {
		var xv = Math.sin(ldir) * v;
		var yv = Math.cos(ldir) * v;
		var xd = Math.sin(ldir) * (size * 4 + 6);
		var yd = Math.cos(ldir) * (size * 4 + 6) ;
		lasers.push(x,y,xv, yv, x + xd, y + yd, xv, yv, id, damage, range,size);
	}

	
	function addcollect (colx, coly , colsize) {
			collects.push(colx, coly, colsize , Math.ceil(Math.random() * 6));
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
	
	if (collects.length < 1200) {
		addcollect(Math.pow(Math.random() * 20 ,3) * (Math.floor(Math.random()*2)*2-1) + mapWidth/2, Math.pow(Math.random() * 20 ,3) * (Math.floor(Math.random()*2)*2-1) + mapHeight/2, 20 + Math.random() * 10);
		
		//addcollect(Math.random() * mapWidth , Math.random() * mapHeight, 5 + Math.random() * 5);
	}
	

	/*if (frame == 1) {
		//spawnship(1,1,1,20,45,2,100,1,1,1,0);
		/*spawnship(1,100,1,20,45,100,1,1,1,1);
		spawnship(100,1,1,20,45,100,1,1,1,1);*/
		
		/*initPlayer(myId); // init player with my ID
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
	/*}*/

	
	//addcollect(100,100,5, "red");
	

	//createlaser(ships[0],ships[1],ships[4],10,1,1);
	
	//shipphysics ();
	cellPhysics();

    
   
    
	laserphysics ();

	
	io.emit('update collects',  collects);
	io.emit('update users',  users);
	io.emit('update lasers',  lasers);
	
	
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
	
}


io.on('connection', function(socket){
	console.log('user ' + socket.id + ' joined')
	
	io.emit('new user',  socket.id);
	socket.emit('init', {id :socket.id, otherPlayerIds : playerIds});
	initPlayer(socket.id);
	
	socket.on('client data', function (data) {
		
		if (data.Vert == -1 || data.Vert == 0 || data.Vert == 1 || data.Hoz == -1 || data.Hoz == 0 || data.Hoz == 1) {
			if (isNumber(data.mouseX) && isNumber(data.mouseY))
			users[socket.id].clientData = data;
		}
	});
	socket.on('disconnect', function() {
		io.emit('user left',  socket.id);
		playerIds.splice(playerIds.indexOf(socket.id),1);
		delete users[socket.id];
		console.log('user ' + socket.id + ' left')
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



setInterval(updateGameArea, 1000/60);


