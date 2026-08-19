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
  const [shiftType, setShiftType] = useState("Früh");

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [msg, setMsg] = useState("");

  useEffect(() => {
    const s = createClient();

    (async () => {
      const branches = await s
        .from("branches")
        .select("id,name")
        .order("id");

      const employees = await s
        .from("employees")
        .select("id,name")
        .eq("active", true)
        .order("name");

      if (branches.data) {
        setB(branches.data);

        if (branches.data[0]) {
          setBranch(branches.data[0].id);
        }
      }

      if (employees.data) {
        setE(employees.data);

        if (employees.data[0]) {
          setEmployee(employees.data[0].id);
        }
      }
    })();
  }, []);

  async function add() {
    if (!branch || !employee) return;

    const startTime =
      shiftType === "Früh" ? "08:00" : "14:30";

    const endTime =
      shiftType === "Früh" ? "12:30" : "18:00";

    const { error } = await createClient()
      .from("shifts")
      .upsert(
        {
          shift_date: date,
          branch_id: branch,
          employee_id: employee,
          shift_type: shiftType,
          start_time: startTime,
          end_time: endTime,
        },
        {
          onConflict:
            "shift_date,branch_id,shift_type",
        }
      );

    setMsg(
      error
        ? error.message
        : `${shiftType}-Schicht gespeichert`
    );
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Dienstplan</h1>

        <div className="toolbar">
          <select
            value={branch}
            onChange={(e) =>
              setBranch(Number(e.target.value))
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
            onChange={(e) =>
              setEmployee(Number(e.target.value))
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

          <select
            value={shiftType}
            onChange={(e) =>
              setShiftType(e.target.value)
            }
          >
            <option value="Früh">
              Vormittag (08:00–12:30)
            </option>
            <option value="Spät">
              Nachmittag (14:30–18:00)
            </option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

          <button
            className="primary"
            onClick={add}
          >
            Schicht speichern
          </button>
        </div>

        <p>{msg}</p>
      </div>
    </main>
  );
}
