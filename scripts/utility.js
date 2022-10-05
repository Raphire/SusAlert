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

// Updates the text inside element
function message(str,elementId="incomingBox",color="white") {
  if (elid(elementId).innerHTML != str) {
    elid(elementId).innerHTML = str;
    elid(elementId).style.color = color;
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

// Increases timer by time
function nudgeTimer(time) {
  startDate = new Date(startDate).getTime() + time;
  
  calculateTimeAndUpdateUI();
}

function getChatReader() {
  return chatReader;
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

function hideCrystalMaskIndicator() {
  elid("body").classList.remove("green-border");
  elid("body").classList.remove("red-border");
  elid("body").classList.remove("blue-border");
  elid("body").classList.remove("yellow-border");
  elid("body").classList.remove("white-border");
  elid("cMaskImage").classList.add("d-none");
}
