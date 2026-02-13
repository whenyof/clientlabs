# Repair Invoice Duplicates

Cuando la migración `20260211180000_billing_list_erp_invoice_type` falla por duplicados en `(userId, saleId)`:

1. **Marcar la migración como revertida** (si falló):
   ```bash
   npx prisma migrate resolve --rolled-back 20260211180000_billing_list_erp_invoice_type
   ```

2. **Ejecutar el script de limpieza**:
   ```bash
   npm run repair-invoice-duplicates
   ```
   Debe mostrar `duplicates found: 0 groups` en la segunda ejecución (o la primera si ya no hay duplicados).

3. **Aplicar migraciones**:
   ```bash
   npx prisma migrate deploy
   ```
   O en desarrollo:
   ```bash
   npx prisma migrate dev
   ```

## Verificación

- **Script**: segunda ejecución debe dar `🔎 duplicates found: 0 groups`, `🧹 invoices removed: 0`.
- **API**: `GET /api/debug/invoice-duplicates` debe devolver `totalDuplicateGroups: 0`, `totalDuplicateInvoices: 0`.
