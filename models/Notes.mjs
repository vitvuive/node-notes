import EventEmitter from "events";
const _note_key = Symbol("key");
const _note_title = Symbol("title");
const _note_body = Symbol("body");
export class Note {
  constructor(key, title, body) {
    this[_note_key] = key;
    this[_note_title] = title;
    this[_note_body] = body;
  }
  get key() {
    return this[_note_key];
  }
  get title() {
    return this[_note_title];
  }
  set title(newTitle) {
    this[_note_title] = newTitle;
  }
  get body() {
    return this[_note_body];
  }
  set body(newBody) {
    this[_note_body] = newBody;
  }
}
export class AbstractNotesStore extends EventEmitter {
  async close() {}
  async update(key, title, body) {}
  async create(key, title, body) {}
  async read(key) {}
  async destroy(key) {}
  async keylist() {}
  async count() {}

  emitCreated(note) {
    this.emit("notecreated", note);
  }
  emitUpdated(note) {
    this.emit("noteupdated", note);
  }
  emitDestroyed(key) {
    this.emit("notedestroyed", key);
  }
}
