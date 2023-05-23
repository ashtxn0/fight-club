
    $('.fighter-page-slide-out').toggle('slide');
    let isOpen= 0;

$('.fighter-name').click(function(event){
    let LName= (this.innerHTML).split(" ")[1];
    let FName= (this.innerHTML).split(" ")[0];
    
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
        }, 390);
        isOpen=0;
    }

})


$('.close').click(function(event){
    $('.fighter-page-slide-out').slideToggle();
    setTimeout(function(){
        $('.fighter-prof').removeClass('shown');
        $('.fighter-prof').addClass('hidden');
        $('.close').css('visibility', 'hidden');
    }, 390);
     isOpen=0;
})

