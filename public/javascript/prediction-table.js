let activeList="ALL";

$(".profile-rankings-btn").on("click", function(event){
 let orgName=event.currentTarget.id;
 if (activeList===orgName){

 }else{
    $.ajax({
        url: "/ajaxFetchProfilePredictions",
        data:{
            userID:profileUserID,
            orgName:orgName
        },
        success: function(res){
            console.log(res);
            $("#"+activeList+" > div").removeClass("active-prediction-rankings-title");
            activeList=orgName;
            $("#"+activeList+" > div").addClass("active-prediction-rankings-title");
            $("#prediction-rankings-rank").text("Rank: "+res.rank);
            $("#prediction-rankings-wins").text(res.wins);
            $("#prediction-rankings-losses").text(res.losses);
            $("#prediction-rankings-mmr").text("Points: "+res.mmr);
            $(".prediction-table td:not(.headings)").remove();
            if(res.predictions.length){
                res.predictions.reverse().forEach(function(prediction){
                    let mmrChange="";
                    let outcomeBackground=prediction.outcome.toLowerCase();
                    if (outcomeBackground==="correct"){
                        mmrChange="+";
                    }
                    if(outcomeBackground===""){
                        prediction.outcome="-";
                        outcomeBackground="scheduled";
                        prediction.mmrChange="-";
                    } if(outcomeBackground==="push"){
                        prediction.mmrChange=0;
                    }
                    $(".prediction-table .headings").after("<tr> <td class='prediction-table-predict "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.predictionName+" to win</td> <td class='prediction-table-result "+outcomeBackground+" "+profileTheme+"-theme-text'>"+prediction.outcome+"</td> <td class='prediction-table-result "+outcomeBackground+" "+profileTheme+"-theme-text'>"+mmrChange+prediction.mmrChange+"</td> <td class='prediction-table-fight "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>fighter name vs. opponent name</td> <td class='prediction-table-event "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>event name</td> </tr>")
                    
                })
            } else{
                    $(".prediction-table .headings").after("<tr> <td class='prediction-table-predict "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>No predictions yet to show</td> <td class='prediction-table-result scheduled "+profileTheme+"-theme-text'>-</td><td class='prediction-table-result scheduled "+profileTheme+"-theme-text'>-</td> <td class='prediction-table-fight "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>-</td> <td class='prediction-table-event "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>-</td> </tr> ");
            }
            
        }
    })
 }
    
})