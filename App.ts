// Serve the applications from index.html
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate();
}

function include(filename: string) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}
