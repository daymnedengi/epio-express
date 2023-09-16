const mysql = require("mysql2");

const mysqlConnection = mysql.createConnection(
    {
        host: "127.0.0.1",
        user: "root",
        database: "epio",
        password: "root"
    }
);

mysqlConnection.connect(function(error)
{
    if (!error)
    {
        console.log("База данных успешно подключена.");
    }
    else
    {
        console.log("Не удалось подключиться к базе данных!");
    }
})

module.exports = 
{
    createArticle: function(article)
    {
        return new Promise(function(resolve, reject)
        {
            
        });
    },

    getArticleById: function(id)
    {
        return new Promise(function(resolve, reject)
        {
            mysqlConnection.query("SELECT * FROM `articles` WHERE `articles`.`id` = " + id, function (error, result, fields)
            {
                if (!error) resolve(result);
                else reject(error);
            });
        });
    },

    getArticlesForMainPage: function()
    {
        return new Promise(function(resolve, reject)
        {
            mysqlConnection.query("SELECT \
                                        `id`, \
                                        `createdAt`, \
                                        `title`, \
                                        `description`, \
                                        `category`, \
                                        `views`, \
                                        `image` \
                                    FROM \
                                        `articles`", function(error, result, fields)
            {
                if (!error) resolve(result);
                else reject(error);
            });
        });
    }
}