package com.wms.wms_lite.domain.transaction.inventory.entity;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryErrorCode;
import com.wms.wms_lite.domain.transaction.inventory.exception.InventoryException;
import com.wms.wms_lite.global.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "inventories", uniqueConstraints = {
                @UniqueConstraint(columnNames = { "location_id", "item_id" })
})
public class Inventory extends AuditableEntity {

        @Setter
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "item_id", nullable = false)
        private Item item;

        @Setter
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "location_id", nullable = false)
        private Location location;

        @Column(nullable = false)
        private Integer quantity = 0;

        @Column(nullable = false)
        private Integer reservedQuantity = 0;

        @Version
        private Long version;

        public static Inventory create(Item item, Location location, int initialQuantity) {
                if (initialQuantity < 0) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                Inventory inventory = new Inventory();
                inventory.item = item;
                inventory.location = location;
                inventory.quantity = initialQuantity;
                inventory.reservedQuantity = 0;
                return inventory;
        }

        public void increaseQuantity(int amount) {
                if (amount <= 0) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                this.quantity += amount;
        }

        public void decreaseQuantity(int amount) {
                if (amount <= 0) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                if (getAvailableQuantity() < amount) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INSUFFICIENT_QUANTITY);
                }
                this.quantity -= amount;
        }

        public void reserve(int amount) {
                if (amount <= 0) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                if (getAvailableQuantity() < amount) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_RESERVE_EXCEEDED);
                }
                this.reservedQuantity += amount;
        }

        public void release(int amount) {
                if (amount <= 0) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                if (this.reservedQuantity < amount) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                this.reservedQuantity -= amount;
        }

        public void decreaseReservedQuantity(int amount) {
                if (amount <= 0) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                if (this.reservedQuantity < amount || this.quantity < amount) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INSUFFICIENT_QUANTITY);
                }
                this.reservedQuantity -= amount;
                this.quantity -= amount;
        }

        public void adjustQuantity(int targetQuantity) {
                if (targetQuantity < 0) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                if (targetQuantity < this.reservedQuantity) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_RESERVE_EXCEEDED);
                }
                this.quantity = targetQuantity;
        }

        public void deductQuantityAndReserved(int amount) {
                if (amount <= 0) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INVALID_QUANTITY);
                }
                if (this.quantity < amount) {
                        throw new InventoryException(InventoryErrorCode.INVENTORY_INSUFFICIENT_QUANTITY);
                }
                this.quantity -= amount;
                this.reservedQuantity = Math.max(0, this.reservedQuantity - amount);
        }

        public int getAvailableQuantity() {
                return this.quantity - this.reservedQuantity;
        }
}
