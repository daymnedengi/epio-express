const {Sequelize, DataTypes} = require("sequelize");

const sequelize = new Sequelize("epio", "root", "root",
{
    dialect: "mysql",
    host: "127.0.0.1",
    port: 3306,
    logging: false
});

const Article = sequelize.define("Article",
{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: DataTypes.STRING(128),
    description: DataTypes.STRING(256),
    keywords: DataTypes.STRING(128),
    category: DataTypes.STRING(16),
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(16),
        defaultValue: "ok"
    },
    image: DataTypes.STRING(256),
    content: DataTypes.TEXT
});

module.exports = {
    sequelize,
    Article
}