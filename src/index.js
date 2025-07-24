import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
/*import "./css/Sign.css";*/
import "./css/dark.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { SignupProvider } from "./contexts/SignupContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { SignThemeProvider } from "./contexts/SignTheme";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  //<React.StrictMode>
  <ChatProvider>
    <UserProvider>
      <ThemeProvider>
        <SignupProvider>
          <SignThemeProvider>
            <App />
          </SignThemeProvider>
        </SignupProvider>
      </ThemeProvider>
    </UserProvider>
  </ChatProvider>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
