// Чистая функция: XML-строка RSS → { feed, posts }. Необязательные элементы дают пустую строку.
const getText = (element, selector) => element.querySelector(selector)?.textContent.trim() ?? "";

const parse = (xml) => {
  const xmlDocument = new DOMParser().parseFromString(xml, "application/xml");
  const channel = xmlDocument.querySelector("channel");

  if (xmlDocument.querySelector("parsererror") || !channel) {
    const error = new Error("Resource is not a valid RSS");
    error.isParsingError = true;
    throw error;
  }

  const feed = {
    title: getText(channel, ":scope > title"),
    description: getText(channel, ":scope > description"),
  };
  const posts = [...channel.querySelectorAll("item")].map((item) => ({
    title: getText(item, "title"),
    link: getText(item, "link"),
    description: getText(item, "description"),
  }));

  return { feed, posts };
};

export default parse;
