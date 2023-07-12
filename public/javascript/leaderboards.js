let isOpen="";

$(".expand-btn").on("click",function(event){
  
    let userID=event.currentTarget.id.split("-")[0];
    let leaderboardType=event.currentTarget.id.split("-")[1];

    if (isOpen===""){
        $.ajax({
            url: "/ajaxFetchLeaderboardData",
            data:{
                userID:userID,
                leaderboardType:leaderboardType,
                function:"getSubTable"
            },
            success: function(res){

                $(event.currentTarget.parentElement).after("<tr class='sub-table-header sub-table-rankings-event'> <th colspan='3'>event</th> <th>record</th> <th>%</th> <th>Points</th> </tr> ");
                res.forEach(function(event){
                    const percentage=Math.floor(event.correct_count/(event.correct_count+event.incorrect_count)*100)||0;
                    $(".sub-table-header").after("<tr class='sub-table-rankings-event'> <td colspan='3'>"+event.eventName+"</td> <td><span class='win'>"+event.correct_count+"</span> - <span class='loss'>"+event.incorrect_count+"</span></td> <td>"+percentage+"%</td> <td>"+event.mmr_change+"</td> </tr>");
                })
                $(event.currentTarget.children[0]).addClass("minus-hidden");
                $(event.currentTarget.children[1]).removeClass("minus-hidden");
                isOpen=event.currentTarget.id;
            }
        })

    } else if(isOpen===event.currentTarget.id){
        $(event.currentTarget.children[1]).addClass("minus-hidden");
        $(event.currentTarget.children[0]).removeClass("minus-hidden");
        $(".sub-table-rankings-event").remove();
        isOpen="";
    } else{
        $.ajax({
            url: "/ajaxFetchLeaderboardData",
            data:{
                userID:userID,
                leaderboardType:leaderboardType,
                function:"getSubTable"
            },
            success: function(res){
                console.log(res);
                $("#"+isOpen+" .plus-btn").removeClass("minus-hidden");
                $("#"+isOpen+" .minus-btn").addClass("minus-hidden");
                $(".sub-table-rankings-event").remove();

                $(event.currentTarget.parentElement).after("<tr class='sub-table-header sub-table-rankings-event'>  <th colspan='3' >event</th> <th>record</th> <th>%</th> <th>Points</th> </tr> ");
                res.forEach(function(event){
                    const percentage=Math.floor(event.correct_count/(event.correct_count+event.incorrect_count)*100);
                    console.log(percentage)
                    $(".sub-table-header").after("<tr class='sub-table-rankings-event'>  <td colspan='3'>"+event.eventName+"</td> <td><span class='win'>"+event.correct_count+"</span> - <span class='loss'>"+event.incorrect_count+"</span></td> <td>"+percentage+"%</td> <td>"+event.mmr_change+"</td> </tr>");
                })
                
                $(event.currentTarget.children[0]).addClass("minus-hidden");
                $(event.currentTarget.children[1]).removeClass("minus-hidden");
                isOpen=event.currentTarget.id;
            }
        })
        
    }
    
})