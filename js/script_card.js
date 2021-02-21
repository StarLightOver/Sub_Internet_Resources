function deleteCardForm(id, deleteId) {
    document.getElementById('card_count').textContent = '0';
    document.getElementById('total').textContent = '$0.00';

    while (document.getElementById(id).childElementCount !== 0) {
        document.getElementById(id).removeChild(document.getElementById(deleteId));
    }
}

function createCardForm(res) {
    deleteCardForm("card", "cart_id");
    for (let i = 0; i < res.length; i++) {
        //    Для средних:
//       <div class="cart_box">
        //       <div class="message">
        //       <div class="alert-close"></div>
        //       <div class="list_img">
        //                  <img alt="" class="img-responsive" src="images/1.jpg"/>
        //       </div>
        //       <div class="list_desc">
        //                    <h4>Вещь 1</h4><span class="actual">$1.00</span>
        //             </div>
        //       <div class="clearfix"></div>
        //       </div>
//       </div>
        let div = document.createElement('div');
        div.id = "cart_id";
        div.setAttribute('class', 'cart_box');

        let div_1 = document.createElement('div');
        div_1.setAttribute('class', 'message');

        let div_2 = document.createElement('div');
        div_2.setAttribute('class', 'alert-close');
        div_2.addEventListener("click", function (e) {
            e.preventDefault();
            setCookie('product', res[i.toString()]['id']);
            deleteOneCard(getCookie('product'));
        });

        let div_3 = document.createElement('div');
        div_3.setAttribute('class', 'list_img');

        let img = document.createElement('img');
        img.id = "product_img";
        img.setAttribute('class', 'img-responsive');
        img.src = 'images/mini_' + res[i.toString()]['image'] + '.jpg';

        let div_4 = document.createElement('div');
        div_4.setAttribute('class', 'list_desc');

        let h4 = document.createElement('h4');
        h4.textContent = res[i.toString()]['nameproduct'];

        let span = document.createElement('span');
        span.textContent = res[i.toString()]['countproduct'] + ' x $' + res[i.toString()]['price'];
        span.setAttribute('class', 'actual');

        let div_5 = document.createElement('div');
        div_5.setAttribute('class', 'clearfix');

        div_3.appendChild(img);
        div_4.appendChild(h4);
        div_4.appendChild(span);
        div_1.appendChild(div_2);
        div_1.appendChild(div_3);
        div_1.appendChild(div_4);
        div_1.appendChild(div_5);
        div.appendChild(div_1);
        document.getElementById("card").appendChild(div);
    }
}

function loadCard() {
    let request = new XMLHttpRequest();

    request.open("POST", "/loadCard", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.addEventListener("load", function () {
        let res = JSON.parse(request.response).cards;

        document.getElementsByClassName('header-bottom-right')[0].setAttribute('style', 'display: block');

        if (res.length > 0){
            createCardForm(res);

            document.getElementById('card_count').textContent = res.length.toString();

            let total = 0;
            for (let i = 0; i < res.length; i++) {
                total += res[i.toString()]['price'] * res[i.toString()]['countproduct']
            }

            document.getElementById('total').textContent = '$' + total.toString();

            if (!document.getElementById('input_pay')){
                let pay = document.createElement("button");
                pay.id = "input_pay";
                pay.setAttribute("class", "check_button");
                pay.setAttribute("style", "margin-top: 10px");
                pay.textContent = 'Оплатить';
                pay.addEventListener("click", function (e) {
                    e.preventDefault();

                    addOrder();


                });
                document.getElementById('login_buttons').appendChild(pay);
            }
        }
        else{
            deleteCardForm("card", "cart_id");
            if (document.getElementById('input_pay')){
                document.getElementById('input_pay').remove();
            }

        }
    });
    request.send(JSON.stringify({token: getCookie("authorization_token")}));
}

function deleteOneCard(id_product) {
    let request = new XMLHttpRequest();

    request.open("POST", "/deleteOneCard", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.addEventListener("load", function () {
        let check = JSON.parse(request.response).check;

        if (check){
            loadCard();

            //Обновить элемнеты на странице
            if (document.getElementById('button_accept')){
                document.getElementById('button_accept').click();
            }
        }
    });
    request.send(JSON.stringify({token: getCookie("authorization_token"), id_product: id_product}));
}