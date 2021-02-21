function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
    options = {path: '/', ...options};

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

function addOrder() {
    let modal = document.getElementById('modal');
    let modalOverlay = document.getElementById('modal-overlay');

    modal.classList.toggle("closed");
    modalOverlay.classList.toggle("closed");

}

function addCard(count_p) {
    let request = new XMLHttpRequest();
    request.open("POST", "/addCard", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.addEventListener("load", function () {
        let check = JSON.parse(request.response).check;

        if (check === true) {
            loadCard();
            alertOpen('Внимание','Товар добавлен в корзину!');
        }
        else {
            alertOpen('Внимание!!!','Товара не достаточно на складе!');
        }
    });
    request.send(JSON.stringify({
        idProduct: getCookie('product'),
        token: getCookie('authorization_token'),
        count_product: count_p}));

}

function alertOpen(title_alert, content_alert) {
    let content = '<div class=\'alertm_h1\'>' + title_alert + '</div>' +
        '<div class=\'alertm_text\'>' + content_alert + '</div>';
    $('<div class="alertm_overlay"></div>').appendTo('body');
    $('<div class="alertm_all">' +
        '<a href="#" onclick="alertClose(); return false" class="alertm_close">x</a>' +
        '<div class="alertm_wrapper">' +
        content +
        '</div><div class="alertm_but" onclick="alertClose(); return false">OK</div></div>').appendTo('body');
    $(".alertm_overlay, .alertm_all").fadeIn("slow");
    $('.alertm_all').css('margin-top', (-1) * ($('.alertm_all').height()) + 'px');
}

function alertClose() {
    $(".alertm_overlay, .alertm_all").remove();
}
