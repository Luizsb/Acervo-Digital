# Script para gerar Prisma Client ignorando problemas de certificado SSL
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npx prisma generate
$env:NODE_TLS_REJECT_UNAUTHORIZED = "1"

