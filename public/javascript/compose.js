let mainCount=0;
let prelimCount=0;

function newMainCardFight(){
    


    $(".main-fight-"+mainCount).after("<div class='panel compose-constructor main-fight-"+(mainCount+1)+"'><h4>fight #"+(mainCount+2)+"</h4><input type='text' name='mainFighter1Name' class='form-control' placeholder='Enter name of fighter 1'><input type='text' name='mainFighter2Name' class='form-control' placeholder='Enter the name of fighter 2'><input type='text' name='mainWeightClass' class='form-control' placeholder='Enter the weightclass'>        </div>");
    mainCount++;
}

function newPrelimFight(){
    


    $(".prelim-fight-"+prelimCount).after("<div class='panel compose-constructor prelim-fight-"+(prelimCount+1)+"'><h4>fight #"+(prelimCount+2)+"</h4><input type='text' name='prelimFighter1Name' class='form-control' placeholder='Enter name of fighter 1'><input type='text' name='prelimFighter2Name' class='form-control' placeholder='Enter the name of fighter 2'><input type='text' name='prelimWeightClass' class='form-control' placeholder='Enter the weightclass'>        </div>");
    prelimCount++;
}
