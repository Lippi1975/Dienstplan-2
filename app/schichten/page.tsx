const [branches, setBranches] = useState<Branch[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [shifts, setShifts] = useState<any[]>([]);

  const [filterBranch, setFilterBranch] = useState("alle");
const [branch, setBranch] = useState(0);
const [employee, setEmployee] = useState(0);
const [shiftType, setShiftType] = useState("Früh");

  const [filterEmployee, setFilterEmployee] = useState("alle");
  const [filterDate, setFilterDate] = useState("");
const [date, setDate] = useState(
new Date().toISOString().slice(0, 10)
);
@@ -220,8 +221,78 @@ export default function Schichten() {

<div className="card">
<h2>Gespeicherte Schichten</h2>
<div className="toolbar">

  <select
    value={filterBranch}
    onChange={(e) =>
      setFilterBranch(e.target.value)
    }
  >
    <option value="alle">
      Alle Filialen
    </option>

    {branches.map((b) => (
      <option
        key={b.id}
        value={b.name}
      >
        {b.name}
      </option>
    ))}
  </select>

  <select
    value={filterEmployee}
    onChange={(e) =>
      setFilterEmployee(e.target.value)
    }
  >
    <option value="alle">
      Alle Mitarbeiter
    </option>

    {employees.map((emp) => (
      <option
        key={emp.id}
        value={emp.name}
      >
        {emp.name}
      </option>
    ))}
  </select>

  <input
    type="date"
    value={filterDate}
    onChange={(e) =>
      setFilterDate(e.target.value)
    }
  />

        {shifts.map((s) => (
</div>
{shifts
  .filter((s) => {
    const branchMatch =
      filterBranch === "alle" ||
      s.branches?.name === filterBranch;

    const employeeMatch =
      filterEmployee === "alle" ||
      s.employees?.name === filterEmployee;

    const dateMatch =
      !filterDate ||
      s.shift_date === filterDate;

    return (
      branchMatch &&
      employeeMatch &&
      dateMatch
    );
  })
  .map((s) => (
<div
key={s.id}
className="shift"
