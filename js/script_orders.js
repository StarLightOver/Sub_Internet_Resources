function createFormOrders(res) {
    for (let i = 0; i < res.length; i++) {
        //    Для средних:
        // <tr>
        // <th scope="row">1</th>
        // <td>Mark</td>
        // <td>Otto</td>
        // <td>@mdo</td>
        // <td>@mdo</td>
        // </tr>
        let tr = document.createElement('tr');

        let td = document.createElement('td');
        td.textContent = res[i.toString()]['nameorder'];

        let td_1 = document.createElement('td');
        td_1.textContent = res[i.toString()]['products'];

        let td_2 = document.createElement('td');
        td_2.textContent = res[i.toString()]['dataorder'].split('T')[0];

        let td_3 = document.createElement('td');
        td_3.textContent = res[i.toString()]['price'];

        let td_4 = document.createElement('td');
        td_4.textContent = res[i.toString()]['address'];

        tr.appendChild(td);
        tr.appendChild(td_1);
        tr.appendChild(td_2);
        tr.appendChild(td_3);
        tr.appendChild(td_4);
        document.getElementById("order_form").appendChild(tr);
    }
}

function loadOrders() {
    let request = new XMLHttpRequest();

    request.open("POST", "/getOrder", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.addEventListener("load", function () {
        let res = JSON.parse(request.response).orders;
        if (res.length !== 0) {
            createFormOrders(res);
        }

    });
    request.send(JSON.stringify({token: getCookie("authorization_token")}));
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

            document.getElementById('left-topbar').setAttribute('style', 'display: none');

            document.getElementById('orders').setAttribute('style', 'cursor: pointer; display: list-item');
            document.getElementById('orders').addEventListener("click", function (e) {
                e.preventDefault();
                document.location.href = 'orders.html'
            });

            loadOrders();

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