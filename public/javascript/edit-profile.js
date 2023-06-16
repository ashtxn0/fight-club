const openButton = document.querySelector("[data-open-modal");
const closeButton = document.querySelector("[data-close-modal");
const modal = document.querySelector("[data-modal]");
let currentTheme="";

openButton.addEventListener("click",()=>{
    modal.showModal();
})

closeButton.addEventListener("click",()=>{
    modal.close();
})

$(".submit-profile-changes").on("click", function(event){
    event.preventDefault();
    let aboutMe=$(".about-me").val();
    let favFighter=$(".fav-fighter").val();
    let favOrg=$(".fav-org").val();

    $.ajax({
        url: "/ajaxEditProfile",
        method:"post",
        data: {
            username:username,
            aboutMe:aboutMe,
            favFighter:favFighter,
            favOrg: favOrg,
            currentTheme:currentTheme
        },
        success: function(res){
            closeButton.click();
            if (res.aboutMe != undefined){
                $(".profile-about").text(res.aboutMe);
            }
            if (res.favFighter != undefined){
                $(".fav-fighter-content").text(res.favFighter);
            }
            if (res.favOrg != undefined){
                $(".fav-org-content").text(res.favOrg);
            }


        }
    })
})
$(".profile-btn-small").on("click", function(event){
    console.log(event.currentTarget.id);
    let profileTheme=event.currentTarget.id;

    if(currentTheme.length){
        $(".title-text").removeClass(currentTheme+"-theme-profile-title");
    $(".username-text").removeClass(currentTheme+"-theme-profile-title");
    $(".profile-heading-container").removeClass(currentTheme+"-theme-profile-heading-container");
    $(".prediction-table td").removeClass(currentTheme+"-theme-profile-heading-container");
    $(".prediction-table th").removeClass(currentTheme+"-theme-profile-table-heading");
    $(".prediction-table-fight, .prediction-table-event, .prediction-table-predict,.profile-about,.profile-favs > h3 *,.profile-about,.profile-favs > h3").removeClass(currentTheme+"-theme-text");
    $(".prediction-rankings-table-heading").removeClass(currentTheme+"-theme-prediction-rankings-table-heading");
    $(".profile-btn").removeClass(currentTheme+"-theme-btn");
    $(".profile-page-container").removeClass(currentTheme+"-theme-profile-page-container");
    }

    $(".title-text").addClass(profileTheme+"-theme-profile-title");
    $(".username-text").addClass(profileTheme+"-theme-profile-title");
    $(".profile-heading-container").addClass(profileTheme+"-theme-profile-heading-container");
    $(".prediction-table th").addClass(profileTheme+"-theme-profile-table-heading");
    $(".prediction-rankings-table-heading").addClass(profileTheme+"-theme-prediction-rankings-table-heading");
    $(".profile-btn").addClass(profileTheme+"-theme-btn");
    $(".prediction-table th").addClass(profileTheme+"-theme-profile-table-heading");
    $(".prediction-table-fight, .prediction-table-event, .prediction-table-predict,.profile-about,.profile-favs > h3 *,.profile-about,.profile-favs > h3").addClass(profileTheme+"-theme-text");
    $(".prediction-table td").addClass(profileTheme+"-theme-profile-heading-container");
    $(".profile-page-container").addClass(profileTheme+"-theme-profile-page-container");
    currentTheme=profileTheme;
})