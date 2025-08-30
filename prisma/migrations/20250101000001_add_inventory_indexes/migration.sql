-- Add composite indexes for Inventory queries (R8: composite indexes matching filters/sorts)
-- R2: left-most index starts with tenant_id

-- Item list query: tenantId + isActive + type + createdAt
CREATE INDEX idx_item_tenant_active_type_created ON "Item"("tenantId", "isActive", "type", "createdAt" DESC);

-- Item search query: tenantId + isActive + text search
CREATE INDEX idx_item_tenant_active_number ON "Item"("tenantId", "isActive", "number");
CREATE INDEX idx_item_tenant_active_description ON "Item"("tenantId", "isActive", "description");

-- Item branches: tenantId + itemId + siteId
CREATE INDEX idx_item_branch_tenant_item_site ON "ItemBranch"("itemId", "siteId");

-- Item locations: itemBranchId + bin
CREATE INDEX idx_item_location_branch_bin ON "ItemLocation"("itemBranchId", "bin");

-- Inventory transactions: tenantId + itemId + siteId + createdAt (time-series)
CREATE INDEX idx_inventory_tx_tenant_item_site_date ON "InventoryTx"("tenantId", "itemId", "siteId", "createdAt" DESC);

-- Inventory transactions by type: tenantId + txType + createdAt
CREATE INDEX idx_inventory_tx_tenant_type_date ON "InventoryTx"("tenantId", "txType", "createdAt" DESC);
