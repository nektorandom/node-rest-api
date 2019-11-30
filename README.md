# node-rest-api
lesson example


## Before start
Install PostgresSQL

```
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Login to postgres
```
sudo -u postgres psql
```

Create user and password
```
CREATE ROLE api_user WITH LOGIN PASSWORD 'password';
ALTER ROLE api_user CREATEDB;
```

Logout of the root
```
\q
psql -d postgres -U api_user
```

Create db
```
CREATE DATABASE books_api;
\c books_api
```

Create table
```
CREATE TABLE books (
  ID SERIAL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL
);
```
Insert
```
INSERT INTO books (author, title)
VALUES  ('J.K. Rowling', 'Harry Potter');
```