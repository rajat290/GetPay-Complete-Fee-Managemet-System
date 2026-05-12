const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

// Load env vars
dotenv.config();

// Models
const Institution = require('./models/Institution');
const Student = require('./models/Student');
const Branch = require('./models/Branch');
const AcademicSession = require('./models/AcademicSession');
const ClassGroup = require('./models/ClassGroup');
const Role = require('./models/Role');
const Fee = require('./models/Fee');
const FeeAssignment = require('./models/FeeAssignment');
const Payment = require('./models/Payment');
const PaymentEvent = require('./models/PaymentEvent');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
    }
};

const clearData = async () => {
    console.log('Clearing existing data (except super admin)...');
    try {
        await Institution.deleteMany();
        await Student.deleteMany({ role: { $ne: 'super_admin' } });
        await Branch.deleteMany();
        await AcademicSession.deleteMany();
        await ClassGroup.deleteMany();
        await Role.deleteMany();
        await Fee.deleteMany();
        await FeeAssignment.deleteMany();
        await Payment.deleteMany();
        await PaymentEvent.deleteMany();
        console.log('Data cleared.');
    } catch (err) {
        console.error(`Error clearing data: ${err.message}`);
    }
};

const generateData = async () => {
    console.log('Generating new mock data...');

    const numInstitutions = 10;
    
    for (let i = 0; i < numInstitutions; i++) {
        try {
            // Create Institution
            const institution = await Institution.create({
                name: faker.company.name() + ' Institute',
                code: faker.string.alpha(5).toUpperCase() + i,
                type: faker.helpers.arrayElement(["school", "college", "coaching"]),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                address: faker.location.streetAddress(),
                subscription: {
                    plan: faker.helpers.arrayElement(["starter", "growth", "enterprise"]),
                    status: "active",
                    currentPeriodEndsAt: faker.date.future()
                },
                enabledModules: [
                    "student_management",
                    "fee_management",
                    "finance_operations",
                    "analytics"
                ],
                isActive: true
            });

            console.log(`Created Institution: ${institution.name}`);

            // Create Academic Session
            const session = await AcademicSession.create({
                institutionId: institution._id,
                name: '2025-2026',
                startsAt: new Date('2025-04-01'),
                endsAt: new Date('2026-03-31'),
                isCurrent: true,
                isActive: true
            });

            // Create Branch
            const branch = await Branch.create({
                institutionId: institution._id,
                name: 'Main Campus',
                code: faker.string.alpha(4).toUpperCase() + 'MAIN',
                address: faker.location.streetAddress(),
                isActive: true
            });

            // Create Class Groups
            const classGroups = [];
            const classes = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
            for (const cls of classes) {
                const cg = await ClassGroup.create({
                    institutionId: institution._id,
                    branchId: branch._id,
                    academicSessionId: session._id,
                    name: cls,
                    section: 'A',
                    code: cls.replace(' ', '').toUpperCase() + 'A' + faker.string.numeric(3),
                    isActive: true
                });
                classGroups.push(cg);
            }

            // Create Staff/Admin
            const adminRole = await Role.create({
                institutionId: institution._id,
                name: 'Admin',
                permissions: ['all'],
                isSystem: true
            });

            const staffRole = await Role.create({
                institutionId: institution._id,
                name: 'Staff',
                permissions: ['read', 'write'],
                isSystem: false
            });

            // 1 Admin
            await Student.create({
                institutionId: institution._id,
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: 'password123',
                role: 'admin',
                roleIds: [adminRole._id],
                registrationNo: `ADM-${i}-${faker.string.numeric(4)}`,
                status: 'active',
                className: 'N/A'
            });

            // 5 Staff
            for (let j = 0; j < 5; j++) {
                await Student.create({
                    institutionId: institution._id,
                    name: faker.person.fullName(),
                    email: faker.internet.email().toLowerCase(),
                    password: 'password123',
                    role: 'staff',
                    roleIds: [staffRole._id],
                    registrationNo: `STF-${i}-${j}-${faker.string.numeric(4)}`,
                    status: 'active',
                    className: 'N/A'
                });
            }

            // Create Fees
            const tuitionFee = await Fee.create({
                institutionId: institution._id,
                academicSessionId: session._id,
                title: 'Tuition Fee',
                amount: faker.helpers.arrayElement([5000, 10000, 15000, 20000]),
                category: 'Tuition',
                dueDate: faker.date.soon({ days: 30 })
            });

            const hostelFee = await Fee.create({
                institutionId: institution._id,
                academicSessionId: session._id,
                title: 'Hostel Fee',
                amount: faker.helpers.arrayElement([10000, 12000, 15000]),
                category: 'Hostel',
                dueDate: faker.date.soon({ days: 60 })
            });

            const transportFee = await Fee.create({
                institutionId: institution._id,
                academicSessionId: session._id,
                title: 'Transport Fee',
                amount: faker.helpers.arrayElement([3000, 4000, 5000]),
                category: 'Transport',
                dueDate: faker.date.soon({ days: 15 })
            });
            
            const fees = [tuitionFee, hostelFee, transportFee];

            // Create Students (100 - 150)
            const numStudents = faker.number.int({ min: 100, max: 150 });
            console.log(`  Generating ${numStudents} students...`);
            
            for (let j = 0; j < numStudents; j++) {
                const cg = faker.helpers.arrayElement(classGroups);
                const student = await Student.create({
                    institutionId: institution._id,
                    branchId: branch._id,
                    academicSessionId: session._id,
                    classGroupId: cg._id,
                    name: faker.person.fullName(),
                    email: faker.internet.email().toLowerCase(),
                    registrationNo: `REG-${i}-${j}-${faker.string.numeric(6)}`,
                    password: 'password123',
                    role: 'student',
                    className: cg.name,
                    status: 'active',
                    guardian: {
                        name: faker.person.fullName(),
                        email: faker.internet.email(),
                        phone: faker.phone.number()
                    }
                });

                // Assign Fees to student
                for (const fee of fees) {
                    // Some students might not have hostel or transport
                    if (fee.category !== 'Tuition' && faker.datatype.boolean() === false) {
                        continue; 
                    }

                    const assignment = await FeeAssignment.create({
                        institutionId: institution._id,
                        academicSessionId: session._id,
                        studentId: student._id,
                        feeId: fee._id,
                        feeTitle: fee.title,
                        amount: fee.amount,
                        dueDate: fee.dueDate,
                        status: faker.helpers.arrayElement(['pending', 'paid', 'overdue'])
                    });

                    // Generate a Payment for 'paid' status
                    if (assignment.status === 'paid') {
                        await Payment.create({
                            institutionId: institution._id,
                            studentId: student._id,
                            assignmentId: assignment._id,
                            amount: assignment.amount,
                            mode: faker.helpers.arrayElement(['online', 'cash', 'bank_transfer']),
                            status: 'completed',
                            gateway: 'razorpay',
                            referenceNo: faker.string.alphanumeric(10).toUpperCase(),
                            verifiedAt: faker.date.recent({ days: 30 })
                        });
                    }
                }
            }
            console.log(`  Completed institution ${i + 1}/${numInstitutions}.`);
        } catch (err) {
            console.error(`Error generating data for institution ${i}:`, err);
        }
    }
};

const run = async () => {
    await connectDB();
    await clearData();
    await generateData();
    console.log('Seeding completed successfully!');
    process.exit(0);
};

run().catch(err => {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
});
