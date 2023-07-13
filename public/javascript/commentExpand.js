$(".read-more-btn").on("click", function(event){
    let commentIndex=event.target.id.split("-")[2];
    $("#comment-"+commentIndex).removeClass("hidden-content");

    $("#less-btn-"+commentIndex).removeClass("hidden-content");
    $("#"+event.target.id).addClass("hidden-content");
})

$(".show-less-btn").on("click", function(event){
    let commentIndex=event.target.id.split("-")[2];
    $("#comment-"+commentIndex).addClass("hidden-content");

    $("#read-btn-"+commentIndex).removeClass("hidden-content");
    $("#"+event.target.id).addClass("hidden-content");
})