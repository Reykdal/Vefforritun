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
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

/* Initial Data */
import { events, attendees } from "./data/initialData.js";
import { getNextEventId, getNextAttendeeId } from "./data/initialData.js";

const basePath = `${apiPath}${version}`;

/* --------------------------

      EVENTS ENDPOINTS

-------------------------- */
app.get(`${basePath}/events`, (req, res) => {
  const allowed = ["name", "location"];
  const keys = Object.keys(req.query);

  if (keys.some((k) => !allowed.includes(k))) {
    return res.status(400).json({
      message: "Incorrect query input. Only name and location are allowed.",
    });
  }

  let result = events;

  const { name, location } = req.query;

  if (name) {
    const n = String(name).toLowerCase();
    result = result.filter((e) => String(e.name).toLowerCase().includes(n));
  }

  if (location) {
    const l = String(location).toLowerCase();
    result = result.filter((e) => String(e.location).toLowerCase().includes(l));
  }

  return res.status(200).json(result);
});

app.get(`${basePath}/events/:eventId`, (req, res) => {
  const id = Number(req.params.eventId);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "id must be a integer." });
  }

  const event = events.find((e) => e.id === id);

  if (!event) {
    return res.status(404).json({ message: "event not found" });
  }

  const attendeeCount = attendees.filter(
    (a) => Array.isArray(a.eventIds) && a.eventIds.includes(id),
  ).length;

  return res.status(200).json({ ...event, attendeeCount });
});

app.post(`${basePath}/events`, (req, res) => {
  const { name, location, date } = req.body;

  if (!name || !location || !date) {
    return res
      .status(400)
      .json({ message: "Fields name, location, and date are required." });
  }

  const name_trim = String(name).trim();
  const location_trim = String(location).trim();
  const date_trim = String(date).trim();

  if (!name_trim || !location_trim || !date_trim) {
    return res
      .status(400)
      .json({ message: "Fields name, location, and date must not be empty." });
  }

  const is_date_valid = /^\d{4}-\d{2}-\d{2}$/.test(date_trim);
  if (!is_date_valid) {
    return res
      .status(400)
      .json({ message: "Field date must be in the format YYYY-MM-DD." });
  }

  if (
    events.some(
      (event) =>
        event.name.toLowerCase() === name_trim.toLowerCase() &&
        event.location.toLowerCase() === location_trim.toLowerCase() &&
        event.date === date_trim,
    )
  ) {
    return res.status(400).json({
      message: "Event with the same name, location, and date already exists.",
    });
  }

  const newEvent = {
    id: getNextEventId(),
    name: name_trim,
    location: location_trim,
    date: date_trim,
  };

  events.push(newEvent);

  return res.status(201).json(newEvent);
});

app.patch(`${basePath}/events/:eventId`, (req, res) => {
  const { name, location, date } = req.body;
  const { eventId } = req.params;

  const EID = Number(eventId);

  if (!Number.isInteger(EID)) {
    return res.status(400).json({ message: "Field eventId must be a number." });
  }

  if (![name, location, date].some((field) => field)) {
    return res.status(400).json({
      message: "At least one of name, location, or date must be provided.",
    });
  }

  const event = events.find((event) => event.id === EID);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }
  const updatedEvent = { ...event };

  if (name) {
    const name_trim = String(name).trim();
    if (!name_trim) {
      return res.status(400).json({ message: "Name must not be empty." });
    }
    updatedEvent.name = name_trim;
  }
  if (location) {
    const location_trim = String(location).trim();
    if (!location_trim) {
      return res.status(400).json({ message: "Location must not be empty." });
    }
    updatedEvent.location = location_trim;
  }
  if (date) {
    const date_trim = String(date).trim();
    if (!date_trim) {
      return res.status(400).json({ message: "Date must not be empty." });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date_trim)) {
      return res
        .status(400)
        .json({ message: "Date must be in YYYY-MM-DD format." });
    }

    updatedEvent.date = date_trim;
  }

  if (
    events.some(
      (event) =>
        event.id !== EID &&
        event.name.toLowerCase() === updatedEvent.name.toLowerCase() &&
        event.location.toLowerCase() === updatedEvent.location.toLowerCase() &&
        event.date === updatedEvent.date,
    )
  ) {
    return res.status(400).json({
      message: "Event with the same name, location, and date already exists.",
    });
  }

  event.name = updatedEvent.name;
  event.location = updatedEvent.location;
  event.date = updatedEvent.date;

  return res.status(200).json(event);
});

app.delete(`${basePath}/events/:eventId`, (req, res) => {
  const { eventId } = req.params;
  const EID = Number(eventId);
  if (!Number.isInteger(EID)) {
    return res.status(400).json({ message: "Event ID must be a number." });
  }
  const event = events.find((event) => event.id === EID);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  for (const attendee of attendees) {
    for (const eid of attendee.eventIds) {
      if (eid === EID) {
        return res
          .status(400)
          .json({ message: "Event has attendees, cannot delete." });
      }
    }
  }

  const deleted = events.splice(events.indexOf(event), 1)[0];
  return res.status(200).json(deleted);
});

app.delete(`${basePath}/events`, (req, res) => {
  return res.status(405).json({ message: "Cannot delete all events." });
});

/* --------------------------

    ATTENDEES ENDPOINTS

-------------------------- */
app.get(`${basePath}/attendees`, (req, res) => {
  return res.status(200).json(attendees);
});

app.post(`${basePath}/attendees`, (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "Fields name and email are required fields." });
  }

  const name_trim = String(name).trim();
  const email_trim = String(email).trim();

  if (
    !name_trim ||
    !email_trim ||
    !email_trim.includes("@") ||
    !email_trim.includes(".")
  ) {
    return res
      .status(400)
      .json({ message: "Fields name and email must not be empty." });
  }

  if (
    attendees.some(
      (attendee) => attendee.email.toLowerCase() === email_trim.toLowerCase(),
    )
  ) {
    return res
      .status(400)
      .json({ message: `Email "${email_trim}" already in use.` });
  }

  const newAttendee = {
    id: getNextAttendeeId(),
    name: name_trim,
    email: email_trim,
    eventIds: [],
  };

  attendees.push(newAttendee);

  return res.status(201).json(newAttendee);
});

app.post(`${basePath}/attendees/:attendeeId/:eventId`, (req, res) => {
  const { attendeeId, eventId } = req.params;

  const AID = Number(attendeeId);
  const EID = Number(eventId);

  if (!Number.isInteger(EID) || !Number.isInteger(AID)) {
    return res
      .status(400)
      .json({ message: "Fields eventId and attendeeId must be numbers." });
  }

  const attendee = attendees.find((attendee) => attendee.id === AID);

  if (!attendee) {
    return res.status(404).json({ message: "Attendee not found." });
  }

  const event = events.find((event) => event.id === EID);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  if (attendee.eventIds.includes(EID)) {
    return res
      .status(400)
      .json({ message: "Attendee already registered for this event." });
  }

  attendee.eventIds.push(EID);

  return res.status(200).json(attendee);
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
