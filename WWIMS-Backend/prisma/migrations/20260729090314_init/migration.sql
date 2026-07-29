-- CreateTable
CREATE TABLE "users" (
    "user_id" VARCHAR(20) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "pos_id" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "pos" (
    "pos_id" VARCHAR(20) NOT NULL,
    "pos_name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_pkey" PRIMARY KEY ("pos_id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "vendor_id" VARCHAR(20) NOT NULL,
    "vendor_name" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("vendor_id")
);

-- CreateTable
CREATE TABLE "pos_vendors" (
    "pos_id" VARCHAR(20) NOT NULL,
    "vendor_id" VARCHAR(20) NOT NULL,

    CONSTRAINT "pos_vendors_pkey" PRIMARY KEY ("pos_id","vendor_id")
);

-- CreateTable
CREATE TABLE "waste_categories" (
    "category_id" VARCHAR(10) NOT NULL,
    "category_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "waste_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "waste_types" (
    "waste_type_id" VARCHAR(20) NOT NULL,
    "category_id" VARCHAR(10) NOT NULL,
    "waste_name" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(10) NOT NULL DEFAULT 'kg',

    CONSTRAINT "waste_types_pkey" PRIMARY KEY ("waste_type_id")
);

-- CreateTable
CREATE TABLE "vendor_prices" (
    "price_id" SERIAL NOT NULL,
    "vendor_id" VARCHAR(20) NOT NULL,
    "waste_type_id" VARCHAR(20) NOT NULL,
    "buy_price" DECIMAL(12,2) NOT NULL,
    "sell_price" DECIMAL(12,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_prices_pkey" PRIMARY KEY ("price_id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "history_id" SERIAL NOT NULL,
    "price_id" INTEGER NOT NULL,
    "old_buy_price" DECIMAL(12,2) NOT NULL,
    "new_buy_price" DECIMAL(12,2) NOT NULL,
    "old_sell_price" DECIMAL(12,2) NOT NULL,
    "new_sell_price" DECIMAL(12,2) NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "nasabah" (
    "customer_id" VARCHAR(20) NOT NULL,
    "pos_id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nasabah_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "transaksi_penimbangan" (
    "transaction_id" SERIAL NOT NULL,
    "customer_id" VARCHAR(20) NOT NULL,
    "pos_id" VARCHAR(20) NOT NULL,
    "vendor_id" VARCHAR(20) NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_buy_value" DECIMAL(12,2) NOT NULL,
    "total_sell_value" DECIMAL(12,2) NOT NULL,
    "margin" DECIMAL(12,2) NOT NULL,
    "pos_profit" DECIMAL(12,2) NOT NULL,
    "pusat_profit" DECIMAL(12,2) NOT NULL,
    "nasabah_credit" DECIMAL(12,2) NOT NULL,
    "created_by" VARCHAR(20),

    CONSTRAINT "transaksi_penimbangan_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "detail_penimbangan" (
    "detail_id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "waste_type_id" VARCHAR(20) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(10) NOT NULL,
    "price_snapshot" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "detail_penimbangan_pkey" PRIMARY KEY ("detail_id")
);

-- CreateTable
CREATE TABLE "transaksi_penarikan" (
    "withdrawal_id" SERIAL NOT NULL,
    "customer_id" VARCHAR(20) NOT NULL,
    "pos_id" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "proof_image_url" TEXT,
    "withdrawal_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(20),

    CONSTRAINT "transaksi_penarikan_pkey" PRIMARY KEY ("withdrawal_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "log_id" SERIAL NOT NULL,
    "user_id" VARCHAR(20),
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(50),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "import_logs" (
    "import_id" SERIAL NOT NULL,
    "user_id" VARCHAR(20),
    "file_name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_logs_pkey" PRIMARY KEY ("import_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_prices_vendor_id_waste_type_id_key" ON "vendor_prices"("vendor_id", "waste_type_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pos_id_fkey" FOREIGN KEY ("pos_id") REFERENCES "pos"("pos_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_vendors" ADD CONSTRAINT "pos_vendors_pos_id_fkey" FOREIGN KEY ("pos_id") REFERENCES "pos"("pos_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_vendors" ADD CONSTRAINT "pos_vendors_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_types" ADD CONSTRAINT "waste_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "waste_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_prices" ADD CONSTRAINT "vendor_prices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_prices" ADD CONSTRAINT "vendor_prices_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "waste_types"("waste_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "vendor_prices"("price_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nasabah" ADD CONSTRAINT "nasabah_pos_id_fkey" FOREIGN KEY ("pos_id") REFERENCES "pos"("pos_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_penimbangan" ADD CONSTRAINT "transaksi_penimbangan_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "nasabah"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_penimbangan" ADD CONSTRAINT "transaksi_penimbangan_pos_id_fkey" FOREIGN KEY ("pos_id") REFERENCES "pos"("pos_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_penimbangan" ADD CONSTRAINT "transaksi_penimbangan_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_penimbangan" ADD CONSTRAINT "transaksi_penimbangan_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penimbangan" ADD CONSTRAINT "detail_penimbangan_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaksi_penimbangan"("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penimbangan" ADD CONSTRAINT "detail_penimbangan_waste_type_id_fkey" FOREIGN KEY ("waste_type_id") REFERENCES "waste_types"("waste_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_penarikan" ADD CONSTRAINT "transaksi_penarikan_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "nasabah"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_penarikan" ADD CONSTRAINT "transaksi_penarikan_pos_id_fkey" FOREIGN KEY ("pos_id") REFERENCES "pos"("pos_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_penarikan" ADD CONSTRAINT "transaksi_penarikan_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_logs" ADD CONSTRAINT "import_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
