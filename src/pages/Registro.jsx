// src/pages/Registro.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../utils/firebase";
import { ref, set, get } from "firebase/database";
import styles from "./Registro.module.scss";

const Registro = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    cedula: ""
  });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    try {
      const snapshot = await get(ref(db, "pacientes/" + form.cedula));
      if (snapshot.exists()) {
        setError("Esta cédula ya está registrada.");
        return;
      }

      await set(ref(db, "pacientes/" + form.cedula), {
        nombre: form.nombre,
        cedula: form.cedula,
        role: "paciente"
      });

      localStorage.setItem("user", JSON.stringify({ nombre: form.nombre, cedula: form.cedula, role: "paciente" }));
      navigate("/paciente");
    } catch (err) {
      console.error(err);
      setError("Error al registrarse. Intenta nuevamente.");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.formSide}>
          <h2>Crear Cuenta</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                placeholder="Cédula"
                required
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.primaryButton}>Registrarse</button>
          </form>

          <p className={styles.loginLink}>
            ¿Ya tienes cuenta? <span onClick={() => navigate("/login")}>Inicia sesión</span>
          </p>
        </div>

        <div className={styles.infoSide}>
          <h3>Bienvenido</h3>
          <p>Crea tu cuenta para solicitar turnos de urgencias y acceder a servicios rápidos.</p>
        </div>
      </div>
    </div>
  );
};

export default Registro;