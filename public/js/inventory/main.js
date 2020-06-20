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


$('#prodUpload1').on('change', function () {
    let formdata = new FormData();
    let image = $("#prodUpload1")[0].files[0];
    formdata.append('prodUpload1', image);
    $.ajax({
        url: '/inventory/upload1',
        type: 'POST',
        data: formdata,
        contentType: false,
        processData: false,
        'success': (data) => {
            $('#img1').attr('src', data.file);
            $('#prodURL1').attr('value', data.file);
            if (data.err) {
                $('#prodErr').show();
                $('#prodErr').text(data.err.message);
            } else {
                $('#prodErr').hide();
            }
        }
    })
});

$('#prodUpload2').on('change', function () {
    let formdata = new FormData();
    let image = $("#prodUpload2")[0].files[0];
    formdata.append('prodUpload2', image);
    $.ajax({
        url: '/inventory/upload2',
        type: 'POST',
        data: formdata,
        contentType: false,
        processData: false,
        'success': (data) => {
            $('#img2').attr('src', data.file);
            $('#prodURL2').attr('value', data.file);
            if (data.err) {
                $('#prodErr').show();
                $('#prodErr').text(data.err.message);
            } else {
                $('#prodErr').hide();
            }
        }
    })
});

$('#prodUpload3').on('change', function () {
    let formdata = new FormData();
    let image = $("#prodUpload3")[0].files[0];
    formdata.append('prodUpload3', image);
    $.ajax({
        url: '/inventory/upload3',
        type: 'POST',
        data: formdata,
        contentType: false,
        processData: false,
        'success': (data) => {
            $('#img3').attr('src', data.file);
            $('#prodURL3').attr('value', data.file);
            if (data.err) {
                $('#prodErr').show();
                $('#prodErr').text(data.err.message);
            } else {
                $('#prodErr').hide();
            }
        }
    })
});

$('#prodUpload4').on('change', function () {
    let formdata = new FormData();
    let image = $("#prodUpload4")[0].files[0];
    formdata.append('prodUpload4', image);
    $.ajax({
        url: '/inventory/upload4',
        type: 'POST',
        data: formdata,
        contentType: false,
        processData: false,
        'success': (data) => {
            $('#img4').attr('src', data.file);
            $('#prodURL4').attr('value', data.file);
            if (data.err) {
                $('#prodErr').show();
                $('#prodErr').text(data.err.message);
            } else {
                $('#prodErr').hide();
            }
        }
    })
});


function remove_img(a){
    var img = document.getElementById('img'+a);
    var imgurl = document.getElementById('prodURL'+a)
    img.src = '/img/no-image.jpg';
    imgurl.value = '/img/no-image.jpg';
}

