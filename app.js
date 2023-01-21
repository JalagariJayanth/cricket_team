const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost/3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializedbandserver();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getplayers = `
    SELECT *
    FROM
       cricket_team`;
  const playersarray = await db.all(getplayers);
  response.send(
    playersarray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playersdetails = request.body;
  const { playerName, jerseyNumber, role } = playersdetails;
  const addplayer = `
    INSERT INTO 
        cricket_team (player_name,jersey_number,role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    )`;
  await db.run(addplayer);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const player = `
    SELECT *
    FROM 
       cricket_team
    WHERE player_id = ${playerId}`;
  const playerdetail = await db.get(player);
  response.send(convertDbObjectToResponseObject(playerdetail));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersdetails = request.body;
  const { playerName, jerseyNumber, role } = playersdetails;
  const updateplayer = `
    UPDATE 
           cricket_team
    SET player_name = '${playerName}',
         jersey_number = ${jerseyNumber},
         role = '${role}'
    WHERE player_id = ${playerId}`;
  await db.run(updateplayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteplayer = `
    DELETE FROM 
         cricket_team
    WHERE player_id = ${playerId}`;
  await db.run(deleteplayer);
  response.send("Player Removed");
});

module.exports = app;
