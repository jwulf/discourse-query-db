/*
    The shape of the doc is documented here: https://docs.discourse.org/#tag/Topics/paths/~1t~1{id}.json/get
*/

import dayjs from "dayjs";
import { Topic, Day } from "./DiscourseAPI";

export const query = (doc: Topic) => {
  const originalPostersQuestion = doc.post_stream.posts[0];
  const questionAsked = dayjs(doc.post_stream.posts[0].updated_at);
  const text = originalPostersQuestion.cooked.toLowerCase();

  // scans for questions asked on a Monday in 2019 or 2020 that contain the word "javascript"
  const isHit =
    (questionAsked.year() === 2020 || questionAsked.year() === 2019) &&
    questionAsked.day() === Day.Monday &&
    text.includes("javascript");

  return isHit;
};

/*

Here is a query for topics where the question contains a term related to Kubernetes

 return text.includes("kubernetes") ||
    text.includes("k8s") ||
    text.includes("helm") ||
    text.includes("kube");

*/

/*

Here is a query for topics where the question contains a term related to docker:

return text.includes("docker-compose") || text.includes("docker");

*/
