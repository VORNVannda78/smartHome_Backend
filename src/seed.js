require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Room = require("./models/Room");
const Tenant = require("./models/Tenant");
const Invoice = require("./models/Invoice");
const Expense = require("./models/Expense");
const Lease = require("./models/Lease");
const TelegramMessage = require("./models/TelegramMessage");
const PaymentProof = require("./models/PaymentProof");

async function seed() {
  await connectDB();
  console.log("🌱 Starting seed...\n");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    Tenant.deleteMany({}),
    Invoice.deleteMany({}),
    Expense.deleteMany({}),
    Lease.deleteMany({}),
    TelegramMessage.deleteMany({}),
    PaymentProof.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // ── Create demo users ──────────────────────────────────────────────────────
  const user1 = await User.create({
    name: "ហេង ច័ន្ទដារ៉ា",
    email: "demo@roomrent.kh",
    password: "demo1234",
    buildingName: "អគារ ចំការមន",
    plan: "pro",
  });

  const user2 = await User.create({
    name: "សុខ វិទ្យា",
    email: "sokha@test.com",
    password: "test1234",
    buildingName: "វីឡា ទួលគោក",
    plan: "free",
  });
  console.log("👤 Created 2 demo users");

  // ── Create rooms ──────────────────────────────────────────────────────────
  const [r1, r2, r3, r4, r5, r6, r7, r8] = await Room.insertMany([
    { landlordId: user1._id, roomNumber: "101", floor: 1, monthlyRent: 180, status: "Occupied" },
    { landlordId: user1._id, roomNumber: "102", floor: 1, monthlyRent: 180, status: "Available" },
    { landlordId: user1._id, roomNumber: "201", floor: 2, monthlyRent: 220, status: "Occupied" },
    { landlordId: user1._id, roomNumber: "202", floor: 2, monthlyRent: 220, status: "Occupied" },
    { landlordId: user1._id, roomNumber: "301", floor: 3, monthlyRent: 260, status: "Maintenance" },
    { landlordId: user1._id, roomNumber: "302", floor: 3, monthlyRent: 260, status: "Available" },
    { landlordId: user1._id, roomNumber: "401", floor: 4, monthlyRent: 300, status: "Occupied" },
    { landlordId: user1._id, roomNumber: "402", floor: 4, monthlyRent: 300, status: "Available" },
  ]);

  const [r9, r10] = await Room.insertMany([
    { landlordId: user2._id, roomNumber: "A1", floor: 1, monthlyRent: 150, status: "Occupied" },
    { landlordId: user2._id, roomNumber: "A2", floor: 1, monthlyRent: 150, status: "Available" },
  ]);
  console.log("🏠 Created 10 rooms");

  // ── Create tenants ────────────────────────────────────────────────────────
  const [t1, t2, t3, t4] = await Tenant.insertMany([
    { landlordId: user1._id, fullName: "សុខ ស្រីនាថ",   phone: "012 345 678", roomId: r1._id, deposit: 360, moveInDate: "2024-01-15", email: "sreynath@gmail.com",   nationalId: "KH-001234", telegramChatId: "tg_111222333", telegramLinked: true },
    { landlordId: user1._id, fullName: "ហេង ច័ន្ទដារ៉ា", phone: "096 789 012", roomId: r3._id, deposit: 440, moveInDate: "2024-03-01", email: "chanthdara@gmail.com", nationalId: "KH-002345", telegramChatId: "tg_444555666", telegramLinked: true },
    { landlordId: user1._id, fullName: "ណាំ ដាវុត",     phone: "077 456 789", roomId: r4._id, deposit: 440, moveInDate: "2023-11-20", email: "davuth@gmail.com",     nationalId: "KH-003456" },
    { landlordId: user1._id, fullName: "លី ពិសី",       phone: "085 123 456", roomId: r7._id, deposit: 600, moveInDate: "2024-02-10", email: "pisey@gmail.com",       nationalId: "KH-004567" },
  ]);

  const [t5] = await Tenant.insertMany([
    { landlordId: user2._id, fullName: "ប៉ែន ចន្ថា", phone: "010 111 222", roomId: r9._id, deposit: 300, moveInDate: "2024-04-01", email: "chantha@gmail.com", nationalId: "KH-005678" },
  ]);
  console.log("👥 Created 5 tenants");

  // ── Create invoices ───────────────────────────────────────────────────────
  const [inv1, inv2, inv3, inv4, inv5, inv6] = await Invoice.insertMany([
    { landlordId: user1._id, tenantId: t1._id, roomId: r1._id, month: "2024-06", rent: 180, waterUsage: 5, waterCost: 20, electricUsage: 120, electricCost: 96, trash: 5, total: 301, status: "Paid",    createdAt: "2024-06-01", oldWater: 100, newWater: 105, oldElectric: 400, newElectric: 520 },
    { landlordId: user1._id, tenantId: t2._id, roomId: r3._id, month: "2024-06", rent: 220, waterUsage: 4, waterCost: 16, electricUsage: 90,  electricCost: 72, trash: 5, total: 313, status: "Pending", createdAt: "2024-06-01", oldWater: 80,  newWater: 84,  oldElectric: 300, newElectric: 390 },
    { landlordId: user1._id, tenantId: t3._id, roomId: r4._id, month: "2024-06", rent: 220, waterUsage: 6, waterCost: 24, electricUsage: 110, electricCost: 88, trash: 5, total: 337, status: "Overdue", createdAt: "2024-06-01", oldWater: 60,  newWater: 66,  oldElectric: 200, newElectric: 310 },
    { landlordId: user1._id, tenantId: t4._id, roomId: r7._id, month: "2024-06", rent: 300, waterUsage: 7, waterCost: 28, electricUsage: 150, electricCost: 120, trash: 5, total: 453, status: "Paid",   createdAt: "2024-06-01", oldWater: 50,  newWater: 57,  oldElectric: 150, newElectric: 300 },
    { landlordId: user1._id, tenantId: t1._id, roomId: r1._id, month: "2024-05", rent: 180, waterUsage: 5, waterCost: 20, electricUsage: 115, electricCost: 92, trash: 5, total: 297, status: "Paid",    createdAt: "2024-05-01", oldWater: 95,  newWater: 100, oldElectric: 285, newElectric: 400 },
    { landlordId: user1._id, tenantId: t2._id, roomId: r3._id, month: "2024-05", rent: 220, waterUsage: 4, waterCost: 16, electricUsage: 88,  electricCost: 70, trash: 5, total: 311, status: "Paid",    createdAt: "2024-05-01", oldWater: 76,  newWater: 80,  oldElectric: 212, newElectric: 300 },
  ]);
  console.log("🧾 Created 6 invoices");

  // ── Create expenses ───────────────────────────────────────────────────────
  await Expense.insertMany([
    { landlordId: user1._id, date: "2024-06-05", category: "Repair",   description: "ជួសជុលបន្ទប់ទឹក 301", amount: 45, roomId: r5._id },
    { landlordId: user1._id, date: "2024-06-10", category: "Cleaning", description: "សម្អាតអគារប្រចាំខែ",  amount: 30 },
    { landlordId: user1._id, date: "2024-05-20", category: "Tax",      description: "បង់ពន្ធអចលនទ្រព្យ",   amount: 120 },
    { landlordId: user1._id, date: "2024-05-15", category: "Repair",   description: "ជួសជុលទ្វារ 102",      amount: 20, roomId: r2._id },
  ]);
  console.log("💸 Created 4 expenses");

  // ── Create leases ─────────────────────────────────────────────────────────
  await Lease.insertMany([
    { landlordId: user1._id, tenantId: t1._id, roomId: r1._id, startDate: "2024-01-15", endDate: "2025-01-14", monthlyRent: 180, depositPaid: 360, terms: "កិច្ចសន្យាជួល ១ ឆ្នាំ។ ហាមបិទផ្ទះដោយគ្មានការព្រមព្រៀង", status: "Active" },
    { landlordId: user1._id, tenantId: t2._id, roomId: r3._id, startDate: "2024-03-01", endDate: "2024-08-31", monthlyRent: 220, depositPaid: 440, terms: "កិច្ចសន្យាជួល ៦ ខែ", status: "Expiring Soon" },
    { landlordId: user1._id, tenantId: t3._id, roomId: r4._id, startDate: "2023-11-20", endDate: "2024-05-19", monthlyRent: 220, depositPaid: 440, terms: "កិច្ចសន្យាជួល ៦ ខែ — បន្ត", status: "Expired" },
    { landlordId: user1._id, tenantId: t4._id, roomId: r7._id, startDate: "2024-02-10", endDate: "2025-02-09", monthlyRent: 300, depositPaid: 600, terms: "កិច្ចសន្យាជួល ១ ឆ្នាំ", status: "Active" },
  ]);
  console.log("📄 Created 4 leases");

  // ── Create Telegram messages ───────────────────────────────────────────────
  const [tm1, tm2] = await TelegramMessage.insertMany([
    { landlordId: user1._id, tenantId: t1._id, invoiceId: inv1._id, type: "invoice", sentAt: "2024-06-01 08:00", status: "sent", preview: "📋 វិក្កយបត្រខែ 2024-06 | ថ្លៃបន្ទប់: $180 | ទឹក: $20 | ភ្លើង: $96 | សរុប: $301" },
    { landlordId: user1._id, tenantId: t2._id, invoiceId: inv2._id, type: "invoice", sentAt: "2024-06-01 08:05", status: "sent", preview: "📋 វិក្កយបត្រខែ 2024-06 | ថ្លៃបន្ទប់: $220 | ទឹក: $16 | ភ្លើង: $72 | សរុប: $313" },
    { landlordId: user1._id, tenantId: t1._id, type: "welcome", sentAt: "2024-01-15 09:00", status: "sent", preview: "🏠 សូមស្វាគមន៍មកកាន់ RoomRentKH! លោក​ស្រី សុខ ស្រីនាថ ត្រូវបានភ្ជាប់ជាមួយ Bot ដោយជោគជ័យ។" },
  ]);
  console.log("📨 Created 3 Telegram messages");

  // ── Create payment proofs ─────────────────────────────────────────────────
  await PaymentProof.insertMany([
    { landlordId: user1._id, tenantId: t2._id, invoiceId: inv2._id, submittedAt: "2024-06-03 14:22", status: "pending_review", note: "Screenshot ABA transfer" },
  ]);
  console.log("🧾 Created 1 payment proof");

  console.log("\n✅ Seed completed successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo Account 1:");
  console.log("  Email:    demo@roomrent.kh");
  console.log("  Password: demo1234");
  console.log("\nDemo Account 2:");
  console.log("  Email:    sokha@test.com");
  console.log("  Password: test1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
