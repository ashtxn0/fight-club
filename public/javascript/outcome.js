const openButtons = document.querySelectorAll(".outcome-btn");
const closeButton = document.querySelector("[data-close-modal");
const modal = document.querySelector("[data-modal]");
const predictionButtonsOpen = document.querySelectorAll(".predictions-close-btn");
const predictionButtonsClose = document.querySelector("[predictions-close-modal");
const predictionModal=document.querySelector("[predictions-modal]");

let currentTheme="";
let fightID="";

openButtons.forEach(function(btn){
    btn.addEventListener("click",(event)=>{
        modal.showModal();

        fightID=event.target.id.split("-")[0];
    })
})

predictionButtonsOpen.forEach(function(btn){
    btn.addEventListener("click",(event)=>{
        predictionModal.showModal();

        fightID=event.target.id.split("-")[0];
    })
})

closeButton.addEventListener("click",()=>{
    modal.close();
})

predictionButtonsClose.addEventListener("click",()=>{
    predictionModal.close();
})

$(".submit-fight-outcome").on("click", function(event){
    let winner=$(".winner").val();
    let method=$(".method").val();
    let round=$(".round").val();
    let time=$(".time").val();
    let result="";
    let action="submitFightOutcome";
    if(winner==="draw"){
        result="draw";
      } else if (winner==="no contest"){
        result="no contest";
      } else{
        result=winner+" won";
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