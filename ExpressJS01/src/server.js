require("dotenv").config();

// import các nguồn cần dùng
const express = require("express");
const configViewEngine = require("./config/viewEngine");
const apiRoutes = require("./routes/api");
const { connection, syncDatabase } = require("./config/database");
const { getUserEntity } = require("./models/user");
const { getHomepage } = require("./controllers/homeController.js");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use("/", webAPI);

app.use("/v1/api/", apiRoutes);

(async () => {
    try {
        // kết nối database using mongoose
        // await mongoose.connect(process.env.MONGO_DB_URL);
        // đã chuyển sang MySQL qua hàm connection()
        await connection();
        getUserEntity();
        await syncDatabase();

        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`);
        });
    } catch (error) {
        console.log(">>> Error connect to DB: ", error);
    }
})();
