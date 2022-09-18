/// <reference path="bosstimer.d.ts" />

//Enable "Add App" button for Alt1 Browser.
A1lib.identifyApp("appconfig.json");

let isPaused = true;
let isAttackable = false;
let recalButtonVisible = false;
let crystalMaskActive = false;
let startDate = Date.now();
let attackStartDate = Date.now();
let currentTooltip = "";
let lastUpcomingMessage = "";

let attackOffset = 0;
let recalOffset = 0;
let intervalCount = 0;
let attackEndCount = 0;
let loadingCount = 2;
let oldTimeLeft = 0;

let tooltipSetting = 1;
let styleSetting = 0;
let countdownSoundSetting = 0;
let compactModeSetting = 1;
let extendedModeSetting = 1;
let crystalMaskSetting = 0;
let crystalMaskSoundSetting = 0;
let startOffset = 0;
let midOffset = 14;

let debugMode = false;

// Dictionary containing croesus' attacks, their timings and the counter move
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

// Dictionary containing the countdown message colors, corresponding to time remaining in seconds
let countdownColors = {
  0: { 5: "white", 4: "white", 3: "white", 2: "white", 1: "white", 0: "white"},
  1: { 5: "white", 4: "white", 3: "white", 2: "yellow", 1: "orange", 0: "red"},
  2: { 5: "white", 4: "white", 3: "red", 2: "orange", 1: "yellow", 0: "limegreen"}
}

let alertSound = new Audio("./assets/shatter.mp3");
var countdownSound = new Audio("./assets/softbeep.mp3");
var countdownFinishSound = new Audio("./assets/softendbeep.mp3");

// Set Chat reader
let chatReader = new Chatbox.default();
chatReader.readargs = {
  colors: [
    A1lib.mixColor(255, 255, 255), // Normal Text White
    A1lib.mixColor(130, 70, 184),  // Gorvek Purple
    A1lib.mixColor(159,255,159),   // Clan chat green
    A1lib.mixColor(255, 82, 86),   // PM Red
    A1lib.mixColor(255, 0, 0),     // Very Red Red
    A1lib.mixColor(0, 174, 0),     // Crystal Mask Green
    A1lib.mixColor(45, 184, 20),   // Completion Time Green
    A1lib.mixColor(67, 188, 188),  // Contribution Score Green
    A1lib.mixColor(102, 152, 255), // Notable Drops Blue
    A1lib.mixColor(235, 47, 47),   // Rot Mistake Red
    A1lib.mixColor(255, 255, 0),   // Blessing From The Gods Yellow
    A1lib.mixColor(0, 255, 255),   // Seren Spirit Cyan
    A1lib.mixColor(30, 255, 0),    // Catalyst Of Alteration Green
    A1lib.mixColor(127, 169, 255), // Public Chat Blue
    A1lib.mixColor(0, 255, 0),     // Artificer's Measure Green
    A1lib.mixColor(255, 112, 0),   // Luck Ring Orange
    A1lib.mixColor(163, 53, 238)   //Rare Drop Purple

  ],
  backwards: true,
};

let bossTimerReader = new BossTimer.default();

let buffReader = new BuffsReader.default();

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Buff reader interval
let buffReadInterval = null;

// Boss timer interval
let bossTimer = setInterval(function () {
  calculateTimeAndUpdateUI();
}, 500);

// Chat finder & parser functions adapted from: https://github.com/ZeroGwafa/SerenTracker
let findChat = setInterval(function () {
  if (chatReader.pos === null) {
    var dots = ".";
    
    for (var y = 0; y < loadingCount % 3; y++) {
      dots += ".";
    }

    loadingCount++;

    message("Looking for chatbox" + dots);
    
    chatReader.find();
  }
  else {
    console.log("Chatbox found!");

    message("Ready!\nAwaiting boss start...");
    
    clearInterval(findChat);

    if (localStorage.susChat && parseInt(localStorage.susChat) <= (chatReader.pos.boxes.length - 1)) {
      chatReader.pos.mainbox = chatReader.pos.boxes[parseInt(localStorage.susChat)];
    } 
    else {
      //If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
      chatReader.pos.mainbox = chatReader.pos.boxes[0];
    }
    
    showSelectedChat(chatReader.pos);
    setInterval(function () {
      if (intervalCount % 2) {
        readBossTimer();
      }
      else {
        readChatbox();
      }

      intervalCount = intervalCount + 1;
    }, 250);
  }
}, 1000);

// Shows a temporary rectangle around the selected chatbox
function showSelectedChat(chat) {
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
function readChatbox() 
{
  var lines = chatReader.read() || [];
  const numLines = lines.length;

  for (let idx = 0; idx < numLines; idx++)
  {
    if(!isPaused) 
    {
      if (debugMode)
      {
        console.log(lines[idx])
      }

      // Check for lines indicating the core can be attacked.
      if (!isAttackable && (lines[idx].text.includes("is vulnerable. Attack its core!") || 
                            lines[idx].text.includes("dark feast subsides. Strike now!") || 
                            lines[idx].text.includes("is the time. To the core!") )) 
      {
        startAttack();
      }
      
      // Check for lines indicating the attack phase has ended
      if (isAttackable && (lines[idx].text.includes("feeds again - stand ready!") || 
                          lines[idx].text.includes("out - it is awakening.") ||
                          lines[idx].text.includes("is going to wake any moment.") ))  // Might not be correct?
      {
        endAttack();
      }

      // Check for lines for statue updates if the indicator is enabled
      if (extendedModeSetting == 0) {
        // Ophalmi has all materials
        if ((lines[idx].text.includes("restore Ophalmi's statue") || 
            lines[idx].text.includes("Ophalmi's statue can be restored") ||
            lines[idx].text.includes("rekindle Ophalmi's spirit") )) 
        {
          $("#OphalmiStatue").attr("src", "assets/statues/Ophalmi - calcified-timber - complete.png");
        }

        // Sana has all materials
        if ((lines[idx].text.includes("restore Sana's statue") || 
            lines[idx].text.includes("Sana's statue can be restored") ||
            lines[idx].text.includes("rekindle Sana's spirit") )) 
        {
          $("#SanaStatue").attr("src", "assets/statues/Sana - spores-algae - complete.png");
        }

        // Tagga has all materials
        if ((lines[idx].text.includes("restore Tagga's statue") || 
            lines[idx].text.includes("Tagga's statue can be restored") ||
            lines[idx].text.includes("rekindle Tagga's spirit") )) 
        {
          $("#TaggaStatue").attr("src", "assets/statues/Tagga - timber-spores - complete.png");
        }

        // Vendi has all materials
        if ((lines[idx].text.includes("restore Vendi's statue") || 
            lines[idx].text.includes("Vendi's statue can be restored") ||
            lines[idx].text.includes("rekindle Vendi's spirit") )) 
        {
          $("#VendiStatue").attr("src", "assets/statues/Vendi - algae-calcified - complete.png");
        }

        // Ophalmi is restored
        if ((lines[idx].text.includes("Awaken the indomitable fisher") || 
            lines[idx].text.includes("Ophalmi will answer our call") ||
            lines[idx].text.includes("The statue is restored - awaken Ophalmi") )) 
        {
          $("#OphalmiStatue").attr("src", "assets/statues/Ophalmi - calcified-timber - built.png");
        }

        // Sana is restored
        if ((lines[idx].text.includes("Awaken the prodigious woodcrafter") || 
            lines[idx].text.includes("Sana will answer our call") ||
            lines[idx].text.includes("The statue is restored - awaken Sana") )) 
        {
          $("#SanaStatue").attr("src", "assets/statues/Sana - spores-algae - built.png");
        }

        // Tagga is restored
        if ((lines[idx].text.includes("Awaken the flint-hearted miner") || 
            lines[idx].text.includes("Tagga will answer our call") ||
            lines[idx].text.includes("The statue is restored - awaken Tagga") )) 
        {
          $("#TaggaStatue").attr("src", "assets/statues/Tagga - timber-spores - built.png");
        }

        // Vendi has all materials
        if ((lines[idx].text.includes("Awaken the dauntless hunter") || 
            lines[idx].text.includes("Vendi will answer our call") ||
            lines[idx].text.includes("The statue is restored - awaken Vendi") )) 
        {
          $("#VendiStatue").attr("src", "assets/statues/Vendi - algae-calcified - built.png");
        }
      }
    }
  }
}

// Checks for boss timer on-screen and starts/stops the timer accordingly
function readBossTimer() {
  if (isPaused && bossTimerReader.find() != null) {
    attackEndCount = 0;
    startEncounter(startOffset);
  }
  else if (!isPaused && bossTimerReader.find() == null && debugMode == false) {
    if (attackEndCount >= 3) {
      attackEndCount = 0;
      stopEncounter();
    }

    attackEndCount = attackEndCount + 1;
  }
}

// Calculates an offset to recalibrate the timer after mid
function calculateMidOffset() {
  let time = Date.now() - startDate;
  let adjTime = new Date(time < 0 ? 0 : time).getTime() / 1000;
  
  adjTime = adjTime - attackOffset;
  
  let totalTime = 147 + midOffset;
  
  adjTime = adjTime % totalTime;
  
  if (adjTime >= 148) {
    recalOffset = adjTime - totalTime;
  }
  else if (adjTime <= 25) {
    recalOffset = adjTime;
  }

  console.log("Mid down, calculated offset: " + recalOffset);

  recalButtonVisible = false;
  elid("recalButton").classList.add("d-none");
}

// Calculate & adjust internal time and update the UI
function calculateTimeAndUpdateUI() {
  if (!isPaused) {
    let upcomingAttack = 0;
    let incomingAttack = 0;
    let attackTime = 0;
    let oldAdjTime = 0;
    let count = 0;
    let time = Date.now() - startDate;
    let adjTime = new Date(time < 0 ? 0 : time).getTime();
    
    // Update clock
    let timeString = new Date(adjTime).toISOString().substr(14, 5);
    message(timeString, "timerBox");

    // Apply all offsets for attack calculations etc.
    adjTime = (adjTime / 1000) - attackOffset - recalOffset;
    
    // Check if fight is at least at or past first mid
    if (adjTime >= 143 + midOffset) {
      let totalTime = 147 + midOffset;
      oldAdjTime = adjTime;
      adjTime = adjTime % totalTime;
      
      if (adjTime < 0) {
        adjTime = oldAdjTime - recalOffset;
      }
    }
    
    if (!isAttackable) {
      for (var key in attacks) {
        // Check if this is an incoming attack
        if ((parseInt(key) - 4) < adjTime && adjTime < (parseInt(key) + 9)) {
          // Check if this is the last attack (Mid energy fungi)
          if (count == (Object.keys(attacks).length - 1)) {
            if (adjTime < (parseInt(key) + 7)) {
              incomingAttack = key;
              upcomingAttack = 0;
              attackTime = parseInt(key);
            } 
            else if (!recalButtonVisible && ((parseInt(key) + 7) <= adjTime && adjTime < (parseInt(key) + 9))) {
              recalButtonVisible = true;
              elid("recalButton").classList.remove("d-none");
              message("");
            }
          }
          // This is different attack
          else if (adjTime < (parseInt(key) + 3)) {
            incomingAttack = key;
            upcomingAttack = parseInt(count) + 1;
            attackTime = parseInt(key);
            
            if (recalButtonVisible) {
              recalButtonVisible = false;
              elid("recalButton").classList.add("d-none");
            }

            break;
          }
        }

        count = count + 1;
      }

      let timeLeft = (attackTime - adjTime).toFixed(0);  

      // Only update UI if the timeleft is >= 0 and timeLeft has changed
      if (timeLeft != oldTimeLeft && timeLeft >= 0) {
        oldTimeLeft = Math.abs(timeLeft);

        updateAttacksUI(incomingAttack, upcomingAttack, timeLeft);
      }
      else if (incomingAttack == 0) {
        if(currentTooltip != "") {
          updateTooltip();
        }

        message("");
      }
    }
  }
}

// Updates the incoming & upcoming attacks on the interface
function updateAttacksUI(incomingAttack, upcomingAttack, timeLeft) {
  // Check whether there is an incoming attack, and update UI & tooltip accordingly
  if (incomingAttack != 0) {
    var color = countdownColors[styleSetting][timeLeft];

    if (timeLeft > 0) {
      if (countdownSoundSetting != 0 && timeLeft < 4 && countdownSoundSetting != 69)  {
        countdownSound.play();
      }

      message("Incoming attack in " + timeLeft + ": \n" + attacks[incomingAttack][0], "incomingBox", color);
    }
    else {
      message("Incoming attack: \n" + attacks[incomingAttack][0], "incomingBox", color);

      if (countdownSoundSetting != 0) {
        countdownFinishSound.play();
      }
    }

    // Update tooltip & upcoming attack UI if no tooltip is currently displayed
    if (currentTooltip == "") {
      switch(tooltipSetting) {
        case 1:
          updateTooltip(attacks[incomingAttack][0]);
          break;
        case 2:
          updateTooltip(attacks[incomingAttack][1]);
          break;
        case 3:
          updateTooltip(attacks[incomingAttack][0] + ", " + attacks[incomingAttack][1]);
          break;
        case 0:
          break;
        default:
          console.log("Error: Invalid tooltip setting!");
          break;
      }

      let keys = Object.keys(attacks);
      message("Next attack: " + attacks[keys[upcomingAttack]][0], "upcomingBox");
    }
  }
}

// Updates the text in the tooltip
function updateTooltip(str = "") {
  currentTooltip = str;

  if (currentTooltip != "") {
    if (!alt1.setTooltip(" " + currentTooltip)) {
      console.log("Error: No tooltip permission");
    }
  }
  else {
    alt1.clearTooltip();
  }
}

// Reading & parsing info from the buff bar
function readBuffBar() {
  // Only check if crystalmask detection is enabled
  if (crystalMaskSetting != 0) {
    // First check if a buff bar has already been found, if not look for one now
    if (buffReader.pos === null) {
      buffReader.find();
    }
    else {
      let buffReadout = buffReader.read();
      const image = new Image;
      image.src = "./assets/crystalmask.png";
      image.onload = () => {
        let imgFound = false;

        ctx.drawImage(image, 0, 0);
        imageData = ctx.getImageData(0, 0, 25, 25);
        
        // Iterate through all buffs to find a buff matching the imgSrc
        for (var buffObj in buffReadout) {
          let countMatch = buffReadout[buffObj].countMatch(imageData,false).passed;
          
          if (countMatch >= 70) {
            imgFound = true;
          }
        }

        // Add border if buff is found
        if (imgFound && !crystalMaskActive) {
          crystalMaskActive = true;
      
          elid("body").classList.add("green-border");
          elid("body").classList.remove("red-border");
        }
        else if (crystalMaskActive && !imgFound) {
          crystalMaskActive = false;
  
          elid("body").classList.remove("green-border");
          elid("body").classList.add("red-border");
    
          // Play sound if enabled in settings
          if (crystalMaskSoundSetting != 0) {
            alertSound.play();

            // To do: Add text overlay as an option
            //alt1.overLayTextEx("Crystalmask has shattered!", A1lib.mixColor(0, 255, 0), 25,parseInt(alt1.rsWidth/2),parseInt((alt1.rsHeight/2)-300),3000,"monospace",true,true);
          }
        }
      }
    }
  }
}

// Start of boss encounter
function startEncounter(offset = 0) {
  isPaused = false;
  attackEndCount = 0;
  startDate = Date.now() + offset;
  
  message("Encounter started");
  message("Next attack: Red bomb","upcomingBox");
}

// End of boss encounter
function stopEncounter() {
  isPaused = true;
  isAttackable = false;
  recalButtonVisible = false;
  currentTooltip = "";
  lastUpcomingMessage = "";
  attackOffset = 0;
  recalOffset = 0;
  intervalCount = 0;

  updateTooltip();

  // Reset statue indicators if enabled!
  if (extendedModeSetting == 0) {
    $("#OphalmiStatue").attr("src", "assets/statues/Ophalmi - calcified-timber.png");
    $("#SanaStatue").attr("src", "assets/statues/Sana - spores-algae.png");
    $("#TaggaStatue").attr("src", "assets/statues/Tagga - timber-spores.png");
    $("#VendiStatue").attr("src", "assets/statues/Vendi - algae-calcified.png");
  }

  elid("recalButton").classList.add("d-none");
  message("Encounter ended\nAwaiting boss start...");
  message("","upcomingBox");
}

// Start of core (mid) attack
function startAttack() {
  isAttackable = true;
  lastUpcomingMessage = document.getElementById('upcomingBox').textContent;

  // Make sure to make mid down button invisible
  elid("recalButton").classList.add("d-none");
  
  // Change messages in incoming/upcoming attacks boxes
  message("","upcomingBox");
  message("Croesus is vulnerable,\nattack the core!");
  
  attackStartDate = Date.now();
}

// End of core (mid) attack
function endAttack() {
  isAttackable = false;

  updateTooltip();
  
  message(lastUpcomingMessage,"upcomingBox");
  message("");
  
  attackOffset = attackOffset + (Date.now() - attackStartDate) / 1000;
  console.log("Attack ended, time offset: " + attackOffset);
}

// Increases timer by time
function nudgeTimer(time) {
  startDate = new Date(startDate).getTime() + time;
  
  calculateTimeAndUpdateUI();
}

// Updates the text inside element
function message(str,elementId="incomingBox",color="white") {
  if (elid(elementId).innerHTML != str) {
    elid(elementId).innerHTML = str;
    elid(elementId).style.color = color;
  }
}

// Gets called when user presses the alt + 1 keybind.
function alt1onrightclick(obj) {
  calculateMidOffset();
}

// Update the selected chatbox with new value from localstorage
function updateChatSetting() { 
  if (localStorage.susChat && parseInt(localStorage.susChat) < chatReader.pos.boxes.length) {
    chatReader.pos.mainbox = chatReader.pos.boxes[localStorage.susChat];

    showSelectedChat(chatReader.pos);

    console.log("Selected chatbox changed to: " + localStorage.susChat);
  } 
}

// Update the tooltip setting with new value from localstorage
function updateTooltipSetting() {
  if (localStorage.susTT) {
    tooltipSetting = parseInt(localStorage.susTT);

    updateTooltip();

    console.log("Tooltip setting changed to: " + tooltipSetting);
  }
}

// Update the style setting with new value from localstorage
function updateStyleSetting() {
  if (localStorage.susStyle) {
    styleSetting = parseInt(localStorage.susStyle);

    console.log("Style setting changed to: " + styleSetting);
  }
}

// Update the countdown sound setting with new value from localstorage
function updateCountdownSoundSetting(playSound=false) {
  if (localStorage.susCountdownSound) {
    countdownSoundSetting = parseInt(localStorage.susCountdownSound);

    switch(countdownSoundSetting) {
      case 1:
        countdownSound = new Audio("./assets/beep.mp3");
        countdownSound.volume = 0.7;
        countdownFinishSound = new Audio("./assets/beeps.mp3");
        countdownFinishSound.volume = 0.7;
        break;
      case 2:
        countdownSound = new Audio("./assets/race1.mp3");
        countdownSound.volume = 0.2;
        countdownFinishSound = new Audio("./assets/race2.mp3");
        countdownFinishSound.volume = 0.15;
        break;
      case 3:
        countdownSound = new Audio("./assets/softbeep.mp3");
        countdownSound.volume = 0.7;
        countdownFinishSound = new Audio("./assets/softendbeep.mp3");
        countdownFinishSound.volume = 0.7;
        break;
      case 4:
        countdownSound = new Audio("./assets/xylo.mp3");
        countdownSound.volume = 0.3;
        countdownFinishSound = new Audio("./assets/xyloend.mp3");
        countdownFinishSound.volume = 0.25;
        break;
      case 69:
        countdownSound = new Audio("./assets/warningend.mp3");
        countdownSound.volume = 0.5;
        countdownFinishSound = new Audio("./assets/warningend.mp3");
        countdownFinishSound.volume = 0.5;
        break;
      default:
        console.log("Error: Invalid countdown sound setting!");
        break;
    }

    if (playSound && countdownSoundSetting != 0) {
      countdownFinishSound.play();

      console.log("Countdown sound setting changed to: " + countdownSoundSetting);
    }
  }
}

// Update the compact mode setting with new value from localstorage
function updateCompactMode(showModal=false) {
  compactModeSetting = parseInt(localStorage.susCompactMode);

  if (compactModeSetting === 0) {
    elid("upcomingBox").classList.add("d-none");
    elid("upcomingBox").classList.remove("d-block");
    elid("recalButton").classList.add("recalButtonCompact");

    A1lib.identifyApp("appconfig_compact.json");
  }
  else {
    elid("upcomingBox").classList.add("d-block");
    elid("upcomingBox").classList.remove("d-none");
    elid("recalButton").classList.remove("recalButtonCompact");

    A1lib.identifyApp("appconfig.json");
  }

  if (showModal) {
    $('#resizeModal').modal('show');

    console.log("Compact mode setting changed to: " + compactModeSetting);
  }
}

// Update the compact mode setting with new value from localstorage
function updateExtendedMode(showModal=false) {
  extendedModeSetting = parseInt(localStorage.susExtendedMode);

  if (extendedModeSetting === 0) {
    elid("statuesBox").classList.remove("d-none");
    elid("statuesBox").classList.add("d-block");


    A1lib.identifyApp("appconfig_extended.json");
  }
  else {
    elid("statuesBox").classList.add("d-none");
    elid("statuesBox").classList.remove("d-block");

    A1lib.identifyApp("appconfig.json");
  }

  if (showModal) {
    $('#resizeModal').modal('show');

    console.log("Extended mode setting changed to: " + compactModeSetting);
  }
}

// Update the crystal mask setting with new value from localstorage
function updateCrystalMaskSetting() {
  if (localStorage.susCMask) {
    crystalMaskSetting = parseInt(localStorage.susCMask);

    if (crystalMaskSetting == 0) {
      clearInterval(buffReadInterval);
      buffReadInterval = null;
      crystalMaskActive = false;
  
      elid("body").classList.remove("green-border");
      elid("body").classList.remove("red-border");
    }
    else if (buffReadInterval === null) {
      buffReadInterval = setInterval(function () {
        readBuffBar();
      }, 600);
    }

    console.log("Crystal mask setting changed to: " + crystalMaskSetting);
  }
}

// Update the crystal mask sound setting with new value from localstorage
function updateAlertSound(playSound=false) {
  if (localStorage.susCMaskSound) {
    crystalMaskSoundSetting = parseInt(localStorage.susCMaskSound);

    switch(crystalMaskSoundSetting) {
      case 1:
        alertSound = new Audio("./assets/shatter.mp3");
        alertSound.volume = 0.6;
        break;
      case 2:
        alertSound = new Audio("./assets/shatter2.mp3");
        alertSound.volume = 0.45;
        break;
      case 3:
        alertSound = new Audio("./assets/bell.mp3");
        alertSound.volume = 0.2;
        break;
      case 4:
        alertSound = new Audio("./assets/spell.mp3");
        alertSound.volume = 0.1;
        break;
      case 5:
        alertSound = new Audio("./assets/damage.mp3");
        alertSound.volume = 0.2;
        break;
      case 6:
        alertSound = new Audio("./assets/fireball.mp3");
        alertSound.volume = 0.2;
        break;
      case 7:
        alertSound = new Audio("./assets/alert.mp3");
        alertSound.volume = 0.2;
        break;
      case 69:
        alertSound = new Audio("./assets/warningend.mp3");
        alertSound.volume = 0.5;
        break;
      default:
        console.log("Error: Invalid crystal mask sound setting!");
        break;
    }
  
    if (playSound && crystalMaskSoundSetting != 0) {
      alertSound.play();

      console.log("Crystal mask sound setting changed to: " + crystalMaskSoundSetting);
    }
  }
}

// Update the start delay with new value from localstorage
function updateStartOffset() {
  if (localStorage.susStartDelay) {
    startOffset = parseInt(localStorage.susStartDelay);

    console.log("Start delay changed to: " + startOffset);
  }
}

// Update the mid delay with new value from localstorage
function updateMidOffset() {
  if (localStorage.susMidDelay) {
    midOffset = parseInt(localStorage.susMidDelay);

    console.log("Mid delay changed to: " + midOffset);
  }
}

function getChatReader() {
  return chatReader;
}

$('document').ready(function() {
  $("#debugButton").click(function () {
    if (debugMode == false) {
      startEncounter();
      debugMode = true;
    }
    else {
      stopEncounter();
      debugMode = false;
    }
  });

  $("#recalButton").click(function () {
    calculateMidOffset();
  });

  $("#plusButton").click(function () {
    nudgeTimer(-1000);
  });

  $("#minusButton").click(function () {
    nudgeTimer(1000);
  });

  // Check for saved start delay & set it
  if (localStorage.susStartDelay) {
    startOffset = parseInt(localStorage.susStartDelay);
  }
  
  // Check for saved delay & set it
  if (localStorage.susMidDelay) {
    midOffset = parseInt(localStorage.susMidDelay);
  }
    
  // Check for saved tooltipSetting & set it
  if (localStorage.susTT) {
    tooltipSetting = parseInt(localStorage.susTT);
  }

  // Check for saved styleSetting & set it
  if (localStorage.susStyle) {
    styleSetting = parseInt(localStorage.susStyle);
  }

  // Check for saved countdownSoundSetting & set it
  if (localStorage.susCountdownSound) {
    countdownSoundSetting = parseInt(localStorage.susCountdownSound);

    updateCountdownSoundSetting();
  }

  // Check for saved styleSetting & set it
  if (localStorage.susCompactMode) {
    compactModeSetting = parseInt(localStorage.susCompactMode);

    updateCompactMode();
  }

  // Check for saved styleSetting & set it
  if (localStorage.susExtendedMode) {
    extendedModeSetting = parseInt(localStorage.susExtendedMode);

    updateExtendedMode();
  }

  // Check for legacy tooltip setting, set it with new setting & remove legacy
  if (localStorage.susTooltip) {
    let legacyTtSetting = JSON.parse(localStorage.susTooltip);

    if (!legacyTtSetting) {
      tooltipSetting = 0;
      localStorage.setItem("susTT", tooltipSetting);
    }

    localStorage.removeItem("susTooltip");
  }

  // Check for saved crystalmask detection & set it
  if (localStorage.susCMask) {
    crystalMaskSetting = parseInt(localStorage.susCMask);

    // Check for legacy cmask setting, set it with new setting
    if (crystalMaskSetting == 2) {
      crystalMaskSetting = 1;
      crystalMaskSoundSetting = 1;

      localStorage.setItem("susCMask", 1);
      localStorage.setItem("susCMaskSound", 1);
    }

    buffReadInterval = setInterval(function () {
      readBuffBar();
    }, 600);
  }

  // Check for saved crystalmask sound setting & set it
  if (localStorage.susCMaskSound) {
    crystalMaskSoundSetting = parseInt(localStorage.susCMaskSound);

    updateAlertSound();
  }

  if (localStorage.susDebug) {
    elid("debugButton").classList.remove("d-none");
  }

  if (!localStorage.susUpdate1) {
    localStorage.setItem("susUpdate1", 1);

    $('#updateModal').modal('show');
  }
});