import NavBar from "../componenets/navbar";
import Footer from '../componenets/footer'
const NotFound = () => {
  return (
    <>
      <NavBar/>
      <div id="notfound">
        <h1 className="rgb-motion">Page not found</h1>
      </div>
      <Footer/>
    </>
  );
};

export default NotFound;
