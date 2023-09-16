/*
    Сделать ответ 200 для статики вместо 304 (хз как сделать на express.static)
*/

const https = require("https");
const fs = require("fs");
const express = require("express");
const {sequelize} = require("./services/sequelize.js");

const pageRoutes = require("./routes/pageRouter.js");
const uploadRoutes = require("./routes/uploadRouter.js");

const options =
{
    cert: fs.readFileSync("./sslcert/fullchain.pem"),
    key: fs.readFileSync("./sslcert/privkey.pem")
};

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// эта функция должна идти первой в цепочке обработчиков запроса
app.use("*", (request, response, next) =>
{
    request.fullUrl = request.protocol + "://" + request.hostname + request.originalUrl; // порой нужно получить полный url запроса
    
    // выводим запрос в консоль
    let currentDate = new Date();
    console.log(`${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()} | [${request.method}] ${request.ip} - ${request.fullUrl}`);

    next();
});

app.use(express.static(__dirname + "/public")); // статика
app.use(pageRoutes); // страницы
app.use(uploadRoutes); // загрузка файлов на сервер

// страница 404 реализована в pageRoutes как GET
// эта функция для остальных 404
app.use("*", (request, response) =>
{
    response.sendStatus(404);
})

async function start() 
{
    try
    {
        await sequelize.authenticate();
        https.createServer(options, app).listen(443, () =>
        {
            console.log("Сервер запущен на 443 порте.");
        });
    }
    catch (error)
    {
        console.log(error);
    }
}

start();