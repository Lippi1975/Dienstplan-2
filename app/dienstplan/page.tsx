"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type B = {
  id: number;
  name: string;
};

type E = {
  id: number;
  name: string;
};

export default function Plan() {
  const [b, setB] = useState<B[]>([]);
  const [e, setE] = useState<E[]>([]);

  const [branch, setBranch] = useState(0);
  const [employee, setEmployee] = useState(0);

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [msg, setMsg] = useState("");

  useEffect(() => {
    const s = createClient();

    (async () => {
      const x = await s
        .from("branches")
        .select("id,name")
        .order("id");

      const y = await s
        .from("employees")
        .select("id,name")
        .eq("active", true)
        .order("name");

      if (x.data) {
        setB(x.data);

        if (x.data[0]) {
          setBranch(x.data[0].id);
        }
      }

      if (y.data) {
        setE(y.data);

        if (y.data[0]) {
          setEmployee(y.data[0].id);
        }
      }
    })();
  }, []);

  async function add() {
    if (!branch || !employee) return;

    const { error } = await createClient()
      .from("shifts")
      .upsert(
        {
          shift_date: date,
          branch_id: branch,
          employee_id: employee,
          shift_type: "Früh",
          start_time: "08:00",
          end_time: "12:30",
        },
        {
          onConflict: "shift_date,branch_id,shift_type",
        }
      );

    setMsg(
      error
        ? error.message
        : "Frühschicht gespeichert."
    );
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Dienstplan</h1>

        <div className="toolbar">
          <select
            value={branch}
            onChange={(x) =>
              setBranch(+x.target.value)
            }
          >
            {b.map((x) => (
              <option
                key={x.id}
                value={x.id}
              >
                {x.name}
              </option>
            ))}
          </select>

          <select
            value={employee}
            onChange={(x) =>
              setEmployee(+x.target.value)
            }
          >
            {e.map((x) => (
              <option
                key={x.id}
                value={x.id}
              >
                {x.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(x) =>
              setDate(x.target.value)
            }
          />

          <button
            className="primary"
            onClick={add}
          >
            Frühschicht speichern
          </button>
        </div>

        <p>{msg}</p>
      </div>
    </main>
  );
}
