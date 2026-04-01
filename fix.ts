import { db } from './src/lib/db'; async function fix() { await db.user.updateMany({ data: { canManagePartners: true } }); console.log('Fixed'); } fix();
