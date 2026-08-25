package com.wms.wms_lite.domain.transaction.stockhistory.entity;

import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import com.wms.wms_lite.global.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "stock_histories")
public class StockHistory extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HistoryType historyType;

    @Column(nullable = false)
    private java.lang.Integer beforeQuantity;

    @Column(nullable = false)
    private java.lang.Integer changeQuantity;

    @Column(nullable = false)
    private java.lang.Integer afterQuantity;

    @Column(length = 50)
    private String referenceNo;

    @Column(length = 255)
    private String description;

    @Column(length = 100)
    private String sourceLocation;

    @Column(length = 200)
    private String targetLocation;

    @Column(length = 100)
    private String partnerName;
}
