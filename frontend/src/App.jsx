import React from "react";
import Header from "./components/Header";
import AsideBar from "./components/AsideBar";
import { Routes, Route } from "react-router-dom";


const App = () => {
  return (
    <div className="h-screen w-full bg-amber-200">
      <AsideBar />
    </div>
  );
};

export default App;