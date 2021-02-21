CREATE TABLE users
 (
    id SERIAL PRIMARY KEY,
    firstname CHARACTER VARYING(30),
    lastname CHARACTER VARYING(30),
    email CHARACTER VARYING(30),
    login CHARACTER VARYING(30),
    pass CHARACTER VARYING(30),
    token CHARACTER VARYING
 );
CREATE TABLE products
 (
    id SERIAL PRIMARY KEY,
    nameproduct CHARACTER VARYING(30),
    namesection CHARACTER VARYING(30),
    price INTEGER,
    countProduct INTEGER,
    description TEXT,
    image CHARACTER VARYING(30),
  material CHARACTER VARYING(30),
  color CHARACTER VARYING(30)
 );
CREATE TABLE orders
 (
 	id SERIAL PRIMARY KEY,
    iduser INTEGER REFERENCES users (Id),
    nameorder CHARACTER VARYING(30),
 	products TEXT,
 	dataorder DATE,
 	price INTEGER,
 	address CHARACTER VARYING(255)
 );
 CREATE TABLE cards
 (
    iduser INTEGER REFERENCES users (Id),
    idproduct INTEGER REFERENCES products (Id),
 	countproduct INTEGER
 );
 
 