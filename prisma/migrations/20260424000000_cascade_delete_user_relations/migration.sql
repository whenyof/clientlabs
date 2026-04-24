-- Add ON DELETE CASCADE to all User foreign keys that were missing it

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_userId_fkey";
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quotes" DROP CONSTRAINT IF EXISTS "quotes_userId_fkey";
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "delivery_notes" DROP CONSTRAINT IF EXISTS "delivery_notes_userId_fkey";
ALTER TABLE "delivery_notes" ADD CONSTRAINT "delivery_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchase_orders" DROP CONSTRAINT IF EXISTS "purchase_orders_userId_fkey";
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
