let midOffset = 14;
let startOffset = 0;
let crystalMaskSetting = 0;
let tooltipSetting = 1;

$('document').ready(function() {
  document.title = 'Settings';

  $(".chat").change(function () {
    localStorage.setItem("susChat", parseInt($(this).val()));

    window.opener.chatChange();
  });

  $(".cMask").change(function () {
    crystalMaskSetting = parseInt($(this).val());
    localStorage.setItem("susCMask", $(this).val());

    window.opener.cMaskChange();
  });

  $(".ttSelect").change(function () {
    localStorage.setItem("susTT", parseInt($(this).val()));

    window.opener.tooltipChange();
  });

  $("#startDelayInput").change(function () {
    startOffset = parseInt($(this).val());
  
    if (startOffset >= 0 && startOffset <= 2000) {
      localStorage.setItem("susStartDelay", startOffset);

      window.opener.startOffsetChange();
    }
  });

  $("#midDelayInput").change(function () {
    midOffset = parseInt($(this).val());

    if (midOffset >= 5 && midOffset <= 25) {
      localStorage.setItem("susMidDelay", midOffset);

      window.opener.midOffsetChange();
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

  // Check for saved crystalmask detection & set it
  if (localStorage.susCMask) {
    crystalMaskSetting = parseInt(localStorage.susCMask);
    $(".cMask").val(crystalMaskSetting);
  }

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