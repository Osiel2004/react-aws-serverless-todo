import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import './App.css';

// URL de tu API Gateway en AWS (Ya configurada directamente)
const API = "https://uoqlghrx24.execute-api.us-east-1.amazonaws.com";

// --- VISTA PÚBLICA (Solo Lectura) ---
function VistaPublica() {
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    fetch(`${API}/tareas`)
      .then(res => res.json())
      .then(data => {
        // Blindaje: Solo actualizamos si AWS manda una lista real
        if (Array.isArray(data)) {
          setTareas(data);
        } else {
          console.error("Respuesta inesperada de AWS:", data);
          setTareas([]); // Evita que .map() explote
        }
      })
      .catch(err => {
        console.error("Error cargando tareas públicas:", err);
        setTareas([]);
      });
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🌎 Tareas Públicas</h2>
      <p><em>Cualquiera puede ver esta lista (Modo solo lectura)</em></p>
      
      {tareas.length === 0 ? <p>No hay tareas registradas aún o están cargando...</p> : (
        <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'left' }}>
          {tareas.map(t => (
            <li key={t.id} style={{ padding: '10px', borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9', marginBottom: '5px', borderRadius: '4px', color: '#333' }}>
              📌 {t.texto}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- VISTA PRIVADA (CRUD Completo) ---
function VistaPrivada({ signOut, user }) {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState('');

  // Función para LEER (GET)
  const cargarTareas = () => {
    fetch(`${API}/tareas`)
      .then(res => res.json())
      .then(data => {
        // Blindaje: Solo actualizamos si AWS manda una lista real
        if (Array.isArray(data)) {
          setTareas(data);
        } else {
          console.error("Respuesta inesperada de AWS:", data);
          setTareas([]); // Evita que .map() explote
        }
      })
      .catch(err => {
        console.error("Error de conexión:", err);
        setTareas([]);
      });
  };

  // Se ejecuta al cargar el componente
  useEffect(() => {
    cargarTareas();
  }, []);

  // Función para CREAR (POST)
  const crearTarea = async (e) => {
    e.preventDefault(); 
    if (!nuevaTarea.trim()) return; 

    const tarea = {
      id: Date.now().toString(), 
      texto: nuevaTarea
    };

    try {
      await fetch(`${API}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarea)
      });
      setNuevaTarea(''); 
      cargarTareas(); 
    } catch (error) {
      console.error("Error al crear la tarea:", error);
    }
  };

  // Función para ELIMINAR (DELETE)
  const eliminarTarea = async (id) => {
    try {
      await fetch(`${API}/tareas/${id}`, {
        method: 'DELETE'
      });
      cargarTareas(); 
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🔒 Panel de Control Privado</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#eef2f5', padding: '10px', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: 'black' }}>Hola, <strong>{user?.signInDetails?.loginId}</strong></p>
        <button onClick={signOut} style={{ backgroundColor: '#ff4d4f', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>

      {/* Formulario para agregar tareas */}
      <form onSubmit={crearTarea} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Escribe una nueva tarea..." 
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', color: 'black' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Agregar
        </button>
      </form>

      {/* Lista de tareas */}
      <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'left' }}>
        {tareas.map(t => (
          <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #ddd', backgroundColor: 'white', color: 'black', marginBottom: '5px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <span>{t.texto}</span>
            <button onClick={() => eliminarTarea(t.id)} style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '5px 10px', fontWeight: 'bold' }}>
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <h1>Gestor de Tareas Serverless</h1>
          <nav style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px', padding: '15px', backgroundColor: '#242424', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>🌎 Ver Públicas</Link>
            <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>🔒 Ir al Admin</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<VistaPublica />} />
            <Route 
              path="/admin" 
              element={
                <Authenticator>
                  {({ signOut, user }) => (
                    <VistaPrivada signOut={signOut} user={user} />
                  )}
                </Authenticator>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;