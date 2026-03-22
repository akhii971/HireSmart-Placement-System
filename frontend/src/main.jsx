import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { store } from './redux/recruiter/store.js';
import { Provider } from 'react-redux';
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";


createRoot(document.getElementById('root')).render(
<Provider store={store}>
  <App />
</Provider>
)
