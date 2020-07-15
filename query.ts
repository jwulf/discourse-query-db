import PouchDB from "pouchdb";
import dayjs from "dayjs";
import {
  openSpreadsheet,
  getSheetIndexByTitle,
  spreadsheetEnabled,
  createMissingTabs,
} from "./GoogleSheets";
import { db } from "./PouchDB";
import { query } from "./custom-query";
PouchDB.plugin(require("pouchdb-upsertex"));
PouchDB.plugin(require("pouchdb-find"));

require("dotenv").config();

const tabName = process.env.GOOGLE_TAB_NAME || "Results";

interface Results {
  [year: number]: {
    [month: number]: {
      posts: number;
      hits: number;
    };
  };
}

const results: Results = {};

db.allDocs({ include_docs: true }).then(async (docs) => {
  docs.rows.forEach((doc) => {
    const date = dayjs(doc.doc?.post_stream.posts[0].updated_at);
    const isHit = query(doc.doc!);
    const increment =
      isHit === true ? 1 : typeof isHit === "number" ? isHit : 0;
    const year = +date.year();
    const month = +date.month() + 1;
    results[year] = results[year] || {};
    results[year][month] = results[year][month] || {};
    const result = results[year][month];
    result.posts = result.posts ? result.posts + increment : 1;
    if (isHit) {
      result.hits = result.hits ? result.hits + 1 : 1;
    }
  });

  if (spreadsheetEnabled) {
    writeSpreadsheet(results);
  }

  console.log(JSON.stringify(results, null, 2));
});

async function writeSpreadsheet(results) {
  const spreadsheet = await openSpreadsheet();
  await spreadsheet.loadInfo();
  await createMissingTabs(spreadsheet, [tabName], ["Date", "Posts", "Hits"]);
  const sheetIndex = getSheetIndexByTitle(spreadsheet, tabName);

  for (const year of Object.keys(results)) {
    for (const month of Object.keys(results[year])) {
      await spreadsheet.sheetsByIndex[sheetIndex].addRow({
        Date: `${year}-${month}`,
        Total: results[year][month].posts,
        Hits: results[year][month].hits || 0,
      });
    }
  }
}
