const { paginationFromLink } = require("./paginationFromLink");
const rp = require("request-promise");
const rxjs = require("rxjs");

const getAllOfResource = (options, resource, queryParams) => {
  if (!options.key || !options.secret || !options.domain) {
    throw new Error("Invalid configuration passed");
  }
  return new rxjs.Observable(subscriber => {
    const baseEndpoint = `https://${options.key}:${options.secret}@${options.domain}/admin/api/2021-04/${resource}.json`;
    let nextUrl = `${baseEndpoint}?${queryParams}`;
    const fetchAll = async callback => {
      try {
        const response = await rp({
          url: nextUrl,
          resolveWithFullResponse: true,
          json: true
        });
        if (response.headers.link) {
          const pagination = paginationFromLink(response.headers.link);
          if (pagination.next) {
            nextUrl = pagination.next.replace(
              "https://",
              `https://${options.key}:${options.secret}@`
            );
          } else {
            nextUrl = null;
          }
        } else {
          nextUrl = null;
        }
        subscriber.next(response.body[resource]);
        callback(nextUrl);
      } catch (error) {
        subscriber.error(error);
        subscriber.complete();
      }
    };
    const onFetched = url => {
      if (url) {
        try {
          fetchAll(onFetched);
        } catch (error) {
          fetchAll(onFetched);
        }
      } else {
        subscriber.complete();
      }
    };
    try {
      fetchAll(onFetched);
    } catch (error) {
      fetchAll(onFetched);
      console.error(error);
    }
  });
};

exports.getAllOfResource = getAllOfResource;
