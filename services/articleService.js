const { Op } = require("sequelize");
const { Article } = require("./sequelize.js");

// преобразуем категорию в формат для клиента
function convertCategoryObject(categoryName)
{
    let category = {};

    // так сделано чтобы в базе она хранила только одно значение
    /*
        category:
        {
            link: "link", // ссылка
            title: "title" // заголовок
        }
    */
    switch (categoryName)
    {
        case "news": category = { link: "category?name=news", title: "Новости" }; break;
        case "articles": category = { link: "category?name=articles", title: "Статьи" }; break;
        case "reviews": category = { link: "category?name=reviews", title: "Обзоры" }; break;
        case "humor": category = { link: "category?name=humor", title: "Юмор" }; break;
        case "files": category = { link: "category?name=files", title: "Файлы" }; break;
        default: category = { link: "/", title: "" }; break;
    }

    return category;
}

// функция создает новую статью в базе данных
async function createArticle(article)
{
    return new Article(article).save();
}

// функция возвращает массив статей из результата запроса
function getArticlesFromResult(result)
{
    // здесь храним статьи
    let articles = [];

    for (let i = 0, l = result.length; i < l; i++)
    {
        // получаем новую статью
        let article = result[i].dataValues;

        article.category = convertCategoryObject(article.category); // преобразуем категорию в формат для навигации
        article.createdAt = new Date(article.createdAt).toLocaleDateString(); // преобразуем время в формат понятный пользователю

        // добавляем новую статью
        articles.push(article);
    }

    return articles;
}

// функция возвращает все статьи для отображения на главное странице отсортировав по дате создания
async function getArticles()
{
    // получаем все статьи из базы данных, у которых статус ок и сортируем их по ид (это все равно что по дате создания)
    let result = await Article.findAll(
    {
        attributes: ["id", "createdAt", "title", "description", "category", "views", "image"],
        where: { status: "OK" },
        order: [["id", "DESC"]]
    });

    if (result.length > 0)
        return getArticlesFromResult(result);

    return null;
}

// функция возвращает статьи по указанной категории
async function getArticlesByCategory(categoryName)
{
    let result = null; // результат запроса
    let where = {}; // условие
    let order = []; // сортировака

    // если категория Лучшее, то нужно вывести по просмотрам
    if (categoryName == "bests")
    {
        where = { status: "OK" };
        order.push(["views", "DESC"]);
    }
    else
    {
        where = { category: categoryName, status: "OK"};
        order.push(["id", "DESC"]);
    }

    result = await Article.findAll(
    {
        attributes: ["id", "createdAt", "title", "description", "category", "views", "image"],
        where: where,
        order: order
    });

    if (result.length > 0)
        return getArticlesFromResult(result);
    
    return null;
}

// функция возвращает статьи по поиску
async function getArticlesBySearch(query)
{
    // получаем все статьи из базы данных
    let result = await Article.findAll(
    {
        attributes: ["id", "createdAt", "title", "description", "category", "views", "image"],
        /*
            в условии формируем следущий запрос:
            status = "OK" OR (title LIKE(%query%) AND description LIKE(%query%) AND keywords LIKE(%query%)) 
        */
        where: 
        {
            status: "OK",
            [Op.or]: 
            {
                title:
                {
                    [Op.substring]: query
                },
                description:
                {
                    [Op.substring]: query
                },
                keywords:
                {
                    [Op.substring]: query
                }
            }
        },
        order: [["id", "DESC"]]
    });

    if (result.length > 0)
    {
        return getArticlesFromResult(result);
    }

    return null;
}

// функция возвращает статью по ид
async function getArticleById(id)
{
    // отправляем запрос и проверяем результат
    let result = await Article.findOne(
    { 
        attributes: ["id", "createdAt", "title", "description", "keywords", "views", "image", "content"],
        where: 
        { 
            id: id, 
            status: "OK" 
        }
        // тут не все поля нужны
    });

    if (result && Object.keys(result).length > 0)
    {
        // для удобства выносим в отдельную переменную
        let article = result.dataValues;

        // преобразовываем дату в формат понятный пользователю
        article.createdAt = new Date(article.createdAt).toLocaleDateString();

        // увеличиваем и обновляем счетчик просмотров в бд
        article.views += 1;
        Article.update({ views: article.views }, { where: { id: article.id } });

        return article;
    }

    return null;
}

module.exports = {
    createArticle,
    getArticles,
    getArticlesByCategory,
    getArticlesBySearch,
    getArticleById
}