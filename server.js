import express from "express";
import { Cat } from "./models.js";

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// api

app.get("/api/cats", async (req, res) => {
  res.json(await Cat.findAll());
});

app.post("/api/cats", async (req, res) => {
  if (
    !(req.body.name && req.body.age) ||
    isNaN(parseInt(req.body.age)) ||
    (await Cat.findAll({ where: { name: req.body.name } })).length > 0
  ) {
    res.statusCode = 400;
    res.end();
  } else {
    await Cat.create({
      name: req.body.name,
      age: req.body.age,
    });
    res.end();
  }
});

// web

async function renderFrontpage(req, res, msg) {
  const options = {
    cats: await Cat.findAll(),
  };
  if (req.body) {
    if (req.body.name) options.name = req.body.name;
    if (req.body.age) options.age = req.body.age;
  }
  if (msg) {
    res.statusCode = 400;
    options.msg = msg;
  }
  res.render("index", options);
}

app.get("/", (req, res) => res.redirect("/cats"));
app.get("/cats", async (req, res) => renderFrontpage(req, res));

app.post("/cats", async (req, res) => {
  if (!(req.body.name && req.body.age))
    renderFrontpage(req, res, "You must fill out both fields!");
  else if (isNaN(parseInt(req.body.age)))
    renderFrontpage(req, res, "The age must be a number!");
  else if ((await Cat.findAll({ where: { name: req.body.name } })).length > 0)
    renderFrontpage(req, res, "That name is already taken!");
  else {
    await Cat.create({
      name: req.body.name,
      age: req.body.age,
    });
    res.redirect("/cats");
  }
});

app.post("/deletecat", async (req, res) => {
  const id = parseInt(req.query.id);
  await Cat.destroy({ where: { id: id } });
  res.redirect("/cats");
});

// does not work if names are unique
// app.post("/copycat", async (req, res) => {
//   const id = parseInt(req.query.id);
//   const cat = await Cat.findByPk(id);
//   await Cat.create({
//     name: cat.name,
//     age: cat.age,
//   });
//   res.redirect("/cats");
// });

async function renderEditPage(req, res, cat, msg) {
  const options = {
    cat: cat,
  };
  if (msg) {
    res.statusCode = 400;
    options.msg = msg;
  }
  res.render("edit", options);
}

app.get("/editcat", async (req, res) => {
  const id = parseInt(req.query.id);
  const cat = await Cat.findByPk(id);
  renderEditPage(req, res, cat);
});

app.post("/editcat", async (req, res) => {
  const id = parseInt(req.query.id);
  const cat = await Cat.findByPk(id);
  const modifiedCat = {
    id: id,
    name: req.body.name,
    age: req.body.age,
  };
  if (!(req.body.name && req.body.age))
    renderEditPage(req, res, modifiedCat, "You must fill out both fields!");
  else if (isNaN(parseInt(req.body.age)))
    renderEditPage(req, res, modifiedCat, "The age must be a number!");
  else if (
    modifiedCat.name != cat.name &&
    (await Cat.findAll({ where: { name: modifiedCat.name } })).length > 0
  )
    renderEditPage(req, res, modifiedCat, "That name is already taken!");
  else {
    cat.name = modifiedCat.name;
    cat.age = modifiedCat.age;
    cat.save();
    res.redirect("/cats");
  }
});

const port = 4444;
app.listen(port, () => console.log(`Listening on :${port}`));
