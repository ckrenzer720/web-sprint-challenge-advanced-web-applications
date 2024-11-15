import React, { useState, useEffect } from "react";
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
  const redirectToLogin = () => {
    navigate("/");
  };
  const redirectToArticles = () => {
    navigate("/articles");
  };

  const logout = () => {
    // If a token is in local storage it should be removed,
    localStorage.removeItem("token");
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    // and a message saying "Goodbye!" should be set in its proper state.
    redirectToLogin();
    setMessage("Goodbye!");
  };
  const login = async (username, password) => {
    // We should flush the message state, turn on the spinner
    setSpinnerOn(true);
    // and launch a request to the proper endpoint.
    try {
      const { data } = await axios.post(loginUrl, {
        username,
        password,
      });
      // On success, we should set the token to local storage in a 'token' key,
      localStorage.setItem("token", data.token);
      // put the server success message in its proper state, and redirect
      // to the Articles screen. Don't forget to turn off the spinner!
      redirectToArticles();
      setMessage(`Here are your articles, ${username}!`);
      setSpinnerOn(false);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "An error occured, please try again"
      );
    }
  };

  const getArticles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      redirectToLogin();
      return;
    }
    try {
      const response = await axios.get(articlesUrl, {
        headers: { Authorization: token },
      });
      // On success, we should set the articles in their proper state and
      setArticles(response.data.articles);
      setMessage(response.data.message);
    } catch (error) {
      if (error?.response?.status == 401) logout();
    }
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
  };

  const postArticle = async (article) => {
    const { title, text, topic } = article;
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    const token = localStorage.getItem("token");
    if (!token) {
      redirectToLogin();
      return;
    }
    try {
      const response = await axios.post(articlesUrl, article, {
        headers: { Authorization: token },
      });
    } catch (error) {
      console.error("Failed to post article:", error);
      setMessage("Failed to post article. Please try again.");
    }
  };

  const updateArticle = ({ article_id, article }) => {
    // ✨ implement
    // You got this!
  };

  const deleteArticle = (article_id) => {
    axios.delete(`articlesUrl/${article_id}`).then((res) => {
      if (!res.ok) throw new Error("Problem DELETEing");
    });
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
                  postArticle={postArticle}
                  updateArticle={updateArticle}
                  setCurrentArticleId={setCurrentArticleId}
                />
                <Articles
                  articles={articles}
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
