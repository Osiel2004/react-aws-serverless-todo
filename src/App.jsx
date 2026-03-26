import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import './App.css';

// URL de tu API Gateway en AWS (Asegúrate de que sea la actual)
const API = "https://4b7c6d8gl3.execute-api.us-east-1.amazonaws.com";

// --- VISTA PÚBLICA (Solo Lectura) ---
function VistaPublica() {
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    fetch(`${API}/tareas`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setTareas(data) : setTareas([]))
      .catch(err => console.error("Error cargando tareas públicas:", err));
  }, []);

  return (
    <div className="container">
      <h2>🌎 Tareas Públicas</h2>
      <ul className="task-list">
        {tareas.length === 0 ? <p>No hay tareas registradas.</p> : (
          tareas.map(t => (
            <li key={t.id} className="task-item public-item">
              📌 {t.texto}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// --- VISTA PRIVADA (CRUD COMPLETO: Crear, Leer, Actualizar, Eliminar) ---
function VistaPrivada({ signOut, user }) {
  const [tareas, setTareas] = useState([]);
  const [textoTarea, setTextoTarea] = useState('');
  const [editandoId, setEditandoId] = useState(null); // Estado para saber si estamos editando

  const cargarTareas = () => {
    fetch(`${API}/tareas`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setTareas(data) : setTareas([]))
      .catch(err => console.error(err));
  };

  useEffect(() => { cargarTareas(); }, []);

  // Función para GUARDAR (Sirve para Crear y para Editar)
  const guardarTarea = async (e) => {
    e.preventDefault();
    if (!textoTarea.trim()) return;

    const tarea = {
      // Si estamos editando, mantenemos el ID original; si no, creamos uno nuevo
      id: editandoId || Date.now().toString(),
      texto: textoTarea
    };

    try {
      await fetch(`${API}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarea)
      });
      
      // Limpiamos el formulario y los estados
      setTextoTarea('');
      setEditandoId(null);
      cargarTareas();
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
    }
  };

  // Función para preparar la interfaz para editar
  const iniciarEdicion = (tarea) => {
    setTextoTarea(tarea.texto);
    setEditandoId(tarea.id);
  };

  // Función para cancelar la edición y volver a modo "Nueva Tarea"
  const cancelarEdicion = () => {
    setTextoTarea('');
    setEditandoId(null);
  };

  const eliminarTarea = async (id) => {
    try {
      await fetch(`${API}/tareas/${id}`, { method: 'DELETE' });
      cargarTareas();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="container">
      <div className="admin-header">
        <p>Hola, <strong>{user?.signInDetails?.loginId}</strong></p>
        <button className="btn-signout" onClick={signOut}>Cerrar Sesión</button>
      </div>

      <h2>{editandoId ? '✏️ Editando Tarea' : '➕ Nueva Tarea'}</h2>

      <form onSubmit={guardarTarea} className="task-form">
        <input 
          type="text" 
          placeholder="Escribe algo..." 
          value={textoTarea}
          onChange={(e) => setTextoTarea(e.target.value)}
          className="task-input"
        />
        <button type="submit" className={editandoId ? "btn-update" : "btn-add"}>
          {editandoId ? 'Actualizar' : 'Agregar'}
        </button>
        {editandoId && (
          <button type="button" onClick={cancelarEdicion} className="btn-cancel">
            Cancelar
          </button>
        )}
      </form>

      <ul className="task-list">
        {tareas.map(t => (
          <li key={t.id} className="task-item">
            <span>{t.texto}</span>
            <div className="actions">
              <button className="btn-edit" onClick={() => iniciarEdicion(t)}>✏️</button>
              <button className="btn-delete" onClick={() => eliminarTarea(t.id)}>X</button>
            </div>
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
        <header className="main-header">
          <h1>Todo Serverless Pro</h1>
          <nav className="nav-bar">
            <Link to="/">Público</Link>
            <Link to="/admin">Admin</Link>
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
// v2.3 correccion id.