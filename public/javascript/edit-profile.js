const openButton = document.querySelector("[data-open-modal");
const closeButton = document.querySelector("[data-close-modal");
const modal = document.querySelector("[data-modal]");
const pofileImageInput = document.getElementById("file-input");
const coverImageInput = document.getElementById("cover-img-upload");
let currentTheme="";

openButton.addEventListener("click",()=>{
    modal.showModal();
})

closeButton.addEventListener("click",()=>{
    modal.close();
})


$(".profile-page-picture").on("mouseover", function(e){
    $(".image-upload").css("display","block");
})

$(".profile-page-picture").on("mouseout", function(e){
    $(".image-upload").css("display","none");
})

$("#cover-img-upload").on("change", function(event){
    const file = event.target.files[0];
    const userID=event.target.classList[0];
    const formData = new FormData();
    formData.append("file",file);
    formData.append("userID",userID);
    formData.append("action","update cover image");
    if(!file){
        return; 
    }
    $.ajax({
        url: "/ajaxEditProfile",
        method:"post",
        data:formData,
        contentType:false,
        processData: false,
        success: function(res){
            console.log("File uploaded successfully",res);
            location.reload();
        },
        error: function(error){
            console.error("Error uploading file:", error);
        }
    })

})

$("#file-input").on("change", function(event){
    const file = event.target.files[0];
    const userID=event.target.classList[0];
    const formData = new FormData();
    formData.append("file",file);
    formData.append("userID",userID);
    formData.append("action","update profile image");
    if(!file){
        return;
    }
    $.ajax({
        url: "/ajaxEditProfile",
        method:"post",
        data:formData,
        contentType:false,
        processData: false,
        success: function(res){
            console.log("File uploaded successfully",res);
            location.reload();
        },
        error: function(error){
            console.error("Error uploading file:", error);
        }
    })

})

$(".submit-profile-changes").on("click", function(event){
    event.preventDefault();
    let aboutMe=$(".about-me").val();
    let favFighter=$(".fav-fighter").val();
    let favOrg=$(".fav-org").val();
    const file=$("#mobile-file-input").prop("files");
    const formData = new FormData();
        formData.append("username",username);
        formData.append("action","update profile");
        formData.append("currentTheme",currentTheme);
        formData.append("favOrg",favOrg);
        formData.append("favFighter",favFighter);
        formData.append("aboutMe",aboutMe);
    if(file){
            formData.append("file",file[0]);
    } 
    

    $.ajax({
        url: "/ajaxEditProfile",
        method:"post",
        data:formData,
        contentType:false,
        processData: false,
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

    if(theme.length){
        $(".title-text").removeClass(theme+"-theme-profile-title");
    $(".username-text").removeClass(theme+"-theme-profile-title");
    $(".profile-heading-container").removeClass(theme+"-theme-profile-heading-container");
    $(".prediction-table td:not(.prediction-table-result)").removeClass(theme+"-theme-profile-heading-container");
    $(".prediction-table th").removeClass(theme+"-theme-profile-table-heading");
    $(".prediction-table-fight, .prediction-table-event, .prediction-table-predict,.profile-about,.profile-favs > h3 *,.profile-about,.profile-favs > h3, .prediction-rankings-title p,.prediction-table-result,.prediction-rankings-subtext").removeClass(theme+"-theme-text");
    $(".prediction-rankings-table-heading,.prediction-rankings-subtext-heading").removeClass(theme+"-theme-prediction-rankings-table-heading");
    $(".profile-btn").removeClass(theme+"-theme-btn");
    $(".profile-page-container").removeClass(theme+"-theme-profile-page-container");

    theme="";
    } else if(currentTheme.length){
        $(".title-text").removeClass(currentTheme+"-theme-profile-title");
        $(".username-text").removeClass(currentTheme+"-theme-profile-title");
        $(".profile-heading-container").removeClass(currentTheme+"-theme-profile-heading-container");
        $(".prediction-table td:not(.prediction-table-result)").removeClass(currentTheme+"-theme-profile-heading-container");
        $(".prediction-table th").removeClass(currentTheme+"-theme-profile-table-heading");
        $(".prediction-table-fight, .prediction-table-event, .prediction-table-predict,.profile-about,.profile-favs > h3 *,.profile-about,.profile-favs > h3,.prediction-rankings-title > *,.prediction-rankings-subtext,.prediction-table-result").removeClass(currentTheme+"-theme-text");
        $(".prediction-rankings-table-heading,.prediction-rankings-subtext-heading").removeClass(currentTheme+"-theme-prediction-rankings-table-heading");
        $(".profile-btn").removeClass(currentTheme+"-theme-btn");
        $(".profile-page-container").removeClass(currentTheme+"-theme-profile-page-container");
    }

    $(".title-text").addClass(profileTheme+"-theme-profile-title");
    $(".username-text").addClass(profileTheme+"-theme-profile-title");
    $(".profile-heading-container").addClass(profileTheme+"-theme-profile-heading-container");
    $(".prediction-table th").addClass(profileTheme+"-theme-profile-table-heading");
    $(".prediction-rankings-table-heading,.prediction-rankings-subtext-heading").addClass(profileTheme+"-theme-prediction-rankings-table-heading");
    $(".profile-btn").addClass(profileTheme+"-theme-btn");
    $(".prediction-table th").addClass(profileTheme+"-theme-profile-table-heading");
    $(".prediction-table-fight, .prediction-table-event, .prediction-table-predict,.profile-about,.profile-favs > h3 *,.profile-about,.profile-favs > h3,.prediction-rankings-title > *,.prediction-table-result,.prediction-rankings-subtext").addClass(profileTheme+"-theme-text");
    $(".prediction-table td:not(.prediction-table-result)").addClass(profileTheme+"-theme-profile-heading-container");
    $(".profile-page-container").addClass(profileTheme+"-theme-profile-page-container");
    currentTheme=profileTheme;

})