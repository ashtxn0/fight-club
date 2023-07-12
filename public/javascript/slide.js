
    $('.fighter-page-slide-out').toggle('slide');
    let isOpen= 0;


    $(".fight-listing").on("click", function(event){
        if(!isOpen && !event.target.matches(".fight-admin-btn")){
            document.location.href='/fight/'+event.currentTarget.id;
            return true;
        }
    })

$(document).click(function(event){
    if(!event.target.matches(".fighter-img") && !event.target.matches(".fighter-name") && !event.target.matches(".fighter-page-slide-out") && !event.target.matches(".fighter-page-slide-out *")&& !event.target.matches(".tapeindex-modal") && !event.target.matches(".tapeindex-modal *")){
        if(isOpen){         
       $('.fighter-page-slide-out').slideToggle();
            setTimeout(function(){
                $('.fighter-prof').removeClass('shown');
                $('.fighter-prof').addClass('hidden');
                $('.close').css('visibility', 'hidden');
                $(".hidden-fights").removeClass("shown-fights");
                $(".hidden-fights").addClass("hide-fights");
            }, 390);
        isOpen=0;
        isShown=0;
        }
    }
  })

$('.fighter-name').click(function(event){
    event.stopPropagation();
    let LName= (this.innerHTML).split('.').join("").split(" ")[1];
    let FName= (this.innerHTML).split('.').join("").split(" ")[0];
    
    $('.fighter-page-slide-out').css('visibility', 'visible');
    if (isOpen===0){
        $('.'+FName+'.'+LName).removeClass('hidden');
        $('.'+FName+'.'+LName).addClass('shown');
        $('.fighter-page-slide-out').slideToggle();
        //code to add the html
        
            
        
        $('.close').css('visibility', 'visible');
        isOpen=1;
    } else{
        $('.fighter-page-slide-out').slideToggle();
        setTimeout(function(){
        $('.fighter-prof').removeClass('shown');
        $('.fighter-prof').addClass('hidden');
        $('.close').css('visibility', 'hidden');
        $(".hidden-fights").removeClass("shown-fights");
        $(".hidden-fights").addClass("hide-fights");
        }, 390);
        isOpen=0;
        isShown=0;
    }

})


$('.close').click(function(event){
    $('.fighter-page-slide-out').slideToggle();
    setTimeout(function(){
        $('.fighter-prof').removeClass('shown');
        $('.fighter-prof').addClass('hidden');
        $('.close').css('visibility', 'hidden');
        $(".hidden-fights").removeClass("shown-fights");
        $(".hidden-fights").addClass("hide-fights");
    }, 390);
     isOpen=0;
     isShown=0;
})

let isShown=0;

$('.hidden-fights-show-all').click(function(event){
    
    if(isShown===0){
        $(".hidden-fights").removeClass("hide-fights");
        $(".hidden-fights").addClass("shown-fights");
        isShown=1;
    } else{
        $(".hidden-fights").removeClass("shown-fights");
        $(".hidden-fights").addClass("hide-fights");
        isShown=0;
    }
})


