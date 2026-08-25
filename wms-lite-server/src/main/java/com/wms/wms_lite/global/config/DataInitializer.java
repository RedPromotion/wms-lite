package com.wms.wms_lite.global.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wms.wms_lite.domain.master.customer.entity.Customer;
import com.wms.wms_lite.domain.master.customer.entity.DeliveryAddress;
import com.wms.wms_lite.domain.master.customer.enums.CustomerStatus;
import com.wms.wms_lite.domain.master.customer.enums.DeliveryAddressStatus;
import com.wms.wms_lite.domain.master.customer.repository.CustomerRepository;
import com.wms.wms_lite.domain.master.customer.repository.DeliveryAddressRepository;
import com.wms.wms_lite.domain.master.item.entity.Item;
import com.wms.wms_lite.domain.master.item.entity.ItemCategory;
import com.wms.wms_lite.domain.master.item.enums.UnitType;
import com.wms.wms_lite.domain.master.item.repository.ItemCategoryRepository;
import com.wms.wms_lite.domain.master.item.repository.ItemRepository;
import com.wms.wms_lite.domain.master.supplier.entity.Supplier;
import com.wms.wms_lite.domain.master.supplier.enums.SupplierStatus;
import com.wms.wms_lite.domain.master.supplier.repository.SupplierRepository;
import com.wms.wms_lite.domain.master.warehouse.entity.Location;
import com.wms.wms_lite.domain.master.warehouse.entity.Warehouse;
import com.wms.wms_lite.domain.master.warehouse.enums.LocationStatus;
import com.wms.wms_lite.domain.master.warehouse.enums.WarehouseStatus;
import com.wms.wms_lite.domain.master.warehouse.repository.LocationRepository;
import com.wms.wms_lite.domain.master.warehouse.repository.WarehouseRepository;
import com.wms.wms_lite.domain.user.admin.entity.Admin;
import com.wms.wms_lite.domain.user.admin.enums.AdminRole;
import com.wms.wms_lite.domain.user.admin.repository.AdminRepository;
import com.wms.wms_lite.domain.user.enums.AccountStatus;
import com.wms.wms_lite.domain.transaction.stockhistory.entity.StockHistory;
import com.wms.wms_lite.domain.transaction.stockhistory.enums.HistoryType;
import com.wms.wms_lite.domain.transaction.stockhistory.repository.StockHistoryRepository;
import com.wms.wms_lite.domain.user.member.entity.Member;
import com.wms.wms_lite.domain.user.member.enums.Department;
import com.wms.wms_lite.domain.user.member.enums.MemberRole;
import com.wms.wms_lite.domain.user.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * WMS 마스터 기준정보 및 초기 계정 시드 데이터 로더.
 * - JSON 기반 시드 데이터 로딩 (secrets 우선, open-template fallback)
 * - 운영(prod) 프로파일에서는 동작하지 않음 (@Profile("!prod"))
 */
@Slf4j
@Component
@Transactional
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final MemberRepository memberRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryAddressRepository deliveryAddressRepository;
    private final ItemCategoryRepository itemCategoryRepository;
    private final ItemRepository itemRepository;
    private final StockHistoryRepository stockHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Value("${app.seed-data.enabled:true}")
    private boolean seedDataEnabled;

    @Value("${app.seed-data.mode:auto}")
    private String seedDataMode; // auto / secrets / open

    @Override
    public void run(String... args) {
        if (!seedDataEnabled) {
            log.info("▶ [DataInitializer] seed-data 생성이 비활성화되어 초기화를 건너뜁니다. (app.seed-data.enabled=false)");
            return;
        }

        File seedDir = resolveSeedDirectory();
        if (seedDir == null || !seedDir.exists() || !seedDir.isDirectory()) {
            log.warn("▶ [DataInitializer] 시드 데이터 디렉토리를 찾을 수 없어 초기화를 건너뜁니다.");
            return;
        }

        log.info("▶ [DataInitializer] WMS 시드 데이터 초기화 시작... (로드 경로: {})", seedDir.getAbsolutePath());

        try {
            initAdmins(seedDir);
        } catch (Exception e) {
            log.warn("▶ [DataInitializer] 관리자(Admin) 초기화 중 예외: {}", e.getMessage(), e);
        }

        try {
            initMembers(seedDir);
        } catch (Exception e) {
            log.warn("▶ [DataInitializer] 회원(Member) 초기화 중 예외: {}", e.getMessage(), e);
        }

        try {
            initWarehouses(seedDir);
        } catch (Exception e) {
            log.warn("▶ [DataInitializer] 창고/로케이션 초기화 중 예외: {}", e.getMessage(), e);
        }

        try {
            initSuppliers(seedDir);
        } catch (Exception e) {
            log.warn("▶ [DataInitializer] 공급업체 초기화 중 예외: {}", e.getMessage(), e);
        }

        try {
            initCustomers(seedDir);
        } catch (Exception e) {
            log.warn("▶ [DataInitializer] 고객사/배송지 초기화 중 예외: {}", e.getMessage(), e);
        }

        try {
            initCategories(seedDir);
        } catch (Exception e) {
            log.warn("▶ [DataInitializer] 품목 카테고리 초기화 중 예외: {}", e.getMessage(), e);
        }

        try {
            initItems(seedDir);
        } catch (Exception e) {
            log.warn("▶ [DataInitializer] 품목(Item) 초기화 중 예외: {}", e.getMessage(), e);
        }

        try {
            initStockHistories();
        } catch (Exception e) {
            log.warn("▶ [DataInitializer] 수불 이력 초기화 중 예외: {}", e.getMessage(), e);
        }

        log.info("▶ [DataInitializer] WMS 마스터 기준정보 및 계정 시드 데이터 초기화 완료!");
    }

    /**
     * 실행 모드 및 상대 경로를 기반으로 유효한 시드 데이터 디렉토리를 탐색합니다.
     */
    private File resolveSeedDirectory() {
        String mode = seedDataMode != null ? seedDataMode.trim().toLowerCase() : "auto";

        if ("secrets".equals(mode)) {
            File dir = findDirectory("seed-data/secrets");
            if (dir != null) {
                log.info("▶ [DataInitializer] 명시적 'secrets' 모드로 시드 데이터를 로드합니다.");
                return dir;
            }
            log.warn("▶ [DataInitializer] 'secrets' 모드가 설정되었으나 secrets 디렉토리를 찾을 수 없습니다.");
            return null;
        }

        if ("open".equals(mode)) {
            File dir = findDirectory("seed-data/open-template");
            if (dir != null) {
                log.info("▶ [DataInitializer] 명시적 'open' 모드로 공개 템플릿 시드 데이터를 로드합니다.");
                return dir;
            }
            log.warn("▶ [DataInitializer] 'open' 모드가 설정되었으나 open-template 디렉토리를 찾을 수 없습니다.");
            return null;
        }

        // auto 모드: secrets가 있으면 secrets 우선, 없으면 open-template으로 자동 Fallback
        File secretsDir = findDirectory("seed-data/secrets");
        if (secretsDir != null && containsJsonFiles(secretsDir)) {
            log.info("▶ [DataInitializer] 로컬 'secrets' 디렉토리 감지 완료 → 비공개 테스트 시드 데이터를 로드합니다.");
            return secretsDir;
        }

        File openDir = findDirectory("seed-data/open-template");
        if (openDir != null) {
            log.info("▶ [DataInitializer] 'open-template' 디렉토리 감지 완료 → 공개 예시 시드 데이터를 로드합니다.");
            return openDir;
        }

        return null;
    }

    private File findDirectory(String relativePath) {
        // 실행 위치(CWD)에 따른 다중 후보 경로 탐색
        List<String> basePaths = List.of(
                "",
                ".",
                "..",
                "../..",
                "../../.."
        );

        for (String base : basePaths) {
            Path path = base.isEmpty() ? Paths.get(relativePath) : Paths.get(base, relativePath);
            File f = path.toFile();
            if (f.exists() && f.isDirectory()) {
                return f;
            }
        }
        return null;
    }

    private boolean containsJsonFiles(File dir) {
        File[] files = dir.listFiles((d, name) -> name.endsWith(".json"));
        return files != null && files.length > 0;
    }

    // ─────────────────────────────────────────────────────────────────
    // 1. 관리자 계정 초기화 (Admins)
    // ─────────────────────────────────────────────────────────────────
    private void initAdmins(File seedDir) throws IOException {
        File file = new File(seedDir, "admins.json");
        if (!file.exists()) return;

        List<AdminSeedDto> list = objectMapper.readValue(file, new TypeReference<>() {});
        for (AdminSeedDto dto : list) {
            if (adminRepository.findByLoginId(dto.loginId()).isEmpty()) {
                Admin admin = new Admin();
                admin.setLoginId(dto.loginId());
                admin.setPassword(passwordEncoder.encode(dto.password()));
                admin.setName(dto.name());
                admin.setEmail(dto.email());
                admin.setPhone(dto.phone());
                admin.setRole(dto.role() != null ? dto.role() : AdminRole.ROLE_ADMIN_OPS);
                admin.setStatus(AccountStatus.ACTIVE);
                adminRepository.save(admin);
                log.info("  ▷ 관리자 생성: {} ({})", dto.loginId(), admin.getRole());
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. 회원 계정 초기화 (Members)
    // ─────────────────────────────────────────────────────────────────
    private void initMembers(File seedDir) throws IOException {
        File file = new File(seedDir, "members.json");
        if (!file.exists()) return;

        List<MemberSeedDto> list = objectMapper.readValue(file, new TypeReference<>() {});
        for (MemberSeedDto dto : list) {
            if (memberRepository.findByLoginId(dto.loginId()).isEmpty()) {
                Member m = new Member();
                m.setLoginId(dto.loginId());
                m.setPassword(passwordEncoder.encode(dto.password()));
                m.setName(dto.name());
                m.setEmail(dto.email());
                m.setPhone(dto.phone());
                m.setDepartment(dto.department() != null ? dto.department() : Department.WAREHOUSE_OPERATOR);
                m.setRole(dto.role() != null ? dto.role() : MemberRole.ROLE_OPERATOR);
                m.setStatus(AccountStatus.ACTIVE);
                memberRepository.save(m);
                log.info("  ▷ 회원 생성: {} ({})", dto.loginId(), dto.role());
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. 창고 & 로케이션 초기화 (Warehouses & Locations)
    // ─────────────────────────────────────────────────────────────────
    private void initWarehouses(File seedDir) throws IOException {
        File file = new File(seedDir, "warehouses.json");
        if (!file.exists()) return;

        List<WarehouseSeedDto> list = objectMapper.readValue(file, new TypeReference<>() {});
        for (WarehouseSeedDto dto : list) {
            Warehouse wh = warehouseRepository.findByCode(dto.code()).orElseGet(() -> {
                Warehouse w = new Warehouse();
                w.setCode(dto.code());
                w.setName(dto.name());
                w.setAddress(dto.address());
                w.setManager(dto.manager());
                w.setPhone(dto.phone());
                w.setDescription(dto.description());
                w.setStatus(WarehouseStatus.ACTIVE);
                log.info("  ▷ 창고 생성: {} ({})", dto.code(), dto.name());
                return warehouseRepository.save(w);
            });

            if (dto.locations() != null) {
                for (LocationSeedDto locDto : dto.locations()) {
                    if (!locationRepository.existsByCode(locDto.code())) {
                        Location loc = new Location();
                        loc.setWarehouse(wh);
                        loc.setCode(locDto.code());
                        loc.setName(locDto.name());
                        loc.setStatus(LocationStatus.ACTIVE);
                        locationRepository.save(loc);
                        log.info("    ↳ 로케이션 생성: {} ({})", locDto.code(), wh.getName());
                    }
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. 공급업체 초기화 (Suppliers)
    // ─────────────────────────────────────────────────────────────────
    private void initSuppliers(File seedDir) throws IOException {
        File file = new File(seedDir, "suppliers.json");
        if (!file.exists()) return;

        List<SupplierSeedDto> list = objectMapper.readValue(file, new TypeReference<>() {});
        for (SupplierSeedDto dto : list) {
            supplierRepository.findByCode(dto.code()).orElseGet(() -> {
                Supplier s = new Supplier();
                s.setCode(dto.code());
                s.setName(dto.name());
                s.setBusinessNo(dto.businessNo());
                s.setCeoName(dto.ceoName());
                s.setPhone(dto.phone());
                s.setEmail(dto.email());
                s.setAddress(dto.address());
                s.setStatus(SupplierStatus.ACTIVE);
                log.info("  ▷ 공급업체 생성: {} ({})", dto.code(), dto.name());
                return supplierRepository.save(s);
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. 고객사 & 배송지 초기화 (Customers & DeliveryAddresses)
    // ─────────────────────────────────────────────────────────────────
    private void initCustomers(File seedDir) throws IOException {
        File file = new File(seedDir, "customers.json");
        if (!file.exists()) return;

        List<CustomerSeedDto> list = objectMapper.readValue(file, new TypeReference<>() {});
        for (CustomerSeedDto dto : list) {
            Customer customer = customerRepository.findByCode(dto.code()).orElseGet(() -> {
                Customer c = new Customer();
                c.setCode(dto.code());
                c.setName(dto.name());
                c.setBusinessNo(dto.businessNo());
                c.setCeoName(dto.ceoName());
                c.setPhone(dto.phone());
                c.setEmail(dto.email());
                c.setStatus(CustomerStatus.ACTIVE);
                log.info("  ▷ 고객사 생성: {} ({})", dto.code(), dto.name());
                return customerRepository.save(c);
            });

            if (dto.deliveryAddresses() != null) {
                for (DeliveryAddressSeedDto daDto : dto.deliveryAddresses()) {
                    boolean exists = deliveryAddressRepository.findByCustomerId(customer.getId()).stream()
                            .anyMatch(a -> a.getName().equals(daDto.name()));
                    if (!exists) {
                        DeliveryAddress da = new DeliveryAddress();
                        da.setCustomer(customer);
                        da.setName(daDto.name());
                        da.setReceiverName(daDto.receiverName());
                        da.setReceiverPhone(daDto.receiverPhone());
                        da.setZipCode(daDto.zipCode());
                        da.setAddress(daDto.address());
                        da.setDefaultAddress(daDto.defaultAddress() != null ? daDto.defaultAddress() : true);
                        da.setStatus(DeliveryAddressStatus.ACTIVE);
                        deliveryAddressRepository.save(da);
                        log.info("    ↳ 배송지 생성: {} → {}", customer.getCode(), daDto.name());
                    }
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. 품목 카테고리 초기화 (Categories)
    // ─────────────────────────────────────────────────────────────────
    private void initCategories(File seedDir) throws IOException {
        File file = new File(seedDir, "categories.json");
        if (!file.exists()) return;

        List<CategorySeedDto> list = objectMapper.readValue(file, new TypeReference<>() {});
        for (CategorySeedDto dto : list) {
            itemCategoryRepository.findByCode(dto.code()).orElseGet(() -> {
                ItemCategory cat = new ItemCategory();
                cat.setCode(dto.code());
                cat.setName(dto.name());
                cat.setDescription(dto.description());
                log.info("  ▷ 카테고리 생성: {} ({})", dto.code(), dto.name());
                return itemCategoryRepository.save(cat);
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 7. 품목 초기화 (Items)
    // ─────────────────────────────────────────────────────────────────
    private void initItems(File seedDir) throws IOException {
        File file = new File(seedDir, "items.json");
        if (!file.exists()) return;

        List<ItemSeedDto> list = objectMapper.readValue(file, new TypeReference<>() {});
        for (ItemSeedDto dto : list) {
            itemRepository.findByCode(dto.code()).orElseGet(() -> {
                ItemCategory cat = dto.categoryCode() != null
                        ? itemCategoryRepository.findByCode(dto.categoryCode()).orElse(null)
                        : null;
                Supplier sup = dto.supplierCode() != null
                        ? supplierRepository.findByCode(dto.supplierCode()).orElse(null)
                        : null;

                Item item = new Item();
                item.setCode(dto.code());
                item.setName(dto.name());
                item.setBarcode(dto.barcode());
                item.setSpecification(dto.specification());
                item.setUnit(dto.unit() != null ? dto.unit() : UnitType.EA);
                item.setCategory(cat);
                item.setSupplier(sup);
                log.info("  ▷ 품목 생성: {} ({})", dto.code(), dto.name());
                return itemRepository.save(item);
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 8. 수불 이력 마이그레이션 및 샘플 생성 (StockHistories)
    // ─────────────────────────────────────────────────────────────────
    private void initStockHistories() {
        List<StockHistory> histories = stockHistoryRepository.findAll();

        for (StockHistory h : histories) {
            if (h.getSourceLocation() == null || h.getTargetLocation() == null || h.getPartnerName() == null) {
                if (h.getHistoryType() == HistoryType.INBOUND) {
                    if (h.getSourceLocation() == null) h.setSourceLocation("공급업체 메인 공급처");
                    if (h.getTargetLocation() == null) h.setTargetLocation("메인 중앙 물류창고 [" + (h.getLocation() != null ? h.getLocation().getCode() : "LOC-A-101") + "]");
                    if (h.getPartnerName() == null) h.setPartnerName("메인 공급업체");
                } else if (h.getHistoryType() == HistoryType.OUTBOUND) {
                    if (h.getSourceLocation() == null) h.setSourceLocation("메인 중앙 물류창고 [" + (h.getLocation() != null ? h.getLocation().getCode() : "LOC-A-102") + "]");
                    if (h.getTargetLocation() == null) h.setTargetLocation("고객사 메인 풀필먼트센터");
                    if (h.getPartnerName() == null) h.setPartnerName("메인 고객사");
                } else if (h.getHistoryType() == HistoryType.MOVEMENT_IN || h.getHistoryType() == HistoryType.MOVEMENT_OUT) {
                    if (h.getSourceLocation() == null) h.setSourceLocation("메인 중앙 물류창고 [" + (h.getLocation() != null ? h.getLocation().getCode() : "LOC-A-101") + "]");
                    if (h.getTargetLocation() == null) h.setTargetLocation("메인 중앙 물류창고 [LOC-B-201]");
                } else {
                    if (h.getSourceLocation() == null) h.setSourceLocation("메인 중앙 물류창고 [" + (h.getLocation() != null ? h.getLocation().getCode() : "LOC-A-101") + "]");
                    if (h.getTargetLocation() == null) h.setTargetLocation("전산 실재고 반영");
                }
                stockHistoryRepository.save(h);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // DTO Definitions for Seed Data
    // ─────────────────────────────────────────────────────────────────
    private record AdminSeedDto(String loginId, String password, String name, String email, String phone, AdminRole role) {}
    private record MemberSeedDto(String loginId, String password, String name, String email, String phone, Department department, MemberRole role) {}
    private record LocationSeedDto(String code, String name) {}
    private record WarehouseSeedDto(String code, String name, String address, String manager, String phone, String description, List<LocationSeedDto> locations) {}
    private record SupplierSeedDto(String code, String name, String businessNo, String ceoName, String phone, String email, String address) {}
    private record DeliveryAddressSeedDto(String name, String receiverName, String receiverPhone, String zipCode, String address, Boolean defaultAddress) {}
    private record CustomerSeedDto(String code, String name, String businessNo, String ceoName, String phone, String email, List<DeliveryAddressSeedDto> deliveryAddresses) {}
    private record CategorySeedDto(String code, String name, String description) {}
    private record ItemSeedDto(String code, String name, String barcode, String specification, UnitType unit, String categoryCode, String supplierCode) {}
}
