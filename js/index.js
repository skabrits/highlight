function try_signin_both() {
    var login_val = $("#login").val();
    var password_val = $("#password").val();
    var is_editor = $('#editor').is(':checked');

    var home_page = is_editor ? "main_editor.html" : "main.html";

    $.ajax({
            url: "api/login",
            method: "POST",
            data: {
                login: login_val,
                password: password_val,
                type: "both"
            },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK") {
                var id = response.id;
                $.redirectGet(home_page, {
                    user_id: id
                });
            } else if (response.code == "2001") {
                alert("Неверный пароль!");
            } else if (response.code == "2000") {
                alert("Неверный логин!");
            } else if (response.code == "2002") {
                alert("Аккаунт пока не подтверждён.");
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function signin() {
    var login_val = $("#login").val();
    var password_val = $("#password").val();
    var is_editor = $('#editor').is(':checked');

    if (login_val.trim() == "") {
        alert("Необходимо ввести логин.");
        return;
    }
    if (password_val.trim() == "") {
        alert("Необходимо ввести пароль.");
        return;
    }

    var home_page = is_editor ? "main_editor.html" : "main.html";
    var status = is_editor ? "chief" : "translator";

    $.ajax({
            url: "api/login",
            method: "POST",
            data: {
                login: login_val,
                password: password_val,
                type: status
            },
            dataType: "json"
        })
        .done(function(data) {
            response = data;
            if (response.code == "OK") {
                var id = response.id;
                $.redirectGet(home_page, {
                    user_id: id
                });
            } else if (response.code == "2002") {
                alert("Аккаунт пока не подтверждён.");
            } else {
                try_signin_both();
            }
        })
        .fail(function(jqXHR, status, error) {
            console.log(error);
        });
}

function signin_doctor() {
    var name = $("#name").val();
    var email = $("#email").val();
    window.location.href = 'search.html?name=' + name + '&email=' + email;
}