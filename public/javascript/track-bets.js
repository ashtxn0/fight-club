const openButtons = document.querySelectorAll(".outcome-btn");
const closeButton = document.querySelector("[data-close-modal");
const modal = document.querySelector("[data-modal]");

let lineIDSelectedForChange;

let isOpen = false;
let betSlip = [];




closeButton.addEventListener("click",()=>{
  modal.close();
})

function removeBetByLineIDHandler(lineIDToRemove) {
  $("#" + lineIDToRemove).remove();
  removeBetLine(lineIDToRemove);
  const index = betSlip.findIndex(bet => bet.lineID === lineIDToRemove);
  if (index !== -1) {
    betSlip.splice(index, 1);
  }
}

function removeBetByFightIDHandler(fightIDToRemove) {
  const betWithMatchingFightID = betSlip.find(bet => bet.fightID === fightIDToRemove);
  if (betWithMatchingFightID) {
    removeBetByLineIDHandler(betWithMatchingFightID.lineID);
    const index = betSlip.findIndex(bet => bet.fightID === fightIDToRemove);
    if (index !== -1) {
      betSlip.splice(index, 1);
    }
  }
}

// Function to convert decimal odds to American odds
function decimalToAmerican(decimalOdds) {
  if (decimalOdds >= 2.0) {
    return (decimalOdds - 1) * 100;
  } else {
    return -100 / (decimalOdds - 1);
  }
}

// Function to convert American odds to decimal odds
function americanToDecimal(americanOdds) {
  if (americanOdds >= 0) {
    return 1 + americanOdds / 100;
  } else {
    return 1 - 100 / americanOdds;
  }
}

// Function to revert the src attribute of a bet line image back to the original
function removeBetLine(lineID) {
  const $betLineImage = $(`[id*='${lineID}']`);
  const originalSrc = $betLineImage.attr("data-original-src");
  $betLineImage.attr("src", originalSrc); // Restore the original src value
  $betLineImage.siblings('.tracked-count').removeClass("active-tracked-bet");
  let trackedCount=Number($betLineImage.siblings('.tracked-count')[0].innerHTML);
  trackedCount--;
  $betLineImage.siblings('.tracked-count').text(trackedCount)
}

// Function to update the parlay odds display
function updateParlayOdds() {
  let parlayOddsDecimal = 1;
  if (betSlip.length > 1) {
    parlayOddsDecimal = betSlip.reduce((accumulator, bet) => accumulator * americanToDecimal(bet.odds), 1);
    $(".parlay-odds-container").addClass("track-bet-row");
  } else {
    $(".parlay-odds-container").removeClass("track-bet-row");
  }

  let parlayOddsAmerican = decimalToAmerican(parlayOddsDecimal);

  const parlayOddsDisplay = parlayOddsAmerican >= 0 ? `+${parlayOddsAmerican.toFixed(0)}` : parlayOddsAmerican.toFixed(0);

  $('.parlay-odds').text(parlayOddsDisplay); // Assuming there's an element with class "parlay-odds-american" to display the odds in American format
}

function closeBetSlide(){
    $('.track-bet-slide-down').removeClass('slide-down');
    $(".betslip-bets").empty();
    updateParlayOdds();
    betSlip.length=0;
    isOpen = false;
}

$(".betting-hub-bets-container").on("click", ".track-bet", function (event) {
  const [lineID, condition, odds, fightID, type,eventID,opponentName] = event.currentTarget.id.split("?");

  if (betSlip.some(bet => bet.lineID === lineID)) {
    removeBetByLineIDHandler(lineID);
    updateParlayOdds();
    return;
  } else if (betSlip.some(bet => bet.fightID === fightID)) {
    removeBetByFightIDHandler(fightID);
  }

  const bettingHubBetOdds = odds >= 0 ? `+${odds}` : odds;
  const bettingHubBetRow = `<div id='${lineID}' class='track-bet-row'>
                                <h2 class='betting-hub-bet-text'>${condition.split("_")[0]}<span class='betting-hub-bet-subtext'> - ${type}</span></h2>
                                <div class='betslip-odds'>
                                  <p class='betting-hub-bet-odds'>${bettingHubBetOdds}</p>
                                  <p class='${lineID}-change change-odds-btn betting-hub-bet-subtext'>change</p>
                                </div>
                             </div>`;
  $(".betslip-bets").append(bettingHubBetRow);
console.log(eventID)
  const bet = {
    _id:lineID,
    lineID: lineID,
    condition: condition,
    opponentName:opponentName.split("_")[0],
    odds: odds,
    fightID: fightID,
    eventID: eventID,
    type: type,
  };

  betSlip.push(bet);
  $(`[id*='${lineID}']`).attr("data-original-src", $(`[id*='${lineID}']`).attr("src")); // Store the original src value in the custom attribute
  $(`[id*='${lineID}']`).attr("src", "/image/track-active.svg");
  $(`[id*='${lineID}']`).siblings('.tracked-count').addClass("active-tracked-bet");
  let trackedCount=Number($(`[id*='${lineID}']`).siblings('.tracked-count')[0].innerHTML);
  trackedCount++;
  $(`[id*='${lineID}']`).siblings('.tracked-count').text(trackedCount)
    updateParlayOdds();

  if (!isOpen) {
    $('.track-bet-slide-down').addClass('slide-down');
    isOpen = true;
  }
});

$(".track-cancel-btn").on("click", function(event){

    betSlip.forEach(function(bet){
        removeBetLine(bet.lineID);
    })
    closeBetSlide();
})


$(".betting-hub-bets-container").on("click", ".odds-track-btn", function(event){
  let id=event.currentTarget.classList[2].split("-")[0];
  $(`[id*='${id}']`).click();
})

function handleOddsBtnClick(){
  lineIDSelectedForChange=this.classList[0].split("-")[0];
  modal.showModal();
}

$(".submit-odds-change").on("click", function(event){
  let newOdds=$(".changed-odds").val();
  if(newOdds){
    const indexToUpdate = betSlip.findIndex(bet => bet.lineID === lineIDSelectedForChange);

    if (indexToUpdate !== -1) {
      betSlip[indexToUpdate].odds = newOdds;
      $("." + lineIDSelectedForChange + "-change").siblings(".betting-hub-bet-odds").text(newOdds);
      updateParlayOdds();
    }

  }
  modal.close();
})

$(".submit-track").on("click", function(event){
    const wager = $(".track-input").val();
    let odds;
    if (betSlip.length>1){
        parlayOddsDecimal = betSlip.reduce((accumulator, bet) => accumulator * americanToDecimal(bet.odds), 1);
        odds = Math.round(decimalToAmerican(parlayOddsDecimal));
    } else{
        odds=betSlip[0].odds;
    }
    $.ajax({
        url: "/ajaxTrackBet",
        method:"post",
        data: {
            betSlip:betSlip,
            wager:wager,
            odds:odds,
            userID:userID,
        },
        success: function(res){
            console.log(res);
            closeBetSlide();
        }
    })
})

// Function to attach the event listener to .change-odds-btn elements
function attachOddsBtnEventListener(element) {
  element.addEventListener("click", handleOddsBtnClick);
}

// Observer configuration
const observerConfig = { childList: true, subtree: true };

// Callback function for the MutationObserver
function mutationCallback(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes) {
        if (node.classList && node.classList.contains("change-odds-btn")) {
          attachOddsBtnEventListener(node);
        } else if (node.querySelectorAll) {
          const oddsBtns = node.querySelectorAll(".change-odds-btn");
          oddsBtns.forEach((btn) => {
            attachOddsBtnEventListener(btn);
          });
        }
      }
    }
  }
}

// Create a new MutationObserver
const observer = new MutationObserver(mutationCallback);

// Start observing the document
observer.observe(document, observerConfig);
