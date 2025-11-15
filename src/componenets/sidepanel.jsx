import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderClosed,
  faCode,
  faDashboard,
  faUsers,
  faSignOut,
  faTimes,
  faUserAlt,
} from "@fortawesome/free-solid-svg-icons";


const SidePanel = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem('access')
  const username = localStorage.getItem('username')

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem('username');
    localStorage.removeItem('access')
    navigate("/login");
  };

  const hasAccess = (level) => access?.includes(level);

  const menuItems = [
    { access: "1", path: "/dashboard", label: "Dashboard", icon: faDashboard },
    { access: "2", path: "/console", label: "Console", icon: faCode },
    { access: "3", path: "/files", label: "Files", icon: faFolderClosed },
    { access: "4", path: "/users", label: "Users", icon: faUsers },
  ];

  return (
    <>
      <button
        type="button"
        id="openOffcanvas"
        data-bs-toggle="offcanvas"
        data-bs-target="#Id2"
        aria-controls="Id2"
      >
        Menu
      </button>

      
      <div id="sidePanelContainer" onClick={(e) => e.stopPropagation()}>
        <div id="sidepanel">
          {menuItems.map(
            (item) =>
              hasAccess(item.access) && (
                <Link to={item.path} key={item.label} className="sidepanelitem">
                  <FontAwesomeIcon icon={item.icon} className="sidepanel-icon" />
                  <span className="sidepanelitem-text">{item.label}</span>
                </Link>
              )
          )}
          <button className="sidepanelitem" onClick={handleLogOut} id="logout">
            <FontAwesomeIcon icon={faSignOut} className="sidepanel-icon signOutIcon" />
            <span className="sidepanelitem-text">Sign Out</span>
          </button>
        </div>
      </div>

      
      <div
        className="offcanvas offcanvas-start"
        tabIndex="-1"
        id="Id2"
        aria-labelledby="offcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasLabel">
            <FontAwesomeIcon icon={faUserAlt} /> {username}
          </h5>
          <button
            type="button"
            className="close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="offcanvas-body">
          <div id="sidepanelSM">
            {menuItems.map(
              (item) =>
                hasAccess(item.access) && (
                  <Link to={item.path} key={item.label} className="sidepanelitemSM">
                    <FontAwesomeIcon icon={item.icon} className="sidepanel-icon" />
                    <span className="sidepanelitem-textSM">{item.label}</span>
                  </Link>
                )
            )}
            <button className="sidepanelitemSM" onClick={handleLogOut} id="logoutSM">
              <FontAwesomeIcon icon={faSignOut} className="sidepanel-icon signOutIcon" /> 
              <span className="sidepanelitem-textSM">Sign Out</span>
            </button>
            <button
              className="baseBtn"
              id="closeOffcanvas"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidePanel;