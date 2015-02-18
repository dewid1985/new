$(function () {
    $('#side-menu').metisMenu();
});

$.fn.exists = function () {
    return $(this).length;
};

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
        + 'class="btn btn-default btn-xs" onclick="deleteArticleRubric('
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
    $.getJSON(getBaseUrl() + 'rubrics/get', function (json) {
        $.each(json.data, function (id, name) {
            $('#rubricName').append('<option data-id="' + id + '">' + name + '</option>');
        });
    });
};


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
            {"data": "id"},
            {"data": "title"},
            {"data": "author"},
            {"data": "created_at"},
            {"data": "modified_at"},
            {"data": "published_at"},
            {
                "data": null,
                "class": "center",
                "defaultContent": "<button class='btn btn-default btn-circle' type='button'><i class='glyphicon glyphicon-pencil'></i></button>"
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
            {"data": "id"},
            {"data": "title"},
            {"data": "created_at"},
            {"data": "modified_at"},
            {"data": "published_at"},
            {
                "data": null,
                "class": "center",
                "defaultContent": "<button class='btn btn-default btn-circle' type='button'><i class='glyphicon glyphicon-pencil'></i></button>"
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

/**********************************************************************************************************************/

var Rubric = {
    add: function () {
        $("div[data-id='error']").empty()
        $.ajax({
            type: "POST",
            url: 'add/json',
            data: $('#rubric').serialize(),
            error: function () {
                Rubric.setMessageTpl($().technomedia.totalRubricError)
            },
            beforeSend: function () {
                $('#loading').modal('show');
            },
            complete: function () {
                Rubric.rubricListData.api().ajax.reload();
                Rubric.setRubric();
                Rubric.resetFormRubric();
                $('#loading').modal('hide');
            },
            success: function (data) {
                try {
                    data = $.parseJSON(data);
                    if (false === data.success) {
                        Rubric.setWarningTpl(data.errors);
                    } else {
                        Rubric.setMessageTpl($().technomedia.saveRubricOk)
                    }
                } catch (e) {
                    Rubric.setMessageTpl($().technomedia.totalRubricError)
                }
            }
        });

    },
    setWarningTpl: function (error) {
        $.each(error, function (k, v) {
            $('#' + k + '_warning').append(
                "<div class='alert alert-warning alert-dismissible fade in' role='alert'>" +
                "<button class='close' type='button' data-dismiss='alert' aria-label='Close'>" +
                "<span aria-hidden='true'>×</span>" +
                "</button>" +
                "<strong>" + $().technomedia.totalRubricError + "</strong> " + v +
                "</div>"
            );
        })
    },
    setMessageTpl: function (message) {
        $('#message').empty();
        $('#message').html(message);
        $('#messageModal').modal('show');
    },
    setRubric: function () {

        $.getJSON(getBaseUrl() + 'rubrics/get', function (json) {
            $('option', $("#parent")).remove();
            $.each(json.data, function (id, name) {
                $('#parent').append('<option data-id="' + id + '">' + name + '</option>');
            })
        })
    },
    resetFormRubric: function () {
        $('#rubric')[0].reset();
        $('#parent option:selected').each(function () {
            this.selected = false;
        });

    },
    addRubricsClick: $('#addRubric').click(function () {
        if ($('#rubric_id').val() == "") {
            $('#messageDialog').html($().technomedia.saveRubricDialogMessage);
            $('#messageDialogModal').modal("show");
        } else {
            $('#messageDialog').html($().technomedia.updateRubricDialogMessage);
            $('#messageDialogModal').modal("show");
        }
    }),
    rubricListData: $('#rubrics').dataTable(
        {
            "language": {
                "url": "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Russian.json"
            },
            "bFilter": false,
            "processing": true,
            "serverSide": true,
            "bSort": false,
            "ajax": {
                "url": "getlist",
                "data": function (requestDataModifiedGET) {
                    delete requestDataModifiedGET.columns;
                    delete requestDataModifiedGET.order;
                }
            },
            "columns": [
                {"data": "id"},
                {"data": "short_name"},
                {"data": "path"},
                {"data": "description"},
                {"data": "created_at"},
                {"data": "modified_at"}
            ]
        }
    ),
    selectedRubric: $('#rubrics tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            Rubric.rubricListData.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    }),
    getRubric: $('#getRubric').click(function () {
        if (!Rubric.rubricListData.api().row('.selected').length)
            return Rubric.setMessageTpl($().technomedia.selectedRubric);
        RubricId = Rubric.rubricListData.api().row('.selected').data().id;
        Rubric.resetFormRubric();
        $.getJSON(getBaseUrl() + 'rubrics/get/' + RubricId, function (json) {
            if (json.success == false)
                return Rubric.setMessageTpl($().technomedia.totalRubricError);

            $.each(json.data, function (field, value) {
                if (field === 'parent') {
                    $("#parent [data-id='" + value + "']").attr('selected', true);
                } else {
                    $('#' + field).val(value);
                }
            });
        });
        $('body,html').animate({scrollTop: 0}, 500);
    }),
    saveRubric: $('#saveRubric').click(function () {
        Rubric.add();
    }),
    clearForm: $('#clearForm').click(function () {
        Rubric.resetFormRubric();
    })

};

if ($('#parent').exists()) Rubric.setRubric();

