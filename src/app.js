import axios from "axios";
import i18next from "i18next";
import _ from "lodash";
import { proxy } from "valtio/vanilla";
import * as yup from "yup";
import resources from "./locales/index.js";
import parse from "./parser.js";
import initView from "./view.js";

const updateInterval = 5000;
const requestTimeout = 10000;

const buildProxyUrl = (url) => {
  const proxyUrl = new URL("/get", "https://allorigins.hexlet.app");
  proxyUrl.searchParams.set("disableCache", "true");
  proxyUrl.searchParams.set("url", url);
  return proxyUrl.toString();
};

const loadRss = (url) =>
  axios
    .get(buildProxyUrl(url), { timeout: requestTimeout })
    .then((response) => parse(response.data.contents));

const getErrorCode = (error) => {
  if (error.isParsingError) {
    return "invalidRss";
  }
  if (axios.isAxiosError(error)) {
    return "network";
  }
  return "unknown";
};

const validateUrl = (url, addedUrls) =>
  yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(addedUrls)
    .validate(url)
    .then(() => null)
    .catch((error) => error.message.key);

const withIds = (posts, feedId) =>
  posts.map((post) => ({ ...post, id: _.uniqueId("post_"), feedId }));

const watchUpdates = (state) => {
  const updates = state.feeds.map((feed) =>
    loadRss(feed.url)
      .then(({ posts }) => {
        const knownLinks = new Set(
          state.posts.filter((post) => post.feedId === feed.id).map((post) => post.link),
        );
        const newPosts = posts.filter((post) => !knownLinks.has(post.link));
        if (newPosts.length > 0) {
          state.posts.unshift(...withIds(newPosts, feed.id));
        }
      })
      .catch(() => {}),
  );
  return Promise.all(updates).finally(() => {
    setTimeout(() => watchUpdates(state), updateInterval);
  });
};

export default () => {
  const i18n = i18next.createInstance();

  return i18n.init({ lng: "ru", resources }).then(() => {
    yup.setLocale({
      mixed: { required: () => ({ key: "required" }), notOneOf: () => ({ key: "duplicate" }) },
      string: { url: () => ({ key: "url" }) },
    });

    const elements = {
      form: document.querySelector(".rss-form"),
      input: document.querySelector("#url-input"),
      submit: document.querySelector('.rss-form [type="submit"]'),
      feedback: document.querySelector(".feedback"),
      feeds: document.querySelector(".feeds"),
      posts: document.querySelector(".posts"),
      modal: document.querySelector(".modal"),
    };

    const state = proxy({
      form: { error: null },
      loadingProcess: { status: "idle", error: null },
      feeds: [],
      posts: [],
      ui: { seenPostIds: [], modalPostId: null },
    });

    initView(elements, state, i18n);

    elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const url = new FormData(event.target).get("url").trim();
      const addedUrls = state.feeds.map((feed) => feed.url);

      state.loadingProcess.error = null;
      state.loadingProcess.status = "idle";
      validateUrl(url, addedUrls).then((validationError) => {
        state.form.error = validationError;
        if (validationError) {
          return null;
        }
        state.loadingProcess.status = "loading";
        return loadRss(url)
          .then(({ feed, posts }) => {
            const feedId = _.uniqueId("feed_");
            state.feeds.unshift({ ...feed, id: feedId, url });
            state.posts.unshift(...withIds(posts, feedId));
            state.loadingProcess.status = "success";
          })
          .catch((error) => {
            state.loadingProcess.error = getErrorCode(error);
            state.loadingProcess.status = "failed";
          });
      });
    });

    elements.posts.addEventListener("click", (event) => {
      const { id } = event.target.dataset;
      if (!id) {
        return;
      }
      if (!state.ui.seenPostIds.includes(id)) {
        state.ui.seenPostIds.push(id);
      }
      if (event.target.tagName === "BUTTON") {
        state.ui.modalPostId = id;
      }
    });

    elements.modal.addEventListener("close", () => {
      state.ui.modalPostId = null;
    });

    watchUpdates(state);
  });
};
