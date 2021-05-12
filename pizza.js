const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const mongodb = require("mongodb");
const URL = "mongodb+srv://mallika:hemasundari@cluster0.bl042.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

//Admin

app.post("/adminregister", async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        let isEmailUnique = await db.collection("admin").findOne({ email: req.body.email });
        if (isEmailUnique) {
            res.status(401).json({
                message: "Email already exists"
            })
        }
        else {
            //Generate a salt
            let salt = await bcrypt.genSalt(10);
            //Hash the password with salt
            let hash = await bcrypt.hash(req.body.password, salt);
            //Store it in the db
            req.body.password = hash;
            let users = await db.collection("admin").insertOne(req.body);
            // console.log(hash);
            // console.log(users.ops);
            res.json({
                message: "User Registered"
            })
        }

    } catch (error) {
        console.log(error);
    }
})

//Login
app.post("/adminlogin", async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");

        //Find the user with the emailID
        let user = await db.collection("admin").findOne({ email: req.body.email });
        //Hash the password
        //Check the hashed password with users
        if (user) {
            let isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
            if (isPasswordCorrect) {
                //Generate Token
                let token = jwt.sign({ _id: user._id }, "secretinfo")
                //Pass token
                res.json({
                    message: "Allow",
                    token: token,
                    id: user._id
                })
            }
            else {
                res.json({
                    message: "Email or Password is Incorrect"
                })
            }
        }
        else {
            res.status(404).json({
                message: "Email or Password is Incorrect"
            })
        }
        //If correct -- Allow the user

    } catch (error) {
        console.log(error);
    }
})

app.post("/adminpost/:id", authenticate, async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        let user = await db.collection("admin").updateOne({ _id: mongodb.ObjectID(req.params.id) }, { $push: { products: req.body } });
        // console.log(user);
        await connection.close();
        res.json({
            message: "Product recieved"
        })
    } catch (error) {
        console.log(error)
    }
})

app.post("/adminpostpizza/:id", authenticate, async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        let user = await db.collection("admin").updateOne({ _id: mongodb.ObjectID(req.params.id) }, { $push: { pizzas: req.body } });
        // console.log(user);
        await connection.close();
        res.json({
            message: "Product recieved"
        })
    } catch (error) {
        console.log(error)
    }
})

app.get("/admingetprod", async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        let prod = await db.collection("admin").findOne();
        // console.log(prod);
        await connection.close();
        res.json(prod);
    } catch (error) {
        console.log(error)
    }
})

//Registration
app.post("/register", async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        let isEmailUnique = await db.collection("register").findOne({ email: req.body.email });
        if (isEmailUnique) {
            res.status(401).json({
                message: "Email already exists"
            })
        }
        else {
            //Generate a salt
            let salt = await bcrypt.genSalt(10);
            //Hash the password with salt
            let hash = await bcrypt.hash(req.body.password, salt);
            //Store it in the db
            req.body.password = hash;
            let users = await db.collection("register").insertOne(req.body);
            // console.log(hash);
            // console.log(users.ops);
            res.json({
                message: "User Registered"
            })
        }

    } catch (error) {
        console.log(error);
    }
})

//Login
app.post("/login", async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");

        //Find the user with the emailID
        let user = await db.collection("register").findOne({ email: req.body.email });
        //Hash the password
        //Check the hashed password with users
        if (user) {
            let isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
            if (isPasswordCorrect) {
                //Generate Token
                let token = jwt.sign({ _id: user._id }, "secretinfo")
                //Pass token
                res.json({
                    message: "Allow",
                    token: token,
                    id: user._id
                })
            }
            else {
                res.json({
                    message: "Email or Password is Incorrect"
                })
            }
        }
        else {
            res.status(404).json({
                message: "Email or Password is Incorrect"
            })
        }
        //If correct -- Allow the user

    } catch (error) {
        console.log(error);
    }
})

//middleware for common place
function authenticate(req, res, next) {
    if (req.headers.authorization) {
        try {
            let jwtValid = jwt.verify(req.headers.authorization, "secretinfo");
            if (jwtValid) {
                req.userId = jwtValid._id;
                next();
            }
        } catch (error) {
            res.status(401).json({
                message: "Invalid Token"
            })
        }
    }
    else {
        res.status(401).json({
            message: "No Token Present"
        })
    }
}

app.get("/:id", authenticate, async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        let order = await db.collection("register").findOne({ _id: mongodb.ObjectID(req.params.id) });
        await connection.close();
        res.json(order);
    } catch (error) {
        console.log(error);
    }
});

app.post("/:id", authenticate, async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        await db.collection("register").updateOne({ _id: mongodb.ObjectID(req.params.id) }, { $push: { order: req.body } });
        await connection.close();
        res.json({
            message: "Order recieved"
        })
    } catch (error) {
        console.log(error);
    }
});

app.post("/pizza/:id", authenticate, async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        await db.collection("register").updateOne({ _id: mongodb.ObjectID(req.params.id) }, { $push: { pizzas: req.body } });
        await connection.close();
        res.json({
            message: "Order recieved"
        })
    } catch (error) {
        console.log(error);
    }
});

app.put("/delcustompizza/:id", async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        // let orderdetails = await db.collection("register").findOne({ _id: mongodb.ObjectID(req.params.id) });
        let order = await db.collection("register").updateOne(
            { _id: mongodb.ObjectID(req.params.id) },
            { $pull: { order: { base: req.body.base } } });
        await connection.close();
        res.json(order);
    } catch (error) {
        console.log(error);
    }
});

app.put("/delpizza/:id", async (req, res) => {
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db("delivery");
        // let orderdetails = await db.collection("register").findOne({ _id: mongodb.ObjectID(req.params.id) });
        let order = await db.collection("register").updateOne(
            { _id: mongodb.ObjectID(req.params.id) },
            { $pull: { pizzas: { title: req.body.title } } });
        await connection.close();
        res.json(order);
    } catch (error) {
        console.log(error);
    }
});

app.listen(process.env.PORT || 3001);

