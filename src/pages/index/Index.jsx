// src/pages/index/Index.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import { db } from "../../utils/firebase";
import styles from "./Index.module.scss";
import { FaUser, FaClock } from "react-icons/fa";

const Index = () => {
  const navigate = useNavigate();

  const [turnoActual, setTurnoActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(120);

  useEffect(() => {
    const turnoRef = ref(db, "turno_actual");
    onValue(turnoRef, (snap) => {
      if (snap.exists()) {
        setTurnoActual(snap.val());
        setTiempoRestante(120); // reset tiempo cada vez que cambia de turno
      }
    });

    const interval = setInterval(() => {
      setTiempoRestante(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.hero}>
      <div className={styles.highlight}>
        Atención rápida de urgencias sin filas ni papeleo.
      </div>
      <h1 className={styles.title}>
        Gestiona tus turnos médicos <br /> de urgencias en segundos
      </h1>
      <p className={styles.description}>
        Regístrate, inicia sesión y solicita tu turno desde cualquier lugar. Nuestra plataforma te permite ver tu turno en tiempo real y ser atendido sin demoras.
      </p>

      <div className={styles.buttons}>
        <button onClick={() => navigate("/login")} className={styles.primaryButton}>
          Iniciar sesión
        </button>
        <button onClick={() => navigate("/registro")} className={styles.secondaryButton}>
          Registrarse
        </button>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <FaUser className={styles.icon} />
          <div>
            <p className={styles.cardLabel}>Turno actual</p>
            <h3>{turnoActual > 0 ? Math.floor(turnoActual) : "—"}</h3>
          </div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressInner}
          style={{ width: `${(tiempoRestante / 120) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Index;