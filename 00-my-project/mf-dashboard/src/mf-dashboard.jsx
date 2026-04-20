import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import RootComponent from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: RootComponent,
  domElementGetter: () => document.getElementById("single-spa-content"),
});

export const { bootstrap, mount, unmount } = lifecycles;