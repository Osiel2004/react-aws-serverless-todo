import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Importar Amplify y sus estilos visuales
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

// 2. Configurar Amplify con tus IDs exactos de Terraform
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_VnYZsG1oI',
      userPoolClientId: '4ur5fvqcd901jflmvtsl9bqgfe',
    }
  }
});

// Guardaremos la URL de tu API globalmente para usarla en el siguiente bloque
window.API_URL = "https://uoqlghrx24.execute-api.us-east-1.amazonaws.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)