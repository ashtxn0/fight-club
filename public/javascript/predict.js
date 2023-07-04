let votedOn =[];

$(".predict-btn").on("click", function(event){
    if(username){
        let fightID=event.currentTarget.classList[1];
        let fighterID=event.currentTarget.id;
        let predictionName=[event.currentTarget.classList[2],event.currentTarget.classList[3]].join(" ");
        let prediction={
            fighterID:fighterID,
            fightID:fightID,
            eventID:eventID,
            userID:userID,
            outcome:null,
            predictionName:predictionName,
            orgName:orgName
        }
    

    $.ajax({
        url: "/ajaxPredict",
        method:"post",
        data:{
            prediction: prediction,
            fightID: fightID
        },
        success: function(res){
            $(".flash-"+prediction.fightID+" > p").text("Voted for "+res.fighterName);
            $(".fight-page-predict-button").css("visibility","hidden");
            setTimeout(function(){
                $(".flash-"+prediction.fightID+" > p").text("");
                $(".fight-page-predict-button").css("visibility","visible");
            },2000)
            $("."+prediction.fighterID+"-image").css("opacity","90%");
            $("."+prediction.fighterID+"-image").addClass("active");
            votedOn.forEach(function(vote,index){
                if (vote.fightID === prediction.fightID && vote.fighterID != prediction.fighterID){
                    $("."+vote.fighterID+"-image").css("opacity","60%");
                    $("."+vote.fighterID+"-image").removeClass("active");
                    votedOn.splice(index,1);
                }
                
            })
            votedOn.push(prediction);
        }
    })
    
}
})