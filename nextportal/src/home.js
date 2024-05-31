import React from "react";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
  // const { loggedIn, email } = props;
  const navigate = useNavigate();

  const login = () => {
    navigate("/login");
  };

  return (
    <div className="mainContainer">
      <div className={"titleContainer"}>
        <div>
          <img
            src={require("./static/nextskill_logo.png")}
            onClick={login}
            alt="Nextportal Logo"
          />
        </div>
      </div>
      <div>
        <h4>Students Management Portal</h4>
      </div>
      <br />
    </div>
  );
};

export default Home;
