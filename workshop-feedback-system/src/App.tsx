import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </ToastProvider>
  );
}

export default App;
