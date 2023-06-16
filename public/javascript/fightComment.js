$(".comment-btn").on("click", function(event){
    if(username){
        let fightID=event.currentTarget.classList[1];
    let content= $(".input"+fightID).val();
    event.preventDefault();
    const currentDate=new Date()
    const timestamp=currentDate.getTime();
    let comment={
        content:content,
        username:username,
        timePosted: timestamp,
        likes: 0,
        dislikes: 0,
        usersLiked:[],
        usersDisiked:[],
    }
    
    $.ajax({
        url: "/ajaxComment",
        method:"post",
        data: {
            comment: comment,
            fightID: fightID,
            contentType: "fight"
        },
        success: function(res){
            $(".input"+fightID).val("");
            $(".fight-comments-container form").after("<div class='comment-col fight-comment'> <div class='comment-col'> <div class='comment-row'> <p class='comment-username'>"+ comment.username +"</p> <p class='fight-time-since'>just now</p> </div> <p class='comment-content fight-comment-content'>"+comment.content+"</p> </div> <div class='comment-row'> <img id='like-comment-"+comment.username+"-"+comment.timePosted+"' class='like-btn' src='/image/thumbs-up-grey.svg' height='20px' alt=''> <p class='comment-likes'>" + comment.likes +"</p> <img id='dislike-comment-"+comment.username+"-"+comment.timePosted+"' class='dislike-btn' src='/image/thumbs-down-grey.svg' height='20px' alt=''> <p class='comment-dislikes'>" + comment.dislikes +"</p> </div> </div>");
            
            //update comment on page
        }
    })}
});
let buttonsLiked=[];
$(".like-btn").on("click", function(event){
    if(username){
    let commentid = $(this).attr("id");

        let numberOfLikes=Number($(this).siblings(".comment-likes")[0].innerHTML);
        let numberOfDislikes=Number($(this).siblings(".comment-dislikes")[0].innerHTML);
        let commentUsername = commentid.split("-")[2];
        let commentTimeStamp= commentid.split("-")[3];
        let action="like";


    $.ajax({
        url: "/ajaxLikeOrDislike",
        method:"post",
        data: {
            commentUsername: commentUsername,
            timePosted: commentTimeStamp,
            username: username,
            action: action,
            contentType: "fight"
        },
        success: function(res){
                if (res.outcome ==="liked"){
                numberOfLikes++;
                $("#"+commentid).siblings(".comment-likes").text(numberOfLikes);
                $("#"+commentid).siblings(".comment-likes").css("color","#001c48");
                $("#"+commentid).attr("src","/image/thumbs-up-blue.svg");
                buttonsLiked.push(commentid);  
                } else if (res.outcome ==="unliked"){
                    numberOfLikes--;
                    $("#"+commentid).siblings(".comment-likes").text(numberOfLikes);
                    $("#"+commentid).siblings(".comment-likes").css("color","#4d4d4d");
                    $("#"+commentid).attr("src","/image/thumbs-up-grey.svg");
                    let index=buttonsLiked.indexOf(commentid);
                    if (index > -1){
                        buttonsLiked.splice(index,1);
                    }  
                } else{
                    numberOfDislikes--;
                    $("#"+commentid).siblings(".comment-dislikes").text(numberOfDislikes);
                    $("#"+commentid).siblings(".comment-dislikes").css("color","#4d4d4d");
                    $("#"+commentid).siblings(".dislike-btn").attr("src","/image/thumbs-down-grey.svg");
                    numberOfLikes++;
                    $("#"+commentid).siblings(".comment-likes").text(numberOfLikes);
                    $("#"+commentid).siblings(".comment-likes").css("color","#001c48");
                    $("#"+commentid).attr("src","/image/thumbs-up-blue.svg");
                    buttonsLiked.push(commentid);  
                }

            
        }
    })
    

    }
});
let buttonsDisliked=[];
$(".dislike-btn").on("click", function(event){
    if(username){
        let commentid = $(this).attr("id");    
        let numberOfDislikes=Number($(this).siblings(".comment-dislikes")[0].innerHTML);
        let numberOfLikes=Number($(this).siblings(".comment-likes")[0].innerHTML);
        let commentUsername = commentid.split("-")[2];
        let commentTimeStamp= commentid.split("-")[3];
        let action="dislike";

    $.ajax({
        url: "/ajaxLikeOrDislike",
        method:"post",
        data: {
            commentUsername: commentUsername,
            timePosted: commentTimeStamp,
            username: username,
            action: action,
            contentType: "fight"
        },
        success: function(res){
                if (res.outcome==="disliked"){
                    numberOfDislikes++;
                    $("#"+commentid).siblings(".comment-dislikes").text(numberOfDislikes);
                    $("#"+commentid).siblings(".comment-dislikes").css("color","#001c48");
                    $("#"+commentid).attr("src","/image/thumbs-down-blue.svg");
                    buttonsLiked.push(commentid);  
                } else if (res.outcome==="undisliked"){
                    numberOfDislikes--;
                    $("#"+commentid).siblings(".comment-dislikes").text(numberOfDislikes);
                    $("#"+commentid).siblings(".comment-dislikes").css("color","#4d4d4d");
                    $("#"+commentid).attr("src","/image/thumbs-down-grey.svg");
                    let index=buttonsDisliked.indexOf(commentid);
                    if (index > -1){
                        buttonsDisliked.splice(index,1);
                    } 
                } else{
                        numberOfLikes--;
                        $("#"+commentid).siblings(".comment-likes").text(numberOfLikes);
                        $("#"+commentid).siblings(".comment-likes").css("color","#4d4d4d");
                        $("#"+commentid).siblings(".like-btn").attr("src","/image/thumbs-up-grey.svg");
                        numberOfDislikes++;
                        $("#"+commentid).siblings(".comment-dislikes").text(numberOfDislikes);
                        $("#"+commentid).siblings(".comment-dislikes").css("color","#001c48");
                        $("#"+commentid).attr("src","/image/thumbs-down-blue.svg");
                        buttonsLiked.push(commentid);
                }

            
        }
    })
    

    }
});

