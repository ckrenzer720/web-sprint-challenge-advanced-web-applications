import React, { useState } from "react";
import PT from "prop-types";
import axios from "axios";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

const initialFormValues = {
  username: "",
  password: "",
};

const loginUrl = "http://localhost:9000/api/login";

export default function LoginForm(props) {
  const [values, setValues] = useState(initialFormValues);
  // ✨ where are my props? Destructure them here
  const { username, password } = props;
  const navigate = useNavigate();

  const onChange = (evt) => {
    const { id, value } = evt.target;
    setValues({ ...values, [id]: value });
  };

  const onSubmit = (evt) => {
    evt.preventDefault();
    const { username, password } = evt.target;
    props.login(username.value, password.value);
  };

  const isDisabled = () => {
    // Trimmed username must be >= 3, and
    // trimmed password must be >= 8 for
    // the button to become enabled
  };

  return (
    <form id="loginForm" onSubmit={onSubmit}>
      <h2>Login</h2>
      <input
        maxLength={20}
        value={values.username}
        onChange={onChange}
        placeholder="Enter username"
        id="username"
      />
      <input
        maxLength={20}
        value={values.password}
        onChange={onChange}
        placeholder="Enter password"
        id="password"
      />
      <button disabled={isDisabled()} id="submitCredentials">
        Submit credentials
      </button>
    </form>
  );
}

// 🔥 No touchy: LoginForm expects the following props exactly:
LoginForm.propTypes = {
  login: PT.func.isRequired,
};
