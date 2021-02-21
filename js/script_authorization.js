function validate_logpass(text) {
    let reg = /^([A-Za-z0-9_-]{1,30})$/gu;
    return reg.test(text);
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
    options = { path: '/', ...options };

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, "", {
        'max-age': -1
    })
}

document.getElementById("input").addEventListener("click", function (e) {
    e.preventDefault();
    let login = document.getElementById("login").value;
    let pass = document.getElementById("pass").value;

    if (validate_logpass(login) && validate_logpass(pass)) {
        let request = new XMLHttpRequest();

        request.open("POST", "/authorization", true);
        request.setRequestHeader("Content-Type", "application/json");

        request.addEventListener("load", function () {
            let res = JSON.parse(request.response);

            if (res.token !== null) {
                setCookie('authorization_token', res.token, {'max-age': 3600});
                document.location.href = 'index.html';
            }
            else {
                document.getElementById("error").style.display = 'block';
                document.getElementById("error").setAttribute("class", "alert alert-danger");
                document.getElementById('error').textContent = 'Данного пользователя не сущестувует ' +
                    'или логин/пароль введены неверно!';
            }
        });

        request.send(JSON.stringify({login: login, pass: pass}));
    }
    else {
        document.getElementById("error").style.display = 'block';
        document.getElementById("error").setAttribute("class", "alert alert-danger");
        document.getElementById("error").textContent = 'Заполните все поля!';
    }
});