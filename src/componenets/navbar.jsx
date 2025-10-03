import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserAlt } from "@fortawesome/free-solid-svg-icons";

const NavBar = () => {
  return (
    <>
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

        <div id="navbarUserName">
          <div Name="dropdown open">
            <span type="button" id="triggerId">
              <FontAwesomeIcon icon={faUserAlt} />{" "}
              {localStorage.getItem("username")}
            </span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
