import {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import SidePanel from "../componenets/sidepanel";
import NavBar from "../componenets/navbar";
import BaseURLContext from "../contexts/baseURL";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faWarning, faX } from "@fortawesome/free-solid-svg-icons";

const Console = () => {
  const [logs, setLogs] = useState("");
  const [cmd, setCmd] = useState("");
  const [sending, setSending] = useState(false);
  const { BaseURL } = useContext(BaseURLContext);

  const consoleRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const handleLogOut = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("access");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    socketRef.current = io(BaseURL, {
      query: {
        token: localStorage.getItem("token"),
      },
    });

    socketRef.current.on("log", (log) => {
      setLogs(log);
    });

    socketRef.current.on("auth", (data) => {
      console.error("Authentication error:", data.alert);
      handleLogOut();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [BaseURL]);

  useEffect(() => {
    const scroll = () => {
      requestAnimationFrame(() => {
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
      });
    };

    const timer = setTimeout(scroll, 0);
    return () => clearTimeout(timer);
  }, [logs]);

  const handleChange = (e) => {
    setCmd(e.target.value);
  };

  const handleSubmit = async () => {
    if (!cmd.trim()) return;

    const token = localStorage.getItem("token");
    setSending(true);

    try {
      const response = await axios.post(`${BaseURL}/api/command`, {
        token,
        cmd,
      });
      console.log(response.data.alert);
    } catch (error) {
      console.error("Command error:", error);
    } finally {
      setCmd("");
      setSending(false);
    }
  };

  const getLogLevel = (line) => {
    const Line = line.toLowerCase();
    if (Line.includes("error")) return "error";
    if (Line.includes("warn")) return "warn";
    if (Line.includes("started")) return "success";
    return "info";
  };

  const levelStyles = {
    error: { color: "#ff4d4d", icon: faX },
    warn: { color: "#ffaa00", icon: faWarning },
    success: { color: "#00ff99", icon: faCheck },
    info: { color: "#eee", icon: null },
  };
  const renderLogs = useMemo(() => {
    if (!logs) return null;

    return logs.split("\n").map((line, i) => {
      const level = getLogLevel(line);

      return (
        <div
          key={i}
          style={{
            color: levelStyles[level].color,
            whiteSpace: "pre-wrap",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {levelStyles[level].icon && (
            <FontAwesomeIcon icon={levelStyles[level].icon} />
          )}
          {line}
        </div>
      );
    });
  }, [logs]);

  return (
    <div className="pageContainer">
      <NavBar />
      <SidePanel />

      <div id="consoleCDiv">
        <div
          name="consoleC"
          id="consoleC"
          type="text"
          className="form-control Console"
          style={{ borderRadius: "10px 0px 0px 0px" }}
          ref={consoleRef}
          readOnly
        >
          {renderLogs}
        </div>

        <div id="consoleCInpDiv">
          <span style={{ color: "white" }}>{"> "}</span>
          <input
            type="text"
            id="consoleCInp"
            value={cmd}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            id="consoleCBtn"
            className="baseBtn"
            onClick={handleSubmit}
          ></button>
        </div>
      </div>
  
    </div>
  );
};

export default Console;
