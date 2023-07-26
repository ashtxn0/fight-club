let activeIndex="0";

$(".change-event-btn").on("click", function (e) {
    const index = e.currentTarget.id;
    if(index===activeIndex){return}
    $(".track-cancel-btn").click();
    const $bettingHubBetsContainer = $(".betting-hub-bets-container");
    $bettingHubBetsContainer.fadeOut(100, function () {
      $bettingHubBetsContainer.empty();
  
      const event = eventData[index];
  
      for (let i = 0; i < event.lines.length; i += 2) {
        $bettingHubBetsContainer.append(
  " <div class='betting-hub-bet'> <div class='betting-hub-bet-head'> <p>"+event.name+"</p> <div id='"+event.lines[i].fightID+"' class='comments-icon-container'> <img class='icon-dark comments-icon' src='/image/comment-dark.svg' alt='comment icon'> <img class='icon-light comments-icon' src='/image/comment-light.svg' alt='comment icon'> <p class='betting-hub-bet-subtext'>"+event.lines[i].comments.length+"</p> </div> </div> <div class='bet-info-container'> <div style='display: grid;'> <h2 class='betting-hub-bet-text'>"+event.lines[i].condition.split('_')[0]+"<span class='betting-hub-bet-subtext'>- "+event.lines[i].type+" </span></h2> <div class='comment-row'> <img id='"+event.lines[i]._id.toString()+"?"+event.lines[i].condition+"?"+event.lines[i].odds+"?"+event.lines[i].fightID+"?"+event.lines[i].type+"?"+event.lines[i+1].eventID+"?"+event.lines[i+1].condition+"' class='track-bet' src='/image/track-light.svg' height='30px' alt='bet tracking icon'> <p class='comment-likes tracked-count'> "+event.lines[i].trackedCount+" </p> <img class='like-btn' src='/image/thumbs-up-grey.svg' height='35px' alt=''> <p class='comment-likes'> "+event.lines[i].likes+" </p> <img class='dislike-btn' src='/image/thumbs-down-grey.svg' height='35px' alt=''> <p class='comment-dislikes'> "+event.lines[i].dislikes+" </p> </div> </div> <p class='betting-hub-bet-odds odds-track-btn "+event.lines[i]._id.toString()+"-redirect'>"+(event.lines[i].odds<0?'':'+')+event.lines[i].odds+"</p> </div> <div class='bet-info-container'> <div style='display: grid;'> <h2 class='betting-hub-bet-text'>"+event.lines[i+1].condition.split('_')[0]+"<span class='betting-hub-bet-subtext'>- "+event.lines[i+1].type +"</span></h2> <div class='comment-row'> <img id='"+event.lines[i+1]._id.toString()+"?"+event.lines[i+1].condition+"?"+event.lines[i+1].odds+"?"+event.lines[i+1].fightID+"?"+event.lines[i+1].type+"?"+event.lines[i+1].eventID+"?"+event.lines[i].condition+"' class='track-bet' src='/image/track-light.svg' height='30px' alt='bet tracking icon'> <p class='comment-likes tracked-count'> "+ event.lines[i+1].trackedCount +" </p> <img class='like-btn' src='/image/thumbs-up-grey.svg' height='35px' alt=''> <p class='comment-likes'> "+ event.lines[i+1].likes +" </p> <img class='dislike-btn' src='/image/thumbs-down-grey.svg' height='35px' alt=''> <p class='comment-dislikes'> "+ event.lines[i+1].dislikes +" </p> </div> </div> <p class='betting-hub-bet-odds odds-track-btn "+event.lines[i+1]._id.toString()+"-redirect'>"+(event.lines[i+1].odds<0?'':'+')+event.lines[i+1].odds +"</p> </div> </div>"
        );
      }
      activeIndex=index;
      $bettingHubBetsContainer.fadeIn(100);
    });
  });