import express from "express";
import { Database } from "sqlite3";

import { ads } from "./ads";

const db = new Database("db.sqlite");

const server = express();
server.use(express.json());

// Hello world
server.get("/", (request, response) => {
  response.send("Hello from Express server.");
});

// GET /ads
server.get("/ads", (request, response) => {
  db.all("SELECT * FROM Ad;", (err, ads) => {
    response.json({ ads });
  });
});

// POST /ads
server.post("/ads", (request, response) => {
  const ad = request.body;

  ads.push(ad);
  response.status(201).json({ ad });
});

// GET /ads/:id
server.get("/ads/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const ad = ads.find((ad) => ad.id === id);
  if (!ad) {
    response.sendStatus(404);
  }
  response.json({ ad });
});

// DELETE /ads/:id
server.delete("/ads/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const adIndex = ads.findIndex((ad) => ad.id === id);
  if (adIndex === -1) {
    response.sendStatus(404);
  }
  const ad = ads[adIndex];
  ads.splice(adIndex, 1);
  response.json({ ad });
});

// PUT /ads/:id
server.put("/ads/:id", (request, response) => {
  const _id = parseInt(request.params.id);
  const adIndex = ads.findIndex((ad) => ad.id === _id);
  if (adIndex === -1) {
    response.sendStatus(404);
  }
  const ad = ads[adIndex];
  const rawData = request.body;
  const updatedAd = {
    ...ad,
    title: rawData.title || ad.title,
    description: rawData.description ?? ad.description,
    owner: rawData.owner || ad.owner,
    price: rawData.price ?? ad.price,
    picture: rawData.picture ?? ad.picture,
    location: rawData.location ?? ad.location,
  };

  ads.splice(adIndex, 1, updatedAd);
  response.json({ ad: updatedAd });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
