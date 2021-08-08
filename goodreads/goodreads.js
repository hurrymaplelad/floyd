/**
 * Forked from https://github.com/bdickason/node-goodreads
 * API Docs: http://www.goodreads.com/api
 */

const fetch = require('node-fetch');
const xml2js = require('xml2js');
const {OAuth} = require('oauth');
const util = require('util');

function makeURL(path, params) {
  const url = new URL('https://www.goodreads.com/');
  url.pathname = path;
  const searchParams = new URLSearchParams(params);
  url.search = searchParams;
  return url;
}

// from https://www.goodreads.com/api/terms
const COOLDOWN = 1000; // ms

async function sleep(ms = COOLDOWN) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

const OAUTH_REQUEST_URL = 'https://goodreads.com/oauth/request_token';
const OAUTH_ACCESS_URL = 'https://goodreads.com/oauth/access_token';
const OAUTH_VERSION = '1.0';
const OAUTH_ENCRYPTION = 'HMAC-SHA1';
// Unused
const OAUTH_CALLBACK = 'http://localhost:3000/callback';

class Goodreads {
  constructor({key, secret, oauthToken, oauthTokenSecret}) {
    this.key = key;
    this.secret = secret;
    this.oauthToken = oauthToken;
    this.oauthTokenSecret = oauthTokenSecret;
    this.oauth = new OAuth(
      OAUTH_REQUEST_URL,
      OAUTH_ACCESS_URL,
      this.key,
      this.secret,
      OAUTH_VERSION,
      OAUTH_CALLBACK,
      OAUTH_ENCRYPTION
    );
  }

  async fetch(url) {
    const response = await fetch(url);
    const text = await response.text();

    const parser = new xml2js.Parser();
    return await parser.parseStringPromise(text);
  }

  async fetchWithOAuth(url) {
    const text = await new Promise((resolve, reject) =>
      this.oauth.get(
        url.toString(),
        this.oauthToken,
        this.oauthTokenSecret,
        (error, data) => {
          if (error) {
            reject(error);
          }
          resolve(data);
        }
      )
    );
    const parser = new xml2js.Parser();
    return await parser.parseStringPromise(text);
  }

  /* USER */
  async showUser(username) {
    return await this.fetch(
      makeURL('/user/show.xml', {
        key: this.key,
        username,
      })
    );
  }

  /* BOOKSHELVES */
  async listShelves(userId) {
    const response = await this.fetch(
      makeURL('/shelf/list.xml', {
        key: this.key,
        user_id: userId,
      })
    );
    return response.GoodreadsResponse.shelves[0].user_shelf.map((shelf) => ({
      name: shelf.name[0],
      bookCount: Number(shelf.book_count[0]._),
    }));
  }

  /**
   * https://www.goodreads.com/api/index#reviews.list
   * Returns an async iterator over books.
   * Stop iterating to stop requesting pages.
   */
  async *listBooks({userId, shelf, perPage = 150, ...rest}) {
    for (let pageNum = 1; (pageNum - 1) * perPage <= 1; pageNum++) {
      const page = await this.fetchWithOAuth(
        makeURL(`/review/list.xml`, {
          ...rest,
          v: 2,
          key: this.key,
          user_id: userId,
          shelf,
          page: pageNum,
          per_page: perPage,
        })
      );
      for (let review of page.GoodreadsResponse.reviews[0].review) {
        yield review;
      }
      await sleep();
    }
  }

  /* OAUTH */
  requestToken(callback) {
    const oa = this.oauth;
    return oa.getOAuthRequestToken(function (
      error,
      oauthToken,
      oauthTokenSecret,
      _results
    ) {
      if (error) {
        console.log(error);
        return callback(
          'Error getting OAuth request token : ' + JSON.stringify(error),
          500
        );
      } else {
        const url =
          'https://goodreads.com/oauth/authorize?oauth_token=' +
          oauthToken +
          '&oauth_callback=' +
          oa._authorize_callback;
        return callback({
          oauthToken: oauthToken,
          oauthTokenSecret: oauthTokenSecret,
          url: url,
        });
      }
    });
  }

  processCallback(oauthToken, oauthTokenSecret, authorize, callback) {
    const oa = this.oauth;
    return oa.getOAuthAccessToken(
      oauthToken,
      oauthTokenSecret,
      authorize,
      function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
        const parser = new xml2js.Parser();
        if (error) {
          callback(
            'Error getting OAuth access token : ' +
              util.inspect(error) +
              '[' +
              oauthAccessToken +
              '] [' +
              oauthAccessTokenSecret +
              '] [' +
              util.inspect(results) +
              ']',
            500
          );
        } else {
          oa.get(
            'https://www.goodreads.com/api/auth_user',
            oauthAccessToken,
            oauthAccessTokenSecret,
            function (error, data, _response) {
              if (error) {
                return callback(
                  'Error getting User ID : ' + util.inspect(error),
                  500
                );
              } else {
                return parser.parseString(data);
              }
            }
          );
        }
        return parser.on('end', function (result) {
          result = result.GoodreadsResponse;
          if (result.user[0]['$'].id !== null) {
            return callback({
              username: result.user.name,
              userid: result.user[0]['$'].id,
              success: 1,
              accessToken: oauthAccessToken,
              accessTokenSecret: oauthAccessTokenSecret,
            });
          } else {
            return callback(
              'Error: Invalid XML response received from Goodreads',
              500
            );
          }
        });
      }
    );
  }
}

module.exports = Goodreads;
