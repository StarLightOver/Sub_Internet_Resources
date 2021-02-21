function validate_email(email) {
    let reg = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/gu;
    return reg.test(email);
}

function validate_text(text) {
    let reg = /^([A-Za-zА-Яа-я]{0,30})$/gu;
    return reg.test(text);
}

function validate_logpass(text) {
    let reg = /^([A-Za-z0-9_-]{0,30})$/gu;
    return reg.test(text);
}

function alertError(text) {
    document.getElementById("error").style.display = 'block';
    document.getElementById("error").setAttribute("class", "alert alert-danger");
    document.getElementById("error").textContent = text;
}

document.getElementById("input").addEventListener("click", function (e) {
    e.preventDefault();
    let name = document.getElementById('name').value;
    let family = document.getElementById('family').value;
    let email = document.getElementById('email').value;
    let login = document.getElementById('login').value;
    let pass = document.getElementById('pass').value;
    let confirmed_pass = document.getElementById('confirmed_pass').value;
    let check = document.getElementById('confidence');

    if (name !== "" && family !== "" && email !== "" && pass !== "" && confirmed_pass !== "" && check.checked === true) {
        if (validate_email(email)) {
            if (validate_text(name) && validate_text(family)){
                if (validate_logpass(login) && validate_logpass(pass) && validate_logpass(confirmed_pass)) {
                    if (pass === confirmed_pass) {
                        let request = new XMLHttpRequest();

                        request.open("POST", "/register_user", true);
                        request.setRequestHeader("Content-Type", "application/json");

                        request.addEventListener("load", function () {
                            let res = JSON.parse(request.response);

                            if (res.check) {
                                document.location.replace('login.html');
                            }
                            else {
                                alertError('Данный пользователь уже существует');
                            }
                        });

                        request.send(JSON.stringify({
                            UserName: name,
                            UserFamily: family,
                            UserMail: email,
                            UserLogin: login,
                            UserPass: pass
                        }));
                    }
                    else {
                        alertError('Пароли не совпадают!');
                    }
                }
                else {
                    alertError('Некорректный логин или пароль!');
                }
            }
            else {
                alertError('Некорректное имя или фамилия!');
            }
        }
        else {
            alertError('Некорректный E-mail!');
        }
    }
    else if (check.checked === false) {
        alertError('Примите политику конфиденциальности!');
    }
    else {
        alertError('Заполните все обязательные поля!');
    }
});


