const http = require('http');
const url = require('url');
const fs = require('fs');
const md5 = require('md5');

const port = 100;
const host = 'localhost';

const pgp = require('pg-promise')();
const db = pgp({host: 'localhost', port: 5432, database: 'user_db', user: 'username', password: 'user'});
//const db = pgp({host: 'localhost', port: 5432, database: 'postgres', user: 'postgres', password: 'postgres'});

function notFound(res) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('NOT FOUND 404\n');
}

function sendFile(filename, res) {
    fs.readFile(filename, (err, data) => {
        if (err) {
            console.error(err);
            console.error(filename);
            notFound(res);
            return
        }
        res.write(data);
        res.end();
    });
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        switch (req.url) {
            case "/": {
                sendFile(__dirname + '/index.html', res);
                break;
            }
            case "/index": {
                sendFile(__dirname + '/index.html', res);
                break;
            }
            case "/register": {
                sendFile(__dirname + '/register.html', res);
                break;
            }
            case "/login": {
                sendFile(__dirname + '/login.html', res);
                break;
            }
            case "/single": {
                sendFile(__dirname + '/single.html', res);
                break;
            }
            default: {
                sendFile(__dirname + req.url, res);
                break;
            }
        }
        /*if (req.url.includes('.css')) {
            res.setHeader('Content-Type', 'text/css');
            sendFile(__dirname + req.url, res);
        } else if (req.url.includes('.js')) {
            res.setHeader('Content-Type', 'text/javascript');
            sendFile(__dirname + req.url, res);
        } else if (req.url.includes('.ico')) {
            res.setHeader('Content-Type', 'text/image/x-icon');
            sendFile(__dirname + req.url, res);
        } else {
            res.setHeader('Content-Type', 'text/html');
            sendFile(__dirname + req.url, res);
        }*/
    }

    if (req.method === 'POST') {
        switch (req.url) {
            case '/authorization': {
                let body = [];

                // Получение содержимого POST-запроса
                req.on('data', function (chunk) {
                    body.push(chunk);
                });

                req.on('end', function () {
                    let login = JSON.parse(body).login;
                    let pass = JSON.parse(body).pass;

                    let token = md5(login + pass);
                    db.any("SELECT * FROM users WHERE token = '" + token + "'").then(user => {
                        if (user.length === 0) {
                            token = null;
                        }

                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(global.JSON.stringify({token: token}));
                    })
                });
                break;
            }

            case '/register_user': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let name = JSON.parse(body).UserName;
                    let family = JSON.parse(body).UserFamily;
                    let email = JSON.parse(body).UserMail;
                    let login = JSON.parse(body).UserLogin;
                    let pass = JSON.parse(body).UserPass;
                    let token = md5(login + pass);

                    db.any("SELECT * FROM users WHERE token = '" + token + "'").then(user => {
                        if (user.length !== 0) {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({check: false}));
                        } else {
                            db.any("INSERT INTO users (firstname, lastname, email, login, pass, token)" +
                                " VALUES ('" + name + "', '" + family + "', '" + email
                                + "', '" + login + "', '" + pass + "', '" + token + "')")
                                .then(() => {
                                    res.writeHead(200, {'Content-Type': 'application/json'});
                                    res.end(JSON.stringify({check: true}));
                                });
                        }
                    });
                });
                break;
            }

            case '/getUser': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let token = JSON.parse(body).token;

                    db.any("SELECT * FROM users WHERE token = '" + token + "'").then(user => {
                        if (user.length !== 0) {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({
                                check: true,
                                id: user[0].id,
                                firstname: user[0].firstname,
                                lastname: user[0].lastname,
                                email: user[0].email
                            }));
                        } else {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(global.JSON.stringify({check: false}));
                        }
                    });
                });
                break;
            }

            case '/loadItems': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let section = JSON.parse(body).section;
                    if (section === 'all') {
                        db.any('SELECT * FROM products WHERE countproduct > 0').then(data => {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(global.JSON.stringify({products: data}));
                        });
                    } else {
                        db.any("SELECT * FROM products WHERE countproduct > 0 AND namesection = '" + section + "'").then(data => {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(global.JSON.stringify({products: data}));
                        });
                    }
                });
                break;
            }

            case '/loadItemsFilter': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let min = JSON.parse(body).minimum;
                    let max = JSON.parse(body).maximum;
                    let section = JSON.parse(body).cur_section;
                    let data_color = JSON.parse(body).data_color;
                    let data_material = JSON.parse(body).data_material;

                    let db_request = '';
                    if (min > -1) {
                        db_request = 'price > ' + min.toString();
                    }

                    if (max > -1) {
                        if (db_request === '') {
                            db_request = 'price < ' + max.toString();
                        } else {
                            db_request += ' AND price < ' + max.toString();
                        }
                    }

                    if (section !== 'all') {
                        if (db_request === '') {
                            db_request = "namesection = '" + section + "'";
                        } else {
                            db_request += " AND namesection = '" + section + "'";
                        }
                    }

                    if (data_color.length > 0) {
                        for (let i = 0; i < data_color.length; i++) {
                            if (db_request === '') {
                                db_request = "NOT color = '" + data_color[i] + "'";
                            } else {
                                db_request += " AND NOT color = '" + data_color[i] + "'";
                            }
                        }
                    }

                    if (data_material.length > 0) {
                        for (let i = 0; i < data_material.length; i++) {
                            if (db_request === '') {
                                db_request = "NOT material = '" + data_material[i] + "'";
                            } else {
                                db_request += " AND NOT material = '" + data_material[i] + "'";
                            }
                        }
                    }

                    if (db_request !== '') {
                        db_request = ' WHERE countproduct > 0 AND ' + db_request;
                    }
                    db.any('SELECT * FROM products' + db_request).then(data => {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(global.JSON.stringify({products: data}));
                    });
                });
                break;
            }

            case '/loadCard': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let token = JSON.parse(body).token;

                    db.any("SELECT iduser, cards.countproduct, id, nameproduct, price, image " +
                        "FROM cards LEFT JOIN products ON cards.idproduct = products.Id " +
                        "where iduser = (Select id from users where token ='" + token + "')").then(data => {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(global.JSON.stringify({cards: data}));
                    });
                });
                break;
            }

            case '/deleteOneCard': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let id_product = JSON.parse(body).id_product;
                    let token = JSON.parse(body).token;

                    db.any("Select countproduct from cards where iduser = (Select id from users where token ='"
                        + token + "')" + " AND idproduct = " + id_product).then((temp_count) => {
                        db.any("DELETE FROM cards where iduser = (Select id from users where token ='" + token + "')" +
                            " AND idproduct = " + id_product).then(() => {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(global.JSON.stringify({check: true}));

                            db.any("Select countproduct from products where id = " + id_product).then((data) => {
                                db.any("UPDATE products SET countproduct = " +
                                    (data[0].countproduct + temp_count[0].countproduct).toString() +
                                    " where id = " + id_product).then(() => {
                                });
                            });
                        });
                    });


                });
                break;
            }

            case '/payCard': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let token = JSON.parse(body).token;

                    db.any("Delete from cards where iduser = (Select id from users where token = '" + token + "')").then(data => {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(global.JSON.stringify({cards: data}));
                    });
                });
                break;
            }

            case '/countCard': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let token = JSON.parse(body).token;

                    db.any("Delete from cards where iduser = (Select id from users where token = '" + token + "')").then(data => {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(global.JSON.stringify({cards: data}));
                    });
                });
                break;
            }

            case '/getProduct': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let idProduct = JSON.parse(body).idProduct;

                    db.any('SELECT * FROM products WHERE id  = ' + idProduct).then(data => {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(global.JSON.stringify({product: data}));
                    })
                });
                break;
            }

            case '/addCard': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let token = JSON.parse(body).token;
                    let idProduct = JSON.parse(body).idProduct;
                    let count_product = JSON.parse(body).count_product;

                    db.any("SELECT countproduct FROM cards " +
                        "WHERE iduser = (Select id from users where token = '" +
                        token + "') AND idproduct = " + idProduct).then((data_count_cards) => {

                        db.any("Select countproduct from products where id = " + idProduct).then((data_count_products) => {

                            // В корзине уже есть товары?
                            if (data_count_cards.length === 0) { //Нет товаров
                                if (data_count_products[0].countproduct - count_product >= 0){
                                    db.any("INSERT INTO cards (iduser, idproduct, countproduct) " +
                                        "VALUES ((Select id from users where token = '" +
                                        token + "'), " + idProduct + ", " + count_product + ")").then(() => {
                                        res.writeHead(200, {'Content-Type': 'application/json'});
                                        res.end(global.JSON.stringify({check: true}));

                                        db.any("UPDATE products SET countproduct = " +
                                            (data_count_products[0].countproduct - count_product).toString() +
                                            "where id = " + idProduct).then((data) => {
                                        });
                                    })
                                }
                                else {
                                    res.writeHead(200, {'Content-Type': 'application/json'});
                                    res.end(global.JSON.stringify({check: false}));
                                }

                            } else {
                                if (data_count_products[0].countproduct - count_product >= 0) { //есть товары
                                    db.any("UPDATE cards SET countproduct = " + (data_count_cards[0].countproduct + count_product).toString() +
                                        " WHERE iduser = (Select id from users where token = '" +
                                        token + "') AND idproduct = " + idProduct).then(() => {
                                        res.writeHead(200, {'Content-Type': 'application/json'});
                                        res.end(global.JSON.stringify({check: true}));

                                        db.any("UPDATE products SET countproduct = " +
                                            (data_count_products[0].countproduct - count_product).toString() +
                                            "where id = " + idProduct).then((data) => {
                                        });
                                    })
                                } else {
                                    res.writeHead(200, {'Content-Type': 'application/json'});
                                    res.end(global.JSON.stringify({check: false}));
                                }
                            }
                        });
                    })
                });
                break;
            }

            case '/addOrder': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let token = JSON.parse(body).token;
                    let nameOrder = JSON.parse(body).nameOrder;
                    let products = JSON.parse(body).products;
                    let Data = new Date();
                    let month;
                    switch (Data.getMonth()) {
                        case 0:
                            month = '01';
                            break;
                        case 1:
                            month = '02';
                            break;
                        case 2:
                            month = '03';
                            break;
                        case 3:
                            month = '04';
                            break;
                        case 4:
                            month = '05';
                            break;
                        case 5:
                            month = '06';
                            break;
                        case 6:
                            month = '07';
                            break;
                        case 7:
                            month = '08';
                            break;
                        case 8:
                            month = '09';
                            break;
                        case 9:
                            month = '10';
                            break;
                        case 10:
                            month = '11';
                            break;
                        case 11:
                            month = '12';
                            break;
                    }
                    let strDate = Data.getFullYear() + '-' + month + '-' + Data.getDate();
                    let price = JSON.parse(body).price;
                    let address = JSON.parse(body).address;

                    db.any("INSERT INTO orders (iduser, nameorder, products, dataorder, price, address) " +
                        "VALUES ((Select id from users where token = '" +
                        token + "'), '" + nameOrder + "', '" + products + "', '" + strDate + "', '" + price + "', '" + address + "')").then(() => {

                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(global.JSON.stringify({check: true}));
                    })

                });
                break;
            }

            case '/getOrder': {
                let body = '';

                req.on('data', function (chunk) {
                    body += chunk;
                });

                req.on('end', function () {
                    let token = JSON.parse(body).token;

                    db.any("SELECT * FROM orders " +
                        "WHERE iduser = (Select id from users where token = '" + token + "')").then((data) => {

                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(global.JSON.stringify({orders: data}));
                    })

                });
                break;
            }

            default: {
                notFound(res);
                break;
            }
        }
    }
});

server.listen(port, host, () => {
    console.log(`Server listens http://${host}:${port}`)
});
