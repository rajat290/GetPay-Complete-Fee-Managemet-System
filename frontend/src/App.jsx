import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="text-center p-10">
        <h1 className="text-3xl font-bold text-blue-600">GetPay Frontend Running</h1>
      </div>
      <Routes>
        <Route path="/" element={<h2>Welcome to GetPay</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
