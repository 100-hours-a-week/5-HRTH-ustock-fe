import "./App.css";
import React from "react";
import { GlobalStyle } from "./Styles/GlobalStyles";
import Router from "./Router";
import "./App.css";
import { useAuth } from "./contexts/authContext";
import GoogleLogin from "./Component/GoogleLogin/login";
import Header from "./Component/Layout/Header/Header";
import Profile from "./Component/Layout/Header/Profile";

function App() {
  const { accessToken } = useAuth();
  return (
    <div>
      {accessToken ? (
        <>
          <Header />
          <Profile />
          <GlobalStyle />
          <Router />
        </>
      ) : (
        <div className="app-container">
          <div
            style={{
              display: "flex",
              width: "500px",
              height: "100vh",
              backgroundColor: "#fff",
              alignContent: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GoogleLogin />
          </div>
        </div>
      )}
    </div>
    // <>
    //   <GlobalStyle />
    //   <Router />
    // </>
  );
}

export default App;
