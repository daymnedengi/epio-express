const express = require("express");
const bodyParser = require("body-parser");
const articleService = require("../services/articleService.js");

const router = express.Router({strict: true});

const ACCESS_KEY = 13258;

// функция возвращает заголовк категории
function getCategoryTitle(categoryName)
{
    switch (categoryName)
    {
        case "news": return "Новости";
        case "bests": return "Лучшее";
        case "articles": return "Статьи";
        case "reviews": return "Обзоры";
        case "humor": return "Юмор";
        case "files": return "Файлы";
        default: "";
    }
}

// главная страница
router.get("/", async (request, response) =>
{
    try
    {
        let articles = await articleService.getArticles();
        if (!articles) throw new Error();
        response.render("index.ejs", { title: "Главная", articles: articles });
    }
    catch
    {
        response.render("index.ejs", { title: "Главная" });
    }
});

// главная страница категорией
router.get("/category", async (request, response) =>
{
    try
    {
        if (!request.query.name) throw new Error();

        let articles = await articleService.getArticlesByCategory(request.query.name);
        if (!articles) throw new Error();
        
        response.render("index.ejs", { title: getCategoryTitle(request.query.name), articles: articles });
    }
    catch
    {
        response.render("index.ejs", { title: getCategoryTitle(request.query.name) });
    }
});

router.get("/search", async (request, response) =>
{
    try
    {
        if (!request.query.query) throw new Error();

        let articles = await articleService.getArticlesBySearch(request.query.query);
        if (!articles) throw new Error();

        response.render("index.ejs", { title: "Результаты по запросу: " + request.query.query, articles: articles });
    }
    catch (error)
    {
        response.render("index.ejs", {title: "Результаты по запросу: " + request.query.query });
    }
});

// страница статьи
router.get("/article", async (request, response) =>
{
    try
    {
        let articleId = parseInt(request.query.id);
        if (!articleId) throw new Error();

        let article = await articleService.getArticleById(articleId);
        if (!article) throw new Error();

        response.render("article.ejs", { article: article });
    }
    catch
    {
        response.status(404);
        response.render("not-found.ejs", {url: request.fullUrl});
    }
});

// станица редактора статьи
router.get("/editor", (request, response) =>
{
    // проверяем указан ли ключ доступа
    let accessKey = request.query.accessKey;

    if (!accessKey || accessKey != ACCESS_KEY)
    {
        response.status(404);
        response.render("not-found.ejs", { url: request.fullUrl });
    }
    else
    {
        response.render("editor.ejs");
    }
});

// создаем новую статью
router.post("/article", bodyParser.text(), async (request, response) =>
{
    try
    {
        // проверяем указан ли ключ доступа
        let accessKey = request.query.accessKey;

        if (!accessKey || accessKey != ACCESS_KEY)
        {
            response.sendStatus(404);
        }
        else
        {
            let article = JSON.parse(request.body);
            if (!article) throw new Error();

            await articleService.createArticle(article);
            response.sendStatus(201);
        }
    }
    catch
    {
        console.log("Не удалось сохранить статью!");
        response.sendStatus(520);
    }
})

// страница 404 для GET запросов
// в файле index.js тоже есть middleware для остальных запросов
router.get("*", (request, response) =>
{
    response.status(404);
    response.render("not-found.ejs", {url: request.fullUrl});
})

module.exports = router;