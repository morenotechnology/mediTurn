// src/pages/PanelAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PanelAdmin.module.scss";
import { db } from "../utils/firebase";
import { ref, onValue, set, remove } from "firebase/database";

const PanelAdmin = () => {
  const navigate = useNavigate();
  const [turnoActual, setTurnoActual] = useState(0);
  const [colaTurnos, setColaTurnos] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    const turnoRef = ref(db, "turno_actual");
    onValue(turnoRef, (snap) => {
      if (snap.exists()) setTurnoActual(snap.val());
    });

    const turnosRef = ref(db, "turnos");
    onValue(turnosRef, (snap) => {
      if (snap.exists()) {
        const datos = Object.values(snap.val());
        const enCola = datos
          .filter(t => t.turno > turnoActual)
          .sort((a, b) => a.turno - b.turno);
        setColaTurnos(enCola);
      } else {
        setColaTurnos([]);
      }
    });
  }, [turnoActual, navigate]);

  const atenderSiguiente = async () => {
    if (colaTurnos.length === 0) return;
    const siguiente = colaTurnos[0].turno;
    await set(ref(db, "turno_actual"), siguiente);
  };

  const reiniciarSistema = async () => {
    await set(ref(db, "turno_actual"), 0);
    await set(ref(db, "ultimo_turno"), 0);
    await remove(ref(db, "turnos"));
    alert("Sistema reiniciado");
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h2>Panel Administrativo</h2>

        <div className={styles.turnoActual}>
          <h4>Turno en Atención</h4>
          <p>{turnoActual}</p>
        </div>

        <div className={styles.cola}>
          <h4>Turnos en Espera</h4>
          {colaTurnos.length > 0 ? (
            <ul>
              {colaTurnos.map((turno, index) => (
                <li key={index}>#{turno.turno} - {turno.nombre}</li>
              ))}
            </ul>
          ) : (
            <p>No hay turnos pendientes</p>
          )}
        </div>

        <button
          className={styles.button}
          onClick={atenderSiguiente}
          disabled={colaTurnos.length === 0}
        >
          Atender Siguiente
        </button>
        <button
          className={styles.button}
          onClick={reiniciarSistema}
        >
          Reiniciar Sistema
        </button>
      </div>
    </div>
  );
};

export default PanelAdmin;