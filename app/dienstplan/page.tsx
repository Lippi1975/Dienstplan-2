"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Branch = {
  id: number;
  name: string;
};

type Employee = {
  id: number;
  name: string;
};

export default function Plan() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [vacations, setVacations] = useState<any[]>([]);


  const [branch, setBranch] = useState(0);
  const [employee, setEmployee] = useState(0);
  const [shiftType, setShiftType] = useState("Früh");

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();

    const { data: branchData } = await supabase
      .from("branches")
      .select("id,name")
      .order("id");

    const { data: employeeData } = await supabase
      .from("employees")
      .select("id,name")
      .eq("active", true)
      .order("name");

    if (branchData) {
      setBranches(branchData);

      if (branchData.length > 0) {
        setBranch(branchData[0].id);
      }
    }

if (employeeData) {
  setEmployees(employeeData);

  if (employeeData.length > 0) {
    setEmployee(employeeData[0].id);
  }
}

await loadShifts();
await loadVacations();
}

async function loadVacations() {
  const { data } = await createClient()
    .from("vacations")
    .select(`
      id,
      employee_id,
      date_from,
      date_to,
      employees(name)
    `);

  if (data) {
    setVacations(data);
  }
}
  
  async function loadShifts() {
    const { data } = await createClient()
      .from("shifts")
      .select(
        `
        id,
        shift_date,
        shift_type,
        employee_id,
        branch_id,
        employees(name),
        branches(name)
      `
      )
      .order("shift_date", { ascending: false });

    if (data) {
      setShifts(data);
    }
  }

  async function add() {
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
        : "Schicht gespeichert"
    );

    await loadShifts();
  }

  async function deleteShift(id: number) {
    await createClient()
      .from("shifts")
      .delete()
      .eq("id", id);

    await loadShifts();
    await loadVacations();
  }

  async function updateEmployee(
    shiftId: number,
    employeeId: number
  ) {
    await createClient()
      .from("shifts")
      .update({
        employee_id: employeeId,
      })
      .eq("id", shiftId);

    await loadShifts();
  }
function formatDate(dateString: string) {
  const d = new Date(dateString);

  return d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
 function getVacation(day: string) {
  return vacations.find(
    (v) =>
      day >= v.date_from &&
      day <= v.date_to
  );
}

function getShift(
  date: string,
  branchName: string,
  shiftType: string
) {
  return shifts.find(
    (s) =>
      s.shift_date === date &&
      s.branches?.name === branchName &&
      s.shift_type === shiftType
  );
}
  
const days = [...new Set(shifts.map((s) => s.shift_date))]
  .sort()
  .slice(-7);
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
            {branches.map((b) => (
              <option
                key={b.id}
                value={b.id}
              >
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={employee}
            onChange={(e) =>
              setEmployee(Number(e.target.value))
            }
          >
            {employees.map((emp) => (
              <option
                key={emp.id}
                value={emp.id}
              >
                {emp.name}
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

      <div className="card">
        <h2>Gespeicherte Schichten</h2>

        {shifts.map((s) => (
          <div
            key={s.id}
            className="shift"
          >
            <div>
              <strong>{s.shift_date}</strong>
            </div>

            <div>
              Filiale: {s.branches?.name}
            </div>

            <div>
              Schicht: {s.shift_type}
            </div>

            <div
              style={{
                marginTop: "10px",
              }}
            >
              Mitarbeiter:
            </div>

            <select
              value={s.employee_id}
              onChange={(e) =>
                updateEmployee(
                  s.id,
                  Number(e.target.value)
                )
              }
            >
              {employees.map((emp) => (
                <option
                  key={emp.id}
                  value={emp.id}
                >
                  {emp.name}
                </option>
              ))}
            </select>

            <div
              style={{
                marginTop: "10px",
              }}
            >
              <button
                onClick={() =>
                  deleteShift(s.id)
                }
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
  <h2>Wochenansicht</h2>

  <div className="week">
    {days.map((day) => (
      <div key={day} className="day">
<div className="dayhead">
  {formatDate(day)}
</div>

        <div className="slot">
          <div className="slottitle">
            Filiale 1 Vormittag
          </div>

<div className="shift"
  style={{
    background: getVacation(day)
      ? "#fff3cd"
      : undefined,
  }}
>
  {getVacation(day)
    ? `🟨 Urlaub: ${getVacation(day)?.employees?.name}`
    : getShift(
        day,
        "Filiale 1",
        "Früh"
      )?.employees?.name || "-"}
</div>
        </div>

        <div className="slot">
          <div className="slottitle">
            Filiale 1 Nachmittag
          </div>

          <div className="shift">
            {
              getShift(
                day,
                "Filiale 1",
                "Spät"
              )?.employees?.name || "-"
            }
          </div>
        </div>

        <div className="slot">
          <div className="slottitle">
            Filiale 2 Vormittag
          </div>

          <div className="shift">
            {
              getShift(
                day,
                "Filiale 2",
                "Früh"
              )?.employees?.name || "-"
            }
          </div>
        </div>

        <div className="slot">
          <div className="slottitle">
            Filiale 2 Nachmittag
          </div>

          <div className="shift">
            {
              getShift(
                day,
                "Filiale 2",
                "Spät"
              )?.employees?.name || "-"
            }
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
    </main>
  );
}
