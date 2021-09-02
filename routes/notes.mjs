import { default as express } from "express";
import { NotesStore as notes } from "../models/notes-store.mjs";
import { ensureAuthenticated } from "./users.mjs";
import { twitterLogin } from "./users.mjs";
import { io } from "../app.mjs";
import { emitNoteTitles } from "./index.mjs";

import { default as DBG } from "debug";
const debug = DBG("notes:router-users");

export const router = express.Router();

// Add Note.
router.get("/add", ensureAuthenticated, (req, res, next) => {
  res.render("noteedit", {
    title: "Add a Note",
    docreate: true,
    notekey: "",
    user: req.user,
    note: undefined,
    twitterLogin: twitterLogin,
  });
});

// Save Note (update)
router.post("/save", ensureAuthenticated, async (req, res, next) => {
  try {
    let note;
    debug(req.body.docreate);
    if (req.body.docreate === "create") {
      debug(0);
      note = await notes.create(
        req.body.notekey,
        req.body.title,
        req.body.body
      );

      debug(note);
    } else {
      debug(1);

      note = await notes.update(
        req.body.notekey,
        req.body.title,
        req.body.body
      );
      debug(note);
    }
    res.redirect("/notes/view?key=" + req.body.notekey);
  } catch (err) {
    next(err);
  }
});

// Read Note (read)
router.get("/view", async (req, res, next) => {
  try {
    let note = await notes.read(req.query.key);
    res.render("noteview", {
      title: note ? note.title : "",
      notekey: req.query.key,
      user: req.user ? req.user : undefined,
      note: note,
      twitterLogin: twitterLogin,
    });
  } catch (err) {
    next(err);
  }
});

// Edit note (update)
router.get("/edit", ensureAuthenticated, async (req, res, next) => {
  try {
    const note = await notes.read(req.query.key);
    res.render("noteedit", {
      title: note ? "Edit " + note.title : "Add a Note",
      docreate: false,
      notekey: req.query.key,
      user: req.user,
      note: note,
      twitterLogin: twitterLogin,
    });
  } catch (err) {
    next(err);
  }
});

// Ask to Delete note (destroy)
router.get("/destroy", ensureAuthenticated, async (req, res, next) => {
  try {
    const note = await notes.read(req.query.key);
    res.render("notedestroy", {
      title: note ? `Delete ${note.title}` : "",
      notekey: req.query.key,
      user: req.user,
      note: note,
      twitterLogin: twitterLogin,
    });
  } catch (err) {
    next(err);
  }
});

// Really destroy note (destroy)
router.post("/destroy/confirm", ensureAuthenticated, async (req, res, next) => {
  try {
    await notes.destroy(req.body.notekey);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

export function init() {
  io.of("/notes").on("connect", (socket) => {
    if (socket.handshake.query.key) {
      socket.join(socket.handshake.query.key);
    }
  });
  notes.on("noteupdated", (note) => {
    const toemit = {
      key: note.key,
      title: note.title,
      body: note.body,
    };
    io.of("/notes").to(note.key).emit("noteupdated", toemit);
    emitNoteTitles();
  });
  notes.on("notedestroyed", (key) => {
    io.of("/notes").to(key).emit("notedestroyed", key);
    emitNoteTitles();
  });
}
