import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Header from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Header,
  domElementGetter: () => document.getElementById("mf-header"),
});

export const { bootstrap, mount, unmount } = lifecycles;
