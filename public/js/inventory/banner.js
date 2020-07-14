function docReady(cb){
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(cb, 1);
    } else {
        document.addEventListener("DOMContentLoaded", cb);
    }
}

docReady(function(){
    let submit = document.getElementById('submit_btn');
    
    if (document.getElementById('bannerURL').value == ""){
        submit.disabled = true;
    }else{
        submit.disabled = false;
    }
})


function bannerUpload(id, upload, img, prodURL){
    $('#'+id).on('change', function () {
        let formdata = new FormData();
        let image = $("#"+id)[0].files[0];
        formdata.append(id, image);
        $.ajax({
            url: upload,
            type: 'POST',
            data: formdata,
            contentType: false,
            processData: false,
            'success': (data) => {
                $('#'+ img).attr('src', data.file);
                $('#'+ prodURL).attr('value', data.file);
                if (data.err) {
                    $('#prodErr').show();
                    $('#prodErr').text(data.err.message);
                } else {
                    $('#prodErr').hide();
                }
            }
        })
    });
}

bannerUpload('bannerUpload', '/banner/upload', 'banner_img', 'bannerURL');