if (window.location.pathname.includes("event") || window.location.pathname.includes("events")){
    $(".events-task").addClass("current-task");
} else if(window.location.pathname.includes("login") || window.location.pathname.includes("signup")){
    $(".login-task").addClass("current-task");
}