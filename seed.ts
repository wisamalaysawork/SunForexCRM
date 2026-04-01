import { db } from './src/lib/db'

async function seed() {
  console.log('Seeding database...')

  // Create courses
  const course1 = await db.course.create({
    data: { name: 'دورة التداول الأساسية', description: 'تعلم أساسيات التداول في الأسواق المالية', price: 200, isActive: true },
  })
  const course2 = await db.course.create({
    data: { name: 'دورة التحليل الفني', description: 'تعلم التحليل الفني المتقدم للرسوم البيانية', price: 350, isActive: true },
  })
  const course3 = await db.course.create({
    data: { name: 'دورة إدارة المخاطر', description: 'تعلم إدارة رأس المال والمخاطر في التداول', price: 150, isActive: true },
  })

  // Create funded account types
  const acct5000 = await db.fundedAccountType.create({
    data: { name: 'حساب 5,000$', accountSize: 5000, sellingPrice: 100, costPrice: 40, isActive: true },
  })
  const acct10000 = await db.fundedAccountType.create({
    data: { name: 'حساب 10,000$', accountSize: 10000, sellingPrice: 180, costPrice: 70, isActive: true },
  })
  const acct25000 = await db.fundedAccountType.create({
    data: { name: 'حساب 25,000$', accountSize: 25000, sellingPrice: 400, costPrice: 150, isActive: true },
  })
  const acct50000 = await db.fundedAccountType.create({
    data: { name: 'حساب 50,000$', accountSize: 50000, sellingPrice: 750, costPrice: 280, isActive: true },
  })

  // Create students
  const students = await Promise.all([
    db.student.create({ data: { name: 'أحمد محمد', phone: '+962 77 123 4567', email: 'ahmed@email.com', status: 'active', totalPaid: 300, notes: 'طالب نشط ومتحمس' } }),
    db.student.create({ data: { name: 'سارة خالد', phone: '+962 79 987 6543', email: 'sara@email.com', status: 'active', totalPaid: 530, notes: 'مهتمة بالحسابات الممولة' } }),
    db.student.create({ data: { name: 'عمر يوسف', phone: '+962 78 555 1234', email: 'omar@email.com', status: 'active', totalPaid: 200 } }),
    db.student.create({ data: { name: 'ليلى حسن', phone: '+962 79 111 2233', email: 'layla@email.com', status: 'inactive', totalPaid: 100, notes: 'لم تتابع منذ شهرين' } }),
    db.student.create({ data: { name: 'محمد علي', phone: '+962 77 444 5566', email: 'mohammed@email.com', status: 'active', totalPaid: 930 } }),
    db.student.create({ data: { name: 'فاطمة أحمد', phone: '+962 78 333 4455', status: 'active', totalPaid: 350 } }),
    db.student.create({ data: { name: 'يوسف إبراهيم', phone: '+962 79 666 7788', email: 'yousef@email.com', status: 'active', totalPaid: 580 } }),
    db.student.create({ data: { name: 'نورة سعيد', phone: '+962 77 888 9900', email: 'noura@email.com', status: 'active', totalPaid: 150 } }),
  ])

  // Create enrollments
  await Promise.all([
    db.courseEnrollment.create({ data: { studentId: students[0].id, courseId: course1.id, paymentStatus: 'paid', amountPaid: 200 } }),
    db.courseEnrollment.create({ data: { studentId: students[0].id, courseId: course2.id, paymentStatus: 'paid', amountPaid: 350 } }),
    db.courseEnrollment.create({ data: { studentId: students[0].id, courseId: course3.id, paymentStatus: 'partial', amountPaid: 100 } }),
    db.courseEnrollment.create({ data: { studentId: students[1].id, courseId: course1.id, paymentStatus: 'paid', amountPaid: 200 } }),
    db.courseEnrollment.create({ data: { studentId: students[1].id, courseId: course2.id, paymentStatus: 'paid', amountPaid: 350 } }),
    db.courseEnrollment.create({ data: { studentId: students[2].id, courseId: course1.id, paymentStatus: 'paid', amountPaid: 200 } }),
    db.courseEnrollment.create({ data: { studentId: students[3].id, courseId: course1.id, paymentStatus: 'partial', amountPaid: 100 } }),
    db.courseEnrollment.create({ data: { studentId: students[4].id, courseId: course1.id, paymentStatus: 'paid', amountPaid: 200 } }),
    db.courseEnrollment.create({ data: { studentId: students[4].id, courseId: course2.id, paymentStatus: 'paid', amountPaid: 350 } }),
    db.courseEnrollment.create({ data: { studentId: students[4].id, courseId: course3.id, paymentStatus: 'paid', amountPaid: 150 } }),
    db.courseEnrollment.create({ data: { studentId: students[5].id, courseId: course2.id, paymentStatus: 'paid', amountPaid: 350 } }),
    db.courseEnrollment.create({ data: { studentId: students[6].id, courseId: course1.id, paymentStatus: 'paid', amountPaid: 200 } }),
    db.courseEnrollment.create({ data: { studentId: students[6].id, courseId: course3.id, paymentStatus: 'paid', amountPaid: 150 } }),
    db.courseEnrollment.create({ data: { studentId: students[7].id, courseId: course1.id, paymentStatus: 'partial', amountPaid: 150 } }),
  ])

  // Create funded account sales
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = `${now.getFullYear()}-${String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, '0')}`

  await Promise.all([
    db.fundedAccountSale.create({ data: { studentId: students[1].id, accountTypeId: acct5000.id, paymentStatus: 'paid', amountPaid: 100, profit: 60 } }),
    db.fundedAccountSale.create({ data: { studentId: students[1].id, accountTypeId: acct10000.id, paymentStatus: 'paid', amountPaid: 180, profit: 110 } }),
    db.fundedAccountSale.create({ data: { studentId: students[4].id, accountTypeId: acct25000.id, paymentStatus: 'paid', amountPaid: 400, profit: 250 } }),
    db.fundedAccountSale.create({ data: { studentId: students[4].id, accountTypeId: acct50000.id, paymentStatus: 'paid', amountPaid: 750, profit: 470 } }),
    db.fundedAccountSale.create({ data: { studentId: students[6].id, accountTypeId: acct10000.id, paymentStatus: 'paid', amountPaid: 180, profit: 110 } }),
    db.fundedAccountSale.create({ data: { studentId: students[6].id, accountTypeId: acct5000.id, paymentStatus: 'partial', amountPaid: 50, profit: 60 } }),
  ])

  // Create payments
  await Promise.all([
    db.payment.create({ data: { studentId: students[0].id, amount: 200, method: 'bank_transfer', description: 'دورة التداول الأساسية', date: new Date(now.getFullYear(), now.getMonth(), 5), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[0].id, amount: 350, method: 'bank_transfer', description: 'دورة التحليل الفني', date: new Date(now.getFullYear(), now.getMonth(), 10), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[1].id, amount: 100, method: 'cash', description: 'حساب 5000$', date: new Date(now.getFullYear(), now.getMonth(), 3), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[1].id, amount: 180, method: 'cash', description: 'حساب 10000$', date: new Date(now.getFullYear(), now.getMonth(), 8), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[2].id, amount: 200, method: 'crypto', description: 'دورة التداول الأساسية', date: new Date(now.getFullYear(), now.getMonth(), 12), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[4].id, amount: 400, method: 'bank_transfer', description: 'حساب 25000$', date: new Date(now.getFullYear(), now.getMonth(), 15), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[4].id, amount: 750, method: 'bank_transfer', description: 'حساب 50000$', date: new Date(now.getFullYear(), now.getMonth(), 18), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[5].id, amount: 350, method: 'cash', description: 'دورة التحليل الفني', date: new Date(now.getFullYear(), now.getMonth(), 7), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[6].id, amount: 180, method: 'crypto', description: 'حساب 10000$', date: new Date(now.getFullYear(), now.getMonth(), 20), month: thisMonth } }),
    db.payment.create({ data: { studentId: students[7].id, amount: 150, method: 'cash', description: 'دورة التداول الأساسية', date: new Date(now.getFullYear(), now.getMonth(), 22), month: thisMonth } }),
  ])

  // Create expenses for this month
  await Promise.all([
    db.expense.create({ data: { category: 'rent', amount: 500, description: 'إيجار المكتب', date: new Date(now.getFullYear(), now.getMonth(), 1), month: thisMonth } }),
    db.expense.create({ data: { category: 'salaries', amount: 800, description: 'رواتب الموظفين', date: new Date(now.getFullYear(), now.getMonth(), 1), month: thisMonth } }),
    db.expense.create({ data: { category: 'bills', amount: 120, description: 'فاتورة الكهرباء', date: new Date(now.getFullYear(), now.getMonth(), 5), month: thisMonth } }),
    db.expense.create({ data: { category: 'bills', amount: 80, description: 'فاتورة الإنترنت', date: new Date(now.getFullYear(), now.getMonth(), 5), month: thisMonth } }),
    db.expense.create({ data: { category: 'marketing', amount: 200, description: 'إعلانات وسائل التواصل', date: new Date(now.getFullYear(), now.getMonth(), 10), month: thisMonth } }),
    db.expense.create({ data: { category: 'software', amount: 50, description: 'اشتراكات برمجيات', date: new Date(now.getFullYear(), now.getMonth(), 15), month: thisMonth } }),
  ])

  // Create some last month expenses
  await Promise.all([
    db.expense.create({ data: { category: 'rent', amount: 500, description: 'إيجار المكتب', date: new Date(now.getFullYear(), now.getMonth() - 1, 1), month: lastMonth } }),
    db.expense.create({ data: { category: 'salaries', amount: 800, description: 'رواتب الموظفين', date: new Date(now.getFullYear(), now.getMonth() - 1, 1), month: lastMonth } }),
    db.expense.create({ data: { category: 'bills', amount: 150, description: 'فواتير متنوعة', date: new Date(now.getFullYear(), now.getMonth() - 1, 5), month: lastMonth } }),
    db.expense.create({ data: { category: 'marketing', amount: 300, description: 'حملة إعلانية', date: new Date(now.getFullYear(), now.getMonth() - 1, 15), month: lastMonth } }),
  ])

  console.log('Database seeded successfully!')
  console.log(`- ${3} courses`)
  console.log(`- ${4} funded account types`)
  console.log(`- ${8} students`)
  console.log(`- 14 enrollments`)
  console.log(`- 6 funded sales`)
  console.log(`- 10 payments`)
  console.log(`- 10 expenses`)
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0))
