import React, { useState } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import Articles from "./Articles";
import LoginForm from "./LoginForm";
import Message from "./Message";
import ArticleForm from "./ArticleForm";
import Spinner from "./Spinner";
import axios from "axios";

const articlesUrl = "http://localhost:9000/api/articles";
const loginUrl = "http://localhost:9000/api/login";

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState("");
  const [articles, setArticles] = useState([]);
  const [currentArticleId, setCurrentArticleId] = useState();
  const [spinnerOn, setSpinnerOn] = useState(false);

  const navigate = useNavigate();
  const redirectToLogin = () => navigate("/");
  const redirectToArticles = () => navigate("/articles");

  const logout = () => {
    // If a token is in local storage it should be removed,
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
      setMessage("Goodbye!");
    }
    redirectToLogin();
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    // and a message saying "Goodbye!" should be set in its proper state.
  };
  const login = (username, password) => {
    // We should flush the message state, turn on the spinner
    setSpinnerOn(true);
    setMessage("");
    // and launch a request to the proper endpoint.
    axios
      .post(loginUrl, { username, password })
      // On success, we should set the token to local storage in a 'token' key,
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        // put the server success message in its proper state, and redirect
        setMessage(res.data.message);
        // to the Articles screen. Don't forget to turn off the spinner!
        redirectToArticles();
      })
      .catch((error) => {
        setMessage(
          error?.response?.data?.message ||
            `An error occured, please try again: ${error.message}`
        );
      })
      .finally(setSpinnerOn(false));
  };

  const getArticles = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      redirectToLogin();
      return;
    }
    axios
      .get(articlesUrl, {
        headers: { Authorization: token },
      })
      .then((response) => {
        // On success, we should set the articles in their proper state and
        setMessage(response.data.message);
        setArticles(response.data.articles);
      })
      .catch((error) => {
        setMessage(error?.response?.data?.message);
        if (error?.response?.status == 401) logout();
      })
      .finally(setSpinnerOn(false));
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
  };

  const postArticle = async (article) => {
    setSpinnerOn(true);
    setMessage("");
    axios
      .post(articlesUrl, article, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((res) => {
        setMessage(res.data.message);
        setArticles((articles) => {
          return articles.concat(res.data.article);
        });
      })
      .catch((err) => {
        setMessage(err?.response?.data?.message || "Uh Oh. Something Happened");
      })
      .finally(() => {
        setSpinnerOn(false);
      });
  };

  const updateArticle = ({ article_id, article }) => {
    setSpinnerOn(true);
    setMessage("");

    axios
      .put(`${articlesUrl}/${article_id}`, article, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((res) => {
        setMessage(res.data.message);
        setArticles((articles) => {
          return articles.map((art) => {
            return art.article_id === article_id ? res.data.article : art;
          });
        });
      })
      .catch((err) => {
        setMessage(err?.response?.data?.message) ||
          "Something Happened, please try again later";
        if (err.response.status == 401) {
          redirectToLogin();
        }
      })
      .finally(() => setSpinnerOn(false));
  };

  const deleteArticle = (article_id) => {
    setSpinnerOn(true);
    setMessage("");

    axios
      .delete(`${articlesUrl}/${article_id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      })
      .then((res) => {
        setMessage(res.data.message);
        setArticles((articles) => {
          return articles.filter((art) => {
            return art.article_id != article_id;
          });
        });
      })
      .catch((err) => {
        setMessage(err?.response?.data?.message) ||
          "Something Happened, please try again later";
        if (err.response.status == 401) {
          redirectToLogin();
        }
      })
      .finally(() => setSpinnerOn(false));
  };

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>
        Logout from app
      </button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}>
        {" "}
        {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">
            Login
          </NavLink>
          <NavLink id="articlesScreen" to="/articles">
            Articles
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route
            path="articles"
            element={
              <>
                <ArticleForm
                  currentArticle={articles.find(
                    (article) => article.article_id == currentArticleId
                  )}
                  postArticle={postArticle}
                  updateArticle={updateArticle}
                  setCurrentArticleId={setCurrentArticleId}
                />
                <Articles
                  articles={articles}
                  currentArticleId={currentArticleId}
                  setCurrentArticleId={setCurrentArticleId}
                  deleteArticle={deleteArticle}
                  getArticles={getArticles}
                />
              </>
            }
          />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  );
}
