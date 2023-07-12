$('.fighter-page-slide-out').toggle('slide');
let isOpen= 0;
let eventShown=0;
let inProgress=0;
let fighters=[];
let opponents=[];

function showEvent(eventID){
    if(inProgress===0){
        inProgress=1;
    if(eventShown){
        $(".tape-index-event-container").empty();
        $(".tape-index-event-container").prepend("<svg class='loading-icon'><circle cx='70' cy='70' r='70'> </circle></svg>");
        eventShown=1;
    } else{
        $(".tape-index-event-container").prepend("<svg class='loading-icon'><circle cx='70' cy='70' r='70'> </circle></svg>");
        eventShown=1;
    }
    
    let action="get event fights"
    console.log(eventID,action)
    $.ajax({
        url: "/ajaxFetchEventInfo",
        data:{
            eventID:eventID,
            action:action
        },
        success: function(res){
            fighters=res.fighters;
            opponents=res.opponents;
            $(".loading-icon").remove();
            $(".tape-index-event-container").prepend("<h2 class='title-text index-title'>"+res.eventName+"</h2>");
            $(".tape-index-event-container").append("<div class='tape-index-fights-container'></div>");

            res.fighters.forEach(function(fighter,i){
                $(".tape-index-fights-container").append("<a onclick='showTape("+i+")'><div class='tape-index-fight'> <div class='tape-index-fighter-img-container'> <img class='tape-index-fighter-img' src='"+fighter.image_url+"' alt=''> <div class='background-gradient'></div> <p class='tape-index-fighter-name'>"+fighter.name+"</p> </div> <h3>VS.</h3> <div class='tape-index-fighter-img-container'> <img class='tape-index-fighter-img' src='"+res.opponents[i].image_url+"' alt=''> <div class='background-gradient'></div> <p class='tape-index-fighter-name'>"+res.opponents[i].name+"</p> </div> </div></a> ");
            })
            inProgress=0;
        }
    })
}
}

function showTape(i){
    $('.fighter-page-slide-out').css('visibility', 'visible');
    if (isOpen===0){
        $(".slide-out-title").prepend("<div class='rect'></div> <h3 class='title-text events-title'>Tape Index: "+fighters[i].name+" vs "+opponents[i].name+"</h3> <div class='rect'></div>");
        $(".slide-out-fighter").append("<div class='fight-index-fighter-info-col'> <div class='tape-index-fighter-img-container'> <img class='tape-index-fighter-img-lg' src='"+fighters[i].image_url+"' alt='event picture'> <div class='background-gradient'></div> <div class='tape-index-fighter-title'> <a target='_blank' href='/fighter/"+fighters[i].name+"'><h3>"+fighters[i].name+"</h3></a> <p>("+fighters[i].wins.total+"-"+fighters[i].losses.total+")</p> </div> </div> <div class='tape-index-fighter-info'> <p>Age: "+fighters[i].age+"</p> <p>Height: "+fighters[i].height+"</p> <p>Weight: "+fighters[i].weight+"</p> <p class='fight-win'>wins via: ("+fighters[i].wins.knockouts+" KO - "+fighters[i].wins.submissions+" SUB - "+fighters[i].wins.decisions+" DEC)</p> <p class='fight-loss'>losses via: ("+fighters[i].losses.knockouts+" KO - "+fighters[i].losses.submissions+" SUB - "+fighters[i].losses.decisions+" DEC)</p> </div> </div> <h3>Fight Links:</h3> <div class='tape-index-fights slide-out-fighter-fights'> </div>");
        $(".slide-out-opponent").append("<div class='fight-index-fighter-info-col'> <div class='tape-index-fighter-img-container'> <img class='tape-index-fighter-img-lg' src='"+opponents[i].image_url+"' alt='event picture'> <div class='background-gradient'></div> <div class='tape-index-fighter-title'> <a target='_blank' href='/fighter/"+opponents[i].name+"'><h3>"+opponents[i].name+"</h3></a> <p>("+opponents[i].wins.total+"-"+opponents[i].losses.total+")</p> </div> </div> <div class='tape-index-fighter-info'> <p>Age: "+opponents[i].age+"</p> <p>Height: "+opponents[i].height+"</p> <p>Weight: "+opponents[i].weight+"</p> <p class='fight-win'>wins via: ("+opponents[i].wins.knockouts+" KO - "+opponents[i].wins.submissions+" SUB - "+opponents[i].wins.decisions+" DEC)</p> <p class='fight-loss'>losses via: ("+opponents[i].losses.knockouts+" KO - "+opponents[i].losses.submissions+" SUB - "+opponents[i].losses.decisions+" DEC)</p> </div> </div> <h3 style='visibility: hidden;'>Fight Links:</h3> <div class='tape-index-fights slide-out-opponent-fights'> </div>");

        fighters[i].fights.forEach(function(fight){
            if(fight.tape_url){
                $(".slide-out-fighter-fights").append("<div onclick=\"openTapeUrl('"+fight.tape_url+"')\" class=\"tape-index-fight-row\"> <div class=\"tape-index-fight-outcome fight-"+fight.result+"\"> <h3>"+fight.result+"</h3> </div> <div class=\"tape-index-fight-info\"><h3>"+fighters[i].name+"</h3> <a onclick=\"event.stopPropagation();\" target=\"_blank\" href=\"/fighter/"+fight.opponent+"\">vs. "+fight.opponent+"</a> <p>"+fight.method+"</p> </div> </div>");
            }
        })
        opponents[i].fights.forEach(function(fight){
            if(fight.tape_url){
                $(".slide-out-opponent-fights").append('<div onclick="openTapeUrl(\''+fight.tape_url+'\')" class="tape-index-fight-row"> <div class="tape-index-fight-outcome fight-'+fight.result+'"> <h3>'+fight.result+'</h3> </div> <div class="tape-index-fight-info"><h3>'+opponents[i].name+'</h3> <a onclick="event.stopPropagation();" target="_blank" href="/fighter/'+fight.opponent+'">vs. '+fight.opponent+'</a> <p>'+fight.method+'</p> </div> </div>');
            }
        })

        $('.fighter-page-slide-out').slideToggle();
        $('.close').css('visibility', 'visible');
        isOpen=1;
    } else{
        $('.fighter-page-slide-out').slideToggle();
        setTimeout(function(){
        $('.close').css('visibility', 'hidden');
        $(".slide-out-title").empty();
        $(".slide-out-fighter").empty();
        $(".slide-out-opponent").empty();
        $(".slide-out-fighter-fights").empty();
        $(".slide-out-opponent-fights").empty();
        }, 390);
        isOpen=0;
    }
}

$('.close').click(function(event){
    $('.fighter-page-slide-out').slideToggle();
    setTimeout(function(){
        $('.close').css('visibility', 'hidden');
        $(".slide-out-title").empty();
        $(".slide-out-fighter").empty();
        $(".slide-out-opponent").empty();
        $(".slide-out-fighter-fights").empty();
        $(".slide-out-opponent-fights").empty();
    }, 390);
     isOpen=0;
})

function openTapeUrl(tapeUrl) {
    window.open(tapeUrl, '_blank');
  }

$(document).click(function(event){
    if(!event.target.matches(".tape-index-fight") && !event.target.matches(".tape-index-fight *") && !event.target.matches(".fighter-page-slide-out")&& !event.target.matches(".fighter-page-slide-out *")){
        if(isOpen){         
       $('.fighter-page-slide-out').slideToggle();
            setTimeout(function(){
                $('.close').css('visibility', 'hidden');
                $(".slide-out-title").empty();
                $(".slide-out-fighter").empty();
                $(".slide-out-opponent").empty();
                $(".slide-out-fighter-fights").empty();
                $(".slide-out-opponent-fights").empty();
            }, 390);
        isOpen=0;
        }
    }
  })