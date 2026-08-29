"use client";

import { useEffect, useState } from "react";
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
      .order("holiday_d*te");

    if (data) {
      setHo*idays(data);
    }
  }

  async fu*ction addHoliday() {
    if (!date*|| !name) return;

    const { err*r } = await createClient()
      .*rom("holidays")
      .insert({
  *     holiday_date: date,
        h*liday_name: name,
        state: s*ate,
      });

    setMsg(
      *rror
        ? error.message
     *  : "Feiertag gespeichert"
    );
*    setDate("");
    setName("");
*    await loadHolidays();
  }

  a*ync function deleteHoliday(id: num*er) {
    await createClient()
   *  .from("holidays")
      .delete(*
      .eq("id", id);

    await l*adHolidays();
  }

  function form*tDate(dateString: string) {
    return new Date(dateString)
      .toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
  }

  return (
    <main className="container">

      <div style={{ marginBottom: 15 }}>
        /
          <button>
            ← Hauptmenü
          </button>
        </Link>
      </div>

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

        {holidays.map((h) => (
          <div
            key={h.id}
            className="shift"
          >
            <strong>
              {formatDate(
                h.holiday_date
              )}
            </strong>

            <div>
              Feiertag:
              {" "}
              {h.holiday_name}
            </div>

            <div>
              Bundesland:
              {" "}
              {h.state}
            </div>

            <div
              style={{
                marginTop: 10,
              }}
            >
              <button
                onClick={() =>
                  deleteHoliday(h.id)
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
