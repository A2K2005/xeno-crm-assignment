import "./App.css";
import Home from "./Components/Home/Home";
import Navbar from "./Components/Navbar/Navbar";
import Feature from "./Components/Feature/Feature";
import Main from "./Components/Main/Main";
import Platform from "./Components/Platforms/Platform";
import DoMore from "./Components/DoMore/DoMore";
import Footer from "./Components/Footer/Footer";

function App() {
  return (
    <>
      <Navbar />
      <div id="logo" />
      <Home />
      <Feature />
      <Main />
      <DoMore />
      <Platform />
      <Footer />
    </>
  );
}

export default App;
