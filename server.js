const express = require("express");
var cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

var Twitter = require("twit");

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));

// EndPoint (proxy) from client to twitter
app.post("/tweet", function (req, res, next) {
  // chceck if the user is acutually authenticated
  if (req.body.access_token_key === "" && req.body.access_token_secret === "") {
    return res.status(400).json({
      msg: "nauthorized, use Twitter login",
    });
  }

  const twitterClient = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY, // from Twitter.
    consumer_secret: process.env.TWITTER_API_KEY_SECRET, // from Twitter.
    access_token: req.body.access_token_key, // from your User (oauth_token)
    access_token_secret: req.body.access_token_secret,
  });

  if (req.body.tweet === "" && req.body.postPhoto === "") {
    return res.status(400).json({
      msg: "NO TWEET WAS UPLOADED",
    });
  }
  // post only text to twitter
  if (req.body.tweet !== "" && req.body.postPhoto === "") {
    twitterClient.post(
      "statuses/update",
      { status: req.body.tweet },
      function (err, data, response) {
        if (err) {
          return res.status(500).send(err);
        }
        return res.json(data);
      }
    );
  }

  // Tweetting a text and image together
  const b64content = req.body.postPhoto;
  // post the media to Twitter
  twitterClient.post(
    "media/upload",
    { media_data: b64content },
    function (err, data, response) {
      // assign alt text to the media, for use by screen readers and
      // other text-based presentations and interpreters
      var mediaIdStr = data.media_id_string;
      var meta_params = {
        media_id: mediaIdStr,
        alt_text: { text: req.body.tweet },
      };

      twitterClient.post(
        "media/metadata/create",
        meta_params,
        function (err, data, response) {
          if (!err) {
            //reference the media and post a tweet (media will attach to the tweet)
            var params = {
              status: req.body.tweet,
              media_ids: [mediaIdStr],
            };
            twitterClient.post(
              "statuses/update",
              params,
              function (err, data, response) {
                return res.json(data);
              }
            );
          }
        }
      );
    }
  );
});

app.listen(5000, () => console.log("server started...."));
