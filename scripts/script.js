/// <reference path="bosstimer.d.ts" />

//Enable "Add App" button for Alt1 Browser.
A1lib.identifyApp("appconfig.json");

let isPaused = true;
let isAttackable = false;
let recalButtonVisible = false;
let tooltipEnabled = true;
let autoStopEnabled = false;
let startDate = Date.now();
let attackStartDate = Date.now();
let currentTooltip = "";
let lastUpcomingMessage = "";

let attackOffset = 0;
let recalOffset = 0;
let midOffset = 14;
let startOffset = 0;
let tempCount = 0;

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
}, 600);

reader.find();
reader.read();

// Chat finder & parser functions adapted from: https://github.com/ZeroGwafa/SerenTracker
let findChat = setInterval(function () {
  if (reader.pos === null) {
    reader.find();
  }
  else {
    clearInterval(findChat);
    reader.pos.boxes.map((box, i) => {
      $(".chat").append(`<option value=${i}>Chat ${i}</option>`);
    });

    if (localStorage.susChat) {
      reader.pos.mainbox = reader.pos.boxes[localStorage.susChat];
    } 
    else {
      //If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
      reader.pos.mainbox = reader.pos.boxes[0];
    }
    
    showSelectedChat(reader.pos);
    setInterval(function () {
      if (tempCount % 2 == 0) {
        readChatbox();
      }
      else {
        readBossTimer();
      }

      tempCount = tempCount + 1;
    }, 300);
  }
}, 1000);

function showSelectedChat(chat) {
  //Attempt to show a temporary rectangle around the chatbox.  skip if overlay is not enabled.
  try {
    alt1.overLayRect(
      A1lib.mixColor(255, 255, 255),
      chat.mainbox.rect.x,
      chat.mainbox.rect.y,
      chat.mainbox.rect.width,
      chat.mainbox.rect.height,
      2000,
      3
    );
  } catch { }
}

// Reading and parsing info from the chatbox.
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
    console.log("Attack detected");
    startAttack();
  }
  
  // Check for lines indicating the attack phase has ended
  if (isPaused == false && isAttackable == true && (chat.indexOf("feeds again - stand ready!") > -1 || 
                                                     chat.indexOf("out - it is awakening.") > -1 ||
                                                     chat.indexOf("is going to wake any moment.") > -1)) { // Might not be correct?
    console.log("End of attack detected");
    endAttack();
  }
  
  // Check for lines indicating the mid energy fungi have spawned
  if (isPaused == false && isAttackable == false && (chat.indexOf("the fungus at Croesus's base!") > -1 ||
                                                     chat.indexOf("fungus at Croesus's base - destroy it, now!") > -1)) { 
    console.log("Mid detected");
  }
}

// Calculates an offset to recalibrate the  timer
function calculateRecalOffset(){
  let time = Date.now() - startDate;
  let adjTime = new Date(time < 0 ? 0 : time).getTime()/1000;
  
  adjTime = adjTime - attackOffset;
  
  let totalTime = 147 + midOffset;
  
  console.log("Time before mod: " + adjTime);
  
  adjTime = adjTime % totalTime;
  
  console.log("Time after mod: " + adjTime);
  
  if (adjTime >= 148) {
    recalOffset = adjTime - totalTime;
  }
  else if (adjTime <= 25) {
    recalOffset = adjTime;
  }

  recalButtonVisible = false;

  let rButton = document.getElementById("recalButton");
  rButton.classList.add("d-none");
}

// Updates clock, upcoming/incoming attack messages and the tooltip (Needs to be broken up)
function updateClock() {
  if (!isPaused) {
    let upcomingAttack = false;
    let incomingAttack = 0;
    let attackTime = 0;
    let oldAdjTime = 0;
    let time = Date.now() - startDate;
    let adjTime = new Date(time < 0 ? 0 : time).getTime()/1000;
    message(adjTime.toFixed(0) + "s", "timerBox");
    
    adjTime = adjTime - attackOffset - recalOffset;
    
    // Check if fight is at least at or past first mid
    if (adjTime >= 143 + midOffset) {
      let totalTime = 147 + midOffset;
      oldAdjTime = adjTime;
      
      adjTime = adjTime % totalTime;
      
      if(adjTime < 0){
        adjTime = oldAdjTime - recalOffset;
      }
    }
    
    let count = 0;
    
    for (var key in attacks) {
      // Check if this is an upcoming attack
      if (!isAttackable && upcomingAttack) {
        upcomingAttack = false;
        
        message("Upcoming attack: " + attacks[key][0], "upcomingBox");
      }
      // Check if this is an incoming attack
      if (!isAttackable && ((parseInt(key) - 4) < adjTime && adjTime < (parseInt(key) + 11))) {
          // Check if this is the last attack (Mid energy fungi)
          if (count == (Object.keys(attacks).length - 1)) {
            if (adjTime < (parseInt(key) + 10)) {
              incomingAttack = key;
              attackTime = parseInt(key);
                
              message("Upcoming attack: Red bomb", "upcomingBox");
            } 
            else if (!recalButtonVisible && ((parseInt(key) + 10) <= adjTime && adjTime < (parseInt(key) + 11))) {
              console.log("visible");
              recalButtonVisible = true;
      
              let rButton = document.getElementById("recalButton");
              rButton.classList.remove("d-none");
            }
          }
          // This is different attack
          else {
            if (adjTime < (parseInt(key) + 3)) {
              incomingAttack = key;
              attackTime = parseInt(key);
              
              if (recalButtonVisible) {
                console.log("invisible");
                recalButtonVisible = false;
        
                let rButton = document.getElementById("recalButton");
                rButton.classList.add("d-none");
              }
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

// Toggles whether or not the tooltip is visible
function toggleTooltip() {
  updateTooltip("");
  alt1.clearTooltip();
  
  cb = document.getElementById('tooltipCheck');
	tooltipEnabled = cb.checked;
  
  localStorage.setItem("susTooltip", tooltipEnabled);
}

// Update the text in the tooltip
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
  recalButtonVisible = false;
  currentTooltip = "";
  lastUpcomingMessage = "";
  attackOffset = 0;
  recalOffset = 0;
  tempCount = 0;

  let rButton = document.getElementById("recalButton");
  rButton.classList.add("d-none");
  
  sBtn.innerHTML = "Start";
  alt1.clearTooltip();
  message("Encounter stopped!");
  message("","upcomingBox");
}

function startAttack() {
  isAttackable = true;
  
  lastUpcomingMessage = document.getElementById('upcomingBox').textContent;
    
  message("","upcomingBox");
  message("Croesus is vulnerable,\nattack the core!");
  
  updateTooltip("Attack the core!");
  
  attackStartDate = Date.now();
}

function endAttack() {
  isAttackable = false;
    
  message(lastUpcomingMessage,"upcomingBox");
  message("",true);
  alt1.clearTooltip();
  
  attackOffset = attackOffset + (Date.now() - attackStartDate) / 1000;
  console.log("Attack ended, time offset: " + attackOffset);
}

function message(str,elementId="incomingBox"){
  elid(elementId).innerHTML=str;
}

function startTimer(){
  if(isPaused){
    startEncounter();
  }
  else {
    stopEncounter();
  }
}

function readBossTimer() {
  if (bossTimerReader.find() != null && isPaused == true){
    startEncounter(startOffset);
  }
  else if (bossTimerReader.find() == null && isPaused == false) {
    stopEncounter();
  }
}

function nudgeTimer(time) {
  startDate = new Date(startDate).getTime() + time;
  
  updateClock();
}

function changeStartDelay() {
  startOffset = document.getElementsByName('startDelayInput')[0].value;
  
  localStorage.setItem("susStartDelay", startOffset);
}

function changeDelay() {
  midOffset = document.getElementsByName('delayInput')[0].value;
  
  localStorage.setItem("susMidDelay", midOffset);
}

// Gets called when user presses the alt + 1 keybind.
function alt1onrightclick(obj){
  calculateRecalOffset();
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
  startDelayInput = document.getElementsByName('startDelayInput');
  delayInput = document.getElementsByName('delayInput');
  ttCheck = document.getElementById('tooltipCheck');  

  // Check for saved start delay & set it
  if (localStorage.susStartDelay) {
    startOffset = parseInt(localStorage.susStartDelay);
    
    startDelayInput[0].value = startOffset;
  }
  else {
    startDelayInput[0].value = startOffset;
  }
  
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