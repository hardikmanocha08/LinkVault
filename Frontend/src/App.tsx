import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dasboard";
import { Landing } from "./pages/LandingPage";
import { SharePage } from "./pages/SharePage";
import { Signin } from "./pages/Signin";
import { Signup } from "./pages/Signup";
export default function App(){
  return <BrowserRouter>
    <Routes>
  <Route path="/" element={<Landing/>} />
      <Route path="/signup" element={<Signup/>}></Route>
      <Route path="/signin" element={<Signin/>}></Route>
      <Route path="/dashboard" element={<Dashboard/>}></Route>
      <Route path="/share/:shareLink" element={<SharePage/>}></Route>
    </Routes>
  </BrowserRouter>
}