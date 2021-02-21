function validate_name(text) {
    let reg = /^([A-Za-z0-9А-Яа-я]{1,20})$/gu;
    return reg.test(text);
}

let modal = document.getElementById('modal');
let modalOverlay = document.getElementById('modal-overlay');
let closeButton = document.getElementById('close-button');

closeButton.addEventListener("click", function () {
    if (!validate_name(document.getElementById('name_order').value)){
        document.getElementById("err").style.display = 'block';
        document.getElementById("err").setAttribute("class", "alert alert-danger");
        document.getElementById("err").textContent = 'Некорректное имя (не более 20 символов).';
    }
    else {
        modal.classList.toggle("closed");
        modalOverlay.classList.toggle("closed");

        let request = new XMLHttpRequest();

        request.open("POST", "/loadCard", true);
        request.setRequestHeader("Content-Type", "application/json");

        request.addEventListener("load", function () {
            let res = JSON.parse(request.response).cards;

            if (res.length > 0) {

                let total = 0;
                let prod = '';
                for (let i = 0; i < res.length; i++) {
                    prod += res[i.toString()]['countproduct'] + ' x ' + res[i.toString()]['nameproduct'] + '; ';
                    total += res[i.toString()]['price'] * res[i.toString()]['countproduct'];
                }

                let address = '';
                let radio = document.getElementsByName("radio");
                for (let i = 0; i < radio.length; i++){
                    if (radio[i].hasAttribute('checked')){
                        address = radio[i].nextElementSibling.textContent;
                        break;
                    }
                }

                let request_1 = new XMLHttpRequest();
                request_1.open("POST", "/addOrder", true);
                request_1.setRequestHeader("Content-Type", "application/json");

                request_1.addEventListener("load", function () {
                    let check = JSON.parse(request_1.response).check;

                    if (check === true) {
                        deleteCardForm("card", "cart_id");
                        alertOpen('Внимание', 'Заказ одобрен!');
                    }
                    else {
                        alertOpen('Внимание', 'Заказ не одобрен! Обратитесь к администратору');
                    }
                });
                request_1.send(JSON.stringify({
                    token: getCookie('authorization_token'),
                    nameOrder: document.getElementById('name_order').value,
                    products: prod,
                    price: total,
                    address: address
                }));

                let request = new XMLHttpRequest();
                request.open("POST", "/payCard", true);
                request.setRequestHeader("Content-Type", "application/json");
                request.send(JSON.stringify({token: getCookie("authorization_token")}));
            }
            else {
                if (document.getElementById('input_pay')) {
                    document.getElementById('input_pay').remove();
                }
            }
        });
        request.send(JSON.stringify({token: getCookie("authorization_token")}));
    }
});