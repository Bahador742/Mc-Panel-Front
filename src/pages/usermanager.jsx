import { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import axios from "axios";
import SidePanel from "../componenets/sidepanel";
import Navbar from "../componenets/navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faTrash,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import baseURL from "../contexts/baseURL";
import * as yup from "yup";

const UserManager = () => {
  const { BaseURL } = useContext(baseURL);
  const [users, setUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForModal, setEmailForModal] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      dashAccess: false,
      consoleAccess: false,
      fileAccess: false,
      usersAccess: false,
    },
    validationSchema: yup.object({
      username: yup.string().required("Username is required"),
      email: yup.string().email("Invalid email").required("Email is required"),
      password: yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      const Token = localStorage.getItem("token");
      setIsSubmitting(true);

      let accessString = "";
      if (values.dashAccess) accessString += "1";
      if (values.consoleAccess) accessString += "2";
      if (values.fileAccess) accessString += "3";
      if (values.usersAccess) accessString += "4";
      if (!accessString) accessString = "0";

      try {
        await axios.post(`${BaseURL}/acmgr/add`, {
          token: Token,
          access: accessString,
          user: values.username,
          pass: values.password,
          email: values.email,
          confirm: values.confirmPassword,
        });

        const response = await axios.post(`${BaseURL}/acmgr/get`, {
          token: Token,
        });
        setUsers(response.data.users || []);
        formik.resetForm();
        setShowModal(false);
      } catch (error) {
        console.error("Error creating user:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const Token = localStorage.getItem("token");
      try {
        const response = await axios.post(`${BaseURL}/acmgr/get`, {
          token: Token,
        });
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [BaseURL]);

  const deleteUser = (id) => {
    setShowDeleteModal(true);
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const Token = localStorage.getItem("token");
    try {
      await axios.post(`${BaseURL}/acmgr/remove`, {
        token: Token,

        id: userToDelete,
      });
      const response = await axios.post(`${BaseURL}/acmgr/get`, {
        token: Token,
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const createUser = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    formik.resetForm();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const showEmail = (email) => {
    setShowEmailModal(true);
    setEmailForModal(email);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailForModal("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    setShowConfirmPassword(!showConfirmPassword);
  };

  const hasError = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  return (
    <div className="pageContainer">
      <Navbar />
      <SidePanel />
      <div id="usersDiv">
        <div id="usersTable">
          <div className="userRow" id="Titles">
            <span className="w-25 CentText">ID</span>
            <span className="w-25 CentText">Username</span>
            <span className="w-25 CentText">Email</span>
            <span className="w-25 CentText">Access</span>
            <button
              className="baseBtn IconBtn"
              style={{ opacity: 0, cursor: "default" }}
              aria-hidden="true"
            ></button>
          </div>
          {users.map((user) => (
            <div key={user.id} className="userRow">
              <span className="w-25 CentText">{user.id}</span>
              <span className="w-25 CentText username-span">
                {user.username}
              </span>
              <span className="w-25 CentText">
                <button
                  className="baseBtn IconBtn"
                  onClick={() => showEmail(user.email)}
                >
                  See
                </button>
              </span>
              <span className="w-25 CentText">{user.access}</span>
              <button
                className="baseBtn IconBtn"
                onClick={() => deleteUser(user.id)}
                aria-label={`Delete user ${user.username}`}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
        <div id="bottomOfUsers">
          <button id="createUserBtn" className="baseBtn" onClick={createUser}>
            + New user
          </button>
        </div>
      </div>

      {/* Email modal */}
      {showEmailModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeEmailModal}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Email</h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeEmailModal}
                  aria-label="Close email modal"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <p>{emailForModal}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="delete-modal-title" className="modal-title">
                  Confirm Delete
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCancelDelete}
                  aria-label="Cancel delete"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div id="delete-modal-description" className="modal-body">
                <p>Are you sure you want to delete this user?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="baseBtn modalBtn"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="baseBtn modalBtn"
                  onClick={confirmDelete}
                  style={{ color: "red" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="create-user-modal-title"
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="create-user-modal-title" className="modal-title">
                  Create new user
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeModal}
                  aria-label="Close create user modal"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <form onSubmit={formik.handleSubmit}>
                <div className="modal-body">
                  <div className="input-container">
                    <input
                      className={`newUserInp ${
                        hasError("username") ? "invalid" : ""
                      }`}
                      name="username"
                      type="text"
                      placeholder={
                        hasError("username")
                          ? formik.errors.username
                          : "Username"
                      }
                      maxLength={18}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.username}
                      aria-invalid={hasError("username") ? "true" : "false"}
                    />
                  </div>

                  <div className="input-container">
                    <input
                      className={`newUserInp ${
                        hasError("email") ? "invalid" : ""
                      }`}
                      name="email"
                      type="email"
                      placeholder={
                        hasError("email") ? formik.errors.email : "Email"
                      }
                      maxLength={30}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      aria-invalid={hasError("email") ? "true" : "false"}
                    />
                  </div>

                  <div
                    className="input-container"
                    style={{ position: "relative" }}
                  >
                    <input
                      className={`newUserInp ${
                        hasError("password") ? "invalid" : ""
                      }`}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        hasError("password")
                          ? formik.errors.password
                          : "Password"
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                      aria-invalid={hasError("password") ? "true" : "false"}
                    />
                    <button
                      type="button"
                      className="showPass"
                      style={{ right: "10%" }}
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>

                  <div className="input-container">
                    <input
                      className={`newUserInp ${
                        hasError("confirmPassword") ? "invalid" : ""
                      }`}
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={
                        hasError("confirmPassword")
                          ? formik.errors.confirmPassword
                          : "Confirm Password"
                      }
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.confirmPassword}
                      aria-invalid={
                        hasError("confirmPassword") ? "true" : "false"
                      }
                    />
                  </div>
                </div>
                <div id="acs">
                  <div className="acsDivs form-switch">
                    <label htmlFor="checkbox1">Dashboard access :</label>
                    <input
                      className="form-check-input"
                      name="dashAccess"
                      id="checkbox1"
                      checked={formik.values.dashAccess}
                      onChange={formik.handleChange}
                      type="checkbox"
                    />
                  </div>

                  <div className="acsDivs form-switch">
                    <label htmlFor="checkbox2">Console access :</label>
                    <input
                      className="form-check-input"
                      name="consoleAccess"
                      id="checkbox2"
                      checked={formik.values.consoleAccess}
                      onChange={formik.handleChange}
                      type="checkbox"
                    />
                  </div>

                  <div className="acsDivs form-switch">
                    <label htmlFor="checkbox3">File manager access :</label>
                    <input
                      className="form-check-input"
                      name="fileAccess"
                      id="checkbox3"
                      checked={formik.values.fileAccess}
                      onChange={formik.handleChange}
                      type="checkbox"
                    />
                  </div>

                  <div className="acsDivs form-switch">
                    <label htmlFor="checkbox4">User manager access :</label>
                    <input
                      className="form-check-input"
                      name="usersAccess"
                      id="checkbox4"
                      checked={formik.values.usersAccess}
                      onChange={formik.handleChange}
                      type="checkbox"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    style={{ color: "crimson" }}
                    type="button"
                    className="baseBtn modalBtn"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    style={{ color: "rgba(46, 204, 113, 0.8)" }}
                    className="baseBtn modalBtn"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="ml-2">Creating...</span>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
