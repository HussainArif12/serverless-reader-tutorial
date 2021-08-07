const { Readability, isProbablyReaderable } = require("@mozilla/readability");
const got = require("got");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = require("dompurify")(window);

async function parseURL(site) {
  const response = await got(site);
  const doc = new JSDOM(response.body);

  if (isProbablyReaderable(doc.window.document)) {
    let reader = new Readability(doc.window.document);
    let article = reader.parse();
    const markup = DOMPurify.sanitize(article.content);
    return {
      title: article.title,
      html: markup,
    };
  } else {
    return { error: "The site was not readable" };
  }
}
function isValidURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}
async function sendData(site) {
  if (isValidURL(site)) {
    const { title, html, error } = await parseURL(site);
    if (!error) {
      return {
        title,
        html,
        error,
      };
    } else {
      return {
        error: "The site was not readable",
      };
    }
  } else {
    return {
      error: "Your input was not a URL",
    };
  }
}

module.exports = sendData;
