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
  const [branches, setBranches] = useState<B[]>([]);
  const [employees, setEmployees] = useState<E[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

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
    const s = createClient();

    const b = await s
      .from("branches")
      .select("id,name")
      .order("id");

    const e = await s
      .from("employees")
      .select("id,name")
      .eq("active", true)
      .order("name");

    if (b.data) {
      setBranches(b.data);

      if (b.data[0]) {
        setBranch(b.data[0].id);
      }
    }

    if (e.data) {
      setEmployees(e.data);

      if (e.data[0]) {
        setEmployee(e.data[0].id);
      }
    }

    loadShifts();
  }

  async function loadShifts() {
    const { data } = await createClient()
      .from("shifts")
      .select(`
        id,
        shift_date,
        shift_type,
        branch_id,
        employee_id,
        branches(name),
        employees(name)
      `)
      .order("shift_date", {
        ascending: false,
      });

    if (data) {
      setShifts(data);
    }
  }

  async function add() {
    const startTime =
      shiftType === "Früh"
        ? "08:00"
        : "14:30";

    const endTime =
      shiftType === "Früh"
        ? "12:30"
        : "18:00";

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

    loadShifts();
  }

  async function deleteShift(id: number) {
    await createClient()
      .from("shifts")
      .delete()
      .eq("id", id);

    loadShifts();
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

    loadShifts();
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Dienstplan</h1>

        <div className="toolbar">
          <select
            value={branch}
            onChange={(e) =>
              setBranch(
                Number(e.target.value)
              )
            }
          >
            {branches.map((x) => (
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
              setEmployee(
                Number(e.target.value)
              )
            }
          >
            {employees.map((x) => (
              <option
                key={x.id}
                value={x.id}
              >
                {x.name}
              </option>
         
