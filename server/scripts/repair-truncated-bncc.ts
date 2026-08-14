import prisma from '../lib/prisma';
import { repairTruncatedBncc } from '../lib/completeBnccText';

async function main() {
  const updated = await repairTruncatedBncc(prisma);
  console.log(`BNCC truncada completada em ${updated} recursos.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
