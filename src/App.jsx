import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import HomePage from './pages/HomePage';
import VideoPlayerPage from './pages/VideoPlayerPage';

function App() {
  return (
    <MovieProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/watch/:id" element={<VideoPlayerPage />} />
        </Routes>
      </BrowserRouter>
    </MovieProvider>
  );
}

export default App;
