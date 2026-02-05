import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SemesterProvider } from './MyComponents/semesterContext'
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SemesterProvider>
      <App />
      </SemesterProvider>
  </BrowserRouter>
)
