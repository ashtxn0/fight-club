let activeList="ALL";
let currentPage=1;
let predictionsPerPage=10;
let startIdx = 0;
let endIdx = predictionsPerPage;

let predictions = JSON.parse(document.currentScript.getAttribute('predictions'));
let totalPages=Math.ceil(predictions.length/predictionsPerPage);

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
            $("#"+activeList+" > div").removeClass("active-prediction-rankings-title");
            activeList=orgName;
            $("#"+activeList+" > div").addClass("active-prediction-rankings-title");
            $("#prediction-rankings-rank").text("Rank: "+res.rank);
            $("#prediction-rankings-wins").text(res.wins);
            $("#prediction-rankings-losses").text(res.losses);
            $("#prediction-rankings-mmr").text("Points: "+res.mmr);
            $(".prediction-table td:not(.headings)").remove();
            if(res.predictions.length){
                predictions=res.predictions;
                predictions.slice(0,10).forEach(function(prediction){
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
                    $(".prediction-table > tbody").append("<tr> <td class='prediction-table-predict "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.predictionName+" to win</td> <td class='prediction-table-result "+outcomeBackground+" "+profileTheme+"-theme-text'>"+prediction.outcome+"</td> <td class='prediction-table-result "+outcomeBackground+" "+profileTheme+"-theme-text'>"+mmrChange+prediction.mmrChange+"</td> <td class='prediction-table-fight "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.fighterName+" vs. "+prediction.opponentName+"</td> <td class='prediction-table-event "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.eventName+"</td> </tr>")
                    currentPage = 1;
                    $(".user-prediction-page-number").text(currentPage.toString());
                    totalPages=Math.ceil(predictions.length/predictionsPerPage);
                    $(".user-prediction-total-pages").text(totalPages.toString());
                })
            } else{
                    $(".prediction-table .headings").after("<tr> <td class='prediction-table-predict "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>No predictions yet to show</td> <td class='prediction-table-result scheduled "+profileTheme+"-theme-text'>-</td><td class='prediction-table-result scheduled "+profileTheme+"-theme-text'>-</td> <td class='prediction-table-fight "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>-</td> <td class='prediction-table-event "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>-</td> </tr> ");
                    $(".user-prediction-total-pages").text("1");
                    $(".user-prediction-page-number").text("1");
            }
            
        }
    })
 }
    
})

$(".next-button").on("click", function(event){
    if(predictions.length && currentPage<totalPages){
        $(".prediction-table td:not(.headings)").remove();

        startIdx = currentPage * predictionsPerPage;
        endIdx = (currentPage + 1) * predictionsPerPage;

        predictions.slice(startIdx,endIdx).forEach(function(prediction){
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
            $(".prediction-table > tbody").append("<tr> <td class='prediction-table-predict "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.predictionName+" to win</td> <td class='prediction-table-result "+outcomeBackground+" "+profileTheme+"-theme-text'>"+prediction.outcome+"</td> <td class='prediction-table-result "+outcomeBackground+" "+profileTheme+"-theme-text'>"+mmrChange+prediction.mmrChange+"</td> <td class='prediction-table-fight "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.fighterName+" vs. "+prediction.opponentName+"</td> <td class='prediction-table-event "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.eventName+"</td> </tr>")
        })
        currentPage++;
        $(".user-prediction-page-number").text(currentPage.toString())
    }
    
})

$(".previous-button").on("click", function(event){
    if(predictions.length && currentPage>1){
        $(".prediction-table td:not(.headings)").remove();

        currentPage--;
        $(".user-prediction-page-number").text(currentPage.toString())
        startIdx = (currentPage-1) * predictionsPerPage;
        endIdx = currentPage * predictionsPerPage;

        predictions.slice(startIdx,endIdx).forEach(function(prediction){
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
            $(".prediction-table > tbody").append("<tr> <td class='prediction-table-predict "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.predictionName+" to win</td> <td class='prediction-table-result "+outcomeBackground+" "+profileTheme+"-theme-text'>"+prediction.outcome+"</td> <td class='prediction-table-result "+outcomeBackground+" "+profileTheme+"-theme-text'>"+mmrChange+prediction.mmrChange+"</td> <td class='prediction-table-fight "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.fighterName+" vs. "+prediction.opponentName+"</td> <td class='prediction-table-event "+profileTheme+"-theme-profile-heading-container "+profileTheme+"-theme-text'>"+prediction.eventName+"</td> </tr>")
        })
    }
    
})