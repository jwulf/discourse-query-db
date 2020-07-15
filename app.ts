import { DiscourseAPI } from "./DiscourseAPI";

import parallelLimit from "async/parallelLimit";
import { db } from "./PouchDB";
require("dotenv").config();

const delta = (process.env.DELTA || "false").toLocaleLowerCase() === "true";
const discourse = new DiscourseAPI();

async function main() {
  const res = await discourse.http.get("categories.json");

  const categories = res.data.category_list.categories;

  const topicReqs = categories.map((category) => (callback) =>
    log(`Retrieving Category ${category.id}`) ||
    getTopicsForCategory(category)
      .then((topics) => {
        topics
          .filter((i) => !!i)
          .forEach(
            (topic, index) =>
              log(
                `Writing ${category.id}-${topic.id} ${index + 1}/${
                  topics.length
                }`
              ) ||
              db.upsert({
                _id: `${category.id}-${topic.id}`,
                ...topic,
              })
          );
        callback(null, topics);
      })
      .catch((err) => console.error(`Discourse ${err}`))
  );

  console.log(topicReqs.length);

  const topics = await parallelLimit(topicReqs, 1).catch((err) =>
    console.error(`Async ${JSON.stringify(err, null, 2)}`)
  );

  console.log("Done!");
  db.info().then(console.log);
}

async function getTopicsForCategory(category) {
  const { id } = category;
  let topics: any[] = [];
  log(`Retrieving c/${id}.json`);
  let res = await discourse.http.get(`c/${id}.json`);
  topics = res.data.topic_list.topics;

  while (res.data.topic_list.more_topics_url) {
    log(`Retrieving another page for Category ${id}`);
    res = await discourse.http.get(res.data.topic_list.more_topics_url);
    topics = [...res.data.topic_list.topics, ...topics];
  }

  log(`Retrieving ${topics.length} topics for category ${category.id}`);
  return parallelLimit(
    topics.map((topic, index) => async (callback) => {
      if (delta) {
        try {
          const _ = await db.get(`${category.id}-${topic.id}`);
          log(
            `Already have topic ${topic.id} for category ${id} ${index + 1}/${
              topics.length
            }`
          );
          return callback(null, undefined);
        } catch (err) {
          log(
            `Retrieving topic ${topic.id} for category ${id} ${index + 1}/${
              topics.length
            }`
          );
        }
      }

      return discourse.http
        .get(`t/${topic.id}.json`)
        .then((res: any) => callback(null, res.data));
    }),
    1
  );
}

function log(msg: any): boolean {
  console.log(msg);
  return false;
}

main();
