import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Navbar from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Navbar,
  domElementGetter: () => document.getElementById("mf-navbar"),
});

export const { bootstrap, mount, unmount } = lifecycles;