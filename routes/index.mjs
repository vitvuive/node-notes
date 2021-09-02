import { default as express } from "express";
import { NotesStore as notes } from "../app.mjs";
import { twitterLogin } from "./users.mjs";

export const router = express.Router();
export function init() {}

/* GET home page. */
router.get("/", async (req, res, next) => {
  try {
    const keylist = await notes.keylist();
    // console.log(`keylist ${util.inspect(keylist)}`);
    const keyPromises = keylist.map((key) => {
      return notes.read(key);
    });
    const notelist = await Promise.all(keyPromises);
    // console.log(util.inspect(notelist));
    res.render("index", {
      title: "Notes",
      notelist: notelist,
      user: req.user ? req.user : undefined,
      twitterLogin: twitterLogin,
    });
  } catch (err) {
    next(err);
  }
});
