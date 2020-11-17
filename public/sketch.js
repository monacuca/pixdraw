//------------------------------------------------
// Demo in which two mobile phones share p5.js "touches"
// events (multi-touch finger positions).
// See https://p5js.org/reference/#/p5/touches
// This is sketch.js, a.k.a the client side.
let saved = false;
let alerta = true;
let scaleFactor = 1.4;
let cnv;
var random_words = ["A HOTDOG", "BATMAN", "AN ARCADE", "PLAYER 2", "PLAYER 1", "A PENCIL", "AN ERASER", "BLACK", "WHITE", "A FLOORPLAN",
                    "HAPPY", "SAD", "CANDY", "A CANE", "CANDYCANE", "CHOCOLATE", "CAKE","CHOCOLATE CAKE", "VANILLA", " A ROOM",
                    "ICE CREAM", "SCREAMING", "CRYING", "A CAT", "A DOG", "FINALS WEEK", "FIGHT", "SLEEP", "NOTHING", "A CHAMBER",
                    "WHATEVER", "A TYPEFACE", "A CHRISTIAN", "A CALCULATOR", "A", "Z", "ZEBRA", "GOKU", "CHAMOMILLE", "TEA", "PAINT",
                    "GINGER", "A BALLOON", "GAMEBOY", "RETRO", "THE FUTURE", "THE PAST", "GOLAN", "ROBIN", "AMERICA", "THE VIRGIN", "AN O.S.",
                    "YELLOW", "RED", "VOMIT", " A VIRUS", "BACTERIA", "GARBAGE", "A DINOSAUR", "A HORSE", "FUNNY THINGS", "A SOCIALIST", "A BOMB",
                    "A GIRL", "A BOY", "CHAD", "A CHROMOSOME", "NIGHT", "DARKNESS", "WHITE", "BALANCE", "GRAVITY", "A PUMPKIN", "SLEEP",
                    "HARMONY", "REGULAR PROPORTION", "DAY", "SUNLIGHT", "COMFORT", "A SHITTY MOVIE", "HOMEWORK", "A VIRGIN", "A TRUCK", "MONEY",
                    "A MAN", "A WOMAN","FOOD", "AN EGG", "CHICKEN", "COLLAPSE","THE APOCALYPSE", "SWEET DREAMS", "BENFORD", "A HAPPY MAC",
                    "A VARICOSE VEIN", "_ _ _ _", "A SQUARE W/3 LINES", "A BOOK", "HARRY POTTER", "CALCULUS",  "A BAD LOGO", "A GOOD LOGO", "SUSAN KARE",
                    "NOTHING", "EVERYTHING", "SOMEWHERE", "ANYWHERE", "AN ARRAY", "A BOX", "CANDY", "JOE", "BOB", "SUSAN", "AN APPLE", "APPLE", "EMAIL", "REJECTION",
                    "APPROVAL", "STOCKS","RANDOM", "INERTIA", "A GAME", "A DRAWING", "STAR WARS",  "MY EX", "GARBAGE", "DECAY", "UNHAPPINESS","STARS", "DORYPHOROS","DREAMS" ]

var socket = io(); // the networking library
var clientData = {}; // stores this particular client's data
var serverData = {}; // stores other users' data from the server
var myFont, myFontBold;
var PIXEL_CONST = 32;
clientData.name = shortID();
function shortID() {
  var id = "";
  for (var i = 0; i < 4; i++) {
    id += String.fromCharCode(~~(Math.random() * 26) + 0x61);
  }
  return id;
}

let roomID = window.location.href.split("?")[1];
if (!roomID) {
  window.location.href = window.location.href + "?lobby";
}
clientData.room = roomID;
socket.emit("client-start",{room:roomID})
var status = "unknown"; // or 'approve' or 'reject', depending on whether the server lets you in
var pixel_colors = [];

// RGB color backgrounds for the two players
var colors = [[0], [255]];
function preload() {
  //https://cdn.glitch.com/a9de28e7-c21f-4317-bebf-cbda31e05447%2FpixChicago.ttf?v=1603638456952
  myFont = loadFont('https://cdn.glitch.com/a9de28e7-c21f-4317-bebf-cbda31e05447%2FPerfect%20DOS%20VGA%20437.ttf?v=1603641158202');
  //myFont =  loadFont('https://cdn.glitch.com/a9de28e7-c21f-4317-bebf-cbda31e05447%2Fdogicabold.ttf?v=1603584523386');
  //myFont = loadFont('https://cdn.glitch.com/a9de28e7-c21f-4317-bebf-cbda31e05447%2Fdogica.ttf?v=1603584518163')
}
//------------------------------------------------
// The main p5.js setup
function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  console.log("test here");
  for (let i = 0; i < 50; i++) {
    pixel_colors[i] = [];
    for (let j = 0; j < 50; j++) {
      pixel_colors[i][j] = floor(200);
    }
  }
  //noLoop();
}


//------------------------------------------------
// The main p5.js draw loop
//
function draw() {
  //+console.log(random_words.length)

  background(255);
  
  stroke(255);
  //line(mouseX, mouseY, 0,0);
textFont(myFont);

  // 1. Handle problematic network statuses. Shouldn't happen often.
  if (status == "reject") {
    showMyErrorScreen("Sorry, room is full!\nPlease use another room. \n\nTo create your own room simply \nwrite in the url: \npixel-fight.glitch.me/?(room number).\n\n <3 Have fun! <3");
    return;
  } else if (status == "unknown") {
    showMyErrorScreen("Waiting for server to usher you...");
    return;
  }

  // 2. Update touches data:
  // Collect all the touches info and update this client's data.
  // Then send this client's data the server
  clientData.room =roomID;
  clientData.matrix = pixel_colors;
  clientData.touches = touches;
  
  socket.emit("client-update", clientData);
  
  // 3. Fetch the other player's data. Since this demo only allows
  // two players, we just grab the first item in the table.
  // Use a loop to iterate serverData if you want more than
  // two players (check out sensors-chorus or sensors-rooms)
  let otherData = serverData[Object.keys(serverData)[0]];
  
  updateData(clientData, otherData);
  //It might be inefficient to do this every time drawing is called but I wanted to update player statuses in case one leaves. 
  /*
  if (!clientData.position){
  if (!otherData || !otherData.name || !otherData.position) {
    //temp object just to have a "fake" player here for testing, not an actual
    otherData = { name: "NO NAME", position: 2};
    
    //if there is no other player, then client is player one!
    clientData.position = 1;
    clientData.role = "black";
    clientData.dimension = min(width,height);
    clientData.level = floor(random(0, random_words.length));
    clientData.room = roomID;
    socket.emit("client-update", clientData);
    
    
    
  } else if ((otherData.position == 1)){
    //if other player is player 1, then client is  player 2! 
    clientData.position = 2;
    pixel_colors = otherData.matrix;
    clientData.role ="white";
    clientData.dimension = min(width,height);
    clientData.room = roomID;
    clientData.level = otherData.level;
    socket.emit("client-update", clientData);
  } else if ((otherData.position == 2)){
    //if other player is player 1, then client is  player 2! 
    clientData.position = 1;
    clientData.role ="black";
    pixel_colors = otherData.matrix;
    clientData.level = otherData.level;
    clientData.dimension = min(width,height);
    clientData.room = roomID;
    socket.emit("client-update", clientData);
  } 
  }
  if(!otherData||!otherData.position){
    
  }
  else{
    if(otherData.position == clientData.position){
      if(otherData.position ==1){
        clientData.position =2;
        clientData.role ="white";
      }else{
        clientData.position =1;
        clientData.role ="black";
      }
      socket.emit("client-update", clientData);
    }
  }
  if(!otherData||!otherData.level){
  
  }
  else{
    if((otherData.level > clientData.level)){
      clientData.level = otherData.level;
      pixel_colors = otherData.matrix;
    }
    
  }*/
  
  /* update pixel data to whaever the other player has, this will be edited and sent to player 2 next time draw is called*/
  
  //noStroke();
    // 4. write in player data 
  drawTouchesData(colors[0], otherData, clientData);
  drawTouchesData(colors[1], clientData, otherData);
  if (saved){
 
    background(0);
  }
  fill(255);
  //5. draw player data 
  for (var i = 0; i < PIXEL_CONST; i++) {
    for (var j = 0; j < PIXEL_CONST; j++) {
      fill(pixel_colors[i][j]);
      stroke(pixel_colors[i][j]);
      rect(
        (i * min(width, height)) / PIXEL_CONST,
        (j * min(width, height)) / PIXEL_CONST,
        min(width, height) / PIXEL_CONST,
      );
    }
  }
if (saved == false){
 interfaz(otherData);
}else{
  save();
  saved = false;
}
  
}
function updateData(clientData, otherData){
    if (!clientData.position){
  if (!otherData || !otherData.name || !otherData.position) {
    //temp object just to have a "fake" player here for testing, not an actual
    otherData = { name: "NO NAME", position: 2};
    
    //if there is no other player, then client is player one!
    clientData.position = 1;
    clientData.role = "black";
    clientData.dimension = min(width,height);
    clientData.level = floor(random(0, random_words.length));
    clientData.room = roomID;
    socket.emit("client-update", clientData);
    
    
    
  } else if ((otherData.position == 1)){
    //if other player is player 1, then client is  player 2! 
    clientData.position = 2;
    pixel_colors = otherData.matrix;
    clientData.role ="white";
    clientData.dimension = min(width,height);
    clientData.room = roomID;
    clientData.level = otherData.level;
    socket.emit("client-update", clientData);
  } else if ((otherData.position == 2)){
    //if other player is player 1, then client is  player 2! 
    clientData.position = 1;
    clientData.role ="black";
    pixel_colors = otherData.matrix;
    clientData.level = otherData.level;
    clientData.dimension = min(width,height);
    clientData.room = roomID;
    socket.emit("client-update", clientData);
  } 
  }
  if(!otherData||!otherData.position){
    
  }
  else{
    if(otherData.position == clientData.position){
      if(otherData.position ==1){
        clientData.position =2;
        clientData.role ="white";
      }else{
        clientData.position =1;
        clientData.role ="black";
      }
      socket.emit("client-update", clientData);
    }
  }
  if(!otherData||!otherData.level){
  
  }
  else{
    if((otherData.level > clientData.level)){
      clientData.level = otherData.level;
      pixel_colors = otherData.matrix;
    }
    
  }
}
function interfaz(otherData){
      noStroke();
  fill(255);
    rect(0, width, width, 80);
  fill(0);
    
    textStyle(ITALIC);
    textAlign(CENTER,CENTER);
    textSize(20*scaleFactor);
    text("DRAW '" + random_words[clientData.level]+ "'", width/2, width+40);
  if(clientData.level == random_words.length - 1){
      textSize(10*scaleFactor);
    text("last level! see you next time <3", width/2, width+60);
    }
  fill(0);
    
    //textStyle(ITALIC);
    textAlign(LEFT);
    textSize(14*scaleFactor);
    text("role:  " + clientData.role, 20, width+130);
  textSize(8*scaleFactor);
  let player2;
    if(!otherData){
       player2 = "NOT CONNECTED"
    }else{
       player2 = "CONNECTED"
    }
    text("you are player " +clientData.position, 20, width+150);
  text("ROOM:" +clientData.room, 20, width+165);
  textAlign(RIGHT)
  text(player2, width-20, height-20);
    
    /*text("How to play: \n\n"+"Draw your task!\n" +
       "Tap update if the data from the other side seems funky or if you want to get the other player's data more accurately!\n"+
       "TIP: Draw slowly!", 20, height -100, width/2);)*/
  
  text("help", width-20, height- 40);
  textAlign(LEFT)
  textSize(14*scaleFactor)
    text("update", 20, width+100);
    text("next", width- 80, width+100);
    text("save", width - 160, width+100);
}
//------------------------------------------------
// Visualize "touches" (fingertips)
//
function drawTouchesData(color, data, otherData) {
  if (!data || !data.touches) {
    return;
  }
  
  let approx_j, approx_i;
  for (var i = 0; i < data.touches.length; i++) {
    // Note: The '...' below is the JavaScript ES6 "spread" syntax.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    // Useful for handling a variable number of arguments.
    
    approx_i = floor(
      (constrain(data.touches[i].x, 0, data.dimension) /
        data.dimension) *
        PIXEL_CONST
    );
    approx_j = floor(
      (constrain(data.touches[i].y, 0, data.dimension) /
        data.dimension) *
        PIXEL_CONST
    );
    let c = 200;
    if (data.position == 1){
      c = 0; 
    }else{
      c = 255;
    }
    if(clientData==data){
   //UPDATE
      /*
      text("update", 20, width+100);
    text("next", width- 80, width+100);
    text("save", width - 160, width+100);*/
    if((data.touches[i].x >=0 &&data.touches[i].x <= 120)&&(data.touches[i].y >= width+90 &&data.touches[i].y <= width+110)){
    fill(200);
      noStroke();
    rect(0,width+90,120, 20);
      if((!otherData||!otherData.matrix)){
        
      }else{
        pixel_colors = otherData.matrix;
      }
      alerta = true;
    }else if((data.touches[i].x >= width - 90 &&data.touches[i].x <= width)&&(data.touches[i].y >= width+90 &&data.touches[i].y <= width+110)){
      //NEXT
      //text("next", width- 40, width+100);
      fill(200);
      if (data.level == random_words.length-1 ){}
      else{
      data.level = (data.level +1); }
      noStroke();
      rect(width-90,width+90,90, 20);
      for (let i = 0; i < PIXEL_CONST; i++) {

    for (let j = 0; j < PIXEL_CONST; j++) {
      pixel_colors[i][j] = floor(200);
    }
  }
      alerta = true;
    }else if((data.touches[i].x >= width-170 &&data.touches[i].x <= width-90)&&(data.touches[i].y >= width+90 &&data.touches[i].y <= width+110)){
      //SAVE
      //text("save", width - 80, width+100);
      fill(200);
      noStroke();
      //rect(width-170,width+90,80, 20);
      saved = true;
      alerta = true;
      //data.status = true;
    }else if((data.touches[i].x >= width-60 &&data.touches[i].x <= width-10)&&(data.touches[i].y >= height-60 &&data.touches[i].y <= height-20)){
      //HELP
      //text("help", width-135, height- 40);
     if (alerta == true){
      alert(
        "How to play: \n\n"+"Draw your task!\n" +
       "Tap update if the data from the other side seems funky or if you want to get the other player's data more accurately!\n"+
       "TIP: Draw slowly!"
        )
       alerta = false;
     }
    }
      
    }
    pixel_colors[approx_i][approx_j] = floor(c);
    //socket.emit("client-update", data);
    fill(c);
    noStroke();
    
  
    //circle(data.touches[i].x, data.touches[i].y, 20);
  }
  
}

//------------------------------------------------
// Show an error screen if there's a network problem.


function showMyErrorScreen(msg) {
  textSize(10*scaleFactor);
  background(0);
  fill(255);
  noStroke();
  textAlign(CENTER,CENTER);
  text(msg, 0, height / 2, width-20);
}

//------------------------------------------------
// These event handlers are used by p5.js. See, e.g.
// https://p5js.org/reference/#/p5/touchStarted, etc.
//
function touchStarted() {
  var fs = fullscreen();
  if (!fs) {
    /* 
      Uncomment the line below to put your app in fullscreen.
      Note, on some devices, being in fullscreen can make it 
      awkward to access useful things like the page-refresh button.
      Perhaps just use this for final documentation.
    */
    fullscreen(true);
  }
  return false;
}
function touchMoved() {
  return false;
}
function touchEnded() {
  return false;
}

// prevents the mobile browser from processing some default
// touch events, like swiping left for "back" or scrolling the page.
document.ontouchmove = function(event) {
  event.preventDefault();
};

function windowResized() {
  //this detects when the window is resized, such as entering fullscreen mode, or changing orientation of the device.
  resizeCanvas(windowWidth, windowHeight); //resizes the canvas to the new dimensions
}

//------------------------------------------------
// Event handlers for the Socket library.
// You probably won't need to change these.
//
socket.on("connection-approve", function(data) {
  // Update status when server tells us when
  // they approve our request to join a room
  status = "approve";
});
socket.on("connection-reject", function(data) {
  // Update status when server tells us when
  // they reject our request to join a room
  status = "reject";
});
socket.on("server-update", function(data) {
  // Update our copy of the other players' data
  // everytime the server sends us an update
  serverData = data;
});

// It could happen that you might need to restart the server.
// For example, if you encounter the “room is full” message while debugging.
// If you put the magic word “crash” in the url (like: http://myapp.glitch.me/?crash)
// then the client will send a message to server to tell it to crash and restart.
if (window.location.href.includes("crash")) {
  alert("crash!");
  socket.emit("crash-the-server");
}

//================================================
// Don't delete these 'comments'; they are necessary to make p5.js work with Glitch.com.
// First of all, shut glitch up about p5's global namespace pollution using this magic comment:
/* global describe p5 setup draw P2D WEBGL ARROW CROSS HAND MOVE TEXT WAIT HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS DEG_TO_RAD RAD_TO_DEG CORNER CORNERS RADIUS RIGHT LEFT CENTER TOP BOTTOM BASELINE POINTS LINES LINE_STRIP LINE_LOOP TRIANGLES TRIANGLE_FAN TRIANGLE_STRIP QUADS QUAD_STRIP TESS CLOSE OPEN CHORD PIE PROJECT SQUARE ROUND BEVEL MITER RGB HSB HSL AUTO ALT BACKSPACE CONTROL DELETE DOWN_ARROW ENTER ESCAPE LEFT_ARROW OPTION RETURN RIGHT_ARROW SHIFT TAB UP_ARROW BLEND REMOVE ADD DARKEST LIGHTEST DIFFERENCE SUBTRACT EXCLUSION MULTIPLY SCREEN REPLACE OVERLAY HARD_LIGHT SOFT_LIGHT DODGE BURN THRESHOLD GRAY OPAQUE INVERT POSTERIZE DILATE ERODE BLUR NORMAL ITALIC BOLD BOLDITALIC LINEAR QUADRATIC BEZIER CURVE STROKE FILL TEXTURE IMMEDIATE IMAGE NEAREST REPEAT CLAMP MIRROR LANDSCAPE PORTRAIT GRID AXES frameCount deltaTime focused cursor frameRate getFrameRate setFrameRate noCursor displayWidth displayHeight windowWidth windowHeight width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams pushStyle popStyle popMatrix pushMatrix registerPromisePreload camera perspective ortho frustum createCamera setCamera setAttributes createCanvas resizeCanvas noCanvas createGraphics blendMode noLoop loop push pop redraw applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase createStringDict createNumberDict storeItem getItem clearStorage removeItem select selectAll removeElements createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ pRotateDirectionX pRotateDirectionY pRotateDirectionZ turnAxis setMoveThreshold setShakeThreshold isKeyPressed keyIsPressed key keyCode keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveGif saveFrames loadImage image tint noTint imageMode pixels blend copy filter get loadPixels set updatePixels loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo createWriter save saveJSON saveJSONObject saveJSONArray saveStrings saveTable writeFile downloadFile abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont append arrayCopy concat reverse shorten shuffle sort splice subset float int str boolean byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim day hour minute millis month second year plane box sphere cylinder cone ellipsoid torus orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadModel model loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess remove canvas drawingContext*/
// Also socket.io:
/* global describe io*/
// Now any other lint errors will be your own problem.
