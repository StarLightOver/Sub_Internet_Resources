function loadCardSingle() {
    let request = new XMLHttpRequest();
    request.open("POST", "/getProduct", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.addEventListener("load", function () {
        let res = JSON.parse(request.response).product;

        if (res !== null) {
            document.getElementById('link').textContent = res[0]['nameproduct'];
            document.getElementById('name_product').textContent = res[0]['nameproduct'];
            document.getElementById('price').textContent = '$' + res[0]['price'] + '.00';
            document.getElementById('description').textContent = res[0]['description'];
            document.getElementById('count_product').textContent = res[0]['countproduct'];
        }
    });
    request.send(JSON.stringify({idProduct: getCookie('product')}));
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

if (getCookie('product')){
    loadCardSingle();
}

document.getElementById('addCard').addEventListener("click", function (e) {
    e.preventDefault();
    let count = document.getElementById('input_count').value;
    addCard(parseInt(count));
    loadCardSingle();
});