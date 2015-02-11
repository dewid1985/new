$(function () {

    $('#side-menu').metisMenu();

});

$(function () {
    $(window).bind("load resize", function () {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100;
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        height = (this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });
});

tinyMCE.init({
    mode: "textareas",
    language: 'ru',
    editor_selector: "Editor",
    plugins: ['media', 'image']
});

$('.form_datetime').datetimepicker({
    language: 'ru',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    forceParse: 0,
    showMeridian: 1
});

var getBaseUrl = function () {
    return 'http://' + location.host + '/';
};

$('#relatedToArticle').bind('click', function () {
    var selectedRubric = $("#rubricName option:selected");
    var selectedDivRubric = $("#rubric");
    var countRubricDiv = document.getElementById('rubric').children.length;
    if (countRubricDiv > 6) {
        return alert('Превышенно кол-во рубрик для статьи');
    }
    if (undefined === $("#" + selectedRubric.attr('data-id')).attr('id')) {
        selectedDivRubric.append('<button type="button" style="margin-right: 3px" '
            + 'class="btn btn-success btn-xs" onclick="deleteArticleRubric('
            + selectedRubric.attr('data-id') +
            ')" id="'
            + selectedRubric.attr('data-id') +
            '">' + $.trim(selectedRubric.text()) + ' &times;</button>');
        selectedDivRubric.append('<input id="rubric_'
            + selectedRubric.attr("data-id") +
            '" hidden value="'
            + selectedRubric.attr("data-id") +
            '" name="rubric_' + getId(countRubricDiv) + '"/>');
    } else {
        return alert('Статья уже привязанна к данной рубрике');
    }
});

var getId = function (countRubricDiv) {
    if ($('form :input[name="rubric_1"]').length == 0)
        return 1;
    countRubricDiv = countRubricDiv / 2;
    if ($('form :input[name="rubric_' + Math.ceil(countRubricDiv) + '"]').length == 0)
        return countRubricDiv;
    return getId(countRubricDiv + 2);
};

var deleteArticleRubric = function (idRubric) {
    $("#" + idRubric.id).remove();
    $("#rubric_" + idRubric.id).remove();
};

var getRubrics = function () {
    $('option', $("#rubricName")).remove();
    $.getJSON(getBaseUrl() + 'rubrics/get', function (data) {
        $.each(data.rubric, function (id, name) {
            $('#rubricName').append('<option data-id="' + id + '">' + name + '</option>');
        });
    });
};

if ($('#articlesRubrics').length != 0) {
    $.getJSON(getBaseUrl() + 'rubrics/get', function (data) {
        console.log(data);
    })
}

/**articles**/
/**********************************************************************************************************************/
var articles = $('#articles').dataTable(
    {
        "language": {
            "url": "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Russian.json"
        },
        "bFilter": false,
        "processing": true,
        "serverSide": true,
        "bSort": false,
        "ajax": {
            "url": "list",
            "data": function (requestDataModifiedGET) {
                delete requestDataModifiedGET.columns;
                delete requestDataModifiedGET.order;
                requestDataModifiedGET.title = $('#title').val();
                requestDataModifiedGET.anons = $('#anons').val();
                requestDataModifiedGET.text = $('#text').val();
                requestDataModifiedGET.of_created_at = $('#of_created_at').val();
                requestDataModifiedGET.to_created_at = $('#to_created_at').val();
                requestDataModifiedGET.of_modified_at = $('#of_modified_at').val();
                requestDataModifiedGET.to_modified_at = $('#to_modified_at').val();
                requestDataModifiedGET.to_published_at = $('#to_published_at').val();
                requestDataModifiedGET.of_published_at = $('#of_published_at').val();
            }
        },
        "columns": [
            { "data": "id" },
            { "data": "title" },
            { "data": "author" },
            { "data": "created_at" },
            { "data": "modified_at" },
            { "data": "published_at" },
            { "data": null,
                "class": "center",
                "defaultContent": "<button class='btn btn-info btn-circle' type='button'><i class='fa fa-edit'></i></button>"
            }
        ]
    }
);

$('#articles tbody').on('click', 'tr', function () {
    $(this).toggleClass('selected');
});


$('#articles tbody').on('click', 'button', function () {
    var url = document.location.href + 'get/' + articles.api().row($(this).parents('tr')).data().id;
    $(location).attr("href", url);

});

var reloadArticlesDataAjax = function () {
   articles.api().ajax.reload()
};

/**news**/
/**********************************************************************************************************************/
var news = $('#news').dataTable(
    {
        "language": {
            "url": "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Russian.json"
        },
        "bFilter": false,
        "processing": true,
        "serverSide": true,
        "bSort": false,
        "ajax": {
            "url": "list",
            "data": function (requestDataModifiedGET) {
                delete requestDataModifiedGET.columns;
                delete requestDataModifiedGET.order;
                requestDataModifiedGET.title = $('#title').val();
                requestDataModifiedGET.anons = $('#anons').val();
                requestDataModifiedGET.text = $('#text').val();
                requestDataModifiedGET.of_created_at = $('#of_created_at').val();
                requestDataModifiedGET.to_created_at = $('#to_created_at').val();
                requestDataModifiedGET.of_modified_at = $('#of_modified_at').val();
                requestDataModifiedGET.to_modified_at = $('#to_modified_at').val();
                requestDataModifiedGET.to_published_at = $('#to_published_at').val();
                requestDataModifiedGET.of_published_at = $('#of_published_at').val();
            }
        },
        "columns": [
            { "data": "id" },
            { "data": "title" },
            { "data": "created_at" },
            { "data": "modified_at" },
            { "data": "published_at" },
            { "data": null,
                "class": "center",
                "defaultContent": "<button class='btn btn-info btn-circle' type='button'><i class='fa fa-edit'></i></button>"
            }
        ]
    }
);

$('#news tbody').on('click', 'tr', function () {
    $(this).toggleClass('selected');
});


$('#news tbody').on('click', 'button', function () {
    var url = document.location.href + 'get/' + news.api().row($(this).parents('tr')).data().id;
    $(location).attr("href", url);

});

var reloadNewsDataAjax = function () {
   news.api().ajax.reload()
};


