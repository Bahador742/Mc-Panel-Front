import {
  faFolderOpen,
  faTimes,
  faTrash,
  faArrowLeft,
  faDownload,
  faPen,
  faFolderPlus,
  faFileCirclePlus,
  faFileZipper,
  faFile,
  faImage,
  faFileCode,
  faBook,
  faUpload,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext, useRef, useCallback } from "react";
import axios from "axios";
import SidePanel from "../componenets/sidepanel";
import NavBar from "../componenets/navbar";
import baseURL from "../contexts/baseURL";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Filemanager = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [selectedFileIndex, setSelectedFileIndex] = useState(null);

  const [files, setFiles] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [cwd, setCwd] = useState("");
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDirectory, setIsDirectory] = useState(false);
  const [SendingBack, setSendingBack] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [DeleteAllDis, setDeleteAllDis] = useState(false);
  const [modalType, setModalType] = useState("");
  const [newItemName, setNewItemName] = useState("");

  const [uploadState, setUploadState] = useState({
    isUploading: false,
    progress: 0,
    selectedFile: null,
  });

  const hiddenFileInput = useRef(null);
  const context = useContext(baseURL);
  const { BaseURL, setDownloadP, setFilename } = useContext(baseURL);

  const refreshFileData = async () => {
    const Token = localStorage.getItem("token");
    const response = await axios.post(`${BaseURL}/fmgr`, { token: Token });
    setFiles(response.data.files || []);
    setDirectory(response.data.dirs || []);
    setCwd(response.data.cwd || "");
  };

  useEffect(() => {
    const fetchData = async () => {
      const Token = localStorage.getItem("token");
      try {
        const response = await axios.post(`${BaseURL}/fmgr`, {
          token: Token,
        });
        setFiles(response.data.files || []);
        setDirectory(response.data.dirs || []);
        setCwd(response.data.cwd || "");
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [BaseURL]);

  const handleUploadButton = useCallback(async () => {
    if (!uploadState.selectedFile) return;

    const Token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", uploadState.selectedFile);
    formData.append("run", "upload");
    formData.append("token", Token);
    formData.append("cwd", cwd);

    try {
      setError(null);
      setUploadState((prev) => ({ ...prev, isUploading: true, progress: 0 }));

      await axios.post(`${BaseURL}/fmgr/net/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadState((prev) => ({ ...prev, progress: percentCompleted }));
          }
        },
      });

      refreshFileData();

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 100,
        selectedFile: null,
      }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 0,
      }));
    }
  }, [uploadState.selectedFile, cwd, BaseURL]);

  useEffect(() => {
    if (uploadState.selectedFile) {
      handleUploadButton();
    }
  }, [uploadState.selectedFile, handleUploadButton]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const MAX_SIZE = 250 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setError("File size exceeds 250MB limit");
        return;
      }
      setUploadState((prev) => ({ ...prev, selectedFile: file }));
    }
  };

  const handleUploadButtonClick = () => {
    hiddenFileInput.current.click();
  };

  const showDeleteConfirmation = (item, isDir = false) => {
    setShowDeleteModal(true);
    setItemToDelete(item);
    setIsDirectory(isDir);
  };

  const handleConfirmDelete = async () => {
    const Token = localStorage.getItem("token");

    try {
      if (isDirectory) {
        await axios.post(`${BaseURL}/fmgr/file/remove`, {
          token: Token,
          dir: itemToDelete,
        });
        setDirectory((prevDir) =>
          prevDir.filter((Dir) => Dir !== itemToDelete)
        );
      } else {
        await axios.post(`${BaseURL}/fmgr/file/remove`, {
          token: Token,
          file: itemToDelete,
        });
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file !== itemToDelete)
        );
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
      setIsDirectory(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setIsDirectory(false);
  };

  const handleOpeningDirectory = async (dir) => {
    if (uploadState.isUploading) return;
    const Token = localStorage.getItem("token");
    await axios.post(`${BaseURL}/fmgr/cd`, {
      token: Token,
      dir: dir,
    });
    refreshFileData();
  };

  const handleDirectoryBackbtn = async () => {
    const Token = localStorage.getItem("token");
    setSendingBack(true);
    await axios.post(`${BaseURL}/fmgr/cd`, {
      token: Token,
      dir: "..",
    });
    refreshFileData();
    setSendingBack(false);
  };

  const CreateFolder = async () => {
    const Token = localStorage.getItem("token");
    const folderName = newItemName.trim();
    if (!folderName) return;

    await axios.post(`${BaseURL}/fmgr/file/create`, {
      token: Token,
      dir: folderName,
    });

    refreshFileData();
    setShowModal(false);
  };

  const CreateFile = async () => {
    const Token = localStorage.getItem("token");
    const fileName = newItemName.trim();
    if (!fileName) return;

    await axios.post(`${BaseURL}/fmgr/file/create`, {
      token: Token,
      file: fileName,
    });

    refreshFileData();
    setShowModal(false);
  };

  const handleDownload = async (filename) => {
    const Token = localStorage.getItem("token");
    try {
      setFilename(filename);
      const response = await axios.post(
        `${BaseURL}/fmgr/net/download`,
        { file: filename, token: Token },
        {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setDownloadP(percentCompleted);
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadP("");
    } catch (error) {
      setDownloadP(`Download failed: ${error}`);
    }
  };

  const createFolder = () => {
    setShowModal(true);
    setModalType("folder");
    setNewItemName("");
  };

  const createFile = () => {
    setShowModal(true);
    setModalType("file");
    setNewItemName("");
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setNewItemName("");
  };

  const handleNewItemNameChange = (e) => {
    setNewItemName(e.target.value);
  };

  const handledeleteall = () => {
    setShowDeleteAllModal(true);
    setDeleteAllDis(true);
  };

  const handleCancelDeleteAll = () => {
    setShowDeleteAllModal(false);
    setDeleteAllDis(false);
  };

  const handleConfirmDeleteAll = async () => {
    setShowDeleteAllModal(false);
    setDeleteAllDis(false);
    const Token = localStorage.getItem("token");
    const result = await axios.post(`${BaseURL}/api/file`, { token: Token });
    for (let index = 0; index < result.data.files.length; index++) {
      await axios.post(`${BaseURL}/fmgr/file/remove`, {
        token: Token,
        file: result.data.files[index],
      });
    }
    refreshFileData();
  };

  const handleEdit = (filename) => {
    context.setFilename(filename);
  };

  const handeUnzip = async (file) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${BaseURL}/fmgr/file/zip`, {
        token,
        ac: "unzip",
        file,
      });
      refreshFileData();
    } catch (error) {
      setError("Failed to unzip file: " + error.message);
    }
  };

  const handleZip = async (Dir) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${BaseURL}/fmgr/file/zip`, {
        token,
        ac: "zip",
        dir: Dir,
      });

      refreshFileData();
    } catch (error) {
      setError("Failed to zip folder: " + error.message);
    }
  };

  const format = (e) => {
    const a = e.split(".").pop().toLowerCase();

    switch (a) {
      case "jar":
        return "crimson";
      case "yml":
        return "wheat";
      case "json":
        return "#ffff00";
      case "properties":
        return "#00ffff";
      case "png":
      case "jpg":
        return "royalblue";
      case "zip":
        return "purple";
      default:
        return "";
    }
  };

  const iconformat = (e) => {
    if (e.endsWith(".jpg") || e.endsWith("png")) {
      return faImage;
    } else if (e.endsWith(".json")) {
      return faFileCode;
    } else if (e.endsWith(".zip")) {
      return faBook;
    } else if (e.endsWith(".sh")) {
      return faCode;
    } else {
      return faFile;
    }
  };

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const mv = async (file) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${BaseURL}/fmgr/file/move`, {
      token,
      file,
      dir: inputValue,
    });
    console.log(response, baseURL);
    setInputValue("");
    refreshFileData();
  };

  const [wgetM, setWgetM] = useState(false);
  const [wgetInp, setWgetInp] = useState("");

  const wget = () => {
    if (wgetM) {
      setWgetM(false);
    } else {
      setWgetM(true);
    }
  };

  const wgetInpChange = (e) => {
    setWgetInp(e.target.value);
  };

  const wgetGo = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${BaseURL}/fmgr/net/download/${wgetInp}`,
      {
        token,
      }
    );
    setWgetInp("");
    setWgetM(false);
    refreshFileData();
  };

  return (
    <>
      <div className="pageContainer">
        <NavBar />
        <SidePanel />
        <div id="fileManagerDiv">
          <div id="controlsDiv">
            <button
              className="baseBtn controlBtn BG"
              onClick={handleDirectoryBackbtn}
              disabled={uploadState.isUploading}
              style={{
                cursor: uploadState.isUploading ? "not-allowed" : "pointer",
              }}
            >
              <span>
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </span>
            </button>

            <div id="ControlBTNS">
              <button className="baseBtn controlBtn FixGap" onClick={wget}>
                WGET
              </button>
              <button
                className="baseBtn controlBtn FixGap"
                onClick={handleUploadButtonClick}
                disabled={uploadState.isUploading}
              >
                {!uploadState.isUploading && (
                  <FontAwesomeIcon icon={faUpload} />
                )}
                {uploadState.isUploading && <div>{uploadState.progress}%</div>}
              </button>
              <button
                className="baseBtn controlBtn FixGap"
                onClick={createFolder}
              >
                <FontAwesomeIcon icon={faFolderPlus} />
              </button>
              <button
                className="baseBtn controlBtn FixGap"
                onClick={createFile}
              >
                <FontAwesomeIcon icon={faFileCirclePlus} />
              </button>
            </div>
            <button
              className="baseBtn controlBtn BG"
              disabled={uploadState.isUploading}
              onClick={handledeleteall}
              style={{
                cursor: uploadState.isUploading ? "not-allowed" : "pointer",
                color: "crimson",
              }}
            >
              Delete all
            </button>
            <div id="kir">
              <button
                style={{
                  cursor: uploadState.isUploading ? "not-allowed" : "pointer",
                }}
                className="baseBtn controlBtn SM"
                onClick={handleDirectoryBackbtn}
                disabled={uploadState.isUploading}
              >
                <span>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </span>
              </button>
              <button
                style={{
                  cursor: uploadState.isUploading ? "not-allowed" : "pointer",
                  color: "crimson",
                }}
                className="baseBtn controlBtn SM"
                disabled={uploadState.isUploading}
                onClick={handledeleteall}
              >
                Delete all
              </button>
            </div>
          </div>

          {error && (
            <div
              className="error-message"
              style={{ color: "red", padding: "10px" }}
            >
              {error}
            </div>
          )}

          <div id="fileAndFolders">
            {directory.map((Dir, index) => (
              <Link className="DirLink" to="#" key={index}>
                <div
                  onClick={() => handleOpeningDirectory(Dir)}
                  className="Dir"
                  style={{
                    cursor: uploadState.isUploading ? "not-allowed" : "pointer",
                  }}
                  disabled={uploadState.isUploading}
                >
                  <span>
                    <FontAwesomeIcon icon={faFolderOpen} className="DirIcon" />{" "}
                    {Dir}
                  </span>
                </div>
                <div className="DirActions">
                  <button
                    className="baseBtn IconBtn"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    mv
                  </button>
                  <div class="dropdown open">
                    <div class="dropdown-menu" aria-labelledby="triggerId">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                      />
                      <button onClick={() => mv(Dir)}>path</button>
                    </div>
                  </div>
                  <button
                    className="baseBtn IconBtn"
                    onClick={() => handleZip(Dir)}
                  >
                    <FontAwesomeIcon icon={faFileZipper} />
                  </button>
                  <button
                    className="baseBtn IconBtn Delete"
                    onClick={() => showDeleteConfirmation(Dir, true)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </Link>
            ))}

            {(files || []).map((file, index) => {
              const isSelected = selectedFileIndex === index;
              const isZip = file.endsWith(".zip");
              const isEditable = !(
                file.endsWith(".zip") ||
                file.endsWith(".jar") ||
                file.endsWith(".jpg") ||
                file.endsWith(".png")
              );

              return (
                <div
                  className="File"
                  key={index}
                  onClick={() => {
                    if (isMobile) {
                      setSelectedFileIndex(isSelected ? null : index);
                    }
                  }}
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "nowrap",
                  }}
                >
                  {/* File name */}
                  <div
                    className="fileName"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                      paddingRight: "8px",
                    }}
                  >
                    <span style={{ color: format(file) }}>
                      <FontAwesomeIcon icon={iconformat(file)} />
                    </span>{" "}
                    {file}
                  </div>

                  {/* File Actions (Mobile - Click to show) */}
                  {isMobile && isSelected && (
                    <div
                      className="fileActions"
                      style={{
                        display: "flex",
                        gap: "8px",
                        background: "#1a1a1a",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        zIndex: 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isZip && (
                        <button
                          className="baseBtn IconBtn"
                          onClick={() => handeUnzip(file)}
                        >
                          <FontAwesomeIcon icon={faFileZipper} />
                        </button>
                      )}
                      {isEditable && (
                        <Link
                          className="baseBtn link IconBtn"
                          to="/editor"
                          onClick={() => handleEdit(file)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                      )}

                      <button
                        className="baseBtn IconBtn"
                        onClick={() => handleDownload(file)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <button
                        className="baseBtn IconBtn"
                        onClick={() => showDeleteConfirmation(file)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  )}

                  {/* File Actions (Desktop - Always visible) */}
                  {!isMobile && (
                    <div
                      className="fileActions"
                      style={{ display: "flex", gap: "8px" }}
                    >
                      <button
                        className="baseBtn IconBtn"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        mv
                      </button>
                      <div class="dropdown open">
                        <div class="dropdown-menu" aria-labelledby="triggerId">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                          />
                          <button onClick={() => mv(file)}>path</button>
                        </div>
                      </div>

                      {isZip && (
                        <button
                          className="baseBtn IconBtn"
                          onClick={() => handeUnzip(file)}
                        >
                          <FontAwesomeIcon icon={faFileZipper} />
                        </button>
                      )}
                      {isEditable && (
                        <Link
                          className="baseBtn link IconBtn"
                          to="/editor"
                          onClick={() => handleEdit(file)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                      )}
                      <button
                        className="baseBtn IconBtn"
                        onClick={() => handleDownload(file)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <button
                        className="baseBtn IconBtn"
                        onClick={() => showDeleteConfirmation(file)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div id="pwd">
            <p>Path : /{cwd}</p>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div id="MODALDELETE" className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCancelDelete}
                  style={{ color: "#FF8C00" }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete{" "}
                  {isDirectory ? "the folder" : "the file"}{" "}
                  <strong style={{ color: "#FF8C00" }}>{itemToDelete}</strong>?
                </p>
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
                  onClick={handleConfirmDelete}
                  style={{ color: "red" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div id="DELETEALLMODAL" className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCancelDeleteAll}
                  style={{ color: "#FF8C00" }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete All Files In This Folder ?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="baseBtn modalBtn"
                  onClick={handleCancelDeleteAll}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="baseBtn modalBtn"
                  onClick={handleConfirmDeleteAll}
                  style={{ color: "red" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {wgetM && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload via wget</h5>
                <button type="button" className="close" onClick={wget}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label style={{ color: "#D3D3D3" }}>URL :</label>
                  <input
                    type="text"
                    className="baseInp"
                    value={wgetInp}
                    onChange={wgetInpChange}
                    placeholder="https://example.com"
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="baseBtn modalBtn"
                  onClick={wget}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="baseBtn modalBtn"
                  onClick={wgetGo}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Create New {modalType === "folder" ? "Folder" : "File"}
                </h5>
                <button type="button" className="close" onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label style={{ color: "#D3D3D3" }}>
                    {modalType === "folder" ? "Folder" : "File"} Name:
                  </label>
                  <input
                    type="text"
                    className="baseInp"
                    value={newItemName}
                    onChange={handleNewItemNameChange}
                    placeholder={`Enter ${modalType} name`}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="baseBtn modalBtn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="baseBtn modalBtn"
                  onClick={() => {
                    if (modalType === "folder") {
                      CreateFolder();
                    } else {
                      CreateFile();
                    }
                    closeModal();
                  }}
                  disabled={!newItemName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={uploadState.isUploading}
      />
    </>
  );
};

export default Filemanager;
