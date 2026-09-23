"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Serien() {
  const currentEmployee =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem("employee") || "null"
        )
      : null;

  if (currentEmployee?.role !== "admin") {
    return (
      <main className="container">
        <div className="card">
          <h1>Kein Zugriff</h1>
          <p>
            Diese Seite ist nur für Administratoren verfügbar.
          </p>
        </div>
      </main>
    );
  }

  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [weekday, setWeekday] = useState("5");
  const [shiftType, setShiftType] = useState("Früh");
  const [msg, setMsg] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);

  // ID der Serie, die gerade bearbeitet wird
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    loadEmployees();
    loadBranches();
    loadTemplates();
  }, []);

  async function loadEmployees() {
    const { data } = await createClient()
      .from("employees")
      .select("id,name")
      .eq("active", true)
      .order("name");

    if (data) setEmployees(data);
  }

  async function loadBranches() {
    const { data } = await createClient()
      .from("branches")
      .select("id,name")
      .order("name");

    if (data) setBranches(data);
  }

  async function loadTemplates() {
    const { data } = await createClient()
      .from("shift_templates")
      .select("*")
      .order("weekday");

    if (data) {
      setTemplates(data);
    }
  }

  // Neue Serie speichern oder bestehende Serie aktualisieren
  async function saveTemplate() {
    setMsg("");

    if (!employeeId || !branchId || !weekday || !shiftType) {
      setMsg("❌ Bitte alle Pflichtfelder ausfüllen.");
      return;
    }

    // Prüfen, ob bereits eine andere Serie mit
    // Filiale + Wochentag + Schicht existiert
    const overlap = templates.find(
      (t) =>
        t.branch_id === Number(branchId) &&
        t.weekday === Number(weekday) &&
        t.shift_type === shiftType &&
        t.id !== editId
    );

    if (overlap) {
      setMsg(
        "❌ Für diese Filiale, diesen Wochentag und diese Schicht existiert bereits eine Serie."
      );
      return;
    }

    const supabase = createClient();

    if (editId !== null) {
      // Bestehende Serie bearbeiten
      const { error } = await supabase
        .from("shift_templates")
        .update({
          employee_id: Number(employeeId),
          branch_id: Number(branchId),
          weekday: Number(weekday),
          shift_type: shiftType,
          valid_from: validFrom || null,
          valid_until: validUntil || null,
        })
        .eq("id", editId);

      if (error) {
        setMsg("❌ Fehler: " + error.message);
        return;
      }

      setMsg("✅ Serie wurde geändert.");
    } else {
      // Neue Serie anlegen
      const { error } = await supabase
        .from("shift_templates")
        .insert({
          employee_id: Number(employeeId),
          branch_id: Number(branchId),
          weekday: Number(weekday),
          shift_type: shiftType,
          active: true,
          valid_from: validFrom || null,
          valid_until: validUntil || null,
        });

      if (error) {
        setMsg("❌ Fehler: " + error.message);
        return;
      }

      setMsg("✅ Serienschicht gespeichert.");
    }

    // Formular zurücksetzen
    cancelEdit();

    // Liste neu laden
    loadTemplates();
  }

  // Serie zum Bearbeiten laden
  function editTemplate(t: any) {
    setEditId(t.id);

    setEmployeeId(String(t.employee_id));
    setBranchId(String(t.branch_id));
    setWeekday(String(t.weekday));
    setShiftType(t.shift_type);
    setValidFrom(t.valid_from || "");
    setValidUntil(t.valid_until || "");

    setMsg("");

    // Nach oben zum Formular scrollen
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Bearbeitung abbrechen / Formular leeren
  function cancelEdit() {
    setEditId(null);
    setEmployeeId("");
    setBranchId("");
    setWeekday("5");
    setShiftType("Früh");
    setValidFrom("");
    setValidUntil("");
  }

  async function deleteTemplate(id: number) {
    const confirmDelete = window.confirm(
      "Möchtest du diese Serie wirklich löschen?"
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await createClient()
      .from("shift_templates")
      .delete()
      .eq("id", id);

    if (error) {
      setMsg("❌ Fehler beim Löschen: " + error.message);
      return;
    }

    // Falls gerade diese Serie bearbeitet wurde
    if (editId === id) {
      cancelEdit();
    }

    setMsg("✅ Serie wurde gelöscht.");
    loadTemplates();
  }

  function weekdayName(weekday: number) {
    switch (weekday) {
      case 1:
        return "Montag";
      case 2:
        return "Dienstag";
      case 3:
        return "Mittwoch";
      case 4:
        return "Donnerstag";
      case 5:
        return "Freitag";
      case 6:
        return "Samstag";
      case 0:
        return "Sonntag";
      default:
        return "";
    }
  }

  function employeeName(id: number) {
    return (
      employees.find(
        (e) => e.id === id
      )?.name || `#${id}`
    );
  }

  function branchName(id: number) {
    return (
      branches.find(
        (b) => b.id === id
      )?.name || `#${id}`
    );
  }

  return (
    <main className="container">

      <a
        href="https://dienstplan-2.vercel.app/"
        style={{
          textDecoration: "none",
        }}
      >
        <button>
          ← Hauptmenü
        </button>
      </a>

      <div className="card form-card">

        <h1>
          {editId !== null
            ? "Serienschicht bearbeiten"
            : "Serienschichten"}
        </h1>

        <div className="form-group">
          <label>Mitarbeiter</label>

          <select
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(e.target.value)
            }
          >
            <option value="">
              Bitte wählen
            </option>

            {employees.map((emp) => (
              <option
                key={emp.id}
                value={emp.id}
              >
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Filiale</label>

          <select
            value={branchId}
            onChange={(e) =>
              setBranchId(e.target.value)
            }
          >
            <option value="">
              Bitte wählen
            </option>

            {branches.map((b) => (
              <option
                key={b.id}
                value={b.id}
              >
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Wochentag</label>

          <select
            value={weekday}
            onChange={(e) =>
              setWeekday(e.target.value)
            }
          >
            <option value="1">Montag</option>
            <option value="2">Dienstag</option>
            <option value="3">Mittwoch</option>
            <option value="4">Donnerstag</option>
            <option value="5">Freitag</option>
            <option value="6">Samstag</option>
            <option value="0">Sonntag</option>
          </select>
        </div>

        <div className="form-group">
          <label>Schicht</label>

          <select
            value={shiftType}
            onChange={(e) =>
              setShiftType(e.target.value)
            }
          >
            <option value="Früh">
              Vormittag
            </option>

            <option value="Spät">
              Nachmittag
            </option>
          </select>
        </div>

        <div className="form-group">
          <label>Gültig von</label>

          <input
            type="date"
            value={validFrom}
            onChange={(e) =>
              setValidFrom(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Gültig bis</label>

          <input
            type="date"
            value={validUntil}
            onChange={(e) =>
              setValidUntil(e.target.value)
            }
          />
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            className="primary form-submit"
            onClick={saveTemplate}
          >
            {editId !== null
              ? "Änderungen speichern"
              : "Serie speichern"}
          </button>

          {editId !== null && (
            <button
              type="button"
              onClick={() => {
                cancelEdit();
                setMsg("");
              }}
            >
              Abbrechen
            </button>
          )}
        </div>

        <p>{msg}</p>

        <p>
          Anzahl Serien: {templates.length}
        </p>

        <hr />

        <h2>Gespeicherte Serien</h2>

        {templates.length === 0 && (
          <p>
            Noch keine Serien vorhanden.
          </p>
        )}

        {templates.map((t) => (
          <div
            key={t.id}
            className="card"
            style={{
              marginBottom: 15,
            }}
          >
            <strong>
              {employeeName(t.employee_id)}
            </strong>

            <div>
              Filiale:{" "}
              {branchName(t.branch_id)}
            </div>

            <div>
              Tag:{" "}
              {weekdayName(t.weekday)}
            </div>

            <div>
              Schicht:{" "}
              {t.shift_type === "Früh"
                ? "Vormittag"
                : "Nachmittag"}
            </div>

            <div>
              Gültig von:{" "}
              {t.valid_from || "-"}
            </div>

            <div>
              Gültig bis:{" "}
              {t.valid_until || "-"}
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() =>
                  editTemplate(t)
                }
              >
                ✏️ Bearbeiten
              </button>

              <button
                onClick={() =>
                  deleteTemplate(t.id)
                }
              >
                🗑️ Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
