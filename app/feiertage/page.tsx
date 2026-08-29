"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Feiertage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState("Niedersachsen");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadHolidays();
  }, []);

  async function loadHolidays() {
    const { data } = await createClient()
      .from("holidays")
      .select("*")
      .order("holiday_date");

    if (data) {
      setHolidays(data);
    }
  }

  async function addHoliday() {
    if (!date || !name) return;

let error = null;

if (state === "Beide") {
  const result = await createClient()
    .from("holidays")
    .insert([
      {
        holiday_date: date,
        holiday_name: name,
        state: "Niedersachsen",
      },
      {
        holiday_date: date,
        holiday_name: name,
        state: "Nordrhein-Westfalen",
      },
    ]);

  error = result.error;
} else {
  const result = await createClient()
    .from("holidays")
    .insert({
      holiday_date: date,
      holiday_name: name,
      state: state,
    });

  error = result.error;
}

    setMsg(
      error
        ? error.message
        : "Feiertag gespeichert"
    );

    if (!error) {
      setDate("");
      setName("");
    }

    await loadHolidays();
  }

  async function deleteHoliday(id: number) {
    await createClient()
      .from("holidays")
      .delete()
      .eq("id", id);

    await loadHolidays();
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(
      "de-DE",
      {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
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

      <div className="card">
        <h1>Feiertage</h1>

        <div className="toolbar">

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Feiertagsname"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

<select
  value={state}
  onChange={(e) =>
    setState(e.target.value)
  }
>
  <option value="Beide">
    Beide Bundesländer
  </option>

  <option value="Niedersachsen">
    Niedersachsen
  </option>

  <option value="Nordrhein-Westfalen">
    Nordrhein-Westfalen
  </option>
</select>

          <button
            className="primary"
            onClick={addHoliday}
          >
            Feiertag speichern
          </button>

        </div>

        <p>{msg}</p>

      </div>

      <div className="card">

        <h2>
          Feiertagsliste ({holidays.length})
        </h2>

        {holidays.map((holiday) => (
          <div
            key={holiday.id}
            className="shift"
          >
            <strong>
              {formatDate(
                holiday.holiday_date
              )}
            </strong>

            <div>
              Feiertag:{" "}
              {holiday.holiday_name}
            </div>

            <div>
              Bundesland:{" "}
              {holiday.state}
            </div>

            <div
              style={{
                marginTop: 10,
              }}
            >
              <button
                onClick={() =>
                  deleteHoliday(
                    holiday.id
                  )
                }
              >
                Löschen
              </button>
            </div>

          </div>
        ))}

      </div>

    </main>
  );
}
