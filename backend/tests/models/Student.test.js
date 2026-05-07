const Institution = require("../../models/Institution");
const Student = require("../../models/Student");

describe("Student Model", () => {
  let institution;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });
    await Student.init();
  });

  it("creates a student with valid tenant-scoped data", async () => {
    const student = await Student.create({
      institutionId: institution._id,
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      registrationNo: "STD001",
      className: "10A"
    });

    expect(student._id).toBeDefined();
    expect(student.institutionId.toString()).toBe(institution._id.toString());
    expect(student.email).toBe("john@example.com");
    expect(await student.matchPassword("password123")).toBe(true);
  });

  it("requires institution, registration number, class, and password", async () => {
    const student = new Student({});

    let error;
    try {
      await student.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors).toHaveProperty("institutionId");
    expect(error.errors).toHaveProperty("name");
    expect(error.errors).toHaveProperty("email");
    expect(error.errors).toHaveProperty("registrationNo");
    expect(error.errors).toHaveProperty("className");
    expect(error.errors).toHaveProperty("password");
  });

  it("allows the same email in different institutions", async () => {
    const otherInstitution = await Institution.create({
      name: "Other Institution",
      code: "OTHER-INST"
    });

    const baseStudent = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      registrationNo: "STD001",
      className: "10A"
    };

    await Student.create({ ...baseStudent, institutionId: institution._id });
    const otherStudent = await Student.create({
      ...baseStudent,
      institutionId: otherInstitution._id
    });

    expect(otherStudent._id).toBeDefined();
  });

  it("blocks duplicate registration numbers inside one institution", async () => {
    const studentData = {
      institutionId: institution._id,
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      registrationNo: "STD001",
      className: "10A"
    };

    await Student.create(studentData);

    let error;
    try {
      await Student.create({
        ...studentData,
        email: "jane@example.com"
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000);
  });
});
