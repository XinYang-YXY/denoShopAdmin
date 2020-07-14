function docReady(cb){
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(cb, 1);
    } else {
        document.addEventListener("DOMContentLoaded", cb);
    }
}

docReady(function(){
    let submit = document.getElementById('submit_btn');

    if (document.getElementById('code_input').value == ""){
        submit.disabled = true;
    }
})

function codegen(){
    let code = Math.random().toString(36).substring(3);
    document.getElementById('code_input').value = code;
    document.getElementById('submit_btn').disabled = false;
}

function validation(a){
    let submit = document.getElementById('submit_btn');
    if (document.getElementById(a).value <= 0 || document.getElementById(a).value >= 100){
        submit.disabled = true;
    }else{
        submit.disabled = false;
    }
}
