const mongoose = require('mongoose');
const Student = require('../../models/Student');

describe('Student Model', () => {
  beforeAll(async () => {
    // Ensure we're connected to the database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/getpay_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Student.deleteMany({});
  });

  it('should create a new student with valid data', async () => {
    const studentData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      rollNumber: 'STD001',
      class: '10',
      section: 'A'
    };

    const student = new Student(studentData);
    const savedStudent = await student.save();

    expect(savedStudent._id).toBeDefined();
    expect(savedStudent.name).toBe(studentData.name);
    expect(savedStudent.email).toBe(studentData.email);
    expect(savedStudent.rollNumber).toBe(studentData.rollNumber);
  });

  it('should not create a student without required fields', async () => {
    const student = new Student({});
    
    let error;
    try {
      await student.save();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors).toHaveProperty('name');
    expect(error.errors).toHaveProperty('email');
    expect(error.errors).toHaveProperty('password');
  });

  it('should not allow duplicate email addresses', async () => {
    const studentData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      rollNumber: 'STD001',
      class: '10',
      section: 'A'
    };

    await new Student(studentData).save();
    
    const duplicateStudent = new Student({
      ...studentData,
      rollNumber: 'STD002'
    });
    
    let error;
    try {
      await duplicateStudent.save();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error
  });

  it('should set default values correctly', async () => {
    const studentData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      rollNumber: 'STD002',
      class: '9',
      section: 'B'
    };

    const student = new Student(studentData);
    const savedStudent = await student.save();

    expect(savedStudent.isActive).toBe(true);
    expect(savedStudent.createdAt).toBeDefined();
    expect(savedStudent.updatedAt).toBeDefined();
  });
});
