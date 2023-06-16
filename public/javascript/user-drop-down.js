
function userDropDown() {
    document.getElementById("userDropDown").classList.toggle("user-drop-down-show");
  }

  window.onclick=function(event){
    if(!event.target.matches(".user-drop-content") && !event.target.matches(".drop-down-img") && !event.target.matches(".user-drop-content > *")){
        if(document.getElementById("userDropDown").classList.contains("user-drop-down-show")){
            document.getElementById("userDropDown").classList.remove("user-drop-down-show");
        }
    }
  }