import Axios from "axios";

require("dotenv").config();

interface DiscourseConfigObject {
  token: string;
  user: string;
  url: string;
}

export class DiscourseAPI {
  public http: any;
  public config: DiscourseConfigObject;
  constructor() {
    // To get your category id
    // http
    //   .get(`/categories`)
    //   .then(res => console.log(JSON.stringify(res.data, null, 2)));

    this.config = {
      token: process.env.DISCOURSE_TOKEN!,
      url: process.env.DISCOURSE_URL!,
      user: process.env.DISCOURSE_USERNAME!,
    };

    this.http = Axios.create({
      baseURL: this.config.url,
      headers: {
        "Api-Key": this.config.token,
        "Api-Username": this.config.user,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log(`Working with ${this.config.url}`);
  }
}

export interface Post {
  id: number;
  name: string;
  username: string;
  avatar_template: string;
  created_at: string;
  cooked: string /* The HTML of the post */;
  post_number: number;
  post_type: number;
  updated_at: string;
  reply_count: number;
  reply_to_post_number: {};
  quote_count: number;
  avg_time: {};
  incoming_link_count: number;
  reads: number;
  score: number;
  yours: true;
  topic_id: number;
  topic_slug: string;
  display_username: string;
  primary_group_name: {};
  primary_group_flair_url: {};
  primary_group_flair_bg_color: {};
  primary_group_flair_color: {};
  version: number;
  can_edit: true;
  can_delete: true;
  can_recover: true;
  can_wiki: true;
  read: true;
  user_title: {};
  actions_summary: [{}];
  moderator: true;
  admin: true;
  staff: true;
  user_id: number;
  hidden: true;
  hidden_reason_id: {};
  trust_level: number;
  deleted_at: {};
  user_deleted: true;
  edit_reason: {};
  can_view_edit_history: true;
  wiki: true;
  polls: {
    poll: {
      options: [
        {
          id: string;
          html: string;
          votes: number;
        }
      ];
      voters: number;
      status: string;
      name: string;
      type: string;
    };
  };
  polls_votes: {
    poll: string[];
  };
}

export interface Topic {
  post_stream: {
    posts: Post[];
    stream: [{}];
  };
  timeline_lookup: [
    {
      number: { [key: string]: any }[];
    }
  ];
  id: number;
  title: string;
  fancy_title: string;
  posts_count: number;
  created_at: string;
  views: number;
  reply_count: number;
  participant_count: number;
  like_count: number;
  last_posted_at: {};
  visible: true;
  closed: true;
  archived: true;
  has_summary: true;
  archetype: string;
  slug: string;
  category_id: number;
  word_count: {};
  deleted_at: {};
  user_id: number;
  draft: {};
  draft_key: string;
  draft_sequence: {};
  unpinned: {};
  pinned_globally: true;
  pinned: true;
  pinned_at: string;
  pinned_until: {};
  details: {
    auto_close_at: {};
    auto_close_hours: {};
    auto_close_based_on_last_post: true;
    created_by: {
      id: number;
      username: string;
      avatar_template: string;
    };
    last_poster: {
      id: number;
      username: string;
      avatar_template: string;
    };
    participants: [
      {
        id: number;
        username: string;
        avatar_template: string;
        post_count: number;
      }
    ];
    suggested_topics: [
      {
        id: number;
        title: string;
        fancy_title: string;
        slug: string;
        posts_count: number;
        reply_count: number;
        highest_post_number: number;
        image_url: string;
        created_at: string;
        last_posted_at: string;
        bumped: true;
        bumped_at: string;
        unseen: true;
        pinned: true;
        unpinned: {};
        excerpt: string;
        visible: true;
        closed: true;
        archived: true;
        bookmarked: {};
        liked: {};
        archetype: string;
        like_count: number;
        views: number;
        category_id: number;
        posters: [
          {
            extras: string;
            description: string;
            user: {
              id: number;
              username: string;
              avatar_template: string;
            };
          }
        ];
      }
    ];
    notification_level: number;
    can_flag_topic: true;
  };
  highest_post_number: number;
  deleted_by: {};
  actions_summary: [
    {
      id: number;
      count: number;
      hidden: true;
      can_act: true;
    }
  ];
  chunk_size: number;
  bookmarked: {};
}

export enum Day {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 0,
}
