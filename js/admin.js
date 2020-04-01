var key_;

function check_user(success) {
    login_ = findGetParameter("login");
    password_ = findGetParameter("password");
    key = findGetParameter("code");

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
            console.log(data);
            response = JSON.parse(data);
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

function approve_user(id_) {
    $.ajax({
            url: "/api/verify",
            method: "POST",
            data: {
                key: key_,
                decision: 1,
                id: id_
            },
            dataType: "json"
        })
        .done(function(data) {
            console.log(data);
            response = JSON.parse(data);
            if (response.code == "OK") {
                load_users();
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function delete_user(id) {
    $.ajax({
            url: "/api/verify",
            method: "POST",
            data: {
                key: key_,
                decision: 0,
                id: id_
            },
            dataType: "json"
        })
        .done(function(data) {
            console.log(data);
            response = JSON.parse(data);
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
            data: {},
            dataType: "json"
        })
        .done(function(data) {
            console.log(data);
            response = JSON.parse(data);
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
                        <a onclick="approve_user('` + users[i]._id + `');" class="approve-btn"><i class="material-icons green-text">done</i></a>
                        <a onclick="delete_user('` + users[i]._id + `');"><i class="material-icons red-text">clear</i></a>
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

function add_document() {
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

    var chips = M.Chips.getInstance($('#tags')).chipsData;;
    var tags = "";
    for (var i = 0; i < chips.length; ++i) {
        tags += chips[i].tag + ",";
    }
    tags = tags.slice(0, -1);

    var extention = $("#corrections_path").val().slice(-4, -1) + $("#corrections_path").val().slice(-1);
    if (extention != "docx") {
        alert("Необходимо загрузить .docx файл!");
    } else {
        $("#filename").val('new_file' + getRandomInt(10000) + '.docx');
        $("#file").submit();

        $.ajax({
                url: "../api/test_script.txt",
                method: "POST",
                data: {},
                dataType: "json"
            })
            .done(function(data) {
                /**/
            })
            .fail(function(jqXHR, status) {
                /**/
            });
    }
}

function load_stat() {
    $.ajax({
            url: "../api/test_script.txt",
            method: "POST",
            data: {},
            dataType: "json"
        })
        .done(function(data) {
            /**/
        })
        .fail(function(jqXHR, status) {
            $("#stat_untranslated").html(1000);
            $("#stat_translated").html(10);
            $("#stat_users").html(200);
        });
}

function load_work() {
    $.ajax({
            url: "../api/test_script.txt",
            method: "POST",
            data: {},
            dataType: "json"
        })
        .done(function(data) {
            /**/
        })
        .fail(function(jqXHR, status) {
            $("#work").empty();

            for (var i = 0; i < 10; ++i) {
                var name = "Иванов Иван Иванович";
                var document = "«" + "Disinfection instructions" + "»";
                var date = "01.01.1970";
                var paragraph_begin = 10;
                var paragraph_end = 30;

                var vk = "example";
                var fb = "";
                var tg = "";

                var social_markup = "";
                if (vk != "") {
                    social_markup += "VK: " + vk + "<br>";
                }
                if (fb != "") {
                    social_markup += "FB: " + fb + "<br>";
                }
                if (tg != "") {
                    social_markup += "TG: " + tg + "<br>";
                }
                social_markup = social_markup.slice(0, -1);

                $("#work").append(`
                <tr>
                    <td>` + name + `<br>` + social_markup + `</td>
                    <td>` + document + `<br>Абзацы: ` + paragraph_begin + `-` + paragraph_end + `</td>
                    <td>` + date + `</td>
                </tr>
                `);
            }
        });
}

function load_translators() {
    $.ajax({
            url: "../api/test_script.txt",
            method: "POST",
            data: {},
            dataType: "json"
        })
        .done(function(data) {
            /**/
        })
        .fail(function(jqXHR, status) {
            $("#translators").empty();

            for (var i = 0; i < 10; ++i) {
                var name = "Иванов Иван Иванович";
                var paragraphs = 100;

                var vk = "example";
                var fb = "";
                var tg = "";

                var social_markup = "";
                if (vk != "") {
                    social_markup += "VK: " + vk + "<br>";
                }
                if (fb != "") {
                    social_markup += "FB: " + fb + "<br>";
                }
                if (tg != "") {
                    social_markup += "TG: " + tg + "<br>";
                }
                social_markup = social_markup.slice(0, -4);

                $("#translators").append(`
                        <tr>
                            <td>` + name + `<br>` + social_markup + `</td>
                            <td>` + paragraphs + `</td>
                        </tr>`);
            }
        });
}

function load_documents() {
    $.ajax({
            url: "../api/test_script.txt",
            method: "POST",
            data: {},
            dataType: "json"
        })
        .done(function(data) {
            /**/
        })
        .fail(function(jqXHR, status) {
            $("#documents").empty();

            for (var i = 0; i < 10; ++i) {
                var document = "«" + "Disinfection instructions" + "»";
                var status = 0;
                var paragraphs_all = 20;
                var paragraphs_ready = 5;
                var stars = 100;

                var status_text = "";
                switch (status) {
                    case 2:
                        status_text = "Переведён и проверен";
                        break;
                    case 1:
                        status_text = "Переведён";
                        break;
                    case 0:
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
        });
}

function save_db() {
    $.ajax({
            url: "../api/test_script.txt",
            method: "POST",
            data: {},
            dataType: "json"
        })
        .done(function(data) {
            /**/
        })
        .fail(function(jqXHR, status) {
            download_text("Текст!", "users_db.txt");
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