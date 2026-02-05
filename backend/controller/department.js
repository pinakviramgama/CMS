const Department = require("../model/Department");
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Department name required" });
    }

    const exists = await Department.findOne({
      name: name.toLowerCase(),
    });

    if (exists) {
      return res.status(409).json({ message: "Department already exists" });
    }

    const department = await Department.create({
      name: name.toLowerCase(),
      semesters: [],
    });

    res.status(201).json(department);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const addSubject = async (req, res) => {
  const { dept, sem } = req.params;
  const { name } = req.body;

  console.log("hello java");

  try {
    const department = await Department.findOne({ name: dept });
    console.log(dept);

    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const semester = department.semesters.find((s) => s.sem === parseInt(sem));
    if (!semester)
      return res.status(404).json({ message: "Semester not found" });

    const exist = semester.subjects.find((sub) => sub.name === name);

    if (exist) {
      return res.status(200).json({ message: "Subject already found" });
    }
    semester.subjects.push({
      name,
      materials: { pyqs: [], midsem: [], references: [] },
    });

    await department.save();

    res.status(200).json({ message: "Subject added successfully", semester });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const addSemester = async (req, res) => {
  const { deptName } = req.params;
  const { sem } = req.body;

  try {
    const dept = await Department.findOne({ name: deptName.trim() });
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const exists = dept.semesters.some((s) => s.sem === Number(sem));
    if (exists)
      return res.status(400).json({ message: "Semester already exists" });

    dept.semesters.push({ sem: Number(sem), subjects: [] });
    await dept.save();

    res.status(200).json({ message: "Semester added", semester: sem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const fetchSubjects = async (req, res) => {
  try {
    const { dept, sem } = req.params;
    const semNumber = Number(sem);

    const department = await Department.findOne({ name: dept.toLowerCase() });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const semesterObj = department.semesters.find((s) => s.sem === semNumber);
    if (!semesterObj) {
      return res.status(404).json({ message: "Semester not found" });
    }

    return res.json({
      subjects: semesterObj.subjects.map((sub) => sub.name),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
const addLink = async (req, res) => {
  try {
    const { title, url } = req.body;
    const { dept, sem, subjectName } = req.params;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    const department = await Department.findOne({ name: dept.toLowerCase() });
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const semNumber = Number(sem);
    const semesterObj = department.semesters.find((s) => s.sem === semNumber);
    if (!semesterObj)
      return res.status(404).json({ message: "Semester not found" });

    const subjectObj = semesterObj.subjects.find(
      (sub) => sub.name === subjectName,
    );
    if (!subjectObj)
      return res.status(404).json({ message: "Subject not found" });

    console.log(subjectObj);

    if (!subjectObj.links) subjectObj.links = [];

    const newLink = { title, url };
    subjectObj.materials.links.push(newLink);

    await department.save();

    return res.status(201).json({ message: "Link added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const deleteLink = async (req, res) => {
  try {
    const { dept, sem, subjectName, linkId } = req.params;

    const department = await Department.findOne({
      name: dept.toLowerCase(),
    });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // 🔥 FIX 1: sem key is `sem`, not semNumber
    const semester = department.semesters.find(
      (s) => String(s.sem) === String(sem),
    );
    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    const subject = semester.subjects.find(
      (sub) => sub.name.toLowerCase() === subjectName.toLowerCase(),
    );
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (
      !subject.materials ||
      !subject.materials.links ||
      subject.materials.links.length === 0
    ) {
      return res.status(404).json({ message: "No links found" });
    }

    const before = subject.materials.links.length;

    subject.materials.links = subject.materials.links.filter(
      (link) => link._id.toString() !== linkId,
    );

    if (subject.materials.links.length === before) {
      return res.status(404).json({ message: "Link not found" });
    }

    await department.save();

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (err) {
    console.error("DELETE LINK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addSubject,
  createDepartment,
  addSemester,
  fetchSubjects,
  addLink,
  deleteLink,
};
