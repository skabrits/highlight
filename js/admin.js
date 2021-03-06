var key_;

function check_user(success) {
    login_ = findGetParameter("login");
    password_ = findGetParameter("password");
    key_ = findGetParameter("code");

    $.ajax({
            url: "/api/let_my_people_pass",
            method: "POST",
            data: {
                login: login_,
                password: password_
            },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK" && response.key == key_) {
                success();
            } else {
                $.redirectGet("index.html", {});
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
            $.redirectGet("index.html", {});
        });
}

function approve_user(login) {
    $.ajax({
            url: "/api/verify",
            method: "POST",
            data: {
                key: key_,
                decision: 1,
                login: login
            },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK") {
                load_users();
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function delete_user(login) {
    $.ajax({
            url: "/api/verify",
            method: "POST",
            data: {
                key: key_,
                decision: 0,
                login: login
            },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK") {
                load_users();
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function load_users() {
    $.ajax({
            url: "/api/get_users",
            method: "POST",
            data: { key: key_ },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK") {
                $("#users").empty();
                var users = response.document;

                for (var i = 0; i < users.length; ++i) {
                    var social = "";
                    if (users[i].vk != "")
                        social += `
                        <p>
                        VK: <a href="https://vk.com/` + users[i].vk + `">` + users[i].vk + `</a>
                        </p>
                        `;
                    if (users[i].fb != "")
                        social += `
                        <p>
                        FB: <a href="https://www.facebook.com/profile.php?id=` + users[i].fb + `">` + users[i].fb + `</a>
                        </p>
                        `;
                    if (users[i].tg != "")
                        social += `
                        <p>
                        TG: <a>` + users[i].tg + `</a>
                        </p>
                        `;
                    if (users[i].email != "")
                        social += `
                        <p>
                        e-mail: <a>` + users[i].email + `</a>
                        </p>
                        `;

                    var status_string = "";
                    if (users[i].status == "translator") {
                        status_string = "Переводчик";
                    } else if (users[i].status == "chief") {
                        status_string = "Редактор";
                    } else {
                        status_string = "Переводчик, Редактор";
                    }

                    $("#users").append(`
                        <li class="collection-item avatar user-card">
                        <p class="user-status">` + status_string + `</p>
                        <span class="title">` + users[i].name + `</span>
                        ` + social + `
                        <div class="secondary-content">
                        <a onclick="approve_user('` + users[i].login + `');" class="approve-btn"><i class="material-icons green-text">done</i></a>
                        <a onclick="delete_user('` + users[i].login + `');"><i class="material-icons red-text">clear</i></a>
                        </div>
                        
                        </li>
                    `);
                }
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

var languages = [{
    code: "ENG",
    name: "Английский"
}, {
    code: "GER",
    name: "Немецкий"
}, {
    code: "FRE",
    name: "Французский"
}, {
    code: "ESP",
    name: "Испанский"
}, {
    code: "ITA",
    name: "Итальянский"
}, {
    code: "JAP",
    name: "Японский"
}, {
    code: "CHI",
    name: "Китайский"
}];

function load_languages() {
    $("#lang").empty();
    for (var i = 0; i < languages.length; ++i) {
        $("#lang").append(`
        <div class="col s6 m4 l4">
            <p><label>
                <input type="radio" name="group1" id="lang_` + i + `" checked />
                <span>` + languages[i].name + `</span>
            </label></p>
        </div>
        `);
    }
}

async function add_document() {
    var lang = "";
    var lang_set = false;
    for (var i = 0; i < languages.length; ++i) {
        if ($("#lang_" + i).is(':checked')) {
            lang_set = true;
            lang = languages[i].code;
            break;
        }
    }

    if (!lang_set) {
        lang = $("#lang_other_val").val();
    }

    var chips = M.Chips.getInstance($('#tags')).chipsData;
    var tags_ = "";
    for (var i = 0; i < chips.length; ++i) {
        tags_ += chips[i].tag + ",";
    }
    tags_ = tags_.slice(0, -1);

    var real_name = $("#filename")
    var extention = real_name.val().slice(-4, -1) + real_name.val().slice(-1);
    if (extention != "docx") {
        alert("Необходимо загрузить .docx файл!");
    } else {
        var fname = 'new_file' + getRandomInt(10000) + '.docx';
        $("#filename").val(fname);
        $("#file").submit();

        alert('Не перезагружайте страницу до появления надписи, сообщающей о статусе файла.');

        await sleep(2000);

        var finame = $("#fname").val();
        if (finame.trim() == "") {
            finame = real_name.val().slice(0, -5);
        }

        Ajax_server();
    }
    function Ajax_server() {
        $.ajax({
            url: "/api/update_docs",
            method: "POST",
            data: {
                name: finame,
                language: lang,
                tags: tags_,
                path: fname,
                key: key_
            },
            dataType: "json"
        })
        .done(function (data) {
            // console.log(data);
            response = data;
            if (response.code == "OK") {
                alert('Файл загружен!');
            } else {
                alert('Произошла ошибка: ' + response.code + ' во время загрузки файла.')
            }
        })
        .fail(async function (jqXHR, status, error) {
            console.log(error);
            alert('Файл загружен!');
        });
    }
}

function load_stat() {
    $.ajax({
            url: "/api/get_trans_and_docs",
            method: "POST",
            data: {
                key: key_
            },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK") {
                var stat = response.document;
                $("#stat_untranslated").html(stat.documents);
                $("#stat_translated").html(stat.translated_documents);
                $("#stat_users").html(stat.translators);
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function load_work() {
    $.ajax({
            url: "/api/get_pieces_stat",
            method: "POST",
            data: { key: key_ },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            $("#work").empty();

            for (var i = 0; i < response.document.length; ++i) {
                var name = response.document[i].translator;
                var document = "«" + response.document[i].name + "»";
                var date = response.document[i].date.split(" ")[0];
                var pb = response.document[i].pb;
                var pe = response.document[i].pe;

                $("#work").append(`
                <tr>
                    <td>` + name + `</td>
                    <td>` + document + (pb == pe ? `<br>Абзацы: ` + pb + `-` + pe : `<br>Абзац: ` + pb) + `</td>
                    <td>` + date + `</td>
                </tr>
                `);
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function load_translators() {
    $.ajax({
            url: "/api/get_translator_stats",
            method: "POST",
            data: {
                key: key_
            },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK") {
                $("#translators").empty();

                var data_translator = response.document;
                for (var i = 0; i < data_translator.length; ++i) {
                    var name = data_translator[i].name;
                    var paragraphs = 0;
                    for (var j = 0; j < data_translator[i].pieces.length; ++j) {
                        paragraphs += data_translator[i].pieces[j].indexes.length;
                    }

                    var vk = data_translator[i].vk;
                    var fb = data_translator[i].fb;
                    var tg = data_translator[i].tg;

                    var social_markup = "";
                    if (vk && vk != "") {
                        social_markup += "VK: " + vk + "<br>";
                    }
                    if (fb && fb != "") {
                        social_markup += "FB: " + fb + "<br>";
                    }
                    if (tg && tg != "") {
                        social_markup += "TG: " + tg + "<br>";
                    }
                    social_markup = social_markup.slice(0, -4);

                    $("#translators").append(`
                            <tr>
                                <td>` + name + `<br>` + social_markup + `</td>
                                <td>` + paragraphs + `</td>
                            </tr>`);
                }
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function load_documents() {
    $.ajax({
            url: "/api/get_file_stat",
            method: "POST",
            data: {
                key: key_
            },
            dataType: "json"
        })
        .done(function(data) {
            // console.log(data);
            response = data;
            if (response.code == "OK") {
                $("#documents").empty();

                var data_doc = response.document;
                for (var i = 0; i < data_doc.length; ++i) {
                    var document = "«" + data_doc[i].name + "»";
                    var status = data_doc[i].status;
                    var paragraphs_all = data_doc[i].pieces_info.all_pieces;
                    var paragraphs_ready = data_doc[i].pieces_info.done_pieces;
                    var stars = data_doc[i].importance;

                    var status_text = "";
                    switch (status) {
                        case 'TRANSLATED':
                            status_text = "Переведён и проверен";
                            break;
                        case 'NEED_CHECK':
                            status_text = "Переведён";
                            break;
                        case 'WAITING_FOR_TRANSLATION':
                            status_text = "В работе<br>(переведено " + paragraphs_ready + "/" + paragraphs_all + " абзацев)";
                    }

                    $("#documents").append(`
                            <tr>
                                <td>` + document + `</td>
                                <td>` + status_text + `</td>
                                <td>` + stars + `</td>
                            </tr>
                    `);
                }
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function save_db() {
    $.ajax({
            url: "/api/get_translator_stats",
            method: "POST",
            data: {
                key: key_
            },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK") {
                var db_data = "";

                var data_translator = response.document;
                for (var i = 0; i < data_translator.length; ++i) {
                    var name = data_translator[i].name;
                    var email = data_translator[i].email;
                    var status = data_translator[i].status;
                    var langs = data_translator[i].langs;
                    var paragraphs = data_translator[i].translated;

                    var vk = data_translator[i].vk;
                    var fb = data_translator[i].fb;
                    var tg = data_translator[i].tg;

                    var social_markup = "";
                    if (vk && vk != "") {
                        social_markup += "VK: " + vk + ";";
                    }
                    if (fb && fb != "") {
                        social_markup += "FB: " + fb + ";";
                    }
                    if (tg && tg != "") {
                        social_markup += "TG: " + tg + ";";
                    }
                    social_markup = social_markup.slice(0, -4);

                    db_data += status + ";" + name + ";" + langs + ";" + email + ";" + social_markup + ";" + paragraphs + "\n";
                }

                download_text(db_data, "users_db.txt");
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function init() {
    $('#tags').chips({
        data: [{
            tag: 'Важный',
        }],
        autocompleteOptions: {
            data: {
                'Важный': null,
            },
            limit: Infinity,
            minLength: 1
        }
    });

    load_languages();
    load_users();
    load_stat();
    load_work();
    load_translators();
    load_documents();
}

$(document).ready(function() {
    check_user(init);
});