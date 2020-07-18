$(document).ready(function () {
    var table = $('#inventory_table').DataTable({
        // "columnDefs": [
        //     { "orderable": false, "targets": [1, 6, 8] }
        // ],
        "dom": "<'row'<'col-sm-12 col-md-6' B>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row mt-5'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>" +
            "<'row'<'col-sm-12 col-md-12 mt-10' i>>",
        "buttons": [{
            "extend": "print",
            "text": "Print/Save as PDF",
            "exportOptions": {
                "stripHtml": false,
                "columns": [0, 1, 2, 3, 4, 5, 6, 7]
            }
        }],
        "columns": [
            null,
            { "orderable": false },
            null,
            null,
            null,
            null,
            { "orderable": false },
            null,
            { "orderable": false }
        ]
    });
    $('#search').on('keyup', function () {
        table.search(this.value).draw();
    });

    var banner_table = $('#banner_table').DataTable({
        "dom":"<'row'<'col-sm-12'tr>>" +
            "<'row mt-5'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>" +
            "<'row'<'col-sm-12 col-md-12 mt-10' i>>",
        "columns": [
            null,
            { "orderable": false },
            null,
            null,
            null,
            { "orderable": false }
        ]
    });
    $('#banner_search').on('keyup', function () {
        banner_table.search(this.value).draw();
    });

    var category_table = $('#category_table').DataTable({
        "dom":"<'row'<'col-sm-12'tr>>" +
            "<'row mt-5'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>" +
            "<'row'<'col-sm-12 col-md-12 mt-10' i>>",
        "columns": [
            null,
            null,
            { "orderable": false }
        ]
    });
    $('#category_search').on('keyup', function () {
        category_table.search(this.value).draw();
    });

    var codes_table = $('#codes_table').DataTable({
        "dom":"<'row'<'col-sm-12'tr>>" +
            "<'row mt-5'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>" +
            "<'row'<'col-sm-12 col-md-12 mt-10' i>>",
        "columns": [
            null,
            null,
            null,
            null,
            { "orderable": false }
        ]
    });
    $('#codes_search').on('keyup', function () {
        codes_table.search(this.value).draw();
    });
});



// "render": function (data, type, row) {
//     return type === 'display' && data.length > 10 ?
//         data.substr(0, 30) + '…' : 
//         data;
// }