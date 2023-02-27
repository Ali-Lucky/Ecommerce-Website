const express = require('express');
const mongoose = require('mongoose');
const route = require('./route/route.js');

const app = express();
app.use(express.json());

mongoose.set('strictQuery', false);

// =============== Connect with DB ===================== //
mongoose.connect("mongodb+srv://Lucky:ejIoY6iVVc1sRKbS@cluster0.byhslvl.mongodb.net/Ecommerce_Website", () => {
    useNewUrlParser: true;
})
    .then(() => {
        console.log("MongoDb is Connected");
    })
    .catch((err) => {
        console.log(err);
    });

// ================= Global middleware ========================== //
app.use('/', route);

// ================= If user providing wrong URL ========================== //
app.use((req, res) => {
    return res.status(404).send({ status: false, message: "Incorrect URL! Please enter valid URL" });
});

// ==================== listen port for server ======================== //
app.listen(process.env.PORT || 3000, () => {
    console.log("App running on PORT : " + (process.env.PORT || 3000));
});