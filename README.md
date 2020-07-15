# Discourse Forum Analyzer

This project allows you to pull down all posts from a Discourse Forum to a local [PouchDB](https://pouchdb.com/) database. Once in that database, you can run queries against the database to count the number of posts that contain keywords. The query results can optionally by sent to a Google Sheets spreadsheet.

## Requirements

You will need [Node.js](https://nodejs.org/en/) on your machine.

## Setup

* Git clone this repo.
* Run `npm i -g pnpm typescript ts-node`.
* Run `pnpm i` to install dependencies.

## Discourse setup 

* Create an API key in the Discourse admin dashboard
* Create a file `.env` in the root of the project, and add the API key details:

```
DISCOURSE_TOKEN=${token}
DISCOURSE_USERNAME=system
DISCOURSE_URL=${forum_url}/
```

This is all you need to suction down the Forum into a local database.

## Download Discourse posts to local database 

To download the Discourse posts to the local database:

```
ts-node app.ts 
```

## Delta Update 

You can do a delta update, where you only download new topics. Note that you will not get new posts in existing topics (new responses) with the delta update.

To do a delta update, in `.env`, set: `DELTA=true`.

To get all new responses to topics as well as new topics, run a complete update.

## Querying the database 

You can query the database with a query that you write in the file `custom-query.ts`.

At the moment, the only thing that can be queried is "_how many times did X happen each month_".

These queries are written in Javascript. The `query` function receives an [entire topic](https://docs.discourse.org/#tag/Topics/paths/~1t~1{id}.json/get), including all the posts in the topic. The query function should return `true` or a number if the topic should count toward the results, and `false` if it should not. If you return `true`, it will add 1 to the result. If you return a number, it will add that number to the result.

Here is an example query, one that counts how many questions were asked in the Forum on a Monday in 2019 or 2020, and contained the word "javascript":

```typescript 
export const query = (doc: Topic): boolean | number => {
  const originalPostersQuestion = doc.post_stream.posts[0];
  const questionAsked = dayjs(doc.post_stream.posts[0].updated_at);
  const text = originalPostersQuestion.cooked.toLowerCase();

  // scans for questions asked on a Monday in 2019 or 2020 that contain the word "javascript"
  const javascriptQuestionOnAMondayin2019or2020 =
    (questionAsked.year() === 2020 || questionAsked.year() === 2019) &&
    questionAsked.day() === Day.Monday &&
    text.includes("javascript");

  return javascriptQuestionOnAMondayin2019or2020;
};
```

## Running a query

To run the query against the database:

```
ts-node query.ts 
```

This will execute your query against the database, and print the results to the console as JSON. Example output:

```
{
"2020": {
    "1": {
      "posts": 31,
      "hits": 2
    },
    "2": {
      "posts": 32,
      "hits": 1
    },
    "3": {
      "posts": 31,
      "hits": 2
    },
    "4": {
      "posts": 40
    },
    "5": {
      "posts": 44
    },
    "6": {
      "posts": 37,
      "hits": 1
    },
    "7": {
      "posts": 18,
      "hits": 2
    }
  }
}
```

## Writing query results to a Google Spreadsheet 

Once you have a query that you are happy with, you can write the query results to a Google Spreadsheet.

* Create a Google Spreadsheet.
* Create a project in the Google Cloud Console: [https://console.cloud.google.com/](https://console.cloud.google.com/). 
* Go to `Credentials` in the project menu, then create a new Service Account. Don't select any role, don't select any users to grant access.
* Click `Create Key`, then select the JSON key.
* Open the JSON key, then grab the value of `private_key` and put it into the `.env` file, along with the service account email:

```
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLmzF5seuzr4a9\nuZ9emvjOsD1AnVK4+ljZB60IJR0DQBvIwyygbSzQGvMAvDGa4+9ZHSfeNPcXuBWo\n/AunvkhYvfEP9sgrfk122URVuQybj74vVtAr0MHDzoBxBGABTw/t7uqjTs3bbmsO\nnmRp1X4iSebdTedxyynMExABfLuwvjAFxnYNNy5L0OhxhNXeS7TuEaFyx+DJ023n\nA1AFd043V1md/KIwKuvCzKMjw8u7CQF4jDQOHzrz1RdIrjX0AVN1RR0cV58O7cuM\nCN5UWq7nLPpOvsP+xDYkIkORbiq0v0qmDZe270aIo6Vs1zXTRisFoYb0gXS/5BS4\nnYaXoZpFAgMBAAECggEAC/aYs9yVK5fo7B1rxJCJBYX791+3FFjbXxcxHs0ldQMv\njr6PEPcRPsISnKyyInZ5ogwRQ2Br01g055q1qZvH3vT8JNK8hLe1YAIYnovStpI9\n28S3Uxe/RtzLlbhq1rDZUALthP50oIvOnQuH/WL2uBeNCdxRuNE16cCF/Hxif9o2\nF8l/NKyiDfBZrzkySudn6B4BFBmoRn2HbOz2ihY07Z+JySntfUB1W86mizKILZB2\nsFGngxplHX3guGPDYQOsTTDwh//Wv6pNVDk4mZmwOzp880w5uN5f3obaX/nPKleJ\n1Yj5szecKlA4hpBArKNzbUWmiiNkg6FJV5QIwIYp8QKBgQDuexrHjJbApWN5hZD6\nDIFKrjMkYiwkhSLMMoYvdiFxHiHHfXkxGnw4XJv//T339uqpxwI0KiuDmH5GkW3F\nZ0v6k/FHgQ4rxA0knnXqgmkdd3gG4nOAdjjGSQs6guDQ3my/2ewafSHtfalLXOv0\nD3h7EwtPDiOv5QQ6TQtSbCWaEQKBgQDakDt/BiFeZ5fStD/x0WDsSK8GaCGE6dc2\nbNBDcThP43IB95SZpHxzZNwZvsqcEMtf5tVql1sg/D05Cg3pxm06X+g0R2no3PLV\nuoe+3ROZyQJFwb45VscN3rtMesDuMfPLsbNqO5fWur5UoAfC4JkMBmSR5TUW37Uf\n6wGFJ+qo9QKBgQCucpbQSeMs4M63YiD/CI67VlpKzxWDUXB29q55oWwtFuGW0A4L\nAVjE0dm7lD/0V0apEs5l4kMabD5S2Kb3s+w8TGQ+7gSztyH2G4QeG29RAsdmIdhj\nrBcz1NLF5l8V6t6aKIsxhT+APl/MpRhk27xCK1gmaC1qyZgiHaGelUWcQQKBgHIi\nv+8llGdoUbCG0J3HaYX6ruv5lQeD1g9l45xUk8OkUvUUBVX2v8bC9O285LF7U7lR\nIkH3qG8hShdvWLSsGn5Rd0FVyckBGQ7jyd+yM3orrjQfaOcomep0VfsqX3YEP/wv\nYDIpzLEl9B7dMzBheYr+C6bku0Smrj9sye5vWevBAoGBAMHPdnjCRKjdrGsEklvc\nCM/KEBVvN4ssk4/SLLwTfOXmx8YAZB3fQ30k4FhhL9liW9AvKJUmrysKs/IYOKDO\n26pDcjvYrVd++dr/HX7Ug9y98D7xTDrC7bxrabMol6aWPQ00vs4n5gNbv7UlZ6V+\nwbNN3pI+H5D1zzkHZyN5xwvP\n-----END PRIVATE KEY-----\n
GOOGLE_ACCOUNT_EMAIL=test-78@news-282810.iam.gserviceaccount.com
```

* Go back to the [Dashboard](https://console.cloud.google.com/apis/dashboard), go to "Enable APIs" and enable the Google Spreadsheets API.
* Share the spreadsheet with your service account email address.

The results of your query will be appended to a tab in the spreadsheet named "Results" (it will create it if it doesn't exist).

To change the name of the tab that the query results will be added to, set the following in `.env`:

```
GOOGLE_TAB_NAME=Kubernetes
```

## Disable the Google Sheet update 

You may want to run queries without updating the Google Sheets, after setting it up. To do that, add the following to the `.env` file:

```
GOOGLE_DISABLED=true
```

## Updating a Google Sheet 

To update a Google sheet, you should delete the tab and re-run the query. This will regenerate the entire sheet.