const Institution = require("../../models/Institution");
const Branch = require("../../models/Branch");
const AcademicSession = require("../../models/AcademicSession");
const ClassGroup = require("../../models/ClassGroup");

describe("Education Domain Models", () => {
  let institution;

  beforeEach(async () => {
    institution = await Institution.create({
      name: "Test Institution",
      code: "TEST-INST"
    });

    await Branch.init();
    await AcademicSession.init();
    await ClassGroup.init();
  });

  it("creates a branch scoped to an institution", async () => {
    const branch = await Branch.create({
      institutionId: institution._id,
      name: "Main Campus",
      code: "MAIN"
    });

    expect(branch._id).toBeDefined();
    expect(branch.code).toBe("MAIN");
    expect(branch.institutionId.toString()).toBe(institution._id.toString());
  });

  it("creates an academic session scoped to an institution", async () => {
    const session = await AcademicSession.create({
      institutionId: institution._id,
      name: "2026-27",
      startsAt: new Date("2026-04-01"),
      endsAt: new Date("2027-03-31"),
      isCurrent: true
    });

    expect(session._id).toBeDefined();
    expect(session.isCurrent).toBe(true);
  });

  it("creates a class group for a branch and academic session", async () => {
    const branch = await Branch.create({
      institutionId: institution._id,
      name: "Main Campus",
      code: "MAIN"
    });

    const session = await AcademicSession.create({
      institutionId: institution._id,
      name: "2026-27",
      startsAt: new Date("2026-04-01"),
      endsAt: new Date("2027-03-31")
    });

    const classGroup = await ClassGroup.create({
      institutionId: institution._id,
      branchId: branch._id,
      academicSessionId: session._id,
      name: "Class 10 A",
      section: "A",
      code: "10A"
    });

    expect(classGroup._id).toBeDefined();
    expect(classGroup.branchId.toString()).toBe(branch._id.toString());
    expect(classGroup.academicSessionId.toString()).toBe(session._id.toString());
  });
});
