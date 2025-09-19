import MyEditor from './myEditor';
import './App.css';
import { ToastProvider } from './ui/toast';
function App() {
  return (
    <div className="App">
      <ToastProvider>
        <MyEditor />
      </ToastProvider>

    </div>
  );
}

export default App;
