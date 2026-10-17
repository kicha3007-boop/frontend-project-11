import { subscribe } from "valtio/vanilla";

const renderStaticTexts = (i18n) => {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = i18n.t(element.dataset.i18n);
  });
};

const renderForm = (elements, state, i18n) => {
  const { input, submit, feedback } = elements;
  const { form, loadingProcess } = state;
  const isLoading = loadingProcess.status === "loading";

  input.readOnly = isLoading;
  submit.disabled = isLoading;

  const errorCode = form.error ?? loadingProcess.error;
  input.classList.toggle("border-red-500", Boolean(form.error));
  input.classList.toggle("ring-2", Boolean(form.error));
  input.classList.toggle("ring-red-500", Boolean(form.error));
  feedback.classList.toggle("text-red-400", Boolean(errorCode));
  feedback.classList.toggle("text-green-400", !errorCode && loadingProcess.status === "success");

  if (errorCode) {
    feedback.textContent = i18n.t(`errors.${errorCode}`);
  } else if (loadingProcess.status === "success") {
    feedback.textContent = i18n.t("success");
  } else {
    feedback.textContent = "";
  }
};

const resetFormOnSuccess = (elements, state) => {
  if (state.loadingProcess.status === "success") {
    elements.form.reset();
    elements.input.focus();
  }
};

const makeCard = (title) => {
  const card = document.createElement("div");
  card.className = "rounded-lg border border-gray-200 bg-white";
  const heading = document.createElement("h2");
  heading.className = "border-b border-gray-200 px-4 py-3 text-xl font-semibold";
  heading.textContent = title;
  const list = document.createElement("ul");
  list.className = "divide-y divide-gray-100";
  card.append(heading, list);
  return { card, list };
};

const renderFeeds = (elements, state, i18n) => {
  if (state.feeds.length === 0) {
    elements.feeds.replaceChildren();
    return;
  }
  const { card, list } = makeCard(i18n.t("feeds"));
  const items = state.feeds.map((feed) => {
    const item = document.createElement("li");
    item.className = "px-4 py-3";
    const title = document.createElement("h3");
    title.className = "font-medium";
    title.textContent = feed.title;
    const description = document.createElement("p");
    description.className = "text-sm text-gray-600";
    description.textContent = feed.description;
    item.append(title, description);
    return item;
  });
  list.append(...items);
  elements.feeds.replaceChildren(card);
};

const renderPosts = (elements, state, i18n) => {
  if (state.posts.length === 0) {
    elements.posts.replaceChildren();
    return;
  }
  const { card, list } = makeCard(i18n.t("posts"));
  const items = state.posts.map((post) => {
    const isSeen = state.ui.seenPostIds.includes(post.id);
    const item = document.createElement("li");
    item.className = "flex items-start justify-between gap-4 px-4 py-3";

    const link = document.createElement("a");
    link.href = post.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.id = post.id;
    link.dataset.seen = String(isSeen);
    link.className = isSeen ? "font-normal text-gray-500" : "font-bold text-blue-700";
    link.textContent = post.title;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = post.id;
    button.className =
      "shrink-0 rounded border border-blue-600 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50";
    button.textContent = i18n.t("preview");

    item.append(link, button);
    return item;
  });
  list.append(...items);
  elements.posts.replaceChildren(card);
};

const renderModal = (elements, state) => {
  const post = state.posts.find(({ id }) => id === state.ui.modalPostId);
  if (!post) {
    return;
  }
  const { modal } = elements;
  modal.querySelector(".modal-title").textContent = post.title;
  modal.querySelector(".modal-body").textContent = post.description;
  modal.querySelector(".full-article").href = post.link;
  modal.showModal();
};

// Слой представления: подписка на состояние, перерисовка по изменившейся ветке
export default (elements, state, i18n) => {
  renderStaticTexts(i18n);

  const renderers = {
    form: () => renderForm(elements, state, i18n),
    loadingProcess: () => {
      renderForm(elements, state, i18n);
      resetFormOnSuccess(elements, state);
    },
    feeds: () => renderFeeds(elements, state, i18n),
    posts: () => renderPosts(elements, state, i18n),
    ui: () => {
      renderPosts(elements, state, i18n);
      renderModal(elements, state);
    },
  };

  Object.entries(renderers).forEach(([branch, render]) => subscribe(state[branch], render));
};
