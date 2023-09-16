const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

// путь для сохранения загруженных изображений
const UPLOAD_IMAGE_DIR = path.join(__dirname, "..", "public", "upload", "img", "/");

// данный маршрут принимает отправленное от клиента изображение
// отправленное изображенние представляет из себя массив двоичных данных
router.post("/upload/image", (request, response) =>
{
    // проверяем было ли отправлено название файла (так как в нем указано расширение)
    let fileName = request.query.name;

    if (!fileName)
    {
        response.sendStatus(400);
        return;
    }

    // генерируем новое имя и создаем поток записи файла
    // нельзя указать в новом имени константу UPLOAD_IMAGE_DIR, так как оно отправиться клиенту
    let newFileName = "epio-site-" + new Date().getTime() + fileName;
    let writableStream = fs.createWriteStream(UPLOAD_IMAGE_DIR + newFileName);

    // пишем данные по мере получения
    request.on("data", chunk =>
    {
        writableStream.write(chunk);
    });

    // после того как все данные получены, закрываем поток
    // и отправляем имя созданного файла
    request.on("end", () =>
    {  
        writableStream.end();
        response.status(201).send(newFileName);
    });

    // в случае ошибки тоже закрываем поток и отправляем ответ (нужно будет потом сделать удаление файла)
    request.on("error", () =>
    {
        writableStream.end();
        response.status(520).send("");
    });
});

module.exports = router;