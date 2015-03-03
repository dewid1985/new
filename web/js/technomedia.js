$(function () {
    $('#side-menu').metisMenu({
        //toggle: false
    });
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

//var deleteArticleRubric = function (idRubric) {
//    $("#" + idRubric.id).remove();
//    $("#rubric_" + idRubric.id).remove();
//};

//$('#get_rubrics').click(function () {
//    $('option', $("#rubricName")).remove();
//    $.getJSON(getBaseUrl() + 'rubrics/get', function (json) {
//        $.each(json.data, function (id, name) {
//            $('#rubricName').append('<option data-id="' + id + '">' + name + '</option>');
//        });
//    });
//});


/**articles**/
/**********************************************************************************************************************/

var Articles = {
    url: getBaseUrl() + 'articles/',
    table: $('#articles').dataTable(
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
                    "defaultContent": "<button class='btn btn-default btn-circle' type='button'>" +
                    "<i class='glyphicon glyphicon-pencil'></i>" +
                    "</button>"
                }
            ]
        }
    ),
    init: function () {
        $('#articles tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');
        });

        $('#articles tbody').on('click', 'button', function () {
            localStorage.setItem('articleId', Articles.table.api().row($(this).parents('tr')).data().id);
            $(location).attr('href', Articles.url + 'editor');
        });

        $('#article_save').click(function () {
            $(':button,  :input, #article_save').attr('disabled', true);
            tinyMCE.get('text').getBody().setAttribute('contenteditable', false);
            Articles.saveDialog($().technomedia.saveArticleDialog);
        });

        $('#search_article').click(function () {
            Articles.reloadTable();
        });

        if (!!localStorage.getItem('articleId'))
            this.get();
    },
    reloadTable: function () {
        this.table.api().ajax.reload();
    },
    get: function () {
        var articleId = localStorage.getItem('articleId');
        localStorage.removeItem('articleId');
        $.ajax({
            type: "post",
            url: Articles.url + 'get/' + articleId + '/json',
            error: function () {
                Articles.setMessageTpl($().technomedia.totalError)
            },
            beforeSend: function () {
                $('#loading').modal('show');
            },
            complete: function () {
                $('#loading').modal('hide');
            },
            success: function (json) {
                json = $.parseJSON(json);
                tinymce.get('text').setContent(json.data.text);
                $.each(json.data, function (k, v) {
                    if (k == 'rubrics') {
                        Articles.setRubricsTpl(v);
                    } else {
                        $('#' + k).val(v);
                    }
                })
            }
        });
    },
    add: function () {
        $.noty.closeAll();
        $(':button,  :input, #article_save').attr('disabled', false);
        tinyMCE.get('text').getBody().setAttribute('contenteditable', true);
        $.ajax({
            type: "post",
            url: Articles.url + 'add/json',
            data: $('#article').serialize() + '&text=' + tinyMCE.get('text').getContent(),
            error: function () {
                Articles.setMessageTpl($().technomedia.totalError)
            },
            beforeSend: function () {
                $('#loading').modal('show');
            },
            complete: function () {
                $('#loading').modal('hide');
            },
            success: function (data) {
                data = $.parseJSON(data);
                if (false === data.success) {
                    Articles.setErrorForm(data.errors);
                } else {
                    $(':button,  :input, #article_save').attr('disabled', true);
                    tinyMCE.get('text').getBody().setAttribute('contenteditable', false);
                    Articles.addArticlesMessageOk();
                }
            }
        });

    },
    setErrorForm: function (errors) {
        $.noty.closeAll();
        $.each(errors, function (k, v) {
            $('#' + k + '_warning').noty({
                text: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + v,
                type: 'warning',
                dismissQueue: true,
                layout: 'topCenter',
                theme: 'defaultTheme',
                maxVisible: 30
            });
        })
    },
    saveDialog: function (message) {
        noty({
            text: message,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-primary',
                    text: $().technomedia.btnSaveOk,
                    onClick: function (noty) {
                        noty.close();
                        Articles.add();
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.btnSaveCancel,
                    onClick: function (noty) {
                        noty.close();
                        $(':button,  :input, #article_save').attr('disabled', false);
                        tinyMCE.get('text').getBody().setAttribute('contenteditable', true);
                    }
                }
            ]
        });
    },
    addArticlesMessageOk: function () {
        noty({
            text: $().technomedia.addArticlesMessageOk,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-primary',
                    text: $().technomedia.addArticlesMessageOkBtnList,
                    onClick: function () {
                        $(location).attr("href", Articles.url);
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.addArticlesMessageOkBtnNew,
                    onClick: function () {
                        $(location).attr("href", Articles.url + 'editor');
                    }
                }
            ]
        });
    },
    setMessageTpl: function (message) {
        noty({
            text: message,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.btnClose,
                    onClick: function (noty) {
                        noty.close();
                    }
                }
            ]
        });
    },
    setRubricsTpl: function (rubrics) {
        var selectedDivRubric = $("#rubric");
        $.each(rubrics, function (k, v) {
            selectedDivRubric.append(
                '<button data-id="' + v.name + '" class="btn btn-default btn-xs" style="margin-right: 3px" type="button">' + v.short_name + ' ×</button>' +
                '<input id="rubric_' + v.name + '" hidden=""  data-id="' + v.name+'" name="' + k + '" value="' + v.name + '">'
            );
        });
    }
};


/**news**/
/**********************************************************************************************************************/

var News = {
    url: getBaseUrl() + 'news/',
    table: $('#news').dataTable(
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
                    "defaultContent": "<button class='btn btn-default btn-circle' type='button'>" +
                    "<i class='glyphicon glyphicon-pencil'></i>" +
                    "</button>"
                }
            ]
        }
    ), init: function () {
        $('#news tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');
        });

        $('#news tbody').on('click', 'button', function () {
            localStorage.setItem('newsId', News.table.api().row($(this).parents('tr')).data().id);
            $(location).attr('href', News.url + 'editor');
        });

        $('#noun_save').click(function () {
            $(':button,  :input, #noun_save').attr('disabled', true);
            tinyMCE.get('text').getBody().setAttribute('contenteditable', false);
            News.saveDialog($().technomedia.saveNewsDialog);
        });

        $('#search_news').click(function () {
            News.reloadTable();
        });

        if (!!localStorage.getItem('newsId'))
            this.get();
    },
    reloadTable: function () {
        this.table.api().ajax.reload();
    },
    get: function () {
        var newsId = localStorage.getItem('newsId');
        localStorage.removeItem('newsId');
        $.ajax({
            type: "post",
            url: News.url + 'get/' + newsId + '/json',
            error: function () {
                News.setMessageTpl($().technomedia.totalError)
            },
            beforeSend: function () {
                $('#loading').modal('show');
            },
            complete: function () {
                localStorage.removeItem('newsId');
                $('#loading').modal('hide');
            },
            success: function (json) {
                json = $.parseJSON(json);
                console.log(json);
                tinymce.get('text').setContent(json.data.text);
                $.each(json.data, function (k, v) {
                    if (k == 'rubrics') {
                        News.setRubricsTpl(v);
                    } else {
                        $('#' + k).val(v);
                    }
                })
            }
        });
    },
    add: function () {
        $(':button,  :input, #noun_save').attr('disabled', false);
        tinyMCE.get('text').getBody().setAttribute('contenteditable', true);
        $.ajax({
            type: "post",
            url: News.url + 'add/json',
            data: $('#noun').serialize() + '&text=' + tinyMCE.get('text').getContent(),
            error: function () {
                News.setMessageTpl($().technomedia.totalError)
            },
            beforeSend: function () {
                $('#loading').modal('show');
            },
            complete: function () {
                $('#loading').modal('hide');
            },
            success: function (data) {
                data = $.parseJSON(data);
                if (false === data.success) {
                    $(":button, #noun_save").attr('disabled', false);
                    News.setErrorForm(data.errors);
                } else {
                    $(':button,  :input, #noun_save').attr('disabled', true);
                    tinyMCE.get('text').getBody().setAttribute('contenteditable', false);
                    News.addNewsMessageOk();
                }
            }
        });
    },
    setErrorForm: function (errors) {
        $.noty.closeAll();
        $.each(errors, function (k, v) {
            $('#' + k + '_warning').noty({
                text: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + v,
                type: 'warning',
                dismissQueue: true,
                layout: 'topCenter',
                theme: 'defaultTheme',
                maxVisible: 30
            });
        })
    },
    saveDialog: function (message) {
        noty({
            text: message,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-primary',
                    text: $().technomedia.btnSaveOk,
                    onClick: function (noty) {
                        noty.close();
                        News.add();
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.btnSaveCancel,
                    onClick: function (noty) {
                        noty.close();
                        $(':button,  :input, #noun_save').attr('disabled', false);
                        tinyMCE.get('text').getBody().setAttribute('contenteditable', true);
                    }
                }
            ]
        });
    },
    addNewsMessageOk: function () {
        noty({
            text: $().technomedia.addNewsMessageOk,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-primary',
                    text: $().technomedia.addNewsMessageOkBtnList,
                    onClick: function () {
                        $(location).attr("href", News.url);
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.addNewsMessageOkBtnNew,
                    onClick: function () {
                        $(location).attr("href", News.url + 'editor');
                    }
                }
            ]
        });
    },
    setMessageTpl: function (message) {
        noty({
            text: message,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.btnClose,
                    onClick: function (noty) {
                        noty.close();
                    }
                }
            ]
        });
    },
    setRubricsTpl: function (rubrics) {
        var selectedDivRubric = $("#rubric");
        $.each(rubrics, function (k, v) {
            selectedDivRubric.append(
                '<button data-id="' + v.name + '" class="btn btn-default btn-xs" style="margin-right: 3px" type="button">' + v.short_name + ' ×</button>' +
                '<input id="rubric_' + v.name + '" hidden=""  data-id="' + v.name+'" name="' + k + '" value="' + v.name + '">'
            );
        });
    }
};

/**********************************************************************************************************************/
var Rubric = {
    table: $('#rubrics').dataTable(
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
                {"data": "modified_at"},
                {
                    "data": null,
                    "class": "center",
                    "defaultContent": "<button class='btn btn-default btn-circle' type='button'>" +
                    "<i class='glyphicon glyphicon-pencil'></i>" +
                    "</button>"
                }
            ]
        }
    ),
    init: function () {
        $("#rubric-row").hide();

        $('#addRubric').click(function () {
            $(':button,  :input, #addRubric').attr('disabled', true);
            Rubric.setMessageSave($().technomedia.saveRubricDialogMessage);
        });

        $('#clearForm').click(function () {
            $.noty.closeAll();
            Rubric.clear();
        });

        $('#rubrics tbody').on('click', 'tr', function () {

            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            }
            else {
                Rubric.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
        });

        $('#add').click(function () {
            Rubric.clear();
            Rubric.setRubric();
            $('#rubric-row').animate({height: 'show'}, 500);
        });

        $('#closeAddRubric, #turn').click(function () {
            $('#rubric-row').animate({height: 'hide'}, 500);
        });

        if ($('#tree').exists()) {
            this.setRubric();
        }

        $('#tree').on('click', 'a', function () {
            $('.tree a[class=selected-tree]').each(function () {
                $(this).removeClass('selected-tree')
            });
            if ($(this).hasClass('selected-tree')) {
                $(this).removeClass('selected-tree');
            }
            else {
                $(this).addClass('selected-tree');
            }
        });

        $('#rubrics tbody').on('click', 'button', function () {
            RubricId = Rubric.table.api().row($(this).parents('tr')).data().id;
            $.getJSON(getBaseUrl() + 'rubrics/get/' + RubricId, function (json) {
                if (json.success == false)
                    return Rubric.setMessageTpl($().technomedia.totalRubricError);
                $.each(json.data, function (field, value) {
                    if (field === 'parent') {
                        $('.tree a').each(function () {
                            $(this).removeClass('selected-tree')
                        });
                        $(".tree a[data-id~='" + value + "']").addClass('selected-tree');
                    } else {
                        $('#' + field).val(value);
                    }
                });
            });

            $('#rubric-row').animate({height: 'show'}, 500);
            $('body,html').animate({scrollTop: 0}, 500);

        });
    },
    insertRubricTpl: function (ulId, data) {
        $(data).each(function (key, value) {
            var defaultIcon = ' <span class="fa fa-sitemap fa-fw"></span>';
            if ($(value.data).length > 0) {
                defaultIcon = '<span class="fa fa-folder-o"></span>';
                $('#' + ulId).append(
                    '<li>' +
                    '<a  data-id=' + value.dataId + '>' +
                    defaultIcon + value.value + '</a>' +
                    '<ul id="' + value.dataId + '">'
                );
                Rubric.insertRubricTpl(value.dataId, value.data)
            } else {
                $('#' + ulId).append(
                    '<li>' +
                    '<a  data-id=' + value.dataId + ' >' + defaultIcon + value.value +
                    '</a>' +
                    '</li>'
                );
            }
        });
    },
    add: function () {
        $("div[data-id='error']").empty();

        var parent = $('.tree a[class=selected-tree]').attr('data-id');
        if (undefined === parent) {
            parent = null;
        }

        $.noty.closeAll();
        $(':button,  :input, #addRubric').attr('disabled', false);
        $.ajax({
            type: "POST",
            url: 'add/json',
            data: $('#rubric').serialize() + '&parent=' + parent,
            error: function () {
                Rubric.setMessageTpl($().technomedia.totalError)
            },
            beforeSend: function () {
                $('#loading').modal('show');
            },
            complete: function () {
                Rubric.table.api().ajax.reload();
                $('#loading').modal('hide');
            },
            success: function (data) {
                try {
                    data = $.parseJSON(data);
                    if (false === data.success) {
                        Rubric.setErrorForm(data.errors);
                    } else {
                        Rubric.setMessageTpl($().technomedia.saveRubricOk);
                        Rubric.clear();
                    }
                } catch (e) {
                    Rubric.setMessageTpl($().technomedia.totalError);
                    Rubric.clear();
                }
                $('body,html').animate({scrollTop: 0}, 500);
            }
        });
        $('#addRubric, #add').attr('disabled', false);
    },
    clear: function () {
        $('#rubric')[0].reset();
    },
    setErrorForm: function (error) {
        $.each(error, function (k, v) {

            if (k === 'failureSave')
                Rubric.setMessageTpl(v);

            $('#' + k + '_warning').noty({
                text: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + v,
                type: 'warning',
                dismissQueue: true,
                layout: 'topCenter',
                theme: 'defaultTheme',
                maxVisible: 30
            });

        })
    },
    setMessageTpl: function (message) {
        noty({
            text: message,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.btnClose,
                    onClick: function (noty) {
                        Rubric.setRubric();
                        noty.close();
                    }
                }
            ]
        });
    },
    setMessageSave: function (message) {
        noty({
            text: message,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-primary',
                    text: $().technomedia.btnSaveOk,
                    onClick: function ($noty) {
                        $noty.close();
                        Rubric.add();
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.btnSaveCancel,
                    onClick: function ($noty) {
                        $(':button,  :input, #addRubric').attr('disabled', false);
                        $noty.close();
                    }
                }
            ]
        });
    },
    setRubric: function () {
        $('.tree').empty();
        $.ajax({
            type: "post",
            url: getBaseUrl() + 'rubrics/get',
            complete: function () {
                $('#rubric .btn-default').each(function () {
                    $('#selected-rubric a[data-id =' + $(this).attr('data-id') + ']').addClass('selected-tree');
                })
            },
            success: function (data) {
                var json  = $.parseJSON(data);
                $(json.data.rubrics).each(function (k, v) {
                    var defaultIcon = ' <span class="fa fa-sitemap fa-fw"></span>';
                    if ($(v.data).length > 0) {
                        defaultIcon = '<span class="fa fa-folder-o"></span>';
                    }
                    $('.tree').append(
                        '<li>' +
                        '<a data-id=' + v.dataId + ' >' +
                        defaultIcon + v.value + '</a>' +
                        '<ul id="' + v.dataId + '">'
                    );
                    if ($(v.data).length > 0) {
                        Rubric.insertRubricTpl(v.dataId, v.data);
                    }
                });
            }

        });

        //$.getJSON(getBaseUrl() + 'rubrics/get', function (json) {
        //    $(json.data.rubrics).each(function (k, v) {
        //        var defaultIcon = ' <span class="fa fa-sitemap fa-fw"></span>';
        //        if ($(v.data).length > 0) {
        //            defaultIcon = '<span class="fa fa-folder-o"></span>';
        //        }
        //        $('.tree').append(
        //            '<li>' +
        //            '<a data-id=' + v.dataId + ' >' +
        //            defaultIcon + v.value + '</a>' +
        //            '<ul id="' + v.dataId + '">'
        //        );
        //        if ($(v.data).length > 0) {
        //            Rubric.insertRubricTpl(v.dataId, v.data);
        //        }
        //    });
        //});
    }
};

var SelectedRubric = {
    init: function () {
        $('#get_rubrics').click(function () {
            Rubric.setRubric();
        });

        $('#selected-rubric').on('click', 'a', function () {
            $.noty.closeAll();
            if ($(this).hasClass('selected-tree')) {
                $(this).removeClass('selected-tree');
            }
            else {
                if ($('#selected-rubric a[class=selected-tree]').length == 3) {
                    return SelectedRubric.message($().technomedia.selectedRubricErrorMax);
                }
                $(this).addClass('selected-tree');
            }
        });

        $('#rubric').on('click', 'button', function () {
            if ($(this).attr('id') == 'get_rubrics')
                return;
            $('#rubric input[data-id=' + $(this).attr('data-id') + ']').remove();
            $(this).remove();
        });

        $('#relatedTo').click(function () {
            SelectedRubric.relatedTo();
        })
    },
    message: function (message) {
        $('#selected-rubric-message').noty({
            text: '<i class="glyphicon glyphicon-exclamation-sign"></i> ' + message,
            type: 'warning',
            dismissQueue: true,
            layout: 'topCenter',
            theme: 'defaultTheme',
            maxVisible: 30
        });
    }

    ,
    relatedTo: function () {

        if ($('#selected-rubric a[class=selected-tree]').length == 0) {
            $.noty.closeAll();
            return this.message($().technomedia.noSelectedRubricError)
        }
        var i = 1;

        $('#rubric .btn-default').each(function () {
            $(this).remove();
        });

        $('#selected-rubric a[class=selected-tree]').each(function () {

            if ($('#rubric button[data-id=' + $(this).attr('data-id') + ']').length == 1)
                return;

            $("#rubric").append('<button type="button" style="margin-right: 3px" '
            + 'class="btn btn-default btn-xs"  data-id="'
            + $(this).attr('data-id') +
            '">' + $(this).text() + ' &times;</button>');

            $("#rubric").append('<input id="rubric_'
            + $(this).attr('data-id') + '" data-id="' + $(this).attr('data-id')
            + '" hidden value="'
            + $(this).attr('data-id') +
            '" name="rubric_' + i + '"/>');
            i++;
        })

    }
};

SelectedRubric.init();
News.init();
Articles.init();
Rubric.init();

