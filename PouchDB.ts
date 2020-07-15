import url from "url";
import PouchDB from "pouchdb";
import { Topic } from "./DiscourseAPI";
PouchDB.plugin(require("pouchdb-upsertex"));
require("dotenv").config();

type UpsertablePouchDB<T> = PouchDB.Database<T> & {
  upsert: (doc: any) => void;
};

const dbName = url.parse(process.env.DISCOURSE_URL!).host!;

export const db: UpsertablePouchDB<Topic> = new PouchDB(dbName, {
  auto_compaction: true,
}) as UpsertablePouchDB<Topic>;

db.info().then((info) => console.log("Database info:", info));
