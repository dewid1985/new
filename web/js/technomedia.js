$(function () {
    $('#side-menu').metisMenu({
        //toggle: false
    });
});


$('.date').datetimepicker({
    format: 'Y-m-d H:i'
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
    plugins: ['media', 'ImagePluginTechnomedia', 'ImageArticlePluginTechnomedia','print']
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

/***** ImagePluginTechnomedia ****/
tinymce.PluginManager.add('ImagePluginTechnomedia', function (editor) {

    function buildListItems(inputList, itemCallback, startItems) {
        function appendItems(values, output) {
            output = output || [];

            tinymce.each(values, function (item) {
                var menuItem = {text: item.text || item.title};

                if (item.menu) {
                    menuItem.menu = appendItems(item.menu);
                } else {
                    menuItem.value = item.value;
                    itemCallback(menuItem);
                }

                output.push(menuItem);
            });

            return output;
        }

        return appendItems(inputList, startItems || []);
    }

    function createImageList(callback) {
        return function () {
            var imageList = editor.settings.image_list;

            if (typeof imageList == "string") {
                tinymce.util.XHR.send({
                    url: imageList,
                    success: function (text) {
                        callback(tinymce.util.JSON.parse(text));
                    }
                });
            } else if (typeof imageList == "function") {
                imageList(callback);
            } else {
                callback(imageList);
            }
        };
    }

    function showDialog(imageList) {
        InsertImagesPlugin.init();
        $('#insert_images_in_materials').modal('show');
        $('#preview-list').on('click', '#insert_image', function () {
            var img = $($(this).parent()).children('img');
            onSubmitForm($(img).attr('src'));
            $('#insert_images_in_materials, #inserting-images-preview').modal('hide');
            $('#').modal('hide');
        });
        var win, data = {}, dom = editor.dom, imgElm = editor.selection.getNode();
        var width, height, imageListCtrl;

        function onSubmitForm(src) {
            /**Может пригодится **/
            data.alt = '';
            data.title = '';
            data.width = null;
            data.height = null;
            data.style = null;

            data = {
                src: src,
                alt: data.alt,
                title: data.title,
                width: data.width,
                height: data.height,
                style: data.style,
                "class": data["class"]
            };

            editor.undoManager.transact(function () {
                if (!data.src) {
                    if (imgElm) {
                        dom.remove(imgElm);
                        editor.focus();
                        editor.nodeChanged();
                    }

                    return;
                }

                if (data.title === "") {
                    data.title = null;
                }
                var id = $(imgElm).length + 1;
                if (!imgElm) {
                    data.id = id;
                    editor.focus();
                    editor.selection.setContent(dom.createHTML('img', data));
                    imgElm = dom.get(id);
                    dom.setAttrib(imgElm, id, null);
                } else {
                    dom.setAttribs(imgElm, data);
                }

            });
        }

        width = dom.getAttrib(imgElm, 'width');
        height = dom.getAttrib(imgElm, 'height');

        if (imgElm.nodeName == 'IMG' && !imgElm.getAttribute('data-mce-object') && !imgElm.getAttribute('data-mce-placeholder')) {
            data = {
                src: dom.getAttrib(imgElm, 'src'),
                alt: dom.getAttrib(imgElm, 'alt'),
                title: dom.getAttrib(imgElm, 'title'),
                "class": dom.getAttrib(imgElm, 'class'),
                width: width,
                height: height
            };
        } else {
            imgElm = null;
        }

        if (imageList) {
            imageListCtrl = {
                type: 'listbox',
                label: 'Image list',
                values: buildListItems(
                    imageList,
                    function (item) {
                        item.value = editor.convertURL(item.value || item.url, 'src');
                    },
                    [{text: 'None', value: ''}]
                ),
                value: data.src && editor.convertURL(data.src, 'src'),
                onselect: function (e) {
                    var altCtrl = win.find('#alt');

                    if (!altCtrl.value() || (e.lastControl && altCtrl.value() == e.lastControl.text())) {
                        altCtrl.value(e.control.text());
                    }

                    win.find('#src').value(e.control.value()).fire('change');
                },
                onPostRender: function () {
                    imageListCtrl = this;
                }
            };
        }
    }

    editor.addButton('image', {
        icon: 'image',
        tooltip: 'Вставить изображение из каталога',
        onclick: createImageList(showDialog),
        stateSelector: 'img:not([data-mce-object],[data-mce-placeholder])'
    });

    editor.addMenuItem('image', {
        icon: 'image',
        text: 'Вставить изображение из каталога',
        onclick: createImageList(showDialog),
        context: 'insert',
        prependToContext: true
    });

  //  editor.addCommand('mceImage', createImageList(showDialog));
});
/***** end ImagePluginTechnomedia ****/

tinymce.PluginManager.add('ImageArticlePluginTechnomedia', function (editor) {

    function showDialogUploadImage()
    {
        $('#upload-and-paste-images-in-materials').modal('show');

    }

    function init(callback) {
        return function () {
            var imageList = editor.settings.image_list;

            if (typeof imageList == "string") {
                tinymce.util.XHR.send({
                    url: imageList,
                    success: function (text) {
                        callback(tinymce.util.JSON.parse(text));
                    }
                });
            } else if (typeof imageList == "function") {
                imageList(callback);
            } else {
                callback(imageList);
            }
        };
    }

    editor.addMenuItem('imagearicle',{
        icon:'paste',
        text: 'Загрузить изображение',
        onclick: init(showDialogUploadImage),
        context: 'insert',
        prependToContext: true
    })
});
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


        $('#article').on('click','#insert-img', function () {
            InsertImagesPlugin.init();
            $('#insert_images_in_materials').modal('show');
            localStorage.setItem('field-image-id',$(this).parent().parent().children('input').attr('id'));
            Articles.insertImgToInput()

        });
        $('#article').on('click','#preview-image', function () {
            InsertImagesPlugin.init();
            $('#inserting-show-image').modal('show');
            $('#show_image').attr('src',$(this).parent().parent().children('input').val());
        });

        if (!!localStorage.getItem('articleId'))
            this.get();
    },
    reloadTable: function () {
        this.table.api().ajax.reload();
    },
    insertImgToInput: function () {
        $('#preview-list').on( 'click','#insert_image', function () {
            $('#'+localStorage.getItem('field-image-id')).val($(this).parent().children('img').attr('src'));
            $('#insert_images_in_materials, #inserting-images-preview').modal('hide');
            localStorage.removeItem('field-image-id');
        });
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
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
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
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
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
                '<button data-id="' + v.name + '" class="btn btn-default btn-xs" style="margin-right: 3px" ' +
                'type="button">' + v.short_name + ' ×</button>' +
                '<input id="rubric_' + v.name + '" hidden=""  data-id="' + v.name + '" name="' +
                k + '" value="' + v.name + '">'
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
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
            },
            complete: function () {
                localStorage.removeItem('newsId');
                $('#loading').modal('hide');
            },
            success: function (json) {
                json = $.parseJSON(json);
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
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
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
                '<button data-id="' + v.name + '" class="btn btn-default btn-xs" style="margin-right:' +
                ' 3px" type="button">'
                + v.short_name + ' ×</button>' +
                '<input id="rubric_' + v.name + '" hidden=""  data-id="' + v.name
                + '" name="' + k + '" value="' + v.name + '">'
            );
        });
    }
};

/**********************************************************************************************************************/
var Rubric = {
    url: getBaseUrl() + 'rubrics/',
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
                    requestDataModifiedGET.short_name = $('#short_name').val();
                    requestDataModifiedGET.description = $('#description').val();
                    requestDataModifiedGET.of_created_at = $('#of_created_at').val();
                    requestDataModifiedGET.to_created_at = $('#to_created_at').val();
                    requestDataModifiedGET.of_modified_at = $('#of_modified_at').val();
                    requestDataModifiedGET.to_modified_at = $('#to_modified_at').val();
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
            localStorage.setItem('rubricId', Rubric.table.api().row($(this).parents('tr')).data().id);
            $(location).attr('href', Rubric.url + 'editor');

        });

        if (!!localStorage.getItem('rubricId'))
            this.get();

        $('#search_rubrics').click(function () {
            Rubric.reloadTable();
        });
    },
    reloadTable: function () {
        this.table.api().ajax.reload();
    },
    get: function () {
        var rubricId = localStorage.getItem('rubricId');
        localStorage.removeItem('rubricId');

        $.ajax({
            type: "post",
            url: Rubric.url + 'get/' + rubricId,
            dataType: "json",
            error: function () {
                News.setMessageTpl($().technomedia.totalError)
            },
            beforeSend: function () {
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
            },
            complete: function () {
                localStorage.removeItem('newsId');
                $('#loading').modal('hide');
            },
            success: function (json) {
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
            },
            timeout: 3000
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
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
            },
            complete: function () {
                $('#loading').modal('hide');
            },
            success: function (data) {
                try {
                    data = $.parseJSON(data);
                    if (false === data.success) {
                        Rubric.setErrorForm(data.errors);
                    } else {
                        Rubric.addRubricMessageOk();
                        Rubric.clear();
                    }
                } catch (e) {
                    Rubric.setMessageTpl($().technomedia.totalError);
                    Rubric.clear();
                }
            }
        });
    },
    clear: function () {
        $('.tree a[class=selected-tree]').each(function () {
            $(this).removeClass('selected-tree')
        });
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
    addRubricMessageOk: function () {
        noty({
            text: $().technomedia.addRubricMessageOk,
            type: 'alert',
            dismissQueue: true,
            layout: 'center',
            theme: 'defaultTheme',
            buttons: [
                {
                    addClass: 'btn btn-primary',
                    text: $().technomedia.addRubricMessageOkBtnList,
                    onClick: function () {
                        $(location).attr("href", Rubric.url);
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.addRubricMessageOkBtnNew,
                    onClick: function () {
                        $(location).attr("href", Rubric.url + 'editor');
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

                    $('#sel').append('<p id="selected_' + $(this).attr('data-id') + '">' +
                    '<i class="fa fa-check selected-rubric"></i>' +
                    $(this).text().replace('×', '') +
                    '</p>');
                });
            },
            success: function (data) {
                var json = $.parseJSON(data);
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
    }
};

var SelectedRubric = {
    init: function () {
        $('#get_rubrics').click(function () {
            $('#sel p').each(function () {
                $(this).remove()
            });
            Rubric.setRubric();
        });

        $('#selected-rubric').on('click', 'a', function () {
            $.noty.closeAll();
            if ($(this).hasClass('selected-tree')) {
                $(this).removeClass('selected-tree');
                $('#selected_' + $(this).attr('data-id')).remove()
            }
            else {
                if ($('#selected-rubric a[class=selected-tree]').length == 3) {
                    return SelectedRubric.message($().technomedia.selectedRubricErrorMax);
                }
                $(this).addClass('selected-tree');
                $('#sel').append('<p id="selected_' + $(this).attr('data-id') + '">' +
                '<i class="fa fa-check selected-rubric"></i>' +
                $(this).text() +
                '</p>');
            }
        });

        $('#rubric').on('click', 'button', function () {
            if ($(this).attr('id') == 'get_rubrics')
                return;
            $('#rubric input[data-id=' + $(this).attr('data-id') + ']').remove();
            $(this).remove();
        });

        $('#view_tree_rubrics').click(
            function () {
                $('#myModal .col-md-5').remove();
                $('#myModal .col-md-7').removeClass('col-md-7').addClass('col-md-12');
                $('#myModal .modal-footer').remove();
                $('#selected-rubric-message').remove();
                $('#myModalLabel').text($().technomedia.treeRubricsName);
                Rubric.setRubric();

            }
        );
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
    },
    relatedTo: function () {

        if ($('#selected-rubric a[class=selected-tree]').length == 0) {
            $.noty.closeAll();
            return this.message($().technomedia.noSelectedRubricError)
        }
        var i = 1;

        $('#rubric .btn-default').each(function () {
            $(this).remove();
            $('#selected-rubric a[class=selected-tree]').each(function () {
                if ($('[data-id=' + $(this).attr('data-id') + ']').length = 0) {
                    $('[data-id=' + $(this).attr('data-id') + ']').remove();
                }
            });

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
        });

        $('#myModal').modal('hide');
    }
};

var ImageWriter = {
    jcropApi: null,
    table: $('#images')
        .on('xhr.dt', function (e, settings, json) {
            for (var i = 0, ien = json.data.length; i < ien; i++) {
                json.data[i].ico_file = '<img id="image_search" class="img-thumbnail center-block"' +
                ' data-holder-rendered="true" src="' + getBaseUrl() + 'images/upload/' + json.data[i].ico_file +
                '" style=" display: block;max-width: 30%; max-height: 30%;" alt="140x140">';

                if (json.data[i].count_cropped > 0)
                    json.data[i].count_cropped = '<strong>' + json.data[i].count_cropped + '</strong>&nbsp;<button ' +
                    'class="btn btn-default btn-circle" id="show_images"' +
                    ' type="button"> <i class="glyphicon glyphicon-search "></i></button>';
            }
            // Тут возомжно придется менять адресса изображений а именно путь до них тут нужно
            // будет думать
        }).
        on('draw.dt', function () {
            $('.img-thumbnail').each(function () {
                $(this).hover(
                    function () {
                        $(this).stop().animate({"max-width": "100%", display: "block", "max-height": "100%"}, 2);
                    },
                    function () {
                        $(this).stop().animate({"max-width": "30%", display: "block", "max-height": "30%"}, 2);
                    }
                )
            })
        }).
        dataTable(
        {
            "language": {
                "url": "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Russian.json"
            },
            "bFilter": false,
            "processing": true,
            "serverSide": true,
            "bSort": false,
            "ajax": {
                "url": getBaseUrl() + "multimedia/images/list",
                "data": function (requestDataModifiedGET) {
                    delete requestDataModifiedGET.columns;
                    delete requestDataModifiedGET.order;
                    requestDataModifiedGET.title = $('#title').val();
                    requestDataModifiedGET.description = $('#description').val();
                    requestDataModifiedGET.tags = $('#tags').val();
                    requestDataModifiedGET.of_uploaded_at = $('#of_uploaded_at').val();
                    requestDataModifiedGET.to_uploaded_at = $('#to_uploaded_at').val();
                }
            },
            "columns": [
                {"data": "id"},
                {"data": "title"},
                {"data": "description"},
                {"data": "ico_file"},
                {"data": "uploaded_at"},
                {
                    "data": "count_cropped",
                    "class": "text-center"
                },
                {
                    "data": null,
                    "class": "text-center",
                    "defaultContent": '<div class="dropdown"> ' +
                    '<button id="dLabel" type="button" data-toggle="dropdown" aria-haspopup="true"' +
                    ' aria-expanded="false">' + 'Действия' + '<span class="caret"></span> ' +
                    '</button> <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel"> ' +
                    '<li role="presentation" ><a id="crop"><i class="fa fa-cut"></i> Нарезать фото</a></li>' +
                    '<li role="presentation" ><a id="edit"><i class="fa fa-pencil">' +
                    '</i> Редактировать описание</a></li></ul> </div>'
                }
            ]
        }
    ),
    init: function () {
        $('#new_photo').hide();
        $('#photo_save').click(function () {
            $.noty.closeAll();
            ImageWriter.addImages();
        });

        $('#search_image').click(function () {
            ImageWriter.reloadTable();
        });
        $('#new_photo').click(function () {
            $(location).attr('href', getBaseUrl() + 'multimedia/image');
        });

        $('#select-size').click(function () {
            $(location).attr('href', getBaseUrl() + 'multimedia/images/crop/' + $('#imagesId').val() + '/' +
            $('input:radio[name=imagesSize]:checked').val());
        });

        $('#images tbody').on('click', '#crop', function () {
            $(location).attr('href', getBaseUrl() + 'multimedia/images/crop/' +
            ImageWriter.table.api().row($(this).parents('tr')).data().id);
        });

        $('#images tbody').on('click', '#show_images', function () {
            $('#preview-list').empty();
            ImageWriter.setCroppedImages(ImageWriter.table.api().row($(this).parents('tr')).data().id);
            $('#croppedImagesShow').modal('show');
        });

        $('#crop-image').click(function () {
            ImageWriter.saveDialog($().technomedia.addCropImagesMessage)
        });
        ImageCrop.init();
    },
    reloadTable: function () {
        this.table.api().ajax.reload();

    },
    setCroppedImages: function (imageId) {
        $.ajax({
            type: "POST",
            url: getBaseUrl() + 'multimedia/images/preview/' + imageId,
            dataType: "json",
            beforeSend: function () {
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
            },
            complete: function () {
                $('#loading').modal('hide');
            },
            success: function (json) {
                $.each(json.data.data, function (k, v) {
                    $('#preview-list').append(
                        '<div class="well" style="margin-top: 3px; margin-right: 4px" > ' + '<blockquote>' +
                        '<h4>' + v.title + '</h4> ' + '<strong>' + $().technomedia.width + ':' + v.width + 'px ' +
                        $().technomedia.height + ':' + v.height + 'px' + '</strong>' + '</blockquote>' +
                        '<img src="' + getBaseUrl() + 'images/upload/' + v.path + '" class="img-responsive' +
                        ' preview-container" alt="Responsive image"> ' +
                        '</div>'
                    );
                })
            }
        });
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
                        ImageWriter.addCropImages();
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.btnSaveCancel,
                    onClick: function (noty) {
                        noty.close();
                    }
                }
            ]
        });
    },
    addCropImages: function () {
        $.post(getBaseUrl() + 'multimedia/images/crop', {
            imagesId: $('#imagesId').val(),
            imagesSizeId: $('input:radio[name=imagesSize]:checked').val(),
            x: $('#x').val(),
            y: $('#y').val(),
            w: $('#w').val(),
            h: $('#h').val()
        }, function (json) {
            if (json.success) {
                ImageWriter.setMessageTpl($().technomedia.saveCropImagesOkMessage)
            } else {
                ImageWriter.setMessageTpl($().technomedia.totalError)
            }
        }, 'json');
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
                    addClass: 'btn btn-success',
                    text: $().technomedia.btnNext,
                    onClick: function (noty) {
                        noty.close();
                    }
                },
                {
                    addClass: 'btn btn-danger',
                    text: $().technomedia.btnList,
                    onClick: function (noty) {
                        noty.close();
                        $(location).attr('href', getBaseUrl() + 'multimedia/images/')
                    }
                }
            ]
        });
    },
    addImages: function () {
        var fd = new FormData();
        fd.append('name', $('#name').val());
        fd.append('description', $('#description').val());
        fd.append('tags', $('#tags').val());
        fd.append('image', $('#image')[0].files[0]);
        $.ajax({
            type: "post",
            url: getBaseUrl() + 'multimedia/upload',
            data: fd,
            processData: false,
            contentType: false,
            dataType: "json",
            beforeSend: function () {
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
            },
            complete: function () {
                $('#loading').modal('hide');
            },
            success: function (json) {
                if (false === json.success) {
                    Rubric.setErrorForm(json.errors);
                } else {
                    $('#image_ico').attr('src', getBaseUrl() + 'images/upload/' + json.data.ico);
                    $('#photo_save').hide();
                    $('#new_photo').show();
                }
            },
            error: function (data) {

            }
        })
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
    }
};

var ImageCrop = {
    api: null,
    boundx: null,
    boundy: null,
    preview: $('#preview-pane'),
    pcnt: $('.preview-container'),
    pimg: $('.preview-container img'),
    xsize: $('.preview-container').width(),
    ysize: $('.preview-container').height(),

    init: function () {
        $('#target').Jcrop({
            onChange: ImageCrop.updatePreview,
            onSelect: ImageCrop.updatePreview,
            aspectRatio: ImageCrop.xsize / ImageCrop.ysize
        }, function () {
            var bounds = this.getBounds();
            ImageCrop.boundx = bounds[0];
            ImageCrop.boundy = bounds[1];
            ImageCrop.api = this;
            ImageCrop.api.setSelect([10, 10, ImageCrop.xsize, ImageCrop.ysize]);
            ImageCrop.api.setOptions({bgColor: 'white', bgOpacity: 0.7});
        });
    },
    updatePreview: function (c) {
        if (parseInt(c.w) > 0) {
            var rx = ImageCrop.xsize / c.w;
            var ry = ImageCrop.ysize / c.h;
            ImageCrop.pimg.css({
                width: Math.round(rx * ImageCrop.boundx) + 'px',
                height: Math.round(ry * ImageCrop.boundy) + 'px',
                marginLeft: '-' + Math.round(rx * c.x) + 'px',
                marginTop: '-' + Math.round(ry * c.y) + 'px'
            });
        }
        $('#x').val(c.x);
        $('#y').val(c.y);
        $('#w').val(c.w);
        $('#h').val(c.h);
    }
};

var InsertImagesPlugin = {
    table: null,
    init: function () {
        if (this.table === null) {
            this.table = $('#insert-images-materials')
                .on('xhr.dt', function (e, settings, json) {
                    for (var i = 0, ien = json.data.length; i < ien; i++) {
                        json.data[i].ico_file = '<img id="image_search" class="img-thumbnail center-block"' +
                        ' data-holder-rendered="true" src="' + getBaseUrl() + 'images/upload/' + json.data[i].ico_file +
                        '" style=" display: block;max-width: 30%; max-height: 30%;" alt="140x140">';

                        if (json.data[i].count_cropped > 0)
                            json.data[i].count_cropped = '<strong>' + json.data[i].count_cropped +
                            '</strong>&nbsp;<button class="btn btn-default btn-circle" id="show_images"' +
                            ' type="button"> <i class="fa fa-paste"></i></button>';
                    }
                    // Тут возомжно придется менять адресса изображений а именно путь до них тут нужно
                    // будет думать
                }).
                on('draw.dt', function () {
                    $('.img-thumbnail').each(function () {
                        $(this).hover(
                            function () {
                                $(this).stop().animate({
                                    "max-width": "100%",
                                    display: "block",
                                    "max-height": "100%"
                                }, 2);
                            },
                            function () {
                                $(this).stop().animate({"max-width": "30%", display: "block", "max-height": "30%"}, 2);
                            }
                        )
                    })
                }).
                dataTable(
                {
                    "language": {
                        "url": "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Russian.json"
                    },
                    "bFilter": false,
                    "processing": true,
                    "serverSide": true,
                    "bSort": false,
                    "ajax": {
                        "url": getBaseUrl() + "multimedia/images/list",
                        "data": function (requestDataModifiedGET) {
                            delete requestDataModifiedGET.columns;
                            delete requestDataModifiedGET.order;
                            requestDataModifiedGET.title = $('#title-image-insert').val();
                            requestDataModifiedGET.description = $('#description-image-insert').val();
                            requestDataModifiedGET.tags = $('#tags-image-insert').val();
                            requestDataModifiedGET.of_uploaded_at = $('#of_uploaded_at-image-insert').val();
                            requestDataModifiedGET.to_uploaded_at = $('#to_uploaded_at-image-insert').val();
                        }
                    },
                    "columns": [
                        {"data": "id"},
                        {"data": "title"},
                        {"data": "description"},
                        {"data": "ico_file"},
                        {"data": "uploaded_at"},
                        {
                            "data": "count_cropped",
                            "class": "text-center"
                        }
                    ]
                }
            )
        } else {
            this.reloadTable();
        }

        $('#insert-images-materials tbody').on('click', '#show_images', function () {
            $('#preview-list').empty();
            InsertImagesPlugin.setCroppedImages(InsertImagesPlugin.table.api().row($(this).parents('tr')).data().id);
            $('#inserting-images-preview').modal('show');
        });

        $('#search_image-image-insert').click(function () {
            InsertImagesPlugin.reloadTable();
        });

        $('#preview_ico').click(function () {
            $('#show_image').attr('src', $('#image-ico').val());
            $('#inserting-show-image').modal('show')
        });

        //$('#preview-list').on('click', '#insert_image', function () {
        //    var img = $($(this).parent()).children('img');
        //    $('#image-ico').empty().val($(img).attr('src'));
        //    $('#inserting-images-preview').modal('hide');
        //})

    },
    setCroppedImages: function (imageId) {
        $.ajax({
            type: "POST",
            url: getBaseUrl() + 'multimedia/images/preview/' + imageId,
            dataType: "json",
            beforeSend: function () {
                $('#loading').modal({
                    backdrop: 'static',
                    keyboard: true
                });
            },
            complete: function () {
                $('#loading').modal('hide');
            },
            success: function (json) {
                $.each(json.data.data, function (k, v) {

                    $('#preview-list').append(
                        '<div class="well" style="margin-top: 3px; margin-right: 4px" > ' + '<blockquote>' +
                        '<h4>' + v.title + '</h4> ' + '<strong>' + $().technomedia.width + ':' + v.width + 'px ' +
                        $().technomedia.height + ':' + v.height + 'px' + '</strong>' + '</blockquote>' +
                        '<img src="' + getBaseUrl() + 'images/upload/' + v.path +
                        '" class="img-responsive preview-container" alt="Responsive image"> ' +
                        ' <button class="btn  btn-success" id="insert_image" type="button">Вставить </button>' +
                        '</div>'
                    );
                })
            }
        });
    },
    reloadTable: function () {
        this.table.api().ajax.reload();
    },
    insert: function (e) {
        InsertImagesPlugin.init();
        $('#insert_images_in_materials').modal('show');
    }
};

SelectedRubric.init();
News.init();
Articles.init();
Rubric.init();
ImageWriter.init();





