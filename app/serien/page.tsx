const [employees, setEmployees] = useState<any[]>([]);
const [branches, setBranches] = useState<any[]>([]);
const [templates, setTemplates] = useState<any[]>([]);

const [employeeId, setEmployeeId] = useState("");
const [branchId, setBranchId] = useState("");
const [weekday, setWeekday] = useState("5");
const [shiftType, setShiftType] = useState("Früh");

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

async function saveTemplate() {
  const { error } = await createClient()
    .from("shift_templates")
    .insert({
      employee_id: employeeId,
      branch_id: branchId,
      weekday: Number(weekday),
      shift_type: shiftType,
      active: true,
    });

  if (!error) {
    loadTemplates();
  }
}

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
