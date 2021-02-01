import React, { useState } from "react";
import { Form, Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useHistory, Link } from "react-router-dom";
import ImageUploader from "react-images-upload";

import axios from "axios";

export default function Dashboard() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser, signinWithTwitter, logout } = useAuth();
  const history = useHistory();
  const [tweetText, setTweetText] = useState("");
  const [encodedpicture, setEncodedpicture] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false); //alert
  const [showImageUploader, setShowImageUploader] = useState(true);

  // handeling the file selection
  function onDrop(pictureFile) {
    console.log(pictureFile);
    setShow(false);
    if (!pictureFile) return;
    if (pictureFile.length !== 0) {
      encodeImageFileAsB64(pictureFile, (encodedFile) => {
        setEncodedpicture(encodedFile);
      });
    }
  }
  // encoding image to b64
  function encodeImageFileAsB64(file, callback) {
    function readerOnload(e) {
      var base64 = btoa(e.target.result);
      callback(base64);
    }
    var reader = new FileReader();
    reader.onload = readerOnload;
    reader.readAsBinaryString(file[0]);
  }

  // handeling file upload to twitter
  async function handelSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    // Check login credentials if not twitter login
    if (currentUser.providerData[0].providerId !== "twitter.com") {
      await signinWithTwitter()
        .then((res) => {
          var token = res.credential.accessToken;
          var secret = res.credential.secret;
          localStorage.setItem("twitterToken", token);
          localStorage.setItem("twitterSecret", secret);
        })
        .catch((error) => {
          // handel the connection with twitter here
          setError("failed to log in with twitter");
        });
    }
    if (encodedpicture !== "" && tweetText === "") {
      setError("Please add text to your tweet");
      return;
    }
    // Send REQUEST to server
    //handel tweet request API
    axios
      .post("http://localhost:5000/tweet", {
        tweet: tweetText,
        postPhoto: encodedpicture,
        access_token_key: localStorage.getItem("twitterToken"), // from your User (oauth_token)
        access_token_secret: localStorage.getItem("twitterSecret"), // from your User (oauth_token_secret)
      })
      .then((res) => {
        // sucessful upload, alert and clean fields
        setTweetText("");
        setMessage(`Tweet was successfully created at: ${res.data.created_at}`);
        setShowImageUploader(false);
        setShow(true);
      })
      .catch((error) => {
        //  error from server or message error status(400)
        if (error.response.status === 500) {
          setError("Bad connection on the server");
        } else {
          setError(error.response.data.msg);
        }
      });
    setLoading(false);
  }

  // handel logout
  async function handleLogout() {
    setError("");
    try {
      await logout();
      history.push("/login");
    } catch (error) {
      setError("Failed to log out");
    }
  }
  // update tweet text
  function updateTweet(e) {
    e.preventDefault();
    setTweetText(e.target.value);
  }
  // handel secsess alert
  function handelAlert() {
    setShow(false);
    setMessage("");
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Create your Tweet</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {show && (
            <Alert variant="success" onClose={handelAlert} dismissible>
              {message}
            </Alert>
          )}
          <Form onSubmit={handelSubmit}>
            <Form.Group controlId="textarea">
              <Form.Control
                as="textarea"
                rows={3}
                value={tweetText}
                onChange={updateTweet}
                placeholder="What's happening? "
              />
            </Form.Group>
            <Form.Group>
              <ImageUploader
                withIcon={true}
                buttonText="Choose an image"
                onChange={onDrop}
                withPreview={showImageUploader}
                singleImage={true}
                imgExtension={[".jpg", ".gif", ".png", "jpeg"]}
                maxFileSize={5242880}
                fileSizeError="is too big"
                fileTypeError="does not supported file extension"
              />
            </Form.Group>
            <Button disabled={loading} className="w-100 mt-2" type="submit">
              Upload to Twitter
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="w-100 mt-2 d-flex flex-row align-items-center justify-content-between">
        {currentUser.providerData[0].providerId === "password" ? (
          <Link to="/update-profile">Update Profile</Link>
        ) : (
          ""
        )}

        <Button variant="link" className="mb-1" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </>
  );
}
