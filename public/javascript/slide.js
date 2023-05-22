$('.fighter-page-slide-out').toggle('slide');

let isOpen= 0;

$('.fighter-name').click(function(event){
    console.log(this.innerHTML);
    $('.fighter-page-slide-out').css('visibility', 'visible');
    if (isOpen===0){
        $('.fighter-page-slide-out').slideToggle();
        $('.fighter-page-slide-out').prepend("<div class='event-fighter-heading'> <img src='/image/dustin.jpg' alt='fighter picture'> <h2>Dustin Poirier</h2> <h4>(29-0)</h4> </div> <div class='event-fighter-info'> <p>Age: 35</p> <p>Height: 5'11</p> <p>Weight Class: Lightweight</p> </div> <div class='event-fight-history panel'> <h2 class='title-text'>Fight History</h2> <div class='event-fight-history-row'> <h3>Opponent</h3> <h3>Outcome</h3> <h3>Tape Index</h3> <h3>Date</h3> </div> <div class='panel event-fight-history-row'> <div class='event-fight-history-col'> <a href=''>Michael Chandler</a> </div> <div class='event-fight-history-col'> <p>Win by R3 Rear Naked Choke</p> <p>UFC 281: Adesanya vs. Poirier</p> </div> <a>Premium</a> <p>11/12/2022</p> </div> <div class='panel event-fight-history-row'> <div class='event-fight-history-col'> <a href=''>Michael Chandler</a> </div> <div class='event-fight-history-col'> <p>Win by R3 Rear Naked Choke</p> <p>UFC 281: Adesanya vs. Poirier</p> </div> <a>Premium</a> <p>11/12/2022</p> </div> <div class='panel event-fight-history-row'> <div class='event-fight-history-col'> <a href=''>Michael Chandler</a> </div> <div class='event-fight-history-col'> <p>Win by R3 Rear Naked Choke</p> <p>UFC 281: Adesanya vs. Poirier</p> </div> <a>Premium</a> <p>11/12/2022</p> </div> <div class='panel event-fight-history-row'> <div class='event-fight-history-col'> <a href=''>Michael Chandler</a> </div> <div class='event-fight-history-col'> <p>Win by R3 Rear Naked Choke</p> <p>UFC 281: Adesanya vs. Poirier</p> </div> <a>Premium</a> <p>11/12/2022</p> </div> <div class='panel event-fight-history-row'> <div class='event-fight-history-col'> <a href=''>Michael Chandler</a> </div> <div class='event-fight-history-col'> <p>Win by R3 Rear Naked Choke</p> <p>UFC 281: Adesanya vs. Poirier</p> </div> <a>Premium</a> <p>11/12/2022</p> </div> <div class='panel event-fight-history-row'> <div class='event-fight-history-col'> <a href=''>Michael Chandler</a> </div> <div class='event-fight-history-col'> <p>Win by R3 Rear Naked Choke</p> <p>UFC 281: Adesanya vs. Poirier</p> </div> <a>Premium</a> <p>11/12/2022</p> </div>");
        //code to add the html
        $('.close').css('visibility', 'visible');
        isOpen=1;
    } else{
        $('.fighter-page-slide-out').slideToggle();
        $('.fighter-page-slide-out *').remove();
        isOpen=0;
    }

})

$('.close').click(function(event){
    $('.fighter-page-slide-out').slideToggle();
        $('.fighter-page-slide-out *').remove();
        $('.close').css('visibility', 'hidden');
        isOpen=0;
})