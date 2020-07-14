function docReady(cb){
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(cb, 1);
    } else {
        document.addEventListener("DOMContentLoaded", cb);
    }
}

docReady(function(){
    let submit = document.getElementById('submit_btn');
    
    if (document.getElementById('prodURL1').value == ""){
        submit.disabled = true;
    }else{
        submit.disabled = false;
    }
})

$('#prodUpload').on('change', function () {
    let formdata = new FormData();
    let image0 = $("#prodUpload")[0].files[0];
    let image1 = $("#prodUpload")[0].files[1];
    let image2 = $("#prodUpload")[0].files[2];
    let image3 = $("#prodUpload")[0].files[3];
    formdata.append('prodUpload', image0);
    formdata.append('prodUpload', image1);
    formdata.append('prodUpload', image2);
    formdata.append('prodUpload', image3);
    $.ajax({
        url: '/inventory/upload',
        type: 'POST',
        data: formdata,
        contentType: false,
        processData: false,
        'success': (data) => {
            $('#prod1').attr('src', data.file0);
            $('#prod2').attr('src', data.file1);
            $('#prod3').attr('src', data.file2);
            $('#prod4').attr('src', data.file3);
            $('#prodURL1').attr('value', data.file0);
            $('#prodURL2').attr('value', data.file1);
            $('#prodURL3').attr('value', data.file2);
            $('#prodURL4').attr('value', data.file3);
            if (data.err) {
                $('#prodErr').show();
                $('#prodErr').text(data.err.message);
            } else {
                $('#prodErr').hide();
            }
        }
    })
});


function prodUpload(id, upload, img, prodURL){
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


prodUpload('prodUpload1', '/inventory/upload1', 'img1', 'prodURL1');
prodUpload('prodUpload2', '/inventory/upload2', 'img2', 'prodURL2');
prodUpload('prodUpload3', '/inventory/upload3', 'img3', 'prodURL3');
prodUpload('prodUpload4', '/inventory/upload4', 'img4', 'prodURL4');
prodUpload('bannerUpload', '/banner/upload', 'banner_img', 'bannerURL');


function remove_img(a){
    var img = document.getElementById('img'+a);
    var imgurl = document.getElementById('prodURL'+a)
    img.src = '/img/no-image.jpg';
    imgurl.value = '/img/no-image.jpg';
}


function formValidation(a){
    let submit = document.getElementById('submit_btn');

    if (document.getElementById(a).value <= 0){
        submit.disabled = true;
    }else{
        submit.disabled = false;
    }
}

