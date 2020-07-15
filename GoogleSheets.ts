import { GoogleSpreadsheet } from "google-spreadsheet";
require("dotenv").config();

const docId = process.env.GOOGLE_DOC_ID;

export const spreadsheetEnabled =
  process.env.GOOGLE_DOC_ID &&
  process.env.GOOGLE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_PRIVATE_KEY &&
  (process.env.GOOGLE_DISABLED || "false").toLocaleLowerCase() !== "true";

export const openSpreadsheet = async function () {
  const spreadsheet = new GoogleSpreadsheet(docId);

  await spreadsheet.useServiceAccountAuth({
    client_email: process.env.GOOGLE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    apiKey: "",
  });
  await spreadsheet.loadInfo();
  return spreadsheet;
};

export const getSheetIndexByTitle = function (spreadsheet, title) {
  const filteredSheets = spreadsheet.sheetsByIndex.filter(
    (sheet) => sheet.title === title
  );

  if (filteredSheets.length == 0) {
    return null;
  } else {
    return filteredSheets[0].index;
  }
};

export const createMissingTabs = async function (
  spreadsheet,
  tabNames: string[],
  headerValues: string[]
) {
  tabNames.map(async (title) => {
    let sheetIndex = getSheetIndexByTitle(spreadsheet, title);

    if (sheetIndex === null) {
      await spreadsheet.addSheet({ title, headerValues });
    }
  });
};
