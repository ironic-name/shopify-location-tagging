const paginationFromLink = link => link
  .split(",")
  .map(x => {
    if (x.indexOf('rel="next"') !== -1) {
      return {
        next: x.substring(x.lastIndexOf("<") + 1, x.lastIndexOf(">"))
      };
    }
    if (x.indexOf('rel="previous"') !== -1) {
      return {
        previous: x.substring(x.lastIndexOf("<") + 1, x.lastIndexOf(">"))
      };
    }
  })
  .reduce((acc, nxt) => ({ ...acc, ...nxt }), {});
exports.paginationFromLink = paginationFromLink;
