/// <reference path="bosstimer.d.ts" />

//Enable "Add App" button for Alt1 Browser.
A1lib.identifyApp("appconfig.json");

const appColor = A1lib.mixColor(255, 255, 255);

let isPaused = true;
let isAttackable = false;
let tooltipEnabled = true;
let autoStopEnabled = false;
let startDate = Date.now();
let attackStartDate = Date.now();
let currentTooltip = "";
let lastUpcomingMessage = "";

let attackOffset = 0;
let recalOffset = 0;
let midOffset = 14;

let attacks = {
	15: ["Red bomb", "Move"],
	27: ["Fairy ring", "Move"],
	39: ["Slimes", "Evade"],
	51: ["Yellow bomb", "Move"],
	63: ["Stun", "Use anticipation"],
	72: ["Sticky fungi", "Click feet"],
	87: ["Green bomb", "Move"],
	99: ["Fairy ring", "Move"],
	111: ["Slimes", "Evade"],
	123: ["Blue bomb", "Move"],
	135: ["Stun", "Use anticipation"],
	144: ["Mid energy fungi", "Go to mid"],
}
// Set Chat reader
let reader = new Chatbox.default();
reader.readargs = {
  colors: [
    A1lib.mixColor(255, 255, 255),
    A1lib.mixColor(128, 69, 182),
  ],
  backwards: true,
};

let bossTimerReader = new BossTimer.default();

let bossTimer = setInterval(function () {
  updateClock();
}, 300);

reader.find();
reader.read();

let findChat = setInterval(function () {
  if (reader.pos === null)
    reader.find();
  else {
    clearInterval(findChat);
    reader.pos.boxes.map((box, i) => {
      $(".chat").append(`<option value=${i}>Chat ${i}</option>`);
    });

    if (localStorage.susChat) {
      reader.pos.mainbox = reader.pos.boxes[localStorage.susChat];
    } else {
      //If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
      reader.pos.mainbox = reader.pos.boxes[0];
    }
    
    showSelectedChat(reader.pos);
    setInterval(function () {
      readChatbox();
      readBossTimer();
    }, 600);
  }
}, 1000);

function showSelectedChat(chat) {
  //Attempt to show a temporary rectangle around the chatbox.  skip if overlay is not enabled.
  try {
    alt1.overLayRect(
      appColor,
      chat.mainbox.rect.x,
      chat.mainbox.rect.y,
      chat.mainbox.rect.width,
      chat.mainbox.rect.height,
      2000,
      3
    );
  } catch { }
}

function readBossTimer() {
  if (bossTimerReader.find() != null && isPaused == true){
    startEncounter();
  }
  else if (bossTimerReader.find() == null && isPaused == false) {
    stopEncounter();
  }
}

//Reading and parsing info from the chatbox.
function readChatbox() {
  var opts = reader.read() || [];
  var chat = "";

  for (a in opts) {
    chat += opts[a].text + " ";
  }
  
  // Check for lines indicating the core can be attacked.
  if (isPaused == false && isAttackable == false && (chat.indexOf("is vulnerable. Attack its core!") > -1 || 
                                                    chat.indexOf("dark feast subsides. Strike now!") > -1 || 
                                                    chat.indexOf("is the time. To the core!") > -1)) {
    startAttack();
  }
  
  // Check for lines indicating the attack phase has ended
  if (isPaused == false && isAttackable == true && (chat.indexOf("feeds again - stand ready!") > -1 || 
                                                     chat.indexOf("out - it is awakening.") > -1 ||
                                                     chat.indexOf("is going to wake any moment.") > -1)) { // Might not be correct?
    endAttack();
  }
  
  // Check for lines indicating the mid enrgy fungi have spawned
  if (isPaused == false && isAttackable == false && (chat.indexOf("the fungus at Croesus's base!") > -1 ||
                                                     chat.indexOf("fungus at Croesus's base - destroy it, now!") > -1)) { 
    recalibrateTime();
  }
}

function recalibrateTime(){
  let currentDate = Date.now();
  let time = Date.now() - startDate;
  let adjTime = new Date(time < 0 ? 0 : time).getTime()/1000;
  
  adjTime = adjTime - attackOffset;
  
  let totalTime = 147 + midOffset;
  
  adjTime = (adjTime % totalTime);
  
  //let attackCycles = Math.round(adjTime / totalTime);
  
  //let calculatedStart = Date.now() - (((totalTime * attackCycles) - midOffset) * 1000)
  
  recalOffset = 144 - adjTime;
  
  console.log("Mid started, recalibration offset: " + recalOffset);
}

function startAttack() {
  isAttackable = true;
  
  lastUpcomingMessage = document.getElementById('upcomingBox').textContent;
    
  message("","upcomingBox");
  message("Croesus is vulnerable,\nattack the core!");
  
  attackStartDate = Date.now();
}

function endAttack() {
  isAttackable = false;
    
  message(lastUpcomingMessage,"upcomingBox");
  message("",true);
  
  attackOffset = attackOffset + (Date.now() - attackStartDate) / 1000;
  console.log("Attack ended, time offset: " + attackOffset);
}

function updateClock(){
  if(!isPaused){
    let upcomingAttack = false;
    let incomingAttack = 0;
    let attackTime = 0;
    let oldAdjTime = 0;
    let time = Date.now() - startDate;
    let adjTime = new Date(time < 0 ? 0 : time).getTime()/1000;
    message(adjTime.toFixed(0) + "s", "timerBox");
    
    adjTime = adjTime - attackOffset;
    
    if(adjTime >= 143) {
      let totalTime = 147 + midOffset;
      let rOffset = 0;
      oldAdjTime = adjTime;
      
      //if(adjTime >= 180) {
      //  rOffset = recalOffset;
      //} 
      //else if(recalOffset != 0)
      //{
      //  recalOffset = 0;
      //}
      
      adjTime = (adjTime % totalTime) - rOffset;
      
      if(adjTime < 0){
        adjTime = oldAdjTime - recalOffset;
      }
    }
    
    let count = 0;
    
    for (var key in attacks) {
      if(!isAttackable && upcomingAttack) {
        upcomingAttack = false;
        
        message("Upcoming attack: " + attacks[key][0], "upcomingBox");
      }
      if(!isAttackable && ((parseInt(key) - 4) < adjTime && adjTime < (parseInt(key) + 10))) {
          if(count == (Object.keys(attacks).length - 1)){
            incomingAttack = key;
            attackTime = parseInt(key);
              
            message("Upcoming attack: Red bomb", "upcomingBox");
          } 
          else {
            if(adjTime < (parseInt(key) + 3)) {
              incomingAttack = key;
              attackTime = parseInt(key);
            }
            
            upcomingAttack = true;
          }
      }
      
      count = count + 1;
    }
      
    let timeLeft = (attackTime - adjTime).toFixed(0);  
      
    if(!isAttackable && incomingAttack != 0){
      if(timeLeft <= 0){
        message("Incoming attack: \n" + attacks[incomingAttack][0]);
      }
      else {
        message("Incoming attack in " + timeLeft + ": \n" + attacks[incomingAttack][0]);
      }
    }
    else if (!isAttackable && incomingAttack == 0 && currentTooltip != "") {
      alt1.clearTooltip();
      message("");
    }
    
    if(tooltipEnabled && incomingAttack != 0) {
      currentTooltip = attacks[incomingAttack][0] + ": " + attacks[incomingAttack][1];
      updateTooltip();
    }
  }
}

function toggleTooltip() {
  updateTooltip("");
  alt1.clearTooltip();
  
  cb = document.getElementById('tooltipCheck');
	tooltipEnabled = cb.checked;
  
  localStorage.setItem("susTooltip", tooltipEnabled);
}

function updateTooltip(){
  if(currentTooltip!=""){
    if(!alt1.setTooltip(" " + currentTooltip)){
      currentTooltip="";
      console.log("No tooltip permission");}}
  else {
    alt1.clearTooltip();
    currentTooltip="";
  }
}

function startEncounter(offset = 0) {
  isPaused = false;
  startDate = Date.now() + offset;
  
  message("Encounter started!");
  message("Upcoming attack: Red bomb","upcomingBox");
  
  sBtn = document.getElementById("startButton");
  sBtn.innerHTML = "Stop";
}

function stopEncounter() {
  isPaused = true;
  isAttackable = false;
  currentTooltip = "";
  lastUpcomingMessage = "";
  attackOffset = 0;
  recalOffset = 0;
  
  sBtn.innerHTML = "Start";
  alt1.clearTooltip();
  message("Encounter stopped!");
  message("","upcomingBox");
}

function message(str,elementId="incomingBox"){
  elid(elementId).innerHTML=str+"\n";
}

function startTimer(){
  if(isPaused){
    startEncounter();
  }
  else {
    stopEncounter();
  }
}

function nudgeTimer(time) {
  startDate = new Date(startDate).getTime() + time;
  
  updateClock();
}

function changeDelay() {
  midOffset = document.getElementsByName('delayInput')[0].value;
  
  localStorage.setItem("susMidDelay", midOffset);
}

function alt1onrightclick(obj){
  startTimer();
}

$(function () {
  $(".chat").change(function () {
    reader.pos.mainbox = reader.pos.boxes[$(this).val()];
    showSelectedChat(reader.pos);
    localStorage.setItem("susChat", $(this).val());
    $(this).val("");
  });
});

$('document').ready(function(){
  delayInput = document.getElementsByName('delayInput');
  ttCheck = document.getElementById('tooltipCheck');  
  
  // Check for saved delay & set it
  if (localStorage.susMidDelay) {
    midOffset = parseInt(localStorage.susMidDelay);
    
    delayInput[0].value = midOffset;
  }
  else {
    delayInput[0].value = midOffset;
  }
    
  // Check for saved tooltipEnabled & set it
  if (localStorage.susTooltip) {
    tooltipEnabled = JSON.parse(localStorage.susTooltip);
    
    ttCheck.checked = tooltipEnabled;
  }
  else {
    ttCheck.checked = true;
  }
});