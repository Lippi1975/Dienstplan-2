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
 const [weekOffset, setWeekOffset] = useState(0);
 const [jumpDate, setJumpDate] = useState("");
  const [branch, setBranch] = useState(0);
  const [employee, setEmployee] = useState(0);
  const [shiftType, setShiftType] = useState("Früh");
  const [holidays, setHolidays] = useState<any[]>([]);
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
await loadHolidays();
}

  async function loadHolidays() {
  const { data } = await createClient()
    .from("holidays")
    .select("*");

  if (data) {
    setHolidays(data);
  }
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

  const vacation = employeeHasVacation(
    employee,
    date
  );

  if (vacation) {
    setMsg(
      `❌ Mitarbeiter hat Urlaub von ${vacation.date_from} bis ${vacation.date_to}`
    );
    return;
  }
  
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

function isToday(dateString: string) {
  const todayString = new Date()
    .toISOString()
    .split("T")[0];

  return dateString === todayString;
}

function getVacation(day: string) {
  return vacations.find(
    (v) =>
      day >= v.date_from &&
      day <= v.date_to
  );
}

  function getHoliday(
  date: string,
  state: string
) {
  return holidays.find(
    (h) =>
      h.holiday_date === date &&
      h.state === state
  );
}
  
function employeeHasVacation(
  employeeId: number,
  day: string
) {
  return vacations.find(
    (v) =>
      v.employee_id === employeeId &&
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
function getCalendarWeek(date: Date) {
  const target = new Date(date);

  const dayNr =
    (target.getDay() + 6) % 7;

  target.setDate(
    target.getDate() - dayNr + 3
  );

  const firstThursday = new Date(
    target.getFullYear(),
    0,
    4
  );

  const diff =
    target.getTime() -
    firstThursday.getTime();

const branch1 =
  branches.find((b) => b.id === 1)?.name ||
  "Filiale 1";

const branch2 =
  branches.find((b) => b.id === 2)?.name ||
  "Filiale 2";
  
  return (
    1 +
    Math.round(
      diff /
        (7 * 24 * 60 * 60 * 1000)
    )
  );
}

function jumpToWeek() {
  if (!jumpDate) return;

  const target = new Date(jumpDate);
  const today = new Date();

  const targetMonday = new Date(target);
  const targetDay =
    targetMonday.getDay() === 0
      ? 7
      : targetMonday.getDay();

  targetMonday.setDate(
    targetMonday.getDate() - targetDay + 1
  );

  const currentMonday = new Date(today);
  const currentDay =
    currentMonday.getDay() === 0
      ? 7
      : currentMonday.getDay();

  currentMonday.setDate(
    currentMonday.getDate() - currentDay + 1
  );

  const diffWeeks = Math.round(
    (targetMonday.getTime() -
      currentMonday.getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );

  setWeekOffset(diffWeeks);
}
const days: string[] = [];

const today = new Date();

const dayOfWeek =
  today.getDay() === 0
    ? 7
    : today.getDay();

const monday = new Date(today);

monday.setDate(
  today.getDate() - dayOfWeek + 1 + (weekOffset * 7)
);

for (let i = 0; i < 7; i++) {
  const d = new Date(monday);

  d.setDate(monday.getDate() + i);

  days.push(
    d.toISOString().split("T")[0]
  );
}

const branch1 =
  branches.find((b) => b.id === 1)?.name ||
  "Filiale 1";

const branch2 =
  branches.find((b) => b.id === 2)?.name ||
  "Filiale 2";
  
  const calendarWeek =
  getCalendarWeek(monday);
  

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
        <div className="toolbar">
  <button
    onClick={() =>
      setWeekOffset(
        weekOffset - 1
      )
    }
  >
    ← Vorherige Woche
  </button>

<strong>
  KW {calendarWeek}
</strong>
          
<button
  className="primary"
  onClick={() =>
    setWeekOffset(0)
  }
>
  Heute
</button>
  <button
    onClick={() =>
      setWeekOffset(
        weekOffset + 1
      )
    }
  >
    Nächste Woche →
  </button>
  <input
  type="date"
  value={jumpDate}
  onChange={(e) =>
    setJumpDate(e.target.value)
  }
/>

<button
  onClick={jumpToWeek}
>
  Gehe zu Datum
</button>
</div>

  <h2>Wochenansicht</h2>

  <div className="week">
    {days.map((day) => (
     
      <div
  key={day}
  className="day"
  style={{
    border: isToday(day)
      ? "3px solid #2563eb"
      : undefined,
    background: isToday(day)
      ? "#eff6ff"
      : undefined,
  }}
>
        
<div className="dayhead">
  {formatDate(day)}
  
{getHoliday(
  day,
  "Niedersachsen"
) && (
  <div
    style={{
      fontSize: 12,
      color: "#2563eb",
      marginTop: 4,
    }}
  >
    🎉 {
      getHoliday(
        day,
        "Niedersachsen"
      )?.holiday_name
    }
  </div>
)}
  
  {isToday(day) && (
    <div
      style={{
        fontSize: 12,
        color: "#2563eb",
        marginTop: 4,
      }}
    >
      Heute
    </div>
  )}
</div>

        <div className="slot">
          <div className="slottitle">
            {branch1} Vormittag
          </div>

{(() => {
  const shift = getShift(
    day,
    branch1,
    "Früh"
  );

  if (!shift) {
return (
  <div
    className="shift"
    style={{
      background: "#fee2e2",
      color: "#991b1b",
      fontWeight: "bold",
      border: "1px solid #fca5a5",
    }}
  >
    ⚪ Nicht besetzt
  </div>
);
  }

  const vacation = employeeHasVacation(
    shift.employee_id,
    day
  );

  return (
    <div
      className="shift"
      style={{
        background: vacation
          ? "#fff3cd"
          : undefined,
      }}
    >
      {vacation
        ? `🟨 Urlaub: ${shift.employees?.name}`
        : shift.employees?.name}
    </div>
  );
})()}
        </div>

        <div className="slot">
          <div className="slottitle">
            {branch1} Nachmittag
          </div>

    

{(() => {
  const shift = getShift(
    day,
    branch1,
    "Spät"
  );

if (!shift) {
  return (
    <div
      className="shift"
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        fontWeight: "bold",
        border: "1px solid #fca5a5",
      }}
    >
      ⚪ Nicht besetzt
    </div>
 
  );
}

  const vacation = employeeHasVacation(
    shift.employee_id,
    day
  );

  return (
    <div
      className="shift"
      style={{
        background: vacation ? "#fff3cd" : undefined,
      }}
    >
      {vacation
        ? `🟨 Urlaub: ${shift.employees?.name}`
        : shift.employees?.name}
    </div>
  );
})()}
        </div>
      
        <hr
  style={{
    margin: "15px 0",
    border: "none",
    borderTop: "3px solid #2563eb",
  }}
/>

        <div className="slot">
          <div className="slottitle">
            {branch2} Vormittag
          </div>

{(() => {
  const shift = getShift(
    day,
    branch2,
    "Früh"
  );

if (!shift) {
  return (
    <div
      className="shift"
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        fontWeight: "bold",
        border: "1px solid #fca5a5",
      }}
    >
      ⚪ Nicht besetzt
    </div>
  );
}

  const vacation = employeeHasVacation(
    shift.employee_id,
    day
  );

  return (
    <div
      className="shift"
      style={{
        background: vacation ? "#fff3cd" : undefined,
      }}
    >
      {vacation
        ? `🟨 Urlaub: ${shift.employees?.name}`
        : shift.employees?.name}
    </div>
  );
})()}
        </div>

        <div className="slot">
          <div className="slottitle">
            {branch2} Nachmittag
          </div>

{(() => {
  const shift = getShift(
    day,
    branch2,
    "Spät"
  );

if (!shift) {
  return (
    <div
      className="shift"
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        fontWeight: "bold",
        border: "1px solid #fca5a5",
      }}
    >
      ⚪ Nicht besetzt
    </div>
  );
}

  const vacation = employeeHasVacation(
    shift.employee_id,
    day
  );

  return (
    <div
      className="shift"
      style={{
        background: vacation ? "#fff3cd" : undefined,
      }}
    >
      {vacation
        ? `🟨 Urlaub: ${shift.employees?.name}`
        : shift.employees?.name}
    </div>
  );
})()}
        </div>
      </div>
    ))}
  </div>
</div>
    </main>
  );
}
