import React, { useEffect, useState } from "react";
import styles from "./TurnosPaciente.module.scss";
import { FaPlusCircle, FaPauseCircle, FaUserClock, FaEye, FaReply, FaEdit, FaArrowUp, FaTimes } from "react-icons/fa";
import { db } from "../utils/firebase";
import { ref, set, onValue, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

const TurnosPaciente = () => {
  const [paciente, setPaciente] = useState(null);
  const [miTurno, setMiTurno] = useState(null);
  const [turnoActual, setTurnoActual] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(120);

  const tiempoPorTurno = 2; // minutos
  const agentes = 15;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setPaciente(user);

    const turnoRef = ref(db, "turno_actual");
    onValue(turnoRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setTurnoActual(val);
    });

    if (user?.cedula) {
      const miTurnoRef = ref(db, "turnos/" + user.cedula);
      onValue(miTurnoRef, (snapshot) => {
        const val = snapshot.val();
        if (val?.turno) {
          setMiTurno(val.turno);
        }
      });
    }
  }, []);

  useEffect(() => {
    const turnoRef = ref(db, "turno_actual");
    onValue(turnoRef, (snap) => {
      if (snap.exists()) {
        setTurnoActual(snap.val());
        setTiempoRestante(120);
      }
    });

    const interval = setInterval(() => {
      setTiempoRestante((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const pedirTurno = async () => {
    if (!paciente?.cedula) return;

    try {
      const ultimoRef = ref(db, "ultimo_turno");
      const ultimoSnap = await get(ultimoRef);
      const ultimoTurno = ultimoSnap.exists() ? ultimoSnap.val() : 0;

      const nuevoTurno = ultimoTurno + 1;

      await set(ref(db, "turnos/" + paciente.cedula), {
        nombre: paciente.nombre,
        cedula: paciente.cedula,
        turno: nuevoTurno,
        timestamp: Date.now()
      });

      await set(ultimoRef, nuevoTurno);
      setMiTurno(nuevoTurno);
    } catch (err) {
      console.error("Error asignando turno:", err);
    }
  };

  const tiempoEspera = miTurno ? (miTurno - turnoActual) * tiempoPorTurno : 0;

  return (
    <div className={styles.dashboard}>
      <h2>Panel de Turnos</h2>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <p>TURNO ACTUAL</p>
          <span>{turnoActual > 0 ? Math.floor(turnoActual) : "—"}</span>
        </div>
        <div className={styles.stat}>
          <p>MI TURNO</p>
          <span>{miTurno || "--"}</span>
        </div>
        <div className={styles.stat}>
          <p>TIEMPO ESTIMADO</p>
          <span>{miTurno ? `${tiempoEspera} min` : "--"}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.nuevo} onClick={pedirTurno} disabled={miTurno}>
          <FaPlusCircle /> {miTurno ? "Ya tienes turno" : "Nuevo Turno"}
        </button>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressInner}
          style={{ width: `${(tiempoRestante / 120) * 100}%` }}
        />
      </div>

      {paciente && (
        <div className={styles.card}>
          <div className={styles.cardInfo}>
            <div>
              <h3>{paciente.nombre}</h3>
              <p>Consulta General</p>
              <p><strong>Cédula:</strong> {paciente.cedula}</p>
              <p><strong>Hora de llegada:</strong> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className={styles.timeBox}>
              {miTurno ? `${tiempoEspera} min` : "--"}
            </div>
          </div>

          <div className={styles.cardActions}>
            <FaEye />
            <FaReply />
            <FaEdit />
            <FaArrowUp />
            <FaTimes />
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnosPaciente;