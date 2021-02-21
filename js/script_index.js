function deleteForm(id, deleteId) {
    while (document.getElementById(id).childElementCount !== 0) {
        document.getElementById(id).removeChild(document.getElementById(id).firstChild);
    }
}

function createForm(res) {
    deleteForm("content", "product_id");
    for (let i = 0; i < res.length; i++) {
        //    Для средних:
        // <div class="col-md-6">
        // <div class="grid1">
        // <h5>Ботинки</h5>
        // <div class="view view-first">
        // <img alt="" class="img-responsive" src="images/pic9.jpg"/>
        // <a href="single.html">
        // <div class="mask mask2">
        // <h3>Ознакомится</h3>
        // </div>
        // </a>
        // </div>
        // <h6>$1111</h6>
        // <ul class="list2">
        // <li class="list2_left">
        // <span class="m_1"><a href="#" class="link">Add to Cart</a></span>
        // </li>
        // <div class="clearfix"></div>
        // </ul>
        // </div>
        // </div>
        let div = document.createElement('div');
        div.id = "product_id";
        div.setAttribute('class', 'col-md-6 mb-4');

        let div_1 = document.createElement('div');
        // div_1.id = "product" + (i + 1).toString();
        div_1.setAttribute('class', 'grid1 box4');

        let h5 = document.createElement('h5');
        h5.id = "product_name";
        h5.textContent = res[i.toString()]['nameproduct'];

        let div_2 = document.createElement('div');
        div_2.setAttribute('class', 'view view-first');

        let img = document.createElement('img');
        img.id = "product_img";
        img.setAttribute('class', 'img-responsive');
        img.setAttribute('alt', 'Продукт');
        img.src = 'images/' + res[i.toString()]['image'] + '.jpg';

        let a = document.createElement('a');
        a.id = "product_link";
        a.addEventListener("click", function (e) {
            e.preventDefault();
            setCookie('product', res[i.toString()]['id']);
            document.location.replace('single.html');
        });

        let div_3 = document.createElement('div');
        div_3.setAttribute('class', 'mask mask1');
        div_3.setAttribute('style', 'cursor: pointer');

        let h3 = document.createElement('h3');
        h3.textContent = 'Ознакомиться с товаром';
        h3.setAttribute('style', 'margin-top: 70px;');

        let h6 = document.createElement('h6');
        h6.id = "product_price";
        h6.textContent = res[i.toString()]['countproduct'] + ' x $' + res[i.toString()]['price'];

        let ul = document.createElement('ul');
        ul.setAttribute('class', 'list2');
        ul.setAttribute('style', 'margin-top: 20px');

        let li = document.createElement('li');
        li.setAttribute('class', 'list2_left');

        let span = document.createElement('span');
        span.setAttribute('class', 'm_1');

        let a_1 = document.createElement('a');
        a_1.id = "product_link";
        a_1.textContent = 'Добавить в корзину';
        a_1.setAttribute('class', 'knopka');
        a_1.addEventListener("click", function (e) {
            e.preventDefault();
            if (getCookie('authorization_token')) {
                setCookie('product', res[i.toString()]['id']);
                addCard(1);

                //Обновить элемнеты на странице
                document.getElementById('button_accept').click();

            } else {
                alertOpen('Вы не авторизовались!','Пожалуйста, авторизуйтесь!');
            }
        });

        let div_4 = document.createElement('div');
        div_4.setAttribute('class', 'clearfix');

        span.appendChild(a_1);
        ul.appendChild(li);
        ul.appendChild(span);
        ul.appendChild(div_4);
        div_3.appendChild(h3);
        a.appendChild(div_3);
        div_2.appendChild(img);
        div_2.appendChild(a);
        div_1.appendChild(h5);
        div_1.appendChild(div_2);
        div_1.appendChild(h6);
        div_1.appendChild(ul);
        div.appendChild(div_1);

        document.getElementById("content").appendChild(div);

        if (i % 2 === 1){
            document.getElementById("content").appendChild(div_4);
        }
    }
}

function alertText(text) {
    document.getElementById("error").style.display = 'block';
    document.getElementById("error").setAttribute("class", "alert alert-danger");
    document.getElementById("error").textContent = text;
}

if (getCookie("section") === undefined) {
    setCookie("section", 'all');
}

if (getCookie("authorization_token")) {
    let request = new XMLHttpRequest();

    request.open("POST", "/getUser", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.addEventListener("load", function () {
        let res = JSON.parse(request.response);
        if (res.check) {
            document.getElementById('input').textContent = 'Выйти из аккаунта';
            document.getElementById("input").addEventListener("click", function (e) {
                e.preventDefault();
                deleteCookie("authorization_token");
                document.location.href = 'index.html'
            });

            document.getElementById('name_user').textContent = res.firstname;
            document.getElementById('left-topbar').setAttribute('style', 'display: none');

            document.getElementById('orders').setAttribute('style', 'cursor: pointer; display: list-item');
            document.getElementById('orders').addEventListener("click", function (e) {
                e.preventDefault();
                document.location.href = 'orders.html'
            });
            loadCard();

        }

    });
    request.send(JSON.stringify({token: getCookie("authorization_token")}));
} else {
    document.getElementById('input').textContent = 'Войти в аккаунт';
    document.getElementById("input").addEventListener("click", function (e) {
        e.preventDefault();
        document.location.href = 'login.html'
    });
}

let request = new XMLHttpRequest();
request.open("POST", "/loadItems", true);
request.setRequestHeader("Content-Type", "application/json");

request.addEventListener("load", function () {
    let res = JSON.parse(request.response).products;

    if (res !== null) {
        createForm(res);
    }
});
request.send(JSON.stringify({section: getCookie("section")}));

document.getElementById('button_reset').addEventListener("click", function (e) {
    e.preventDefault();

    document.getElementById('input_minimum').value = '';
    document.getElementById('input_maximum').value = '';

    let ul_material = document.getElementById('material').children;
    for (let i = 0; i < ul_material.length; i++) {
        ul_material[i].getElementsByTagName('input')[0].checked = true;
    }
    let ul_color = document.getElementById('color').children;
    for (let i = 0; i < ul_color.length; i++) {
        ul_color[i].getElementsByTagName('input')[0].checked = true;
    }

    let request = new XMLHttpRequest();
    request.open("POST", "/loadItems", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.addEventListener("load", function () {
        let res = JSON.parse(request.response).products;

        if (res !== null) {
            createForm(res);
        }
    });
    request.send(JSON.stringify({section: getCookie('section')}));
});

document.getElementById('button_accept').addEventListener("click", function (e) {
    e.preventDefault();

    let min = document.getElementById('input_minimum').value;
    let max = document.getElementById('input_maximum').value;

    let data_material = [];
    let ul_material = document.getElementById('material').children;
    for (let i = 0; i < ul_material.length; i++) {
        let li_material = ul_material[i].getElementsByTagName('input')[0];

        if (!li_material.checked) {
            data_material.push(li_material.id);
        }
    }

    let data_color = [];
    let ul_color = document.getElementById('color').children;
    for (let i = 0; i < ul_color.length; i++) {
        let li_color = ul_color[i].getElementsByTagName('input')[0];

        if (!li_color.checked) {
            data_color.push(li_color.id);
        }
    }

    let value_min;
    let value_max;

    if (min !== "") {
        if (/^[0-9]{1,3}$/.test(min)) {
            value_min = parseInt(min);
        } else {
            alertText("Некорректно ввведена минимальная цена!");
            return;
        }
    } else {
        value_min = -1;
    }

    if (max !== "") {
        if (/^[0-9]{1,3}$/.test(max)) {
            value_max = parseInt(max);
        } else {
            alertText("Некорректно ввведена максимальная цена!");
            return;
        }
    } else {
        value_max = -1;
    }

    if ((value_max > -1 && value_min > -1 && value_max > value_min)
        || (value_max === -1 && value_min > -1)
        || (value_max > -1 && value_min === -1)
        || (value_max === -1 && value_min === -1)
        || (data_material.length !== 0)
        || (data_color.length !== 0)) {
        let request = new XMLHttpRequest();
        request.open("POST", "/loadItemsFilter", true);
        request.setRequestHeader("Content-Type", "application/json");

        request.addEventListener("load", function () {
            let res = JSON.parse(request.response).products;

            if (res !== null) {
                createForm(res);
            }
        });
        request.send(JSON.stringify({
            minimum: value_min,
            maximum: value_max,
            cur_section: getCookie('section'),
            data_material: data_material,
            data_color: data_color
        }));
    } else {
        alertText("Некорректно установлен один из фильтров!")
    }
});

document.getElementById("all").addEventListener("click", function (e) {
    e.preventDefault();

    setCookie("section", 'all');
    document.getElementsByClassName('dropbtn')[0].textContent = 'Все товары';
    document.getElementById('button_accept').click();
});

document.getElementById("jacket").addEventListener("click", function (e) {
    e.preventDefault();

    setCookie("section", 'jacket');
    document.getElementsByClassName('dropbtn')[0].textContent = 'Куртки';
    document.getElementById('button_accept').click();
});

document.getElementById("jeans").addEventListener("click", function (e) {
    e.preventDefault();

    setCookie("section", 'jeans');
    document.getElementsByClassName('dropbtn')[0].textContent = 'Джинсы';
    document.getElementById('button_accept').click();
});

document.getElementById("boots").addEventListener("click", function (e) {
    e.preventDefault();

    setCookie("section", 'boots');
    document.getElementsByClassName('dropbtn')[0].textContent = 'Ботинки';
    document.getElementById('button_accept').click();
});
