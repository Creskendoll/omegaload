import React from "react";
import ReactDOM from "react-dom/client";
import "../styles/landingPageStyling.css";
// import logo from "/mainLogo.png";
export const LandingPage = ({ setScreen }) => {
  console.log(setScreen);
  return (
    <section className="landingPage">
      {/* <button onClick={() => setScreen("map")}>Next</button> */}
      <img id="mainLogo" alt="" src="/mainLogo.svg"></img>
      <div>
        <h1>Bike Delivery</h1>
        <p id="summaryParagraph"> Quick. On Demand. Sustainable</p>
      </div>

      <img
        id="ctaButton"
        onClick={() => setScreen("map")}
        alt="ctaButton"
        src="/ctaButton.svg"
      ></img>
    </section>
  );
};