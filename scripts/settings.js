let tooltipSetting = 1;
let styleSetting = 0;
let compactModeSetting = 1;
let extendedModeSetting = 1;
let crystalMaskSetting = 1;
let crystalMaskBorderSetting = 1;
let crystalMaskSoundSetting = 0;
let countdownSoundSetting = 0;
let startOffset = 0;
let midOffset = 14;

function toggleSoundEffectSetting() {
  if (crystalMaskSetting == 1) {
    elid("cMaskSoundSetting").classList.remove("locked");
    elid("cMaskSoundSelect").disabled = false;
    elid("cMaskBorderSetting").classList.remove("locked");
    elid("cMaskBorderSelect").disabled = false;
  }
  else {
    elid("cMaskSoundSetting").classList.add("locked");
    elid("cMaskSoundSelect").disabled = true;
    elid("cMaskBorderSetting").classList.add("locked");
    elid("cMaskBorderSelect").disabled = true;
  }
}

$('document').ready(function() {
  $(".chat").change(function () {
    localStorage.setItem("susChat", parseInt($(this).val()));

    window.opener.updateChatSetting();
  });

  $(".ttSelect").change(function () {
    localStorage.setItem("susTT", parseInt($(this).val()));

    window.opener.updateTooltipSetting();
  });

  $(".styleSelect").change(function () {
    localStorage.setItem("susStyle", parseInt($(this).val()));

    window.opener.updateStyleSetting();
  });

  $(".countdownSoundSelect").change(function () {
    localStorage.setItem("susCountdownSound", parseInt($(this).val()));

    window.opener.updateCountdownSoundSetting(true);
  });

  $(".compactModeSelect").change(function () {
    compactModeSetting = parseInt($(this).val());
    localStorage.setItem("susCompactMode", compactModeSetting);

    window.opener.updateUISize(true);
  });

  $(".extendedModeSelect").change(function () {
    extendedModeSetting = parseInt($(this).val());
    localStorage.setItem("susExtendedMode", extendedModeSetting);

    window.opener.updateUISize(true);
  });

  $(".cMask").change(function () {
    crystalMaskSetting = parseInt($(this).val());
    localStorage.setItem("susCMask", crystalMaskSetting);

    toggleSoundEffectSetting();

    window.opener.updateCrystalMaskSetting();
  });

  $(".cMaskBorder").change(function () {
    localStorage.setItem("susCMaskBorder", $(this).val());

    window.opener.updateCrystalMaskBorder(true);
  });

  $(".cMaskSound").change(function () {
    localStorage.setItem("susCMaskSound", $(this).val());

    window.opener.updateAlertSound(true);
  });

  $("#startDelayInput").change(function () {
    startOffset = $(this).val();

    if (startOffset >= 0 && startOffset <= 2000) {
      localStorage.setItem("susStartDelay", startOffset);

      window.opener.updateStartOffset();
    }
  });

  $("#midDelayInput").change(function () {
    midOffset = $(this).val();

    if (midOffset >= 5 && midOffset <= 25) {
      localStorage.setItem("susMidDelay", midOffset);

      window.opener.updateMidOffset();
    }
  });

  startDelayInput = document.getElementsByName('startDelayInput');
  delayInput = document.getElementsByName('midDelayInput');

  // Check for saved start delay & set it
  if (localStorage.susStartDelay) {
    startOffset = parseInt(localStorage.susStartDelay);
  }
    
  startDelayInput[0].value = startOffset;
  
  // Check for saved delay & set it
  if (localStorage.susMidDelay) {
    midOffset = parseInt(localStorage.susMidDelay);
  }
    
  delayInput[0].value = midOffset;
    
  // Check for saved tooltipSetting & set it
  if (localStorage.susTT) {
    tooltipSetting = parseInt(localStorage.susTT);
  }
  
  $(".ttSelect").val(tooltipSetting);

  // Check for saved styleSetting & set it
  if (localStorage.susStyle) {
    styleSetting = parseInt(localStorage.susStyle);
  }

  $(".styleSelect").val(styleSetting);

  // Check for saved countdownSoundSetting & set it
  if (localStorage.susCountdownSound) {
    countdownSoundSetting = parseInt(localStorage.susCountdownSound);
  }

  $(".countdownSoundSelect").val(countdownSoundSetting);

  // Check for saved styleSetting & set it
  if (localStorage.susCompactMode) {
    compactModeSetting = parseInt(localStorage.susCompactMode);
  }

  $(".compactModeSelect").val(compactModeSetting);

  // Check for saved styleSetting & set it
  if (localStorage.susExtendedMode) {
    extendedModeSetting = parseInt(localStorage.susExtendedMode);
  }

  $(".extendedModeSelect").val(extendedModeSetting);

  // Check for saved crystalmask detection & set it
  if (localStorage.susCMask) {
    crystalMaskSetting = parseInt(localStorage.susCMask);
    toggleSoundEffectSetting();
  }

  $(".cMask").val(crystalMaskSetting);

  // Check for saved crystalmask border effect & set it
  if (localStorage.susCMaskBorder) {
    crystalMaskBorderSetting = parseInt(localStorage.susCMaskBorder);
  }

  $("#cMaskBorderSelect").val(crystalMaskBorderSetting);

  // Check for saved crystalmask sound effect & set it
  if (localStorage.susCMaskSound) {
    crystalMaskSoundSetting = parseInt(localStorage.susCMaskSound);
  }

  $("#cMaskSoundSelect").val(crystalMaskSoundSetting);

  // Get chatboxes found by susalert & fill selection
  let chatBoxes = window.opener.getChatReader();

  chatBoxes.pos.boxes.map((box, i) => {
    $(".chat").append(`<option value=${i}>Chat ${i}</option>`);
  });

  // Check for saved selected chat & set it
  if (localStorage.susChat) {
    $(".chat").val(localStorage.susChat);
  }
});