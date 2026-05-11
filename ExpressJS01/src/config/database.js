require("dotenv").config();
const { Sequelize } = require("sequelize");

// const mongoose = require("mongoose");

// const dbState = [{
//     value: 0,
//     label: "Disconnected"
// },
// {
//     value: 1,
//     label: "Connected"
// },
// {
//     value: 2,
//     label: "Connecting"
// },
// {
//     value: 3,
//     label: "Disconnecting"
// }];

let sequelize;

const getSequelize = () => {
    if (!sequelize) {
        throw new Error("Sequelize chưa được khởi tạo");
    }
    return sequelize;
};

const connection = async () => {
    // await mongoose.connect(process.env.MONGO_DB_URL);
    // const state = Number(mongoose.connection.readyState);
    // console.log(dbState.find(f => f.value === state).label, "to database");

    sequelize = new Sequelize(
        process.env.MYSQL_DATABASE,
        process.env.MYSQL_USER,
        process.env.MYSQL_PASSWORD,
        {
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT || 3306),
            dialect: "mysql",
            logging: false,
            pool: {
                max: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );

    await sequelize.authenticate();
    console.log("Connected to MySQL database");
};

const syncDatabase = async () => {
    const sequelizeInstance = getSequelize();
    await sequelizeInstance.sync({ alter: true });
    console.log("MySQL schema synced");
};

module.exports = {
    connection,
    getSequelize,
    syncDatabase
};
