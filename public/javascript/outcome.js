const openButtons = document.querySelectorAll(".outcome-btn");
const closeButton = document.querySelector("[data-close-modal");
const modal = document.querySelector("[data-modal]");
const predictionButtonsOpen = document.querySelectorAll(".predictions-close-btn");
const predictionButtonsClose = document.querySelector("[predictions-close-modal");
const predictionModal=document.querySelector("[predictions-modal]");
const tapeindexModal=document.querySelector("[tapeindex-modal]");
const tapeindexButtonsOpen = document.querySelectorAll(".tapeindex-btn");
const tapeindexButtonClose=document.querySelector("[tapeindex-close-modal]");

const outcomeSelect = document.getElementById("outcome");
const fighterNameOption = outcomeSelect.querySelector('option[value="fighterName"]');
const opponentNameOption = outcomeSelect.querySelector('option[value="opponentName"]');

let currentTheme="";
let fightID="";
let fightName="";
let fighterID="";
let fighterName;
let opponentName;

openButtons.forEach(function(btn){
    btn.addEventListener("click",(event)=>{
        modal.showModal();
        fighterName=btn.name.split("?")[0];
        opponentName=btn.name.split("?")[1];
        fightID=event.target.id.split("-")[0];
        fighterNameOption.textContent = fighterName;
        fighterNameOption.value = fighterName;
        opponentNameOption.textContent = opponentName;
        opponentNameOption.value = opponentName;
    })
})

predictionButtonsOpen.forEach(function(btn){
    btn.addEventListener("click",(event)=>{
        predictionModal.showModal();

        fightID=event.target.id.split("-")[0];
    })
})

tapeindexButtonsOpen.forEach(function(btn){
    btn.addEventListener("click",(event)=>{
        tapeindexModal.showModal();
        fighterID=event.target.id.split("?")[1];
        fightName=event.target.id.split("?")[0].replace(/_/g, ' ');
        // fightID=event.target.id.split("-")[0];
    })
})

closeButton.addEventListener("click",()=>{
    modal.close();
})

tapeindexButtonClose.addEventListener("click",()=>{
    tapeindexModal.close();
})

predictionButtonsClose.addEventListener("click",()=>{
    predictionModal.close();
})

$(".add-timing-btn").on("click", function(event){
    $(".add-timing-btn").after("<label for='tape-time'>Enter time:</label><input class='tape-time' type='text'>");
})

$(".submit-tapeindex").on("click", function(event){

    let action="submitTapeIndex";
    let tapeLink=$(".tape-link").val();
    let tapeTime=$(".tape-time").val() || "";
    $(".tape-time").remove();
    $(".tape-link").val("");
    tapeindexButtonClose.click();
    
    $.ajax({
        url: "/ajaxAdminFightActions",
        method:"post",
        data:{
            fighterID:fighterID,
            fightName:fightName,
            action:action,
            tapeLink:tapeLink,
            tapeTime:tapeTime,
            userID:userID
        },
        success: function(res){
            console.log(res);
        }
    })
})

$(".submit-fight-outcome").on("click", function(event){
    let winner;
    let method=$(".method").val();
    let round=$(".round").val();
    let time=$(".time").val();
    let result="";
    let action="submitFightOutcome";

      let outcomeSelect = document.getElementById("outcome");
      let selectedOption = outcomeSelect.options[outcomeSelect.selectedIndex].value;
      
      if (selectedOption === "draw") {
        winner = "draw";
        result = "draw";
      } else if (selectedOption === "no contest") {
        winner = "no contest";
        result = "no contest";
      } else {
        winner = selectedOption;
        result = winner + " won";
      }

      closeButton.click();
    $.ajax({
        url: "/ajaxAdminFightActions",
        method:"post",
        data:{
            fightID:fightID,
            winner:winner,
            result:result,
            method:method,
            round: round,
            time: time,
            action:action,
            userID:userID
        },
        success: function(res){
            console.log(res);
        }
    })
})

$(".submit-close-predictions").on("click", function(event){
    event.preventDefault();
    let action="closeFightPredictions";
    predictionButtonsClose.click();
    $.ajax({
        url: "/ajaxAdminFightActions",
        method:"post",
        data:{
            fightID:fightID,
            action:action,
            userID:userID
        },
        success: function(res){
            console.log(res);
        }
    })
})