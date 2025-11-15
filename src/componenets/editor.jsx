import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import SidePanel from "./sidepanel";
import NavBar from "./navbar";
import baseURL from "../contexts/baseURL";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const FileEditor = () => {
  const context = useContext(baseURL);
  const navigate = useNavigate();
  const { BaseURL } = useContext(baseURL);

  const formik = useFormik({
    initialValues: {
      content: "",
      filename: context.filename || "",
      originalContent: "",
      originalFilename: context.filename || "",
    },
    onSubmit: async (values, { setSubmitting, setFieldValue }) => {
      try {
        const Token = localStorage.getItem("token");

        const saveResponse = await axios.post(`${BaseURL}/fmgr/file/edit`, {
          token: Token,
          ac: "write",
          file: values.originalFilename,
          content: values.content,
        });

        if (values.filename !== values.originalFilename) {
          await axios.post(`${BaseURL}/fmgr/file/rename`, {
            token: Token,
            file: values.originalFilename,
            name: values.filename,
          });
        }

        setFieldValue("originalContent", values.content);
        setFieldValue("originalFilename", values.filename);
        return saveResponse.data.alert;
      } finally {
        setSubmitting(false);
      }
    },
  });

  const [displayModal, setDisplayModal] = useState(false);
  const [saveResult, setSaveResult] = useState("---");

  useEffect(() => {
    const fetchFileContent = async () => {
      if (!context.filename) return;
      const Token = localStorage.getItem("token");
      try {
        const response = await axios.post(`${BaseURL}/fmgr/file/edit`, {
          token: Token,
          ac: "read",
          file: context.filename,
        });

        formik.setValues({
          content: response.data.content,
          filename: context.filename,
          originalContent: response.data.content,
          originalFilename: context.filename,
        });
      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    };

    fetchFileContent();
  }, [context.filename, BaseURL]);

  const handleEditorChange = (value) => {
    formik.setFieldValue("content", value);
  };

  const handleExit = () => {
    const contentChanged =
      formik.values.content !== formik.values.originalContent;
    const filenameChanged =
      formik.values.filename !== formik.values.originalFilename;

    if (
      saveResult === "File successfully Saved" ||
      (!contentChanged && !filenameChanged)
    ) {
      navigate("/files");
    } else {
      setDisplayModal(true);
    }
  };

  const handleCancel = () => {
    setDisplayModal(false);
  };

  const handleSave = async () => {
    const result = await formik.submitForm();
    setSaveResult(result);

    setTimeout(() => {
      setSaveResult("---");
    }, 2000);
  };

  const handleSaveAndExit = async () => {
    await formik.submitForm();
    navigate("/files");
  };

  return (
    <>
      <div className="pageContainer">
        <NavBar />
        <SidePanel />
        <div id="EditorDiv">
          <div id="editorControlPanel">
            <div>
              <span>File Name: </span>
              <input
                className="baseInp"
                type="text"
                onChange={(e) =>
                  formik.setFieldValue("filename", e.target.value)
                }
                value={formik.values.filename}
              />
            </div>
            <div
              className="DI"
              style={{
                color:
                  saveResult === "File successfully Saved"
                    ? "rgba(46, 204, 113, 0.8)"
                    : "white",
              }}
              id="saveStatusDiv"
            >
              {saveResult}
            </div>
            <div className="DI">
              <button
                style={{ color: "rgba(46, 204, 113, 0.8)" }}
                className="baseBtn editorBtns"
                onClick={handleSave}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                style={{ color: "crimson" }}
                className="baseBtn editorBtns"
                onClick={handleExit}
              >
                Exit
              </button>
            </div>
          </div>

          <CodeMirror
            value={formik.values.content}
            height="74vh"
            id="codeMirror"
            extensions={[python()]}
            theme="dark"
            onChange={handleEditorChange}
            style={{
              fontSize: 20,
              backgroundColor: "#222",
              overflow: "auto",
              flex: 1,
              borderRadius: "0px 0px 10px 10px",
            }}
          />
          <div id="SMTHING">
            <div
              style={{
                color:
                  saveResult === "File successfully Saved"
                    ? "rgba(46, 204, 113, 0.8)"
                    : "white",
                textAlign: "center",
              }}
              id="saveStatusDiv2"
            >
              {saveResult}
            </div>
            <div>
              <button
                style={{ color: "rgba(46, 204, 113, 0.8)" }}
                className="A editorBtns"
                onClick={handleSave}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                style={{ color: "crimson" }}
                className="A editorBtns"
                onClick={handleExit}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {displayModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Unsaved changes !</h5>
                <button type="button" className="close" onClick={handleCancel}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to leave without saving changes?</p>
              </div>
              <div className="modal-footer" id="editor-modal-footer">
                <button
                  onClick={handleSaveAndExit}
                  className="baseBtn editor-modal-btn"
                  disabled={formik.isSubmitting}
                  style={{ color: "rgba(46, 204, 113, 0.8)" }}
                >
                  {formik.isSubmitting ? "Saving..." : "Save changes & exit"}
                </button>
                <Link
                  style={{ textDecoration: "none", color: "royalblue" }}
                  to={"/files"}
                  className="baseBtn editor-modal-btn"
                >
                  Exit without saving changes
                </Link>
                <button
                  onClick={handleCancel}
                  className="baseBtn editor-modal-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileEditor;
