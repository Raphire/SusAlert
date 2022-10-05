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
let oldLineTime = new Date();

let tooltipSetting = 1;
let styleSetting = 0;
let countdownSoundSetting = 0;
let compactModeSetting = 1;
let extendedModeSetting = 1;
let crystalMaskSetting = 1;
let crystalMaskBorderSetting = 1;
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
  0: { 5: "white", 4: "white", 3: "white", 2: "white", 1: "white", 0: "white" },
  1: { 5: "white", 4: "white", 3: "white", 2: "yellow", 1: "orange", 0: "red" },
  2: { 5: "white", 4: "white", 3: "red", 2: "orange", 1: "yellow", 0: "limegreen" }
}

// Dictionary containing the alert sounds and their volume
let alertSounds = {
  1: ["./assets/shatter.mp3", 0.6],
  2: ["./assets/shatter2.mp3", 0.45],
  3: ["./assets/bell.mp3", 0.2],
  4: ["./assets/spell.mp3", 0.1],
  5: ["./assets/damage.mp3", 0.2],
  6: ["./assets/fireball.mp3", 0.2],
  7: ["./assets/alert.mp3", 0.2],
  69: ["./assets/warningend.mp3", 0.5]
}

// Dictionary containing border colors for settings
let borderColors = {
  1: ["green-border", "red-border"],
  2: ["blue-border", "red-border"],
  3: ["blue-border", "yellow-border"],
  4: ["blue-border", "white-border"],
  5: ["white-border", "red-border"]
}

// Dictionary containing the countdown sounds and their volume
let countdownSounds = {
  1: [["./assets/beep.mp3", 0.7], ["./assets/beeps.mp3", 0.7]],
  2: [["./assets/race1.mp3", 0.2], ["./assets/race2.mp3", 0.15]],
  3: [["./assets/softbeep.mp3", 0.7], ["./assets/softendbeep.mp3", 0.7]],
  4: [["./assets/xylo.mp3", 0.3], ["./assets/xyloend.mp3", 0.25]],
  69: [["./assets/warningend.mp3", 0.5], ["./assets/warningend.mp3", 0.5]]
}

let alertSound = new Audio("./assets/shatter.mp3");
var countdownSound = new Audio("./assets/softbeep.mp3");
var countdownFinishSound = new Audio("./assets/softendbeep.mp3");

// Set Chat reader with all textcolors etc.
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
    A1lib.mixColor(163, 53, 238)   // Rare Drop Purple

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
        if (!isPaused) {
          readChatbox();
        }
        else {
          readBossTimer();
        }

      }

      intervalCount = intervalCount + 1;
    }, 300);
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

  // Iterate through each chatline that was read
  for (let idx = 0; idx < numLines; idx++) {
    let lineTime = new Date();
    let lineTimeStr;

    if (debugMode) {
      console.log(lines[idx]);
    }

    try {
      // Match for the (first) timestamp in the chatline
      lineTimeStr = lines[idx].text.match(/[0-9]{2}[:]{1}[0-9]{2}[:]{1}[0-9]{2}/g)[0];

      // Check whether a timestamp has been found in the chatline
      if (lineTimeStr != null) {
        let lineTimeSplit = lineTimeStr.split(':');

        // Check if chatline was from previous day & fix lineTime if true
        if (lineTimeSplit[0] == 23 && lineTime.getHours() == 00) {
          lineTime.setDate(lineTime.getDate() - 1);
        }

        lineTime.setHours(lineTimeSplit[0]);
        lineTime.setMinutes(lineTimeSplit[1]);
        lineTime.setSeconds(lineTimeSplit[2]);
      }
    }
    catch {
      if (debugMode) {
        console.log("Error: No timestring in chatline");
      }
    }

    // Check if timestamp is newer than previous read chatline, or if there's no timestamp at all (as timestamps are not enabled by default)
    if (oldLineTime <= lineTime) {
      if (lineTimeStr != null) {
        oldLineTime = lineTime;
      }

      // Check for lines indicating the core can be attacked.
      if (!isAttackable && (lines[idx].text.includes("is vulnerable. Attack its core!") || 
                            lines[idx].text.includes("dark feast subsides. Strike now!") || 
                            lines[idx].text.includes("is the time. To the core!") )) 
      {
        startAttack();
      }
      
      // Check for lines indicating the attack phase has ended
      else if (isAttackable && (lines[idx].text.includes("feeds again - stand ready!") || 
                                lines[idx].text.includes("out - it is awakening.") ||
                                lines[idx].text.includes("is going to wake any moment.") )) 
      {
        endAttack();
      }

      // Check for lines for statue updates if the indicator is enabled
      if (extendedModeSetting == 0) {
        // Statue has all materials
        if (lines[idx].text.includes("Go - restore") || 
            lines[idx].text.includes("statue can be restored") ||
            lines[idx].text.includes("Now - rekindle")) 
        {
          if (lines[idx].text.includes("Ophalmi")) {
            $("#OphalmiStatue").attr("src", "assets/statues/Ophalmi - calcified-timber - complete.png");
          }
          else if (lines[idx].text.includes("Sana")) {
            $("#SanaStatue").attr("src", "assets/statues/Sana - spores-algae - complete.png");
          }
          else if (lines[idx].text.includes("Tagga")) {
            $("#TaggaStatue").attr("src", "assets/statues/Tagga - timber-spores - complete.png");
          }
          else if (lines[idx].text.includes("Vendi")) {
            $("#VendiStatue").attr("src", "assets/statues/Vendi - algae-calcified - complete.png");
          }
        }

        // Statue is built/restored (variant 1)
        else if (lines[idx].text.includes("will answer our call") ||
                  lines[idx].text.includes("The statue is restored - awaken")) 
        {
          if (lines[idx].text.includes("Ophalmi")) {
            $("#OphalmiStatue").attr("src", "assets/statues/Ophalmi - calcified-timber - built.png");
          }
          else if (lines[idx].text.includes("Sana")) {
            $("#SanaStatue").attr("src", "assets/statues/Sana - spores-algae - built.png");
          }
          else if (lines[idx].text.includes("Tagga")) {
            $("#TaggaStatue").attr("src", "assets/statues/Tagga - timber-spores - built.png");
          }
          else if (lines[idx].text.includes("Vendi")) {
            $("#VendiStatue").attr("src", "assets/statues/Vendi - algae-calcified - built.png");
          }
        }

        // Statue is built/restored (variant 2)
        else if (lines[idx].text.includes("Awaken the")) {
          if (lines[idx].text.includes("indomitable fisher")) {
            $("#OphalmiStatue").attr("src", "assets/statues/Ophalmi - calcified-timber - built.png");
          }
          else if (lines[idx].text.includes("prodigious woodcrafter")) {
            $("#SanaStatue").attr("src", "assets/statues/Sana - spores-algae - built.png");
          }
          else if (lines[idx].text.includes("flint-hearted miner")) {
            $("#TaggaStatue").attr("src", "assets/statues/Tagga - timber-spores - built.png");
          }
          else if (lines[idx].text.includes("dauntless hunter")) {
            $("#VendiStatue").attr("src", "assets/statues/Vendi - algae-calcified - built.png");
          }
        }
      }
    }
    else if (debugMode) {
      console.log("Error: Old message!");
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
        if (currentTooltip != "") {
          updateTooltip();
        }

        // Makes sure the "Encounter Started" message is not until 3 seconds after the encounter started.
        if (time > 3000){
          message("");
        }
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
      if (countdownSoundSetting != 0 && timeLeft < 4 && countdownSoundSetting != 69) {
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
      
          if (crystalMaskBorderSetting != 0) {
            elid("body").classList.add(borderColors[crystalMaskBorderSetting][0]);
            elid("body").classList.remove(borderColors[crystalMaskBorderSetting][1]);
          }

          elid("cMaskImage").classList.remove("d-none");
        }
        else if (crystalMaskActive && !imgFound) {
          crystalMaskActive = false;
  
          if (crystalMaskBorderSetting != 0) {
            elid("body").classList.remove(borderColors[crystalMaskBorderSetting][0]);
            elid("body").classList.add(borderColors[crystalMaskBorderSetting][1]);
          }

          elid("cMaskImage").classList.add("d-none");
    
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
  startDate = Date.now() + offset;
  oldLineTime = new Date();
  
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

  // Reset statue indicators if enabled
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

    if (countdownSoundSetting != 0) {
      countdownSound = new Audio(countdownSounds[countdownSoundSetting][0][0]);
      countdownSound.volume = countdownSounds[countdownSoundSetting][0][1];
      countdownFinishSound = new Audio(countdownSounds[countdownSoundSetting][1][0]);
      countdownFinishSound.volume = countdownSounds[countdownSoundSetting][1][1];
    }

    if (playSound) {
      if (countdownSoundSetting != 0) {
        countdownFinishSound.play();
      }

      console.log("Countdown sound setting changed to: " + countdownSoundSetting);
    }
  }
}

// Update the UI mode settings with new value(s) from localstorage, and update UI
function updateUISize(showModal=false) {
  if (localStorage.susCompactMode) {
    compactModeSetting = parseInt(localStorage.susCompactMode);
  }

  if (localStorage.susExtendedMode) {
    extendedModeSetting = parseInt(localStorage.susExtendedMode);
  }

  if (compactModeSetting === 0 && extendedModeSetting === 0) {
    hideUpcomingbox();

    showStatueIndicator();

    compactStatueIndicator();

    A1lib.identifyApp("appconfig_statues_compact.json");
  }
  else if (compactModeSetting === 0) {
    hideUpcomingbox();

    hideStatueIndicator();

    A1lib.identifyApp("appconfig_compact.json");
  }
  else if (extendedModeSetting === 0) {
    showUpcomingbox();

    showStatueIndicator();
    
    uncompactStatueIndicator();

    A1lib.identifyApp("appconfig_statues.json");
  }
  else {
    showUpcomingbox();

    hideStatueIndicator();

    A1lib.identifyApp("appconfig.json");
  }

  if (showModal) {
    $('#resizeModal').modal('show');

    console.log("UI mode settings changed to: " + compactModeSetting + " (compact mode), and " + extendedModeSetting + " (statue indicator)");
  }
}

function showUpcomingbox() {
  elid("upcomingBox").classList.remove("d-none");
  elid("upcomingBox").classList.add("d-block");
  elid("recalButton").classList.remove("compactMode");
}

function hideUpcomingbox() {
  elid("upcomingBox").classList.add("d-none");
  elid("upcomingBox").classList.remove("d-block");
  elid("recalButton").classList.add("compactMode");
}

function showStatueIndicator() {
  elid("statuesBox").classList.remove("d-none");
  elid("statuesBox").classList.add("d-block");

  // Reset all statue indicators, in case they were disabled mid-fight.
  $("#OphalmiStatue").attr("src", "assets/statues/Ophalmi - calcified-timber.png");
  $("#SanaStatue").attr("src", "assets/statues/Sana - spores-algae.png");
  $("#TaggaStatue").attr("src", "assets/statues/Tagga - timber-spores.png");
  $("#VendiStatue").attr("src", "assets/statues/Vendi - algae-calcified.png");
}

function hideStatueIndicator() {
  elid("statuesBox").classList.add("d-none");
  elid("statuesBox").classList.remove("d-block");
}

function compactStatueIndicator() {
  elid("hrStatueDivider").classList.add("compactMode");
  elid("vrStatueDivider").classList.add("compactMode");
  elid("VendiStatue").classList.add("compactMode");
  elid("OphalmiStatue").classList.add("compactMode");
  elid("SanaStatue").classList.add("compactMode");
  elid("TaggaStatue").classList.add("compactMode");
}

function uncompactStatueIndicator() {
  elid("hrStatueDivider").classList.remove("compactMode");
  elid("vrStatueDivider").classList.remove("compactMode");
  elid("VendiStatue").classList.remove("compactMode");
  elid("OphalmiStatue").classList.remove("compactMode");
  elid("SanaStatue").classList.remove("compactMode");
  elid("TaggaStatue").classList.remove("compactMode");
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
      elid("body").classList.remove("blue-border");
      elid("body").classList.remove("yellow-border");
      elid("body").classList.remove("white-border");
      elid("cMaskImage").classList.add("d-none");
    }
    else if (buffReadInterval === null) {
      buffReadInterval = setInterval(function () {
        readBuffBar();
      }, 600);
    }

    console.log("Crystal mask setting changed to: " + crystalMaskSetting);
  }
}

// Update the crystal mask border setting with new value from localstorage
function updateCrystalMaskBorder() {
  if (localStorage.susCMaskBorder) {
    crystalMaskBorderSetting = parseInt(localStorage.susCMaskBorder);
    
    elid("body").classList.remove("green-border");
    elid("body").classList.remove("red-border");
    elid("body").classList.remove("blue-border");
    elid("body").classList.remove("yellow-border");
    elid("body").classList.remove("white-border");

    if (crystalMaskActive) {
      crystalMaskActive = false;
    }
    
    console.log("Crystal mask border setting changed to: " + crystalMaskBorderSetting);
  }
}

// Update the crystal mask sound setting with new value from localstorage
function updateAlertSound(playSound=false) {
  if (localStorage.susCMaskSound) {
    crystalMaskSoundSetting = parseInt(localStorage.susCMaskSound);

    if (crystalMaskSoundSetting != 0) {
      alertSound = new Audio(alertSounds[crystalMaskSoundSetting][0]);
      alertSound.volume = alertSounds[crystalMaskSoundSetting][1];  
    }

    if (playSound) {
      if (crystalMaskSoundSetting != 0) {
        alertSound.play();
      }

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

  // Check for saved countdownSoundSetting & update
  if (localStorage.susCountdownSound) {
    updateCountdownSoundSetting();
  }

  // Check for saved styleSetting & call UI update
  if (localStorage.susCompactMode || localStorage.susExtendedMode) {
    updateUISize();
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
  }

  if (crystalMaskSetting != 0) {
    buffReadInterval = setInterval(function () {
      readBuffBar();
    }, 600);
  }

  // Check for saved crystalmask border setting & update
  if (localStorage.susCMaskBorder) {
    crystalMaskBorderSetting = parseInt(localStorage.susCMaskBorder);
  }

  // Check for saved crystalmask sound setting & update
  if (localStorage.susCMaskSound) {
    updateAlertSound();
  }

  // Show debug button if susDebug flag exists in localstorage
  if (localStorage.susDebug) {
    elid("debugButton").classList.remove("d-none");
  }
});