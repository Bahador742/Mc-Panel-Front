import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import SidePanel from "../componenets/sidepanel";
import NavBar from "../componenets/navbar";
import Footer from "../componenets/footer";
import baseURL from "../contexts/baseURL";
import { FixedSizeList as List } from 'react-window';
import { faCheck, faWarning, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashKeys from "../componenets/dashboardkeys";

const Dashboard = () => {
  const [stats, setStats] = useState({
    Cpu: 0,
    Ram: 0,
    OnlinePlayers: "n",
    MaxPlayers: "a",
    ServerStatus: "n/a",
    ServerIP: "n/a",
  });
  const [logs, setLogs] = useState("");
  const [buttonStatus, setButtonStatus] = useState("");
  const [copy, setCopy] = useState(false);
  const { BaseURL } = useContext(baseURL);
  const socketRef = useRef(null);
  const consoleRef = useRef(null);
  const consoleRefSM = useRef(null);

  const [ScreenWidth, Non] = useState(window.screen.width);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (ScreenWidth <= 950) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, [ScreenWidth]);

  useEffect(() => {
    socketRef.current = io(BaseURL, {
      query: {
        token: localStorage.getItem("token"),
      },
    });

    socketRef.current.on("status", (data) => {
      setStats({
        Cpu: Math.round(data.cpu),
        Ram: Math.round(data.ram),
        OnlinePlayers: data.onlinePlayers,
        MaxPlayers: data.maxPlayers,
        ServerStatus: data.status,
        ServerIP: data.address,
      });
    });

    socketRef.current.on("log", (log) => {
      setLogs(log);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [BaseURL]);

  useEffect(() => {
    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
        if (consoleRefSM.current) {
          consoleRefSM.current.scrollTop = consoleRefSM.current.scrollHeight;
        }
      });
    };

    scrollToBottom();
  }, [logs]);

  const ramStyle = {
    background: `conic-gradient(rgba(243, 156, 18, 0.8) ${stats.Ram}%, rgba(2, 2, 2, 0.9) 0%)`,
  };

  const cpuStyle = {
    background: `conic-gradient(rgba(243, 156, 18, 0.8) ${stats.Cpu}%, rgba(2, 2, 2, 0.9) 0%)`,
  };

  const handleAction = async (btnType) => {
    const Token = localStorage.getItem("token");
    try {
      setButtonStatus(btnType);

      if (btnType === "restart" && stats.ServerStatus === "online") {
        await axios.post(`${BaseURL}/api/button`, {
          token: Token,
          btn: "stop",
        });
        if (stats.ServerStatus === "offline") {
          await axios.post(`${BaseURL}/api/button`, {
            token: Token,
            btn: "start",
          });
        }
      } else {
        await axios.post(`${BaseURL}/api/button`, {
          token: Token,
          btn: btnType,
        });
      }
    } catch (error) {
      alert(`Failed to ${btnType} server: ${error.message}`);
    } finally {
      setButtonStatus(null);
    }
  };
  const Copy = (e) => {
    const txt = e.target.innerHTML;
    navigator.clipboard
      .writeText(txt)
      .then(() => {
        setCopy(true);
        setTimeout(() => setCopy(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
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
    <>
      <div className="pageContainer">
        <NavBar />
        <SidePanel />

        <div id="DashBoardDiv">
          {!isMobile && (
            <div id="consolediv">
              <div
                name="console"
                id="console"
                type="text"
                className="form-control Console"
                ref={consoleRef}
                readOnly
              >
                {renderLogs}
              </div>
            </div>
          )}

          <div id="informations">
            <section id="section1">
              <div style={ramStyle} className="square">
                <div className="inside-square">
                  <h6>RAM</h6>
                  <h1 className="rgb-motion">{stats.Ram}%</h1>
                </div>
              </div>

              <div style={cpuStyle} className="square">
                <div className="inside-square">
                  <h6>CPU</h6>
                  <h1 className="rgb-motion">{stats.Cpu}%</h1>
                </div>
              </div>
            </section>

            {isMobile && (
              <div
                name="consoleMobile"
                id="consoleSM"
                type="text"
                className="form-control Console"
                ref={consoleRefSM}
                readOnly
              >
                {renderLogs}
              </div>
            )}
            <section id="section2">
              <div id="div1">
                <div className="Info">
                  Address:{" "}
                  <span onClick={Copy}>
                    {copy ? "ServerIP Copied !" : stats.ServerIP}
                  </span>
                </div>
                <div className="Info">
                  <span>Players:</span>{" "}
                  <span>{`${stats.OnlinePlayers}/${stats.MaxPlayers}`}</span>
                </div>
                <div className="Info">
                  Server Status:{" "}
                  <span
                    style={{
                      color: stats.ServerStatus === "online" ? "green" : "red",
                    }}
                  >
                    {stats.ServerStatus}
                  </span>
                </div>
              </div>

              <div id="DashBoardbuttonsdiv">
                {["start", "stop", "restart"].map((btn) => (
                  <DashKeys
                    key={btn}
                    btn={btn}
                    buttonStatus={buttonStatus}
                    handleAction={handleAction}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
