/* --------------------------

   INITIAL EXPRESS CONFIG  
   (Middleware, CORS, JSON)

-------------------------- */

import express, { json } from "express";

/* Use cors to avoid issues with testing on localhost */
import cors from "cors";

const app = express();

/* Base url parameters and port settings */
const apiPath = "/api/";
const version = "v1";
const port = 3000;

/* Set Cors-related headers to prevent blocking of local requests */
app.use(json());
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/* Initial Data */
import { events, attendees } from "./data/initialData.js";
import { nextEventId, nextAttendeeId } from "./data/initialData.js";

const basePath = `${apiPath}${version}`; 

/* --------------------------

      EVENTS ENDPOINTS     

-------------------------- */
app.get(`${basePath}/events`, (req, res) => {
  let result = events;

  const { name, location } = req.query;

  if (name) {
    const n = String(name).toLowerCase();
    result = result.filter((e) => String(e.name).toLowerCase().includes(n))
  }

  if (location) {
    const l = String(location).toLowerCase();
    result = result.filter((e) => String(e.name).toLowerCase().includes(l))
  }

  return res.status(200).json(result)
});

app.get(`${basePath}/events/:eventId`, (req, res) => {
  const id = Number(req.params.eventId);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "id must be a number." });
  }

  const event = events.find((e) => e.id === id);

  if (!event) {
    return res.status(404).json({ message: "event not found" });
  }

  const attendeeCount = attendees.filter((a) => Array.isArray(a.eventIds) && a.eventIds.includes(id)).length;

  return res.status(200).json({ ...event, attendeeCount });
});


/* --------------------------

    ATTENDEES ENDPOINTS    

-------------------------- */
app.get(`${basePath}/attendees`, (req, res) => {
  return res.status(200).json(attendees);
});
/* --------------------------

      SERVER INITIALIZATION  
      
!! DO NOT REMOVE OR CHANGE THE FOLLOWING (IT HAS TO BE AT THE END OF THE FILE) !!
      
-------------------------- */
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
