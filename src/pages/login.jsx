import { useContext, useState } from "react";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import * as yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseURL from "../contexts/baseURL";

const Login = () => {
  const [passwordType, setPasswordType] = useState("password");
  const [sending, setSending] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  const { BaseURL } = useContext(baseURL);

  const validationSchema = yup.object({
    user: yup.string().required("Username is required"),
    pass: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters !"),
  });

  const formik = useFormik({
    initialValues: {
      user: "",
      pass: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSending(true);
        setLoginError(null);
        const response = await axios.post(`${BaseURL}/api/login`, values);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem('username',values.user)
        localStorage.setItem('access',response.data.access)


        if (response.data.alert === "Login successful") {
          const access = response.data.access;
          if (access.includes("1")) navigate("/dashboard");
          else if (access.includes("2")) navigate("/console");
          else if (access.includes("3")) navigate("/files");
          else if (access.includes("4")) navigate("/users");
          else navigate("/login");
        } else {
          setLoginError(response.data.alert);
        }
      } catch (error) {
        setLoginError(error.message);
      } finally {
        setSending(false);
      }
    },
  });

  const handleEye = () => {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  const getFieldError = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? formik.errors[fieldName]
      : null;
  };

  const getFieldBorderStyle = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? { borderBottom: "1px solid crimson" }
      : {};
  };

  return (
    <>
      <div className="pageContainer">
        <nav id="navbar" className="shadow-lg">
          <div id="navbarTitle">
            <h1
              className="rgb-motion"
              style={{
                fontFamily: "-moz-initial",
              }}
            >
              MC Panel
            </h1>
          </div>
        </nav>

        <form id="loginForm" onSubmit={formik.handleSubmit}>
          <h1 id="SignIn">Sign in</h1>

          <div id="loginInpsDiv">
            <input
              className="loginInps"
              id="usernameInp"
              type="text"
              placeholder={
                getFieldError("user") ? getFieldError("user") : "Your username"
              }
              {...formik.getFieldProps("user")}
              style={getFieldBorderStyle("user")}
              onFocus={() => formik.setFieldTouched("user", false)}
            />

            <div id="passDiv">
              <input
                className="loginInps"
                id="passwordInp"
                type={passwordType}
                placeholder={
                  getFieldError("pass")
                    ? getFieldError("pass")
                    : "Your password"
                }
                {...formik.getFieldProps("pass")}
                style={getFieldBorderStyle("pass")}
                onFocus={() => formik.setFieldTouched("pass", false)}
              />
              <button type="button" className="showPass" onClick={handleEye}>
                <FontAwesomeIcon
                  icon={passwordType === "password" ? faEye : faEyeSlash}
                />
              </button>
            </div>

            {loginError ? (
              <p className="error" id="invalidUP">
                {loginError}
              </p>
            ) : (
              <p className="error" id="invalidUP">
                {formik.touched.pass &&
                formik.errors.pass ===
                  "Password must be at least 8 characters !"
                  ? formik.errors.pass
                  : null}
              </p>
            )}
          </div>

          <button id="Go" disabled={sending} className="baseBtn" type="submit">
            {sending && <span className="spinner-border spinner-border-sm" />}

            {!sending && <span>Go</span>}
          </button>
        </form>
      </div>

    </>
  );
};

export default Login;
