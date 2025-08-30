# JDE Equipment Maintenance Data Architecture Knowledge Base

## Overview
Dokumen ini berisi ringkasan komprehensif dari arsitektur data JDE untuk sistem pemeliharaan peralatan (Equipment Maintenance) berdasarkan analisis diagram Entity-Relationship (ERD) yang disediakan.

## Arsitektur Data Utama

### 1. Core Equipment Management (Page 1 of 2)

#### Entitas Utama:

**Work Order (F4801)** - Entitas pusat untuk operasi pemeliharaan
- **Atribut Utama:**
  - Work Order Number
  - Parent WO Number
  - Description
  - Equipment Number
  - Branch
  - Work Order Type
  - Priority
  - Status
  - Inventory BOM
  - Repair Code
  - Job Type
  - Problem Class
  - Repair Type
  - Trades Required
  - Maint Supervisor
  - Maint Planner

**Item Master (Equipment/FA) (F1201)** - Entitas pusat untuk data peralatan
- **Atribut Utama:**
  - Asset Number
  - Equipment/FA Number
  - Serial Number
  - Parent Number
  - Company
  - Description
  - Equipment Status
  - Accounts
  - Location
  - Accounting Class
  - Equipment Type
  - Department
  - Manufacturer
  - Equipment Criticality
  - Responsible Charge
  - Inventory BOM

#### Entitas Pendukung:

**Payroll Time Entry/History (F06116/F0618)**
- Work Order Number
- Employee Number
- Equipment Number
- Hours
- Quantity

**Parts List (F3111)**
- Work Order Number
- Component Number
- Component Branch ID
- Description
- Quantity

**Labour Instructions (F3112)**
- Work Order Number
- Craft Type
- Operation Sequence
- Work Centre
- Estimated Labour Rate
- Hours

**Quality Management (F3701/F3702/F3703/F3711)**
- Specification Data
- Test Data
- Test Results
- Work Order Number

**Inventory Item Number (F4101)**
- BOM
- Standard Rebuild
- Parts for a Work Order

### 2. Financial & Accounting Integration (Page 2 of 2)

#### Entitas Konfigurasi:

**Company Constants (F0010)**
- Asset Number Prefix
- Item
- Unit or Tag
- Serial
- Account Setup Defaults:
  - Cost
  - Accumulated Depreciation (AD)
  - Expense
  - Revenue

**Default Accounting Constants (F12002)**
- Company Number
- Cost Object
- Cost Subsidiary
- Accumulated Depr. Account
- Expense Account
- Revenue Account
- Major Class
- Sub Class

**Default Depreciation Constants (F12003)**
- Company
- Cost Object
- Cost Subsidiary
- Ledger Type
- Depreciation Method
- Method of Computation
- Life Periods

#### Entitas Keuangan:

**Item Balances (F1202)**
- Equipment FA Number
- Account Number
- Ledger Type
- Fiscal Year
- Account Balances
- Depreciation Method
- Method of Computation
- Life Periods
- Depreciation Start Date

**Account Ledger (F0911)**
- Equipment FA Number
- Work Order Number
- Phase Code
- Account
- Amount
- G/L Date

**Equipment Ledger (F1202)**
- Equipment/FA Number
- Work Order Number
- Account
- Amount
- G/L Date

### 3. Supporting Entities

**Status History (F1307)**
- Equipment Number
- Data Item
- Historical Value
- Effective Date
- Change Reason

**License Master (F1206)**
- Equipment FA Number
- License Number
- Province
- License Agency
- Renewal Date

**Maintenance Schedule (F1207)**
- Equipment FA Number
- Service Type
- Maintenance Status
- Service Intervals
- Model WO Number
- Maintenance Percent
- Complete

**Parent History (F1212)**
- Equipment FA Number
- Parent Number
- Start Date
- Ending Date

**Account Balances (F0902)**
- Equipment FA Number
- Location
- Start Date
- Ending Date

**Additional Book (F0101)**
- Employee
- Manufacturer
- Vendor
- Supervisor
- Assign to

**UDC (F0005)**
- System Code
- Various category codes (12, 13, 31, 32, 33, 37, 41, 48)

**Supplemental Database (F12090, 92, 93)**
- User Defined Data

## Relasi Antar Entitas

### Relasi Utama:
1. **Work Order (F4801)** ↔ **Item Master (F1201)**: One-to-many (optional)
2. **Item Master (F1201)** ↔ **Item Balances (F1202)**: One-to-many (optional)
3. **Item Master (F1201)** ↔ **Account Ledger (F0911)**: One-to-many (optional)
4. **Item Master (F1201)** ↔ **Equipment Ledger (F1202)**: One-to-many (optional)

### Relasi Konfigurasi:
1. **Company Constants (F0010)** ↔ **Item Master (F1201)**: One-to-many (optional)
2. **Default Accounting Constants (F12002)** ↔ **Item Master (F1201)**: One-to-many (optional)
3. **Default Accounting Constants (F12002)** ↔ **Default Depreciation Constants (F12003)**: One-to-one (optional)

### Relasi Pendukung:
1. **Work Order (F4801)** ↔ **Payroll Time Entry (F06116/F0618)**: One-to-many (optional)
2. **Work Order (F4801)** ↔ **Parts List (F3111)**: One-to-many (optional)
3. **Work Order (F4801)** ↔ **Labour Instructions (F3112)**: One-to-many (optional)
4. **Work Order (F4801)** ↔ **Quality Management (F3701/F3702/F3703/F3711)**: One-to-many (optional)
5. **Work Order (F4801)** ↔ **Inventory Item Number (F4101)**: One-to-many (optional)

## Integrasi Sistem

### GL Posting Integration:
- **Payroll System** → General Ledger posting
- **Inventory System** → General Ledger posting
- **Equipment Maintenance** → General Ledger posting

### Workflow Integration:
- **Parts List** → Generate inventory issue or Purchase Order
- **Work Orders** → Time tracking via Payroll system
- **Quality Management** → Work order validation and testing

## Kunci Implementasi

### 1. Data Consistency
- Semua entitas terhubung melalui Equipment FA Number
- Work Order Number sebagai referensi untuk aktivitas pemeliharaan
- Company Number untuk segregasi data multi-company

### 2. Financial Tracking
- Depreciation tracking melalui Item Balances
- Cost allocation melalui Account Ledger
- Revenue tracking untuk equipment rental

### 3. Maintenance Lifecycle
- Status tracking melalui Status History
- Schedule management melalui Maintenance Schedule
- Parent-child relationships untuk equipment hierarchy

### 4. Compliance & Documentation
- License management untuk regulatory compliance
- Quality management untuk standards compliance
- Audit trail melalui various history tables

## Best Practices

1. **Data Integrity**: Gunakan foreign key constraints untuk memastikan referential integrity
2. **Performance**: Index pada Equipment FA Number dan Work Order Number
3. **Audit Trail**: Maintain history tables untuk tracking changes
4. **Configuration**: Gunakan UDC tables untuk flexible configuration
5. **Integration**: Implement proper GL posting rules untuk financial accuracy

## Catatan Implementasi

- Sistem mendukung multi-company environment
- Flexible depreciation methods dan accounting rules
- Comprehensive maintenance scheduling capabilities
- Integration dengan payroll dan inventory systems
- Quality management integration untuk compliance
- User-defined data fields untuk customization

---

# JDE Financial Modules Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul keuangan utama: Accounts Receivable (A/R) dan Accounts Payable (A/P).

## Accounts Receivable (A/R) Data Architecture

### Entitas Utama:

**CustomerLedgerFile** - Entitas pusat untuk transaksi customer
- **Primary Keys:**
  - DocVoucherInvoiceE [PK1]
  - DocumentType [PK2]
  - CompanyKey [PK3]
  - DocumentPayItem [PK4]
- **Atribut Utama:**
  - AddressNumber [FK]
  - DateForGLandVoucherJULIA
  - DateInvoiceJ
  - BatchType, BatchNumber
  - FiscalYear1, Century, PeriodNoGeneralLedge
  - Company [FK]
  - GIClass, AccountId
  - PayorAddressNumber
  - GLPostedCode, PostStatusReceivables
  - AmountGross, AmountOpen
  - AmtDiscountAvailable, AmountDiscountTaken
  - AmountTaxable
  - CurrencyCodeBase, CurrencyMode, CurrencyCodeFrom
  - CurrencyConverRateOv, AmountCurrency
  - AmountForeignOpen, ForeignDiscountAvail
  - ForeignDiscountTaken, ForeignTaxableAmount
  - ForeignTaxExempt, ForeignTaxAmount
  - TaxArea1, TaxExplanationCode1
  - DateServiceCurrency
  - GIBankAccount
  - AccountModeGL, AccountId2

**A/RCheckDetailFile** - Detail pembayaran customer
- **Primary Keys:**
  - PaymentID [PK1] [FK]
  - FileLineIdentifier50 [PK2]
- **Foreign Keys:**
  - DocVoucherInvoiceE [FK]
  - DocumentType [FK]
  - CompanyKey [FK]
  - DocumentPayItem [FK]
  - AddressNumber [FK]
- **Atribut Utama:**
  - CkNumber
  - DocTypeMatching
  - DateMatchingCheckOr
  - DateForGLandVoucherJULIA
  - GLPostedCode, GiClass, AccountId
  - Century, FiscalYear1, PeriodNoGeneralLedge
  - Company [FK]
  - BatchType, BatchNumber
  - DateBatchJulian
  - AddressNumberParent
  - RelatedPaymentID, RelatedPaymentLineID
  - PaymntAmount
  - AmtDiscountAvailable, AmountDiscountTaken
  - AMOUNT_ADJUSTMENTS
  - ChargebackAmounts, ClaimAmount
  - CurrencyCodeBase, CurrencyMode, CurrencyCodeFrom
  - CurrencyConverRateOv
  - PaymentAmountForeign
  - ForeignDiscountAvail, ForeignDiscountTaken
  - ForeignChangedAmount
  - ForeignChargebackAmounts, ForeignClaimAmount
  - AmountGainLoss
  - DiscountAccountID, ReasnCode
  - WriteOffAccountID, ChargebackReasonCode
  - GLOffsetChargebacks

**ReceiptsHeaderFile** - Header penerimaan pembayaran
- **Primary Keys:**
  - PaymentID [PK1]
- **Atribut Utama:**
  - CkNumber
  - AddressNumber [FK], PayorAddressNumber
  - DateMatchingCheckOr
  - DateForGLandVoucherJULIA, DateValue
  - GLPostedCode, PostStatusReceivables
  - ARPostToCashManagement
  - CashReceiptLoggedCash
  - GIClass, AccountId
  - Century [FK], FiscalYear1 [FK], PeriodNoGeneralLedge [FK]
  - Company [FK]
  - BatchType, BatchNumber
  - DateBatchJulian
  - AddressNumberParent
  - AmountCheckAmount, AmountOpen
  - CurrencyCodeBase, CurrencyMode, CurrencyCodeFrom
  - CurrencyConverRateOv
  - CheckAmountForeignOpen, AmountForeignOpen
  - GIBankAccount
  - AccountModeGL
  - CashReceiptTranCode
  - NameRemarkExplanation
  - GLPostCodeAlt006
  - PaymentInstrumentA
  - BankTapeReconcilliationR
  - NameAlpha
  - DocumentNumberJE, DocumentTypeJE, DocumentCompanyJE
  - VoidDateForGLJulian, VoidReasonCode
  - ReceiptNSFVoidCode
  - DocumentNumberVoidNSFJE, DocumentTypeVoidNSFJE, DocumentCompanyVoidNSFJE
  - VoidNSFBatchType, BatchNumberVoidNSFReceipt

### Entitas Pendukung:

**CreditandCashManagement** - Manajemen kredit dan kas
- **Primary Keys:**
  - AddressNumber [PK1]
  - ParentChildRelationshi [PK2]
  - Company [PK3]
- **Atribut Utama:**
  - DateAgeAsOf
  - AddressNumberParent
  - CreditManager, CollectionManager
  - AmountOpen, NumberOfOpenInvoices
  - OpenChargebackAmount, NumberOfOpenChargebacks
  - AmountDiscountTaken, DiscountEarnable
  - AmountPastDue, NumberOfPastDueInvoices
  - ChargebackPastDue, DiscountAvailablePastDue
  - AmountFuture
  - CurrentAmountDue, NumberOfCurrentInvoices
  - CurrentChargebackAmount
  - CurrentDiscountAvailable, CurrentDiscountEarnable
  - AmtAgingCategories1 through AmtAgingCategories7
  - AmtOverCreditLimit
  - AmountUnapplied, NumberOfUnappliedReceipts
  - CreditsEntered, NumberOfOpenCredits
  - CurrencyCodeFrom
  - OutstandingDraftAmount, NumberOfOpenDrafts
  - AgingMethod
  - AgingDaysARCurrent, AgingDaysAR001

**A/RStatisticalHistory** - Data statistik historis A/R
- **Primary Keys:**
  - AddressNumber [PK1] [FK]
  - Company [PK2] [FK]
- **Atribut Utama:**
  - Century, FiscalYear1, PeriodNoGeneralLedge
  - DateEnding, PeriodDays
  - EndingBalance, DelinquentBalance
  - AmountHighBalance, DateHighBalanceJulian
  - DaysSalesOutstanding, DaysCreditGranted
  - DelinquentDaysSales, AverageDaysLate
  - AVDN
  - AmountGross, NumberOfInvoices
  - AmountSales
  - CreditsEntered
  - AmtDiscountAvailable
  - AmountDelinquencyFees
  - ChargebackAmounts, NumberOfChargebacks
  - PaymntAmount
  - AmountDiscountTaken, DiscountEarnable, DiscountUnearned
  - NumberOfInvoicesPaid
  - AmountPaidLate, NumberOfInvoicesPaidLate
  - AmountDeductions, NumberOfDeductions
  - AmountMinorWriteOff, AmountTotalActualWriteOff
  - AmountBadDebt

**A/RStatisticalSummary** - Ringkasan statistik A/R
- **Primary Keys:**
  - AddressNumber [PK1]
  - ParentChildRelationshi [PK2]
  - Company [PK3]
- **Atribut Utama:**
  - EndingBalance
  - AmountHighBalance, DateHighBalanceJulian
  - AmountHighCreditLimit
  - AverageDaysLate, AVDN
  - AmountGross, NumberOfInvoices
  - AmountSales
  - CreditsEntered
  - AmtDiscountAvailable
  - AmountDelinquencyFees
  - ChargebackAmounts, NumberOfChargebacks
  - DateFirstInvoiceJulian, DateLastInvoiceJulian
  - DateLastStatementDate
  - AmtInvoicedThisYr, AmtInvoicedPriorYr
  - PaymntAmount
  - DiscountEarnable, DiscountUnearned
  - NumberOfInvoicesPaid
  - AmountPaidLate, NumberOfInvoicesPaidLate
  - AmountDeductions, NumberOfDeductions
  - AmountMinorWriteOff, AmountBadDebt
  - AmountNSF, NumberOfNSF
  - DateLastPaid, AmountLastPaid
  - NextPeriodToProcess
  - NoSentReminders1
  - DateLastDunningLetterJul
  - CurrencyCodeFrom
  - CreditManager, CollectionManager
  - UserId, ProgramId
  - DateUpdated, TimeLastUpdated
  - WorkStationId

## Accounts Payable (A/P) Data Architecture

### Entitas Utama:

**AccountsPayableLedger** - Entitas pusat untuk transaksi vendor
- **Primary Keys:**
  - CompanyKey [PK1]
  - DocVoucherInvoiceE [PK2]
  - DocumentType [PK3]
  - DocumentPayItem [PK4]
  - PayItemExtensionNumber [PK5]
- **Atribut Utama:**
  - DocumentTypeAdjusting
  - AddressNumber, PayeeAddressNumber, AddressNumberSentTo
  - DateInvoiceJ, DateServiceCurrency
  - DateDueJulian, DateDiscountDueJulian
  - DateForGLandVoucherJULIA
  - FiscalYear1, Century, PeriodNoGeneralLedge
  - Company, BatchNumber, BatchType
  - DateBatchJulian
  - BalancedJournalEntries
  - PayStatusCode
  - AmountGross, AmountOpen
  - AmtDiscountAvailable, AmountDiscountTaken
  - AmountTaxable, AmountTaxExempt, AmtTax2
  - TaxArea1, TaxExplanationCode1
  - CurrencyMode, CurrencyCodeFrom, CurrencyConverRateOv
  - AmountCurrency
  - AmountForeignOpen
  - ForeignDiscountAvail, ForeignDiscountTaken
  - ForeignTaxableAmount, ForeignTaxExempt, ForeignTaxAmount
  - GIClass, GIBankAccount
  - GLPostedCode, AccountModeGL, AccountId2
  - CostCenter, ObjectAccount, Subsidiary
  - SubledgerType, Subledger
  - BankTransitShortId
  - PaymentTermsCode01
  - VoidFlag
  - CompanyKeyOriginal
  - OriginalDocumentType, OriginalDocumentNo, OriginalDocPayItem
  - CheckRoutingCode
  - VendorInvoiceNumber
  - CompanyKeyPurchase, PurchaseOrder
  - DocumentTypePurchase, LineNumber, OrderSuffix
  - SequenceNoOperations
  - Reference1, UnitNo
  - CostCenter2, NameRemark
  - FrequencyRecurring, RecurFrequencyOfPaym
  - APChecksControlField
  - FinalPayment
  - Units, UnitOfMeasure
  - PaymentInstrument
  - TaxRateArea3Withholding, TaxExplCode3Withholding
  - ArApMiscCode1, ArApMiscCode2, ArApMiscCode3
  - ReportCodeAddBook007
  - FlagFor1099
  - DomesticEntryWMultCurrency
  - IdentifierShortItem

**A/PPaymentDetail** - Detail pembayaran vendor
- **Primary Keys:**
  - PaymentID [PK1] [FK]
  - FileLineldentifier50 [PK2]
  - CompanyKey [PK3] [FK]
  - DocVoucherInvoiceE [PK4] [FK]
  - DocumentType [PK5] [FK]
  - DocumentPayItem [PK6] [FK]
  - PayItemExtensionNumber [PK7] [FK]
- **Atribut Utama:**
  - DocTypeMatching
  - PaymntAmount
  - AmtDiscountAvailable, AmountDiscountTaken
  - PaymentAmountForeign
  - ForeignDiscountAvail, ForeignDiscountTaken
  - CurrencyMode, CurrencyCodeFrom, CurrencyConverRateOv
  - GIClass, GLPostedCode, GLPostCodeAlt006
  - PeriodNoGeneralLedge, FiscalYear1, Century
  - FinalPayment
  - AddressNumber, Company
  - CostCenter, PurchaseOrder
  - NameRemark
  - HistoricalCurrencyConver

**A/PPaymentRegister** - Register pembayaran vendor
- **Primary Keys:**
  - PaymentID [PK1]
- **Atribut Utama:**
  - DocTypeMatching, DocMatchingCheckOr
  - PayeeAddressNumber
  - GIBankAccount
  - DateMatchingCheckOr
  - VoidDateForGLJulian
  - BatchNumber, BatchType
  - DateBatchJulian
  - PaymntAmount
  - CurrencyCodeFrom, CurrencyMode
  - AccountModeGL
  - DateValue
  - PaymentInstrument
  - PostStatusPayments
  - CustBankAcctNumber
  - BankTapeReconcilliationR
  - TransactionOriginator
  - UserId

## Relasi Antar Entitas

### A/R Relationships:
1. **CustomerLedgerFile** ↔ **A/RCheckDetailFile**: One-to-many (via DocVoucherInvoiceE, DocumentType, CompanyKey, DocumentPayItem)
2. **CustomerLedgerFile** ↔ **A/RStatisticalHistory**: One-to-many (via AddressNumber, Company)
3. **A/RCheckDetailFile** ↔ **ReceiptsHeaderFile**: Many-to-one (via PaymentID)
4. **A/RCheckDetailFile** ↔ **A/RStatisticalHistory**: One-to-many (via AddressNumber, Company)
5. **ReceiptsHeaderFile** ↔ **A/RStatisticalSummary**: One-to-many
6. **CreditandCashManagement** ↔ **A/RStatisticalSummary**: One-to-many
7. **A/RStatisticalHistory** ↔ **A/RStatisticalSummary**: One-to-many

### A/P Relationships:
1. **AccountsPayableLedger** ↔ **A/PPaymentDetail**: One-to-many (via CompanyKey, DocVoucherInvoiceE, DocumentType, DocumentPayItem, PayItemExtensionNumber)
2. **A/PPaymentDetail** ↔ **A/PPaymentRegister**: Many-to-one (via PaymentID)

## Integrasi Keuangan

### Multi-Currency Support:
- **Base Currency**: CurrencyCodeBase
- **Foreign Currency**: CurrencyCodeFrom
- **Exchange Rate**: CurrencyConverRateOv
- **Amount Tracking**: AmountCurrency, AmountForeignOpen

### GL Integration:
- **GL Posted Code**: GLPostedCode untuk tracking posting status
- **Account Mapping**: AccountId, AccountModeGL
- **Fiscal Period**: FiscalYear1, Century, PeriodNoGeneralLedge
- **Batch Processing**: BatchType, BatchNumber

### Tax Management:
- **Tax Areas**: TaxArea1, TaxExplanationCode1
- **Taxable Amounts**: AmountTaxable, AmountTaxExempt
- **Foreign Tax**: ForeignTaxableAmount, ForeignTaxExempt, ForeignTaxAmount
- **Withholding Tax**: TaxRateArea3Withholding, TaxExplCode3Withholding

## Best Practices Financial Modules

### 1. Data Integrity
- Gunakan composite keys untuk transaksi (Company + Document + Type + Item)
- Maintain referential integrity melalui foreign keys
- Implement audit trail untuk semua perubahan

### 2. Performance Optimization
- Index pada AddressNumber, Company, PaymentID
- Partition tables berdasarkan FiscalYear untuk historical data
- Optimize queries untuk aging reports

### 3. Compliance & Reporting
- Maintain complete audit trail untuk SOX compliance
- Implement proper tax calculation dan withholding
- Support multi-currency untuk international operations

### 4. Integration Points
- **A/R** → **General Ledger** posting untuk revenue recognition
- **A/P** → **General Ledger** posting untuk expense recognition
- **A/R** → **Cash Management** untuk bank reconciliation
- **A/P** → **Cash Management** untuk payment processing

---

---

# JDE Manufacturing & Production Planning Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Manufacturing dan Production Planning, mencakup Cost Centers, Work Centers, Resource Units, Capacity Planning, dan Shop Floor Control/Routing Instructions.

## Entitas Utama:

### 1. CostCenterMaster
- **Deskripsi:** Master data untuk pusat biaya, mendefinisikan unit organisasi dan akuntansi.
- **Primary Key:**
  - `CostCenter [PK1]`
- **Atribut Penting:**
  - `CostCenterType`, `DescripCompressed`, `Company`, `AddressNumber`
  - Berbagai `CategoryCodeCostCt` dan `CategoryCodeCostCenter` untuk klasifikasi.
  - Atribut terkait pajak (`TaxArea`, `TaxDeductionCodes`, `TaxOrDedCompStat`).
  - Atribut akuntansi dan alokasi (`GlBankAccount`, `AllocationLevel`, `LaborLoadingMethod`).

### 2. WorkCenterMasterFile
- **Deskripsi:** Master data untuk pusat kerja, mendefinisikan lokasi fisik atau kelompok sumber daya tempat pekerjaan dilakukan.
- **Primary Key:**
  - `CostCenter [PK1]` (Foreign Key ke `CostCenterMaster`)
- **Atribut Penting:**
  - `DispatchGroup`, `Location`, `CriticalWorkCenter`, `PayPointCode`
  - Data kapasitas dan efisiensi (`WorkCenterEfficiency`, `WorkCenterUtilization`, `NumberOfEmployees`, `NumberOfMachines`).
  - Jam kerja dan kapasitas yang diinginkan per shift (`DesiredHoursShift`, `DemoCapicityShift`, `DesiredCapicityShift`).

### 3. WorkCenterResourceUnits
- **Deskripsi:** Detail unit sumber daya yang terkait dengan pusat kerja, seringkali berdasarkan periode waktu.
- **Primary Keys:**
  - `CostCenter [PK1] [FK]` (Foreign Key ke `WorkCenterMasterFile`)
  - `Calendar Year [PK2]`
  - `Calendar Month [PK3]`
  - `CostCenterAlt [PK4]`
  - `UnitOfMeasure [PK5]`
- **Atribut Penting:**
  - `ShiftCode`, `WorkCenterEfficiency`, `WorkCenterUtilization`
  - Berbagai `ResourceUnits` (001-029) untuk detail alokasi sumber daya.

### 4. CapacityMessageFile
- **Deskripsi:** File pesan yang terkait dengan perencanaan kapasitas, seringkali menghubungkan permintaan kapasitas dengan instruksi routing.
- **Primary Keys (Composite, banyak juga FK):**
  - `CostCenter [PK1] [FK]`
  - `UnitOfMeasure [PK11] [FK]`
  - `Calendar Year [PK8] [FK]`
  - `Calendar Month [PK9] [FK]`
  - `CostCenterAlt [PK10] [FK]`
  - `DocumentOrderInvoiceE [PK12] [FK]`
  - `ItemNumberShortKit [PK13] [FK]`
  - `SequenceNbOperations [PK14] [FK]`
  - `TypeOperationCode [PK15] [FK]`
  - `AtoLineType [PK16] [FK]`
  - `ParentSegmentNumber [PK17] [FK]`
- **Atribut Penting:**
  - `CapacityMode`, `CapacityMessageCode`, `ActionMessageControl`, `HoldCode`
  - `QuantityTransaction`, `UnitsTransactionQty`, `DateRequestedJulian`, `DateStart`.

### 5. ShopFloorControlRoutingInstruct
- **Deskripsi:** Instruksi routing detail untuk operasi di lantai produksi, mendefinisikan langkah-langkah, sumber daya, dan waktu yang dibutuhkan.
- **Primary Keys (Composite):**
  - `DocumentOrderInvoiceE [PK1] [FK]` (Foreign Key ke `CapacityMessageFile`)
  - `ItemNumberShortKit [PK7]`
  - `SequenceNbOperations [PK3]`
  - `TypeOperationCode [PK4]`
  - `AtoLineType [PK5]`
  - `ParentSegmentNumber [PK6]`
  - `CategoriesWorkOrder001 [PK8] [FK]`
  - `CategoriesWorkOrder002 [PK9] [FK]`
  - `CategoriesWorkOrder003 [PK10] [FK]`
- **Atribut Penting:**
  - `OrderType`, `TypeRouting`, `CostCenterAlt`, `LineIdentifier`
  - Status operasi (`OperationStatusCodeWo`), kode inspeksi (`InspectionCode`).
  - Data waktu dan tenaga kerja (`TimeBasisCode`, `LaborOrMachine`, `PayPointCode`, `DateStart`, `DateCompletion`, `BeginningHhMmss`, `EndingHhMmSs`).
  - Data shift (`ShiftCodeRequested`, `ShiftCodeStart`, `ShiftCodeCompleted`).
  - Metrik kinerja (`PercentOfOverlap`, `PercentOperationalPl`, `PercentCumulativePla`).
  - Data kuantitas (`UnitsTransactionQty`, `UnitsQuantityCanceled`, `UnitsQuantityShipped`, `UnitsQuantityMovedT`).
  - Biaya tidak langsung (`UnacctDirectLaborHrs`, `UnacctSetupLaborHrs`, `UnacctMachineHours`, `UnacctDirectLaborAmt`, `UnacctDirectSetupAmt`, `UnacctDirectMachAmt`).
  - Atribut terkait akuntansi (`PurchasingCostCenter`, `ObjectAccount`, `Subsidiary`).

## Hubungan Antar Entitas:
- **CostCenterMaster** adalah master untuk **WorkCenterMasterFile** (satu Cost Center dapat memiliki banyak Work Centers).
- **WorkCenterMasterFile** adalah master untuk **WorkCenterResourceUnits** (sumber daya dialokasikan ke Work Centers).
- **CapacityMessageFile** dan **ShopFloorControlRoutingInstruct** memiliki hubungan yang erat, di mana pesan kapasitas seringkali merujuk pada instruksi routing spesifik.

---

# JDE Address Book & Customer/Supplier Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Address Book dan manajemen Customer/Supplier, mencakup master data alamat, kontak, dan informasi terkait.

## Entitas Utama:

### 1. AddressBookMaster
- **Deskripsi:** Master data untuk semua entitas alamat (customer, supplier, employee, dll).
- **Primary Keys:**
  - `AddressNumber [PK1]`
  - `ZipCodePostal [PK2] [FK]`
  - `City [PK3] [FK]`
- **Atribut Penting:**
  - `AlternateAddressKey`, `TaxId`, `NameAlpha`, `DescripCompressed`
  - `CostCenter`, `StandardIndustryCode`, `LanguagePreference`
  - Berbagai `AddressType` (1-5, Payables, Receivables, Employee)
  - `PersonCorporationCode`, `SubledgerInactiveCode`
  - `DateBeginningEffective`
  - Berbagai `AddressNumber` (1st-6th) untuk hierarki
  - `ReportCodeAddBook001` hingga `ReportCodeAddBook020`
  - `CategoryCodeAddressBook2`, `CategoryCodeAddressBk22` hingga `CategoryCodeAddressBk30`
  - `GIBankAccount`, `CertificateTaxExempt`, `TaxId2`
  - User reserved fields dan audit trail (`UserId`, `ProgramId`, `DateUpdated`, `WorkStationId`)

### 2. AddressBookWho'sWho
- **Deskripsi:** Data kontak person untuk setiap alamat.
- **Primary Keys:**
  - `AddressNumber [PK1] [FK]`
  - `LineNumberID [PK2]`
  - `SequenceNumber70 [PK3]`
- **Atribut Penting:**
  - `SequenceNumber52Display`, `NameMailing`, `ContactTitle`
  - `Remark1`, `SalutationName`, `NameAlpha`, `DescripCompressed`
  - `NameGiven`, `NameMiddle`, `NameSurname`, `TypeCode`
  - `CategoryCodeWhosWh001` hingga `CategoryCodeWhosWh010`
  - `SecondaryMailingName`

### 3. AddressBookContactPhoneNumbers
- **Deskripsi:** Nomor telepon untuk kontak.
- **Primary Keys:**
  - `AddressNumber [PK1] [FK]`
  - `LineNumberID [PK2]`
  - `SequenceNumber70 [PK3]`
- **Atribut Penting:**
  - `PhoneNumberType`, `PhoneAreaCode1`, `PhoneNumber`
  - `UserId`, `ProgramId`

### 4. AddressbyDate
- **Deskripsi:** Alamat berdasarkan tanggal efektif.
- **Primary Keys:**
  - `AddressNumber [PK1] [FK]`
  - `DateBeginningEffective [PK2]`
- **Atribut Penting:**
  - `EffectiveDateExistence10`
  - `AddressLine1` hingga `AddressLine4`
  - `ZipCodePostal`, `City`, `CountyAddress`, `State`
  - `CarrierRoute`, `BulkMailingCenter`, `Country`
  - `UserId`

### 5. AddressOrganizationStructureMas
- **Deskripsi:** Struktur organisasi untuk alamat.
- **Primary Keys:**
  - `OrganizationTypeStructur [PK1]`
  - `AddressNumberParent [PK2]`
  - `AddressNumber [PK3] [FK]`
- **Atribut Penting:**
  - `SequenceNumber72Display`
  - `BeginningEffectiveDateJu`, `EndingEffectiveDateJulia`
  - `NameRemark`, `UserId`, `DateUpdated`

### 6. PostalCodeTransactions
- **Deskripsi:** Master data kode pos.
- **Primary Keys:**
  - `ZipCodePostal [PK1]`
  - `City [PK2]`
- **Atribut Penting:**
  - `State`, `CountyAddress`, `Country`, `CarrierRoute`

### 7. CustomerMaster
- **Deskripsi:** Data khusus customer.
- **Primary Key:**
  - `AddressNumber [PK1]`
- **Atribut Penting:**
  - `ARClass`, `CostCenterArDefault`, `ObjectAcctsReceivable`, `SubsidiaryAcctsReceiv`
  - `CompanyKeyARModel`, `DocArDefault.Je`, `DocTyArDefault.Je`
  - `CurrencyCodeFrom`, `TaxArea1`, `TaxExplanationCode1`
  - `AmountCreditLimit`, `ArHoldInvoices`, `PaymentTermsAR`
  - `AltPayor`, `SendStatementToCP`, `PaymentInstrumentA`
  - `PrintStatementYN`, `AutoCash`, `SendInvoiceToCP`
  - `SequenceForLedgrinq`, `AutocashAlgorithm`, `StatementCycle`
  - `BalForwardOpenItem`, `TempCreditMessage`, `CreditCkHandlingCode`
  - `DateLastCreditReview`, `DelinquencyLetter`, `LastCreditReview`
  - `DateRecallforReview`, `DaysSalesOutstanding`

### 8. SupplierMaster
- **Deskripsi:** Data khusus supplier.
- **Primary Keys:**
  - `AddressNumber [PK1] [FK]`
  - `ZipCodePostal [PK2] [FK]`
  - `City [PK3] [FK]`
- **Atribut Penting:**
  - `APClass`, `CostCenterApDefault`, `ObjectAcctsPayable`, `SubsidiaryAcctsPayable`
  - `CompanyKeyAPModel`, `DocApDefault.Je`, `DocTyApDefault.Je`
  - `CurrencyCodeAP`, `TaxArea2`, `TaxExemptReason2`
  - `HoldPaymentCode`, `TaxRateArea3Withholding`, `TaxExplCode3Withhholding`
  - `TaxAuthorityAp`, `PercentWithholding`, `PaymentTermsAP`
  - `MultipleChecksYN`, `PaymentInstrument`, `AddressNumberSentTo`
  - `MiscCode1`, `FloatDaysForChecks`, `SequenceForLedgrinq`
  - `CurrencyCodeAmounts`, `AmountVoucheredYtd`, `AmountVoucheredPye`

## Hubungan Antar Entitas:
- **AddressBookMaster** adalah entitas pusat yang terhubung ke semua entitas lain.
- **AddressBookWho'sWho** dan **AddressBookContactPhoneNumbers** terhubung ke **AddressBookMaster** (one-to-many).
- **AddressbyDate** dan **AddressOrganizationStructureMas** terhubung ke **AddressBookMaster** (one-to-many).
- **PostalCodeTransactions** terhubung ke **AddressBookMaster** (one-to-many).
- **CustomerMaster** dan **SupplierMaster** terhubung ke **AddressBookMaster** (one-to-one optional).

---

# JDE Advanced Price Adjustments Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk sistem penyesuaian harga yang kompleks, mencakup definisi jenis penyesuaian, jadwal, detail, dan pencatatan dalam ledger.

## Entitas Utama:

### 1. GroupCodeKey Definition Table
- **Deskripsi:** Tabel definisi untuk grup kode yang digunakan di beberapa tabel lain.
- **Primary Keys:**
  - `TypeGroup [PK1]`
  - `CodeGroup [PK2]`
- **Atribut Penting:**
  - `Description001`, `GroupCodeKey01`, `GroupCodeKey02`

### 2. Item/Customer Group Relationship
- **Deskripsi:** Relasi antara item dan customer group.
- **Primary Keys:**
  - `TypeGroup [PK1] [FK]`
  - `CodeGroup [PK2] [FK]`
  - `GroupCategoryCode01 [PK3]` hingga `GroupCategoryCode04 [PK6]`

### 3. PriceAdjustment Type
- **Deskripsi:** Definisi jenis penyesuaian harga.
- **Primary Keys:**
  - `PriceAdjustmentType [PK1]`
  - `TypeGroup [PK2] [FK]`
  - `CodeGroup [PK3] [FK]`
- **Atribut Penting:**
  - `PricingCategory`, `GroupCustomerPriceGp`, `SalesDetailGroup`
  - `Prefernce`, `LevelBreakType`, `GIClass`, `SubledgerInformation`
  - `AdjustmentControlCode`, `LineType`, `ManualDiscount`
  - `AdjustmentBasedon`, `OrderLevelAdjustmentYN`, `AdjustmentTaxableYN`
  - `PriceAdjustmentCode01` hingga `PriceAdjustmentCode05`
  - User reserved fields dan audit trail

### 4. PriceAdjustmentSchedule
- **Deskripsi:** Jadwal penyesuaian harga.
- **Primary Keys:**
  - `PriceAdjustmentScheduleN [PK1]`
  - `SequenceNumber [PK2]`
  - `PriceAdjustmentType [PK5] [FK]`
  - `TypeGroup [PK3] [FK]`
  - `CodeGroup [PK4] [FK]`
- **Atribut Penting:**
  - User reserved fields dan audit trail

### 5. PriceAdjustmentDetail
- **Deskripsi:** Detail penyesuaian harga.
- **Primary Keys (Composite):**
  - `PriceAdjustmentType [PK1] [FK]`
  - `IdentifierShortitem [PK2]`
  - `AddressNumber [PK3]`
  - `ItemCustomerKeyID [PK4]`
  - `SalesDetailGroup [PK5]`
  - `SalesDetailValue01 [PK6]` hingga `SalesDetailValue03 [PK8]`
  - `CurrencyCodeFrom [PK9]`
  - `UnitOfMeasureAsInput [PK10]`
  - `QuantityMinimum [PK11]`
  - `DateEffectiveJulian1 [PK28] [FK]`
  - `DateExpiredJulian1 [PK12]`
  - `PriceAdjustmentScheduleN [PK13] [FK]`
  - `SequenceNumber [PK14] [FK]`
- **Atribut Penting:**
  - `GroupCustomerPriceGp [PK22] [FK]`
  - `CustomerGroup01` hingga `CustomerGroup04 [PK23-PK26] [FK]`
  - `PriceAdjustmentVariableN [PK27] [FK]`
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `BasisCode`, `LedgType`, `PriceFormulaName`, `FactorValue`
  - `FreeGoodsYN`, `PriceAdjustmentKeyID`
  - User reserved fields

### 6. Item/Customer KeyID Master File
- **Deskripsi:** Master data untuk kombinasi kunci item dan customer.
- **Primary Keys:**
  - `PricingCategory [PK1]`
  - `ItemGroup01 [PK2]` hingga `ItemGroup04 [PK5]`
  - `GroupCustomerPriceGp [PK6]`
  - `CustomerGroup01 [PK7]` hingga `CustomerGroup04 [PK10]`

### 7. PriceVariable Table
- **Deskripsi:** Tabel variabel harga.
- **Primary Keys:**
  - `PriceAdjustmentVariableN [PK1]`
  - `DateEffectiveJulian1 [PK2]`
- **Atribut Penting:**
  - `CurrencyCodeFrom`, `UnitOfMeasureAsInput`, `AmtPricePerUnit2`
  - `DateExpiredJulian1`
  - Audit trail (`Userld`, `ProgramId`, `WorkStationId`)

### 8. FreeGoods MasterFile
- **Deskripsi:** Master data untuk barang gratis atau promosi.
- **Primary Keys (Composite, banyak FK):**
  - `PriceAdjustmentType [PK1] [FK]`
  - `PriceAdjustmentKeyID [PK2]`
  - `Identifier2nditem [PK3]`
  - `UnitOfMeasureAsInput [PK28] [FK]`
  - `IdentifierShortitem [PK4] [FK]`
  - `AddressNumber [PK5] [FK]`
  - `ItemCustomerKeyID [PK6] [FK]`
  - `SalesDetailGroup [PK7] [FK]`
  - `SalesDetailValue01 [PK8]` hingga `SalesDetailValue03 [PK10] [FK]`
  - `CurrencyCodeFrom [PK11] [FK]`
  - `QuantityMinimum [PK12] [FK]`
  - `DateExpiredJulian1 [PK13] [FK]`
  - `PriceAdjustmentScheduleN [PK14] [FK]`
  - `SequenceNumber [PK15] [FK]`
  - `TypeGroup [PK16] [FK]`
  - `CodeGroup [PK17] [FK]`
  - `PricingCategory [PK18] [FK]`
  - `ItemGroup01 [PK19]` hingga `ItemGroup04 [PK22] [FK]`
  - `GroupCustomerPriceGp [PK23] [FK]`
  - `CustomerGroup01 [PK24]` hingga `CustomerGroup04 [PK27] [FK]`
- **Atribut Penting:**
  - `ItemNoShortRelated`, `Identifier3rditem`, `UnitsTransactionQty`
  - `RelatedPrice`, `AmountUnitCost`, `GIClass`, `LineType`
  - `QuantityPerOrderedFreeGo`, `ProcessingTypeFreeGood`
  - `FreeGoodProcessCode01`, `FreeGoodProcessCode002`

### 9. PriceAdjustmentLedgerFile
- **Deskripsi:** File ledger untuk mencatat detail penyesuaian harga.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1] [FK]`
  - `OrderType [PK2] [FK]`
  - `CompanyKeyOrderNo [PK3] [FK]`
  - `LineNumber [PK4] [FK]`
  - `SequenceNumber [PK5]`
- **Atribut Penting:**
  - `PriceAdjustmentScheduleN`, `PriceAdjustmentType`
  - `IdentifierShortitem`, `AddressNumber`, `ItemCustomerKeyID`
  - `SalesDetailGroup`, `SalesDetailValue01` hingga `SalesDetailValue03`
  - `CurrencyCodeFrom`, `UnitOfMeasureAsInput`, `QuantityMinimum`
  - `LedgType`, `PriceFormulaName`, `BasisCode`, `FactorValue`
  - `AdjustmentBasedon`, `AmtPricePerUnit2`, `AmtForPricePerUnit`
  - `GIClass`, `AdjustmentReasonCode`, `AdjustmentControlCode`
  - `SubledgerInformation`, `ManualDiscount`, `PriceOverrideCode`
  - `PriceAdjustmentKeyID`

### 10. Sales Order Detail File
- **Deskripsi:** Tabel detail untuk pesanan penjualan.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1]`
  - `DocumentOrderInvoiceE [PK2]`
  - `OrderType [PK3]`
  - `LineNumber [PK4]`
- **Atribut Penting:**
  - `OrderSuffix`, `CostCenter`, `Company`
  - `CompanyKeyOriginal`, `OriginalPoSoNumber`, `OriginalOrderType`, `OriginalLineNumber`
  - `CompanyKeyRelated`, `RelatedPoSoNumber`, `RelatedOrderType`, `RelatedPoSoLineNo`
  - `ContractNumberDistributi`, `ContractSupplementDistri`, `ContractBalancesUpdatedY`
  - `AddressNumber`, `AddressNumberShipTo`, `AddressNumberParent`
  - Berbagai tanggal (`DateRequestedJulian`, `DateTransactionJulian`, `PromisedDeliveryDate`, dll)
  - `Reference1`, `Reference2Vendor`
  - `IdentifierShortitem`, `Identifier2nditem`, `Identifier3rditem`
  - `Location`, `Lot`, `FromGrade`, `ThruGrade`, `FromPotency`, `ThruPotency`
  - `DaysPastExpiration`, `DescriptionLine1`, `DescriptionLine2`
  - `LineType`, `StatusCodeNext`, `StatusCodeLast`
  - `CostCenterHeader`, `ItemNumberRelatedKit`, `LineNumberKitMaster`
  - `ComponentNumber`, `RelatedKitComponent`, `NumbOfCpntPerParent`
  - `SalesReportingCode1` hingga `SalesReportingCode5`
  - `PurchasingReportCode1` hingga `PurchasingReportCode4`

## Hubungan Antar Entitas:
- **GroupCodeKey Definition Table** adalah master untuk grup kode yang digunakan di berbagai tabel.
- **PriceAdjustment Type** terhubung ke **GroupCodeKey Definition Table** dan merupakan induk bagi **PriceAdjustmentSchedule** dan **PriceAdjustmentDetail**.
- **PriceAdjustmentSchedule** terhubung ke **PriceAdjustment Type** dan **GroupCodeKey Definition Table**, serta merupakan induk bagi **PriceAdjustmentDetail** dan **FreeGoods MasterFile**.
- **PriceAdjustmentDetail** terhubung ke **PriceAdjustment Type**, **PriceAdjustmentSchedule**, **Item/Customer KeyID Master File**, dan **PriceVariable Table**.
- **Item/Customer KeyID Master File** terhubung ke **PriceAdjustmentDetail** dan **FreeGoods MasterFile**.
- **PriceVariable Table** terhubung ke **PriceAdjustmentDetail**.
- **FreeGoods MasterFile** terhubung ke **PriceAdjustment Type**, **Item/Customer KeyID Master File**, **PriceAdjustmentSchedule**, dan **GroupCodeKey Definition Table**.
- **PriceAdjustmentLedgerFile** terhubung ke **Sales Order Detail File**.

## Fitur Utama Advanced Price Adjustments:

### 1. Flexible Pricing Structure
- Support untuk berbagai jenis penyesuaian harga
- Grouping berdasarkan item dan customer
- Multi-level pricing dengan break types

### 2. Complex Discount Management
- Manual dan automatic discounts
- Order level dan line level adjustments
- Taxable dan non-taxable adjustments

### 3. Free Goods Management
- Promotional items
- Buy-one-get-one offers
- Quantity-based free goods

### 4. Time-Based Pricing
- Effective dates untuk penyesuaian
- Expiration dates
- Seasonal pricing

### 5. Multi-Currency Support
- Currency-specific pricing
- Exchange rate considerations
- Foreign currency adjustments

---

---

# JDE Product Configuration & Sales Order Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Product Configuration dan Sales Order Management, mencakup konfigurasi item, segment management, cross-segment editing rules, assembly inclusions, dan integrasi dengan shop floor control.

## Entitas Utama:

### 1. ItemMaster
- **Deskripsi:** Entitas pusat untuk mendefinisikan item dalam sistem.
- **Atribut Penting:**
  - `DescriptionLine1`, `DescriptionLine2`, `SearchText`, `SearchTextCompressed`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchasingReportCode10`
  - `CommodityCode`, `ProductGroupFrom`, `DispatchGrp`
  - `PricingCategory`, `RepriceBasketPriceCat`, `OrderRepriceCategory`
  - `Buyer`, `DrawingNumber`, `RevisionNumber`, `DrawingSize`
  - `VolumeCubicDimensions`, `Carrier`, `PreferCarrierPurchasin`, `ShippingConditionsCode`
- **Relationships:** `ItemNumberShortKit` dari entitas ini berfungsi sebagai foreign key di berbagai tabel lain.

### 2. ConfiguredItemSegments
- **Deskripsi:** Mendefinisikan segment yang membentuk item yang dikonfigurasi.
- **Primary Keys:**
  - `ItemNumberShortKit [PK1]`
  - `CostCenter [PK2]`
  - `ParentSegmentNumber [PK3]`
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `EffectiveFromDate`, `EffectiveThruDate`
  - `DescriptionLine1`, `DataItem`, `RequiredToBe`
  - `SystemCode`, `UserDefinedCodes`, `ValueForEntryDefault`
  - `LowerAllowedValueDd`, `AllowedValueUpper`, `NumericYN`
  - `DataItemSize`, `DataDisplayDecimals`
  - `AddressNumber`, `ATOSaveSegment`
  - `DisplayItemNumber`, `TextStringorCustomFormat`
  - `SpacesBeforeSegmentinfor`, `ATOPrintSegmentNumber`
  - `ATOPrintSegmentDescripti`, `ATOPrintSegmentValue`, `ATOPrintSegmentValueDesc`
  - `SpacesAfterSegmentinform`, `ReturnandStartNewLine`
  - `DerivedCalculationRound`, `UpdateCategoryCode`
  - User reserved fields dan audit trail

### 3. ConfiguredStringHistoryFile
- **Deskripsi:** Menyimpan data historis terkait configured strings.
- **Primary Key:**
  - `ConfiguredString [PK1]`
- **Atribut Penting:**
  - `ItemNumberShortKit`, `CostCenter`, `Location`, `Lot`
  - `ConfiguredStringiD`, `ATOSegmentProductFamilyN`
  - `CompanyKeyOrderNo`, `DocumentOrderinvoiceE`, `OrderType`, `LineNumber`
  - `AddressNumber`, `IdentifierShortitem`, `BranchComponent`
  - `DateRequestedJulian`, `AmountMemoCost1`, `UnitPriceEntered`
  - Audit trail (`Userid`, `Programid`, `WorkStationid`, `DateUpdated`, `TimeOfDay`)

### 4. CrossSegmentEditingRules
- **Deskripsi:** Mendefinisikan aturan untuk editing di berbagai segment, penting untuk konfigurasi produk.
- **Primary Keys:**
  - `ItemNumberShortKit [PK1] [FK]`
  - `CostCenter [PK2] [FK]`
  - `AtoRuleNumber [PK3]`
  - `AtoSeqNumber [PK4]`
  - `ParentSegmentNumber [PK5] [FK]`
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `EffectiveFromDate`, `EffectiveThruDate`
  - `ATOSegmentProductFamilyN`, `CostCenterHeader`
  - `Relationship`, `SelectionValueAtolf`, `AndOrSelection`
  - `AndOrSelectionBeginning`, `AndOrSelectionEnding`
  - `ChildSegmentNumber`, `SelectionValueAtoThen`
  - `RequiredToBe`, `SegmentDelimiter`, `CustomMessage`
  - `RelationshipValue`, `AtoLineType`, `MessageNo`
  - `IdentifierShortitem`, `CostCenterAlt`
  - User reserved fields dan audit trail

### 5. AssemblyInclusionsRules
- **Deskripsi:** Menentukan aturan untuk memasukkan komponen dalam assembly.
- **Primary Keys:**
  - `CostCenter [PK1] [FK]`
  - `ItemNumberShortKit [PK2] [FK]`
  - `AtoLineType [PK3]`
  - `AtoRuleNumber [PK4]`
  - `AtoSeqNumber [PK5]`
  - `ParentSegmentNumber [PK11] [FK]`
  - `CompanyKeyOrderNo [PK6]`
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`, `IdentifierShortitem`
  - `BranchComponent`, `DescriptionLine1`
  - `AndOrSelection`, `AndOrSelectionBeginning`, `AndOrSelectionEnding`
  - `ATOSegmentProductFamilyN`, `CostCenterHeader`
  - `Relationship`, `SelectionValueAtolf`
  - `SequenceNoOperations`, `UnitPriceEntered`, `AmountMemoCost1`
  - `LineType`, `MessageNo`, `QtyRequiredStandard`
  - `UnitOfMeasure`, `FixedOrVariableQty`, `IssueTypeCode`
  - `LeadtimeOffsetDay`

### 6. SalesOrderDetailFile
- **Deskripsi:** Berisi informasi detail tentang sales order.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1]`
  - `DocumentOrderinvoiceE [PK2]`
  - `OrderType [PK3]`
  - `LineNumber [PK4]`
- **Atribut Penting:**
  - `OrderSuffix`, `CostCenter`, `Company`
  - `CompanyKeyOriginal`, `OriginalPoSoNumber`, `OriginalOrderType`, `OriginalLineNumber`
  - `CompanyKeyRelated`, `RelatedPoSoNumber`, `RelatedOrderType`, `RelatedPoSoLineNb`
  - `ContractNumberDistributi`, `ContractSupplementDistri`, `ContractBalancesUpdatedY`
  - `AddressNumber`, `AddressNumberShipTo`, `AddressNumberParent`
  - Berbagai tanggal (`DateRequestedJulian`, `DateTransactionJulian`, `DateOriginalPromisde`, `PromisedDeliveryDate`, `ActualDeliveryDate`, `DatelnvoiceJulian`, `CancelDate`, `DtForGLAndVouch1`, `DateReleaseJulian`, `DatePriceEffectiveDate`, `DatePromisedPickJu`, `DatePromisedShipJu`)
  - `Reference1`, `Reference2Vendor`
  - `IdentifierShortitem`, `Identifier2ndItem`, `Identifier3rditem`

### 7. CostCenterMaster
- **Deskripsi:** Master data untuk cost center, mendefinisikan unit organisasi dan akuntansi.
- **Primary Key:**
  - `CostCenter [PK1]`
- **Atribut Penting:**
  - `CostCenterType`, `DescripCompressed`, `LevelOfDetailCcCode`
  - `Company`, `AddressNumber`, `AddressNumberJobAr`, `County`, `State`
  - `ModelAccountsandConsolid`, `Description001` hingga `Description01004`
  - Berbagai `CategoryCodeCostCtXXX` dan `CategoryCodeCostCenterXX`
  - Atribut terkait pajak (`TaxArea`, `TaxEntity`, `TaxArea1`, `TaxExplanationCode1`, `TaxDeductionCodes1` hingga `TaxDeductionCodes10`, `DistributeTaxCode001` hingga `DistributeTaxCode010`, `TaxOrDedCompStat01` hingga `TaxOrDedCompStat10`)
  - Atribut akuntansi dan alokasi (`PostingEditCostCenter`, `AllocaSummarizaMeth`, `InvstmtSummarizaMeth`, `GlBankAccount`, `AllocationLevel`, `LaborLoadingMethod`, `LaborLoadingFactor`, `GlObjectAcctLabor`, `GlObjctAcctLaborPrem`, `GlobjAcctLaborBurden`, `SubsidiaryBurdnCstCde`, `UnitsTotal`)
  - `SubledgerInactiveCode`, `Supervisor`, `ContractType1`, `CertifiedJob`
  - `CostCenterSubsequent`, `BillingTypeCostCenter`, `PercentComplete`, `PerCompleteAggregate`
  - `AmtCostToCompleteOb`, `IntComputationCodeAr`, `IntComputationCodeRev`
  - Berbagai tanggal (`DatePlannedStartJ`, `DateActualStartJ`, `DatePlannedCompleteJ`, `DateActualCompleteJ`, `DateOther5J`, `DateOther6J`, `DteFinalPaymnt.Julian`)
  - `AmtCostAtCompletion`, `AmtProfitAtCompletion`, `EqualEmploymentOpport`
  - `EquipmentRateCode`
  - Audit trail (`Userid`, `Programid`, `DateUpdated`, `WorkStationId`, `TimeLastUpdated`)

### 8. ShopFloorControlRoutingInstruct
- **Deskripsi:** Memberikan instruksi routing detail untuk operasi manufaktur di shop floor.
- **Primary Keys (Composite):**
  - `ItemNumberShortKit [PK7] [FK]`
  - `SequenceNbOperations [PK3]`
  - `TypeOperationCode [PK4]`
  - `AtoLineType [PK5] [FK]`
  - `ParentSegmentNumber [PK6] [FK]`
  - `CostCenter [PK8] [FK]`
  - `AtoRuleNumber [PK9] [FK]`
  - `AtoSeqNumber [PK10] [FK]`
  - `CompanyKeyOrderNo [PK11] [FK]`
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `TypeRouting`
  - `ItemNumber2ndKit`, `ItemNumber3rdKit`, `CostCenterAlt`
  - `Lineldentifier`, `AutoLoadDescription`, `DescriptionLine1`
  - `OperationStatusCodeWo`, `InspectionCode`
  - `TimeBasisCode`, `LabororMachine`, `PayPointCode`, `PayPointStatus`
  - `JobCategory`, `AddressNumber`, `CriticalRatio`, `SlackTimeRatio`
  - Berbagai tanggal (`DateTransactionJulian`, `DateRequestedJulian`, `DateStart`, `DateCompletion`)
  - `BeginningHhMmSs`, `EndingHhMmSs`
  - `ShiftCodeRequested`, `ShiftCodeStart`, `ShiftCodeCompleted`
  - `LeadtimeOverlap`, `PercentOfOverlap`, `PercentOperationalPl`, `PercentCumulativePla`
  - `NextOperation`, `CrewSize`, `MoveHours`, `QueueHours`
  - `RunMachineStandard`, `RunLaborStandard`, `SetupLaborHrsStdr`
  - `RunMachineActual`, `RunLaborActual`, `SetupLaborHoursActual`
  - `OperationShrinkage`, `UnitsTransactionQty`, `UnitsQuantityCanceled`
  - `UnitsQuantityShipped`, `UnitsQuantityMovedT`, `RatePiecework`
  - `UnitOfMeasureAsinput`
  - Biaya tidak langsung (`UnacctDirectLaborHrs`, `UnacctSetupLaborHrs`, `UnacctMachineHours`, `UnacctDirectLaborAmt`, `UnacctDirectSetupAmt`)

## Hubungan Antar Entitas:
- **ItemMaster** adalah entitas pusat yang terhubung ke berbagai tabel lain melalui `ItemNumberShortKit`.
- **ConfiguredItemSegments** terhubung ke **ItemMaster** dan **CostCenterMaster**.
- **ConfiguredStringHistoryFile** terhubung ke **ConfiguredItemSegments** dan **SalesOrderDetailFile**.
- **CrossSegmentEditingRules** terhubung ke **ItemMaster** dan **CostCenterMaster**.
- **AssemblyInclusionsRules** terhubung ke **ItemMaster**, **CostCenterMaster**, dan **SalesOrderDetailFile**.
- **CostCenterMaster** memainkan peran sentral dalam menghubungkan berbagai aspek operasional dan keuangan.
- **ShopFloorControlRoutingInstruct** terhubung ke **ItemMaster**, **CostCenterMaster**, dan **SalesOrderDetailFile**.

---

# JDE Workflow & Messaging System Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk sistem workflow dan messaging, mencakup manajemen pesan internal, notifikasi, alur kerja, dan integrasi dengan Address Book.

## Entitas Utama:

### 1. PPATMessageDetailFile
- **Deskripsi:** Menyimpan detail pesan atau notifikasi terkait proses "PPAT" (kemungkinan singkatan untuk modul atau fungsi spesifik).
- **Primary Keys:**
  - `KeyValueSerialNumber [PK1]`
  - `AddressNumber [PK2]`
- **Atribut Penting:**
  - `NameAlpha`, `MailBoxDesignator`, `DateTickler`
  - `CommandFlagPPAT`, `StatusElectronicMailMess`
  - `SequenceNumber52Display`, `ActionMessageControl`
  - `MiscCode3`, `TimeLastUpdated`

### 2. PPATMessageControlFile
- **Deskripsi:** Bertindak sebagai file kontrol atau header untuk pesan-pesan PPAT, mengelola informasi umum dan status pesan.
- **Primary Key:**
  - `KeyValueSerialNumber [PK1]`
- **Atribut Penting:**
  - `AddressNumber`, `NameAlpha`, `SntFrm` (Sent From)
  - `CallFromCompany`, `MailBoxDesignator`, `DateTickler`
  - `DateUpdated`, `TimeLastUpdated`, `WorkStationId`
  - `SequenceNumber52Display`, `PPATBriefMessage`
  - `AddressNumberParent`
  - `CategoryCodePPAT01`, `CategoryCodePPAT02`
  - `MessageType1`, `MessageType2`, `MessageType3`
  - `Userld`, `Programid`, `ActionMessageControl`
  - `TimeEntered`, `StatusElectronicMailMess`
  - `PhoneExtension`, `BaseMemberName`, `SystemCode`
  - `DocumentOrderInvoiceE`, `OrderSuffix`, `OrderType`, `LineNumber`
  - `CompanyKeyOrderNo`, `TemplateID`, `MiscCode3`
  - `LevelIndented`, `KeyValueSerialNumber` (terulang sebagai non-key)
  - `Version`, `TemplateSubstitutionValues`
  - `ApplicationID`, `FormID`

### 3. AddressBookMaster
- **Deskripsi:** Entitas inti JDE yang menyimpan semua informasi alamat untuk berbagai entitas (pelanggan, vendor, karyawan, dll.).
- **Primary Key:**
  - `AddressNumber [PK1]`
- **Atribut Penting:**
  - `AlternateAddressKey`, `TaxId`, `NameAlpha`, `DescripCompressed`
  - `CostCenter`, `StandardIndustryCode`, `LanguagePreference`
  - `AddressType1` hingga `AddressType5`, `AddressTypePayables`, `AddressTypeReceivables`, `AddTypeCode4Purch`
  - `MiscCode3`, `AddressTypeEmployee`, `SubledgerInactiveCode`
  - `DateBeginningEffective`
  - `AddressNumber1st` hingga `AddressNumber6th`
  - `ReportCodeAddBook001` hingga `ReportCodeAddBook020`
  - `CategoryCodeAddressBook2` hingga `CategoryCodeAddressBk30`
  - `GIBankAccount`, `TimeScheduledIn`, `DateScheduledIn`
  - `ActionMessageControl`, `NameRemark`, `CertificateTaxExempt`
  - `TaxId2`, `Kanjialpha`
  - User reserved fields (`UserReservedCode`, `UserReservedDate`, `UserReservedAmount`, `UserReservedNumber`, `UserReservedReference`)
  - Audit trail (`Userid`, `Programid`, `DateUpdated`, `WorkStationId`, `TimeLastUpdated`)

### 4. JDEMMailFilters
- **Deskripsi:** Menyimpan konfigurasi filter untuk email atau pesan dalam sistem JDE, kemungkinan terkait dengan penerima atau pengirim dari Address Book.
- **Primary Keys:**
  - `AddressNumberParent [PK1]`
  - `AddressNumber [PK2]`
- **Atribut Penting:**
  - `MailBoxDesignator`

### 5. TimeLogLedgerFile
- **Deskripsi:** Mencatat log waktu untuk berbagai aktivitas atau status, kemungkinan terkait dengan penjadwalan atau pemrosesan pesan/workflow.
- **Primary Keys:**
  - `AddressNumber [PK1]`
  - `DateScheduledOut [PK2]`
  - `TimeScheduledOut [PK3]`
- **Atribut Penting:**
  - `NameAlpha`, `TypePpatAction`, `NameRemark`
  - `DateScheduledIn`, `TimeScheduledin`, `TimeEntered`
  - `Userld`, `Programid`, `DateUpdated`
  - `WorkStationId`, `TimeLastUpdated`

### 6. WorkflowMessageSecurity
- **Deskripsi:** Mengelola pengaturan keamanan untuk pesan-pesan alur kerja, menentukan hak akses berdasarkan grup alur kerja dan pengguna.
- **Primary Keys:**
  - `AddressNumber [PK1]`
  - `WorkflowGroup [PK2]`
  - `WorkflowUser [PK3]`
  - `MailBoxDesignator [PK4]`
- **Atribut Penting:**
  - `Userld`, `WorkStationId`, `DateUpdated`
  - `TimeOfDay`, `Programid`

### 7. JDEMMultiLevelMessage
- **Deskripsi:** Menyimpan pesan yang mungkin memiliki struktur bertingkat atau hierarkis, seperti pesan berantai atau balasan.
- **Primary Keys:**
  - `KeyValueSerialNumber [PK1]`
  - `KeyValueSerialNumber [PK2]` (Composite key dari dua komponen KeyValueSerialNumber)
- **Atribut Penting:**
  - `PPATBriefMessage`, `DateTickler`, `LevelIndented`
  - `AddressNumber`, `AddressNumberParent`
  - `TemplateSubstitutionValues`, `TemplateID`, `FormID`
  - `ApplicationID`, `Version`, `FunctionName`
  - `SourceLineNumber`

## Hubungan Antar Entitas:

### 1. PPATMessageControlFile (1) --- (M) PPATMessageDetailFile
- Satu `PPATMessageControlFile` dapat memiliki banyak `PPATMessageDetailFile`.
- Terhubung melalui `KeyValueSerialNumber`.

### 2. AddressBookMaster (1) --- (M) PPATMessageControlFile
- Satu entri di `AddressBookMaster` dapat terkait dengan banyak `PPATMessageControlFile`.
- Terhubung melalui `AddressNumber`.

### 3. JDEMMultiLevelMessage (1) --- (M) PPATMessageControlFile
- Satu `JDEMMultiLevelMessage` dapat memiliki banyak `PPATMessageControlFile`.
- Terhubung melalui `KeyValueSerialNumber`.

### 4. AddressBookMaster (1) --- (M) JDEMMailFilters
- Satu entri di `AddressBookMaster` dapat memiliki banyak `JDEMMailFilters`.
- Terhubung melalui `AddressNumber` (ke `AddressNumberParent` dan `AddressNumber` di `JDEMMailFilters`).

### 5. AddressBookMaster (1) --- (M) TimeLogLedgerFile
- Satu entri di `AddressBookMaster` dapat memiliki banyak `TimeLogLedgerFile`.
- Terhubung melalui `AddressNumber`.

### 6. AddressBookMaster (1) --- (M) WorkflowMessageSecurity
- Satu entri di `AddressBookMaster` dapat memiliki banyak `WorkflowMessageSecurity`.
- Terhubung melalui `AddressNumber`.

## Fungsi dan Modul yang Disimpulkan:

### 1. Sistem Pesan Internal/Notifikasi
- Entitas `PPATMessageControlFile`, `PPATMessageDetailFile`, dan `JDEMMultiLevelMessage` menunjukkan struktur untuk menyimpan dan mengelola pesan atau notifikasi dalam sistem.
- Kemungkinan terkait dengan alur kerja atau proses bisnis tertentu (ditunjukkan oleh prefiks "PPAT").

### 2. Manajemen Buku Alamat
- `AddressBookMaster` adalah pusat untuk semua informasi kontak, yang digunakan sebagai referensi oleh modul pesan dan alur kerja untuk mengidentifikasi pengirim dan penerima.

### 3. Filter Pesan
- `JDEMMailFilters` memungkinkan konfigurasi filter untuk pesan, kemungkinan untuk mengarahkan atau membatasi visibilitas pesan berdasarkan kriteria tertentu.

### 4. Pencatatan Waktu/Log Aktivitas
- `TimeLogLedgerFile` berfungsi sebagai log untuk aktivitas berbasis waktu, yang bisa jadi melacak kapan pesan dikirim, diterima, atau diproses.

### 5. Keamanan Alur Kerja
- `WorkflowMessageSecurity` mengimplementasikan kontrol akses untuk pesan-pesan alur kerja, memastikan bahwa hanya pengguna atau grup yang berwenang yang dapat melihat atau berinteraksi dengan pesan tertentu.

## Fitur Utama Workflow & Messaging System:

### 1. Multi-Level Message Support
- Support untuk pesan berantai atau hierarkis
- Template-based messaging
- Message substitution values

### 2. Security & Access Control
- Workflow group-based security
- User-level access control
- Mailbox-based filtering

### 3. Time-Based Tracking
- Scheduled message processing
- Time logging untuk aktivitas
- Tickler-based reminders

### 4. Integration with Business Processes
- Integration dengan sales orders
- Integration dengan address book
- Template-based messaging

### 5. Audit Trail
- Complete tracking of message flow
- User activity logging
- System-level audit trail

---

---

# JDE Human Resources (HR) & Employee Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Human Resources dan Employee Management, mencakup master data karyawan, job history, turnover analysis, dan konfigurasi HR history.

## Entitas Utama:

### 1. HRHistoryConstants
- **Deskripsi:** Tabel konfigurasi untuk konstanta dan pengaturan terkait HR history.
- **Primary Keys:**
  - `DataFileLibrary [PK1]`
  - `HrSubSystem [PK2]`
- **Atribut Penting:**
  - `EmployeeHistory` - Flag untuk mengaktifkan history karyawan
  - `EmpHistoryPrompt001` hingga `EmpHistoryPrompt010` - Prompt atau flag untuk history records
  - `Userld`, `Programid`, `DateUpdated`, `WorkStationId`
  - `FlexCredits Per Dollar` - Konfigurasi kredit fleksibel
  - `UseAssignmentWindow` - Flag untuk menggunakan assignment window
  - `PayRate Source` - Sumber data gaji
  - `Step Progression RateSourc` - Sumber data progresi step
  - `Position BudgetEditSalary` - Edit budget gaji posisi
  - `Position BudgetEditFTE` - Edit budget FTE posisi
  - `Position BudgetEditHours` - Edit budget jam kerja posisi
  - `Position BudgetEditHeadct` - Edit budget headcount posisi
  - `PayRangeEdit` - Edit range gaji
  - `SalaryDefaultSource` - Sumber default gaji
  - `SalaryincreasesinProject` - Kenaikan gaji dalam proyek
  - `SalaryDisplay` - Tampilan gaji

### 2. EmployeeMasterInformation
- **Deskripsi:** Entitas pusat untuk data master karyawan yang komprehensif.
- **Primary Keys (Composite, banyak FK):**
  - `AddressNumber [PK1] [FK]` - Nomor alamat karyawan
  - `CostCenterHome [PK12] [FK]` - Cost center utama
  - `PayTypeHSP [PK3] [FK]` - Tipe pembayaran HSP
  - `JobCategory [PK13] [FK]` - Kategori pekerjaan
  - `JobStep [PK7] [FK]` - Step pekerjaan
  - `Change Reason [PK11] [FK]` - Alasan perubahan
  - `DatePayStops [PK14] [FK]` - Tanggal berhenti dibayar
  - `PayGrade [PK4] [FK]` - Grade gaji
  - `SalaryDataLocality [PK5] [FK]` - Lokasi data gaji
  - `DateEffective [PK2] [FK]` - Tanggal efektif
  - `JobType [PK6] [FK]` - Tipe pekerjaan
  - `Dataltem [PK8] [FK]` - Item data
  - `TurnoverData [PK9] [FK]` - Data turnover
  - `DateEffective On [PK10] [FK]` - Tanggal efektif pada
  - `FileName [PK15] [FK]` - Nama file
  - `Sequence NumberView [PK16] [FK]` - Nomor urut view
- **Atribut Penting:**
  - `Name Alpha` - Nama karyawan
  - `Social SecurityNumber` - Nomor jaminan sosial
  - `Employee Number Third` - Nomor karyawan ketiga
  - `SexMale Female` - Jenis kelamin
  - `Marital StatusTax` - Status pernikahan untuk pajak
  - `Marital Status TaxState` - Status pernikahan untuk pajak negara
  - `ResidencyStatus12` - Status residensi
  - `EarnincomeCredStatus` - Status kredit penghasilan
  - `NumberOfDependents` - Jumlah tanggungan
  - `EmploymentStatus` - Status kepegawaian
  - `Employee Classification` - Klasifikasi karyawan
  - `TaxArea Residence` - Area pajak tempat tinggal
  - `TaxArea Work` - Area pajak tempat kerja
  - `School DistrictCode` - Kode distrik sekolah
  - `StateHome` - Negara bagian rumah
  - `State Working` - Negara bagian kerja
  - `Location Home` - Lokasi rumah
  - `Location WorkCity` - Kota lokasi kerja
  - `Location WorkCounty` - Kabupaten lokasi kerja
  - `CompanyHome` - Perusahaan rumah
  - `CostCenter` - Cost center
  - `Control Group` - Grup kontrol
  - `Routing CodeCheck` - Kode routing cek

### 3. EmployeeTurnoverAnalysis
- **Deskripsi:** Entitas untuk analisis turnover karyawan.
- **Primary Keys (Composite, semua FK):**
  - `Dataltem [PK1] [FK]`
  - `TurnoverData [PK2] [FK]`
  - `Change Reason [PK3] [FK]`
  - `DateEffective On [PK4] [FK]`
  - `AddressNumber [PK9] [FK]`
  - `PayTypeHSP [PK5] [FK]`
  - `PayGrade [PK6] [FK]`
  - `SalaryDataLocality [PK7] [FK]`
  - `Date Effective [PK8] [FK]`
  - `CostCenterHome [PK10] [FK]`
  - `JobCategory [PK11] [FK]`
  - `JobStep [PK12] [FK]`
  - `DatePayStops [PK13] [FK]`
  - `JobType [PK14] [FK]`
- **Atribut Penting:**
  - `EffectOn Turnover` - Efek pada turnover
  - `Userld`, `Programid`, `DateUpdated`

### 4. EmployeeJobs
- **Deskripsi:** Data pekerjaan spesifik atau saat ini untuk karyawan.
- **Primary Keys (Composite, banyak FK):**
  - `AddressNumber [PK1] [FK]`
  - `CostCenterHome [PK2] [FK]`
  - `JobCategory [PK3] [FK]`
  - `JobStep [PK4] [FK]`
  - `DatePayStops [PK5] [FK]`
  - `SalaryDataLocality [PK9] [FK]`
  - `PayGrade [PK8] [FK]`
  - `PayTypeHSP [PK7] [FK]`
  - `Change Reason [PK15] [FK]`
  - `Date Effective On [PK16] [FK]`
  - `Date Effective [PK6] [FK]`
  - `Job Type [PK10] [FK]`
  - `Dataltem [PK11] [FK]`
  - `TurnoverData [PK12] [FK]`
  - `FileName [PK13] [FK]`
  - `SequenceNumberView [PK14] [FK]`
- **Atribut Penting:**
  - `Position ID` - ID posisi
  - `PrimaryJobFlag` - Flag pekerjaan utama
  - `DatePay Starts` - Tanggal mulai dibayar
  - `Union Code` - Kode serikat
  - `RtSalary` - Rate gaji
  - `RtHourly` - Rate per jam
  - `DefaultAutoPayType` - Tipe pembayaran otomatis default
  - `ShiftCode` - Kode shift
  - `WorkersCompInsurCode` - Kode asuransi kompensasi pekerja

### 5. Multiple Employee Job History
- **Deskripsi:** Data historis berbagai penugasan pekerjaan atau perubahan karyawan.
- **Primary Keys (Composite):**
  - `AddressNumber [PK1]`
  - `CostCenterHome [PK2]`
  - `JobCategory [PK3]`
  - `JobStep [PK4]`
  - `Date PayStops [PK5]`
  - `SalaryDataLocality [PK6]`
  - `PayGrade [PK7]`
  - `PayTypeHSP [PK8]`
  - `Change Reason [PK9]`
  - `Date Effective On [PK10]`
  - `DateEffective [PK11]`
  - `JobType [PK12]`
  - `Dataltem [PK13]`
  - `TurnoverData [PK14]`
  - `FileName [PK15]`
  - `Sequence NumberView [PK16]`

### 6. HRHistory
- **Deskripsi:** Tabel history umum untuk berbagai data terkait HR.
- **Primary Keys (Composite, banyak FK):**
  - `FileName [PK1] [FK]`
  - `AddressNumber [PK2] [FK]`
  - `Dataltem [PK3] [FK]`
  - `DateEffective on [PK4] [FK]`
  - `Change Reason [PK16] [FK]`
  - `SequenceNumberView [PK5] [FK]`
  - `PayTypeHSP [PK6] [FK]`
  - `PayGrade [PK7] [FK]`
  - `SalaryDataLocality [PK8] [FK]`
  - `DateEffective [PK9] [FK]`
  - `CostCenterHome [PK10] [FK]`
  - `JobCategory [PK11] [FK]`
  - `JobStep [PK12] [FK]`
  - `Date PayStops [PK13] [FK]`
  - `JobType [PK14] [FK]`
  - `TurnoverData [PK15] [FK]`
- **Atribut Penting:**
  - `HistoryData` - Data history
  - `Userid`, `DateUpdated`, `Programid`, `WorkStationId`
  - `Numeric Value Of History` - Nilai numerik history

## Hubungan Antar Entitas:
- **EmployeeMasterInformation** adalah entitas pusat yang terhubung ke **EmployeeTurnoverAnalysis** dan **EmployeeJobs** (one-to-many).
- **EmployeeJobs** terhubung ke **Multiple Employee Job History** (one-to-many).
- **Multiple Employee Job History** terhubung ke **HRHistory** (one-to-many).
- **EmployeeTurnoverAnalysis** terhubung ke **HRHistory** (one-to-many).
- **HRHistoryConstants** adalah tabel konfigurasi standalone.

## Fitur Utama HR & Employee Management:

### 1. Comprehensive Employee Tracking
- Master data karyawan yang lengkap
- Job history tracking
- Turnover analysis
- Pay rate management

### 2. Flexible Configuration
- Configurable history tracking
- Multiple data sources
- Budget control options
- Salary progression tracking

### 3. Compliance & Reporting
- Tax area management
- Employment status tracking
- Dependent information
- Residency status

### 4. Integration Capabilities
- Integration dengan payroll system
- Integration dengan cost center management
- Integration dengan job classification system

---

# JDE Manufacturing & Asset Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Manufacturing dan Asset Management, mencakup shop floor control, work orders, asset management, dan integrasi dengan financial ledger.

## Entitas Utama:

### 1. ShopFloorControlPartsList
- **Deskripsi:** Daftar komponen atau parts yang dibutuhkan untuk work order tertentu, digunakan dalam proses shop floor control.
- **Primary Keys:**
  - `UniqueKeyIDInternal [PK1]`
  - `CategoriesWorkOrder001 [PK2] [FK]`
  - `CategoriesWorkOrder002 [PK3] [FK]`
  - `CategoriesWorkOrder003 [PK4] [FK]`
  - `DocumentOrderInvoiceE [PK5] [FK]`
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `TypeBill`
  - `FixedOrVariableQty`, `IssueTypeCode`
  - `CoproductsByproducts`, `ComponentType`
  - `ComponentNumber`, `FromPotency`, `ThruPotency`
  - `FromGrade`, `ThruGrade`
  - `CompanyKeyRelated`, `RelatedPoSoNumber`
  - `RelatedOrderType`, `RelatedPoSoLineNo`
  - `SequenceNoOperations`, `BubbleSequence`
  - `ResourcePercent`, `PercentOfScrap`
  - `ReworkPercent`, `AsisPercent`
  - `PercentCumulativePla`, `StepScrapPercent`
  - `LeadtimeOffsetDays`
  - `ComponentItemNoShort`, `ComponentItemNo2nd`, `ComponentThirdNumber`

### 2. WorkOrderMasterFile
- **Deskripsi:** Entitas pusat untuk master data Work Orders, berisi detail komprehensif tentang pekerjaan yang akan dilakukan.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1]`
  - `CategoriesWorkOrder001 [PK2] [FK]`
  - `CategoriesWorkOrder002 [PK3] [FK]`
  - `CategoriesWorkOrder003 [PK4] [FK]`
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `RelatedOrderType`, `RelatedPoSoNumber`
  - `LineNumber`, `PegToWorkOrder`, `ParentWoNumber`
  - `TypeWo`, `PriorityWo`, `Description001`, `StatusCommentWo`
  - `Company`, `CostCenter`, `CostCenterAlt`, `Location`
  - `AisleLocation`, `BinLocation`, `StatusCodeWo`
  - `DateStatusChanged`, `Subsidiary`, `AddressNumber`
  - `AddNoOriginator`, `AddressNumberManager`, `Supervisor`
  - `AssignedTo`, `AddressNumberInspector`, `NextAddressNumber`
  - Berbagai tanggal (`DateTransactionJulian`, `DateStart`, `DateRequestedJulian`, `DateWoPlanCompleted`, `DateCompletion`, `DateAssignedTo`, `DateAssignToInspector`, `PaperPrintedDate`)
  - `CategoriesWorkOrder004` hingga `CategoriesWorkOrder010`
  - `Reference1`, `Reference2Vendor`
  - `AmountOriginalDollars`, `CrewSize`, `RateDistribuOrBill`
  - `PayDeductBenefitType`, `AmtChngToOriginalD`
  - `HoursOriginal`, `HrsChngToOriginalHo`
  - `AmountActual`, `HoursActual`
  - `IdentifierShortItem`, `Identifier3rdItem`, `Identifier2ndItem`
  - `AssetItemNumber`, `UnitNumber`
  - `UnitsTransactionQty`, `UnitsQuanBackorHeld`, `UnitsQuantityCanceled`
  - `UnitsQuantityShipped`, `QuantityShippedToDate`
  - `UnitOfMeasureAsInput`, `MessageNo`
  - `BeginningHhMmSs`, `TypeBill`, `TypeRouting`
  - `WoPickListPrinted`, `PostingEdit`, `VarianceFlag`
  - `BillOfMaterialN`, `RouteSheetN`, `WoFlashMessage`
  - `WoOrderFreezeCode`, `IndentedCode`, `SequenceCode`
  - `AmtMilesOrHoursUnit`, `DateScheduledTickler`
  - `AmtProjectedOverUnder`, `PercentComplete`
  - `LeadtimeLevel`, `LeadtimeCum`, `UnacctDirectLaborHrs`
  - `Lot`, `LotPotency`, `LotGrade`
  - `CriticalRatioPriority1`, `CriticalRatioPriority2`
  - `DocumentType`, `SubledgerInactiveCode`
  - `CompanyKeyRelated`, `BillRevisionLevel`
  - `RoutingRevisionLevel`, `DrawingChange`
  - `RoutingChangeEco`, `NewPartNumberRequired`

### 3. AccountLedger
- **Deskripsi:** General Ledger, mencatat semua entri akuntansi dan transaksi keuangan.
- **Primary Keys (Composite):**
  - `CompanyKey [PK1]`
  - `DocumentType [PK2]`
  - `DocVoucherInvoiceE [PK3]`
  - `DateForGLandVoucherJULIA [PK4]`
  - `JournalEntryLineNo [PK5]`
  - `LineExtensionCode [PK6]`
  - `LedgerType [PK7] [FK]`
  - `AssetItemNumber [PK8] [FK]`
  - `AccountId [PK9] [FK]`
  - `Century [PK10] [FK]`
  - `FiscalYear1 [PK11] [FK]`
  - `FiscalQtrFutureUse [PK12] [FK]`
  - `Subledger [PK13] [FK]`
  - `SubledgerType [PK14] [FK]`
- **Atribut Penting:**
  - `GLPostedCode`, `BatchNumber`, `BatchType`
  - `DateBatchJulian`, `DateBatchSystemDateJuliA`, `BatchTime`
  - `Company`, `AcctNoInputMode`, `AccountModeGL`
  - `CostCenter`, `ObjectAccount`, `Subsidiary`
  - `PeriodNoGeneralLedge`, `CurrencyCodeFrom`
  - `CurrencyConverRateOv`, `HistoricalCurrencyConver`
  - `HistoricalDateJulian`, `AmountField`, `Units`
  - `UnitOfMeasure`, `GIClass`, `ReverseOrVoidRV`
  - `NameAlphaExplanation`, `NameRemarkExplanation`
  - `Reference1JeVouchin`, `Reference2`, `Reference3AccountReconci`
  - `DocumentPayItem`, `OriginalDocumentNo`
  - `OriginalDocumentType`, `OriginalDocPayItem`
  - `CompanyKeyPurchase`, `CompanyKeyOriginal`
  - `DocumentTypePurchase`, `AddressNumber`, `CheckNumber`
  - `DateCheckJ`, `DateCheckCleared`, `SerialTagNumber`
  - `BatchRearEndPostCode`, `ReconciledROrBlank`

### 4. AssetAccountBalancesFile
- **Deskripsi:** Informasi saldo untuk akun terkait asset, termasuk saldo awal dan posting bersih periodik.
- **Primary Keys:**
  - `AccountId [PK1]`
  - `Century [PK2]`
  - `FiscalYear1 [PK3]`
  - `FiscalQtrFutureUse [PK4]`
  - `LedgerType [PK5]`
  - `Subledger [PK6]`
  - `AssetItemNumber [PK7]`
  - `SubledgerType [PK8]`
- **Atribut Penting:**
  - `Company`, `AmtBeginningBalancePy`
  - `AmountNetPosting001` hingga `AmountNetPosting014`
  - `AmtPriorYrNetPosti`, `AmountWtd`
  - `AmtOriginalBeginBud`, `AmtProjectedOverUnder`
  - `PercentComplete`, `UnitsProjectedFinal`
  - `BudgetRequested`, `BudgetApproved`
  - `CostCenter`, `ObjectAccount`, `Subsidiary`

### 5. ShopFloorControlRoutingInstruct
- **Deskripsi:** Instruksi routing detail untuk operasi manufaktur yang terkait dengan work order.
- **Primary Keys (Composite):**
  - `DocumentOrderInvoiceE [PK1] [FK]`
  - `SequenceNoOperations [PK3]`
  - `TypeOperationCode [PK4]`
  - `AtoLineType [PK5]`
  - `ParentSegmentNumber [PK6]`
  - `ItemNumberShortKit [PK7]`
  - `CategoriesWorkOrder001 [PK8] [FK]`
  - `CategoriesWorkOrder002 [PK9] [FK]`
  - `CategoriesWorkOrder003 [PK10] [FK]`
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `TypeRouting`
  - `ItemNumber2ndKit`, `ItemNumber3rdKit`, `CostCenterAlt`
  - `LineIdentifier`, `AutoLoadDescription`, `DescriptionLine1`
  - `OperationStatusCodeWo`, `InspectionCode`
  - `TimeBasisCode`, `LaborOrMachine`, `PayPointCode`, `PayPointStatus`
  - `JobCategory`, `AddressNumber`, `CriticalRatio`, `SlackTimeRatio`
  - Berbagai tanggal (`DateTransactionJulian`, `DateRequestedJulian`, `DateStart`, `DateCompletion`)
  - `BeginningHhMmSs`, `EndingHhMmSs`
  - `ShiftCodeRequested`, `ShiftCodeStart`, `ShiftCodeCompleted`
  - `LeadtimeOverlap`, `PercentOfOverlap`, `PercentOperationalPi`, `PercentCumulativePla`
  - `NextOperation`, `CrewSize`, `MoveHours`, `QueueHours`
  - `RunMachineStandard`, `RunLaborStandard`, `SetupLaborHrsStdr`
  - `RunMachineActual`, `RunLaborActual`, `SetupLaborHoursActual`
  - `OperationShrinkage`, `UnitsTransactionQty`, `UnitsQuantityCanceled`
  - `UnitsQuantityShipped`, `UnitsQuantityMovedT`, `RatePiecework`
  - `UnitOfMeasureAsInput`

### 6. StatusHistoryFile
- **Deskripsi:** Mencatat perubahan status historis untuk equipment work orders dan assets.
- **Primary Keys:**
  - `RecordNumber [PK1]`
  - `TypeOfRec [PK2]`
  - `DateBeginningEffective [PK3]`
  - `TimeBeginning [PK4]`
  - `EquipmentWorkOrderS [PK5]`
  - `CategoriesWorkOrder001 [PK6] [FK]`
  - `CategoriesWorkOrder002 [PK7] [FK]`
  - `CategoriesWorkOrder003 [PK8] [FK]`
  - `DocumentOrderInvoiceE [PK9] [FK]`
  - `AssetItemNumber [PK10] [FK]`
- **Atribut Penting:**
  - `DateEndingEffective`, `TimeEnding`
  - `StatusHours`, `CumulativeHours`
  - `LifetimeFuelMeter`, `LifetimeHourMeter`, `LifetimeMileMeter`
  - `NameRemark`, `UserId`, `ProgramId`
  - `WorkStationId`, `DateUpdated`, `TimeLastUpdated`

### 7. AssetMasterFileDONOTDELETE
- **Deskripsi:** Master data file untuk assets, berisi detail komprehensif tentang setiap asset.
- **Primary Key:**
  - `AssetItemNumber [PK1]`
- **Atribut Penting:**
  - `Company`, `ParentNumber`, `UnitNumber`, `SerialTagNumber`
  - `SequenceNumber1`, `MajorClass`, `SubClass`
  - `ClassCode3`, `ClassCode4`, `ClassCode5`
  - `CostCenter`, `Description001`, `Description01002`, `Description01003`
  - `DescCompressed`, `DateAcquired`, `DateDisposal`
  - `EquipmentStatus`, `NewOrUsedOnAcquisit`
  - `AmtEstSalvageVa`, `AmountReplacementCost`
  - `AmtLastYearsReplace`, `AssetCostAcctCostCen`
  - `AssetCostAcctObject`, `AssetCostAcctSubsid`
  - `AccumDepreAcctCc`, `AccumDepreAcctObj`, `AccumDepreAcctSub`
  - `DepreciationExpenseCc`, `DepreciationExpenseObj`, `DepreciaExpenseSubsid`
  - `AssetRevenueCostCntr`, `AssetRevenueObject`, `AssetRevenueSubsidiary`
  - `AssetItemCurrentQuan`, `AssetItemOrigQuan`
  - `TaxEntity`, `AmtInvTaxCrYtd`, `AmtInvTaxCrPye`
  - `FinancingMethod`, `ItcOwnedFlag`, `PurchaseOption`
  - `AmtPurchaseOptionPric`, `PurOptionCreditPercen`
  - `AmtPurchaseOptionMaxi`, `AddressNumberLessor`
  - `DateContract`, `DateExpiredJulian`, `AmountMonthlyPayment`
  - `NameRemark`, `NameRemarksLine2`
  - `InsurancePolicyNumber`, `InsuranceCompany`
  - `PolicyRenewalMonth`, `AmountInsurancePremium`
  - `AmountInsuranceValue`, `InsuranceValueIndex`
  - `UserId`, `DtLastChanged`

## Hubungan Antar Entitas:
- **WorkOrderMasterFile** adalah entitas pusat yang terhubung ke **ShopFloorControlPartsList**, **ShopFloorControlRoutingInstruct**, dan **StatusHistoryFile**.
- **StatusHistoryFile** terhubung ke **AssetMasterFileDONOTDELETE** melalui `AssetItemNumber`.
- **AccountLedger** terhubung ke berbagai dimensi keuangan dan potensial terhubung ke **AssetAccountBalancesFile**.

## Fitur Utama Manufacturing & Asset Management:

### 1. Comprehensive Work Order Management
- Detailed work order tracking
- Parts list management
- Routing instructions
- Status history tracking

### 2. Asset Lifecycle Management
- Asset master data
- Depreciation tracking
- Insurance management
- Maintenance history

### 3. Financial Integration
- GL posting integration
- Asset account balances
- Cost tracking
- Revenue tracking

### 4. Manufacturing Operations
- Shop floor control
- Capacity planning
- Resource allocation
- Quality control integration

---

---

# JDE Forecasting & Item Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Forecasting dan Item Management, mencakup master data item, data item per cabang, ringkasan dan detail perkiraan, serta harga perkiraan.

## Entitas Utama:

### 1. Item Master
- **Deskripsi:** Entitas pusat untuk mendefinisikan item dalam sistem.
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `DescriptionLine1`, `DescriptionLine2`
  - `SearchText`, `SearchTextCompressed`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchasingReportCode10`
  - `CommodityCode`, `ProductGroupFrom`, `DispatchGrp`

### 2. Item BranchFile
- **Deskripsi:** Menyimpan data item spesifik untuk setiap cabang atau lokasi.
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchasingReportCode10`
  - `CommodityCode`, `ProductGroupFrom`, `DispatchGrp`
  - `PrimaryLastVendorNo`, `AddressNumberPlanner`
  - `Buyer`
  - `GICategory`, `CountryOfOrigin`, `ReorderPointInput`

### 3. CategoryCodeKeyPositionFile
- **Deskripsi:** Mendefinisikan struktur dan posisi untuk berbagai kode kategori yang digunakan dalam sistem, terutama terkait dengan perkiraan.
- **Primary Key:**
  - `VersionKeyDefinition [PK1]`
- **Atribut Penting:**
  - `KeyPostionCode001` hingga `KeyPostionCode018` (dan seterusnya)

### 4. ForecastSummaryFile
- **Deskripsi:** Menyimpan data perkiraan yang diringkas pada berbagai tingkat agregasi.
- **Primary Keys:**
  - `VersionKeyDefinition [PK1] [FK]`
  - `ForecastType [PK2]`
  - `KeyValueCategoryCodes001` hingga `KeyValueCategoryCodes010 [PK3-PK12]`
  - `Company [PK13]`
  - `IdentifierShortItem [PK14]`
  - `AddressNumber [PK15]`
  - `DateRequestedJulian [PK16]`
- **Atribut Penting:**
  - `UnitsTransactionQty`

### 5. ForecastSummaryWorkFile
- **Deskripsi:** Kemungkinan file sementara atau perantara untuk pemrosesan atau pelaporan ringkasan perkiraan.
- **Primary Keys:**
  - `IdentifierShortItem [PK1] [FK]`
  - `CostCenter [PK2]`
  - `ForecastType [PK3] [FK]`
  - `SummaryForecastKey [PK4]`
  - `VersionKeyDefinition [PK5] [FK]`
  - `KeyValueCategoryCodes001` hingga `KeyValueCategoryCodes004 [PK6-PK9] [FK]`

### 6. ForecastFile
- **Deskripsi:** Menyimpan entri perkiraan yang terperinci.
- **Primary Keys:**
  - `IdentifierShortItem [PK1] [FK]`
  - `CostCenter [PK2] [FK]`
  - `DateRequestedJulian [PK3]`
  - `AddressNumber [PK4] [FK]`
  - `ForecastType [PK5] [FK]`
  - `CalendarYear [PK6]`
  - `EffectiveFromDate [PK7] [FK]`
  - `EffectiveThruDate [PK8] [FK]`
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `UnitsTransactionQty`, `AmountExtendedPrice`
  - `ForecastAmount`, `ForecastQuantity`
  - `OrderType`, `BypassForcingYN`, `Revised`
  - `DateUpdated`, `Userld`, `WorkStationId`, `ProgramId`

### 7. ForecastPrices
- **Deskripsi:** Menyimpan informasi harga yang terkait dengan perkiraan.
- **Primary Keys:**
  - `CostCenter [PK1]`
  - `IdentifierShortItem [PK2]`
  - `AddressNumber [PK3]`
  - `ForecastType [PK4]`
  - `EffectiveFromDate [PK5]`
  - `EffectiveThruDate [PK6]`
- **Atribut Penting:**
  - `AmtPricePerUnit2`
  - `DateUpdated`, `TimeOfDay`
  - `WorkStationId`, `Userld`

## Hubungan Antar Entitas:
- `CategoryCodeKeyPositionFile` memiliki hubungan satu-ke-banyak dengan `ForecastSummaryFile` melalui `VersionKeyDefinition`.
- `Item Master` memiliki hubungan satu-ke-banyak dengan `Item BranchFile`.
- `ForecastSummaryFile` memiliki hubungan satu-ke-banyak dengan `ForecastSummaryWorkFile`.
- `ForecastSummaryFile` memiliki hubungan satu-ke-banyak dengan `ForecastFile`.
- `ForecastFile` memiliki hubungan satu-ke-banyak dengan `ForecastPrices`.
- Banyak atribut Foreign Key (`[FK]`) menunjukkan keterkaitan logis antar tabel, seperti `IdentifierShortItem`, `CostCenter`, `AddressNumber`, dan `ForecastType` yang menghubungkan tabel perkiraan dengan master data terkait.

---

# JDE Fixed Assets & Asset Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Fixed Assets dan Asset Management, mencakup master data aset, saldo akun aset, riwayat lokasi, jadwal produksi, dan integrasi dengan sistem keuangan.

## Entitas Utama:

### 1. FixedAssetConstants
- **Deskripsi:** Tabel konfigurasi untuk konstanta dan pengaturan terkait fixed assets.
- **Primary Key:**
  - `SupplementalDataCategory [PK1]`
- **Atribut Penting:**
  - `-Key Data` (header untuk bagian key data)

### 2. CompanyConstants
- **Deskripsi:** Tabel konfigurasi untuk pengaturan perusahaan yang komprehensif.
- **Primary Key:**
  - `Company [PK1]`
- **Atribut Penting:**
  - Berbagai atribut terkait pengaturan perusahaan, tahun fiskal, konversi mata uang, kompensasi pekerja
  - Flag akuntansi, metode aging (misalnya `AgingDaysARCurrent`, `AgingDaysAR001` hingga `AgingDaysAR007`)
  - Interface buku alamat, ID pengguna/program

### 3. DefaultAccountingConstants
- **Deskripsi:** Konfigurasi default untuk akuntansi aset.
- **Primary Keys (Composite, banyak FK):**
  - `Company [PK1] [FK]`
  - `AssetCostAcctObjectId [PK2] [FK]`
  - `AssetAcctSubsidiaryDe [PK3] [FK]`
  - `AssetItemNumber [PK4] [FK]`
  - `LedgerType [PK5] [FK]`
  - `SupplementalDataCategory [PK6] [FK]`
  - `DepreciationCategoryCode [PK7] [FK]`
- **Atribut Penting:**
  - `MajorClass`, `SubClass`
  - Berbagai `AccumDepreAcct` dan `DepreciationExpense` accounts
  - `AssetRevenue` accounts
  - Audit trail (`DtLastChanged`, `UserId`, `ProgramId`, `DateUpdated`, `WorkStationId`, `TimeLastUpdated`)

### 4. AssetMasterFile
- **Deskripsi:** Master data untuk aset, berisi detail komprehensif tentang setiap aset.
- **Primary Keys:**
  - `AssetItemNumber [PK1]`
  - `SupplementalDataCategory [PK8] [FK]`
  - `DepreciationCategoryCode [PK9] [FK]`
- **Atribut Penting:**
  - `ParentNumber`, `SerialTagNumber`, `UnitNumber`
  - `MajorClass`, `SubClass`, `ClassCode` (3-10)
  - `CostCenter`, berbagai `Description` fields
  - `DateAcquired`, `DateDisposal`, `EquipmentStatus`
  - Biaya dan depresiasi (`AmountReplacementCost`, `AccumDepreAcctCc`)
  - Informasi pajak, pembiayaan, asuransi
  - `CategoryCodeFA0` hingga `CategoryCodeFA9`

### 5. AssetAccountBalancesFile
- **Deskripsi:** Informasi saldo untuk akun terkait aset.
- **Primary Keys:**
  - `AccountId [PK1]`
  - `Century [PK2]`
  - `FiscalYear1 [PK3]`
  - `FiscalQtrFutureUse [PK4]`
  - `LedgerType [PK5] [FK]`
  - `Subledger [PK6]`
  - `Company [PK13] [FK]`
  - `AssetItemNumber [PK7] [FK]`
  - `SubledgerType [PK8]`
  - `SupplementalDataCategory [PK9] [FK]`
  - `DepreciationCategoryCode [PK10] [FK]`
  - `AssetCostAcctObjectId [PK11] [FK]`
  - `AssetAcctSubsidiaryDe [PK12] [FK]`
- **Atribut Penting:**
  - `AmountNetPosting001` hingga `AmountNetPosting014`
  - Saldo awal, informasi budget
  - `CostCenter`, `ObjectAccount`, `Subsidiary`
  - `LifeMonths`, detail metode depresiasi

### 6. ParentHistory
- **Deskripsi:** Riwayat hubungan parent-child untuk aset.
- **Primary Keys (Composite, semua FK):**
  - `AssetItemNumber [PK1] [FK]`
  - `ParentNumber [PK2]`
  - `DateBeginningEffective [PK3]`
  - `DateEndingEffective [PK4]`
  - `SupplementalDataCategory [PK5] [FK]`
  - `DepreciationCategoryCode [PK6] [FK]`
  - `Company [PK7] [FK]`
  - `AssetCostAcctObjectId [PK8] [FK]`
  - `AssetAcctSubsidiaryDe [PK9] [FK]`
  - `LedgerType [PK10] [FK]`
- **Atribut Penting:**
  - `DateUpdated`, `UserId`, `ProgramId`

### 7. LocationTrackingTable
- **Deskripsi:** Pelacakan lokasi aset berdasarkan waktu.
- **Primary Keys (Composite, banyak FK):**
  - `AssetItemNumber [PK9] [FK]`
  - `TransferNumber [PK1]`
  - `NextNumberValue [PK2]`
  - `SupplementalDataCategory [PK3] [FK]`
  - `DepreciationCategoryCode [PK4] [FK]`
  - `Company [PK5] [FK]`
  - `AssetCostAcctObjectId [PK6] [FK]`
  - `AssetAcctSubsidiaryDe [PK7] [FK]`
  - `LedgerType [PK8] [FK]`
- **Atribut Penting:**
  - `LocationHistorSched`, `CostCenterLocation`
  - `DateBeginningEffective`, `DateEnding`
  - `NameRemark`, `Quantity`, `EquipmentStatus`
  - Pembacaan meter, atribut lokasi spesifik
  - `AisleLocation`, `BinLocation`

### 8. ProductionScheduleMasterFile
- **Deskripsi:** Jadwal produksi untuk aset.
- **Primary Keys:**
  - `AssetItemNumber [PK1] [FK]`
  - `SupplementalDataCategory [PK2] [FK]`
  - `DepreciationCategoryCode [PK3] [FK]`
  - `Company [PK4]`
  - `AssetCostAcctObjectId [PK5]`
  - `AssetAcctSubsidiaryDe [PK6]`
  - `LedgerType [PK7]`
- **Atribut Penting:**
  - `ScheduleMethod`, `Description001`, `UnitOfMeasure`
  - Berbagai unit produksi (`UnitsCurrentMoProduct`, `UnitsProducedPriorYr`, `UnitsProducedYrToDate`, `UnitsTotal`)
  - Informasi revisi

### 9. DefaultDepreciationConstants
- **Deskripsi:** Konfigurasi default untuk depresiasi aset.
- **Primary Keys:**
  - `Company [PK1]`
  - `AssetCostAcctObjectId [PK2]`
  - `AssetAcctSubsidiaryDe [PK3]`
  - `LedgerType [PK4]`
  - `AssetItemNumber [PK5] [FK]`
  - `SupplementalDataCategory [PK6] [FK]`
  - `DepreciationCategoryCode [PK7] [FK]`
- **Atribut Penting:**
  - `DepreciationMethod`, `LifeMonths`, `DepreciationInformation`
  - `ScheduleMethodB`, `CompMethodIdOrRem`

## Hubungan Antar Entitas:
- `CompanyConstants` dan `AssetMasterFile` berfungsi sebagai hub pusat yang menghubungkan berbagai aspek manajemen aset tetap, akuntansi, pelacakan lokasi, dan penjadwalan produksi.
- Foreign keys digunakan secara ekstensif untuk membangun hubungan antar entitas, memastikan konsistensi dan integritas data di seluruh sistem.

## Fitur Utama Fixed Assets & Asset Management:

### 1. Comprehensive Asset Tracking
- Master data aset yang lengkap
- Pelacakan lokasi aset
- Riwayat parent-child relationships
- Penjadwalan produksi

### 2. Financial Integration
- Integrasi dengan sistem akuntansi
- Saldo akun aset
- Pelacakan depresiasi
- Konfigurasi default akuntansi

### 3. Location Management
- Pelacakan transfer lokasi
- Riwayat lokasi berdasarkan waktu
- Informasi lokasi detail (aisle, bin)

### 4. Production Planning
- Jadwal produksi untuk aset
- Unit produksi tracking
- Metode penjadwalan

---

---

# JDE Payroll & Establishment Constants Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Payroll dan Establishment Constants, mencakup konfigurasi umum payroll dan pengaturan spesifik establishment/cost center.

## Entitas Utama:

### 1. PayrollGeneralConstants
- **Deskripsi:** Tabel yang menyimpan konstanta dan pengaturan konfigurasi umum untuk modul Payroll JDE.
- **Primary Key:**
  - `Company [PK1]`
- **Atribut Penting:**
  - **GL Integration:** `GlInterfaceKeyGl`, `GlInterfaceAcctPayabl`
  - **Submission & Interface:** `ConsecutiveSubmission`, `PeInterfaceFlag`
  - **Work Schedule:** `WorkHoursPerDay`, `WorkDaysPerWeek`, `WorkWeeksPerYear`, `WorkHoursPerYear`
  - **Tax & Costing:** `TaxArrearage`, `CostCenterSearch`, `SubsidiarySearch`
  - **Approval & Control:** `BatchControlRequireGl`, `ManagemntApprovalInput`, `Subsidiary`
  - **Employee & Fiscal:** `ModeEmployeeNumber`, `CountryForPayroll`, `PayrollFiscalPeriod`, `PrinterfaceInvMgmt`, `FiscalYear1`
  - **Leave & Burden:** `DenominationMinimum`, `AnnualLeaveHours`, `LaborPremiumDistr`, `BurdenOverrideRule`
  - **Last Document Numbers:** `LastCheckNumberPr`, `LastBankAdviseNo`, `LastPayslipNumber`
  - **Flags & Rates:** `TipProcessingFlag`, `CanadianPayrollFlag`, `CycleControlFlag`, `InterestRateStandard`, `MaximumDeferralRate`
  - **Retirement & Exemptions:** `CompanyRetirementPlan`, `ExemptionType`
  - **Management Approvals:** `AcctPayableMgmtAppr`, `BatchControlMgmtAppr`, `AcctRecMgmtAppr`
  - **Processing & Calculation Switches:** `DbaPeriodProcessing`, `SpendingAcctControl`, `SuiCalculationSwitch`, `CalculateVDITax`
  - **System & Audit:** `Userld`, `Programid`, `DateUpdated`

### 2. EstablishmentConstantFile
- **Deskripsi:** Tabel yang mendefinisikan konstanta dan pengaturan spesifik untuk establishment atau cost center.
- **Primary Key:**
  - `CostCenter [PK1]`
- **Atribut Penting:**
  - **General Settings:** `CommonPaycycleGroup`, `EstablishmentType`, `CostCenterIdNumber`
  - **Tax & Routing:** `CountyCodeSui`, `CountyTaxIdNumber`, `RoutingCodeCheck`
  - **Effective Dates:** `DateBeginningEffective`, `DateEndingEffective`
  - **Job & Tip:** `JobCategory`, `TipAllocationMethod`, `RateTipAllocationPer`
  - **Wage & Burden:** `AverageDaysPerMonth`, `MinWageRate`, `DenominationMinimum`, `BurdenDistrRule`, `StMnimumWage`
  - **System & Audit:** `Userld`, `Programid`, `DateUpdated`

## Hubungan Antar Entitas:
- `PayrollGeneralConstants` dan `EstablishmentConstantFile` bekerja bersama untuk mengkonfigurasi sistem payroll
- `PayrollGeneralConstants` mengatur pengaturan tingkat perusahaan
- `EstablishmentConstantFile` mengatur pengaturan tingkat cost center/establishment

---

# JDE General Ledger (GL) & Financial Master Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul General Ledger (GL) dan master data keuangan terkait, mencakup pola fiskal, konstanta perusahaan, buku alamat, master pusat biaya, master akun, ledger akun, file referensi chart of accounts, catatan kontrol batch, dan saldo akun.

## Entitas Utama:

### 1. DateFiscalPatterns
- **Deskripsi:** Mendefinisikan pola tanggal fiskal dan periode akuntansi.
- **Primary Keys:**
  - `FiscalDatePattern [PK1]`
  - `Datefiscalyearbeginsj [PK2]`
  - `FiscalQtrFutureUse [PK3]`
- **Atribut Penting:**
  - `FiscalYear1`
  - `DateEndofPeriod01Ju` hingga `DateEndofPeriod14` (tanggal akhir periode fiskal)
  - `DatePatternType`

### 2. CompanyConstants
- **Deskripsi:** Menyimpan konstanta dan pengaturan konfigurasi tingkat perusahaan.
- **Primary Key:**
  - `Company [PK1]`
- **Atribut Penting:**
  - `Name`, `AlternateCompanyName`
  - `Datefiscalyearbeginsj [FK]` (terkait dengan `DateFiscalPatterns`)
  - `PeriodNumberCurrent`
  - `CurrencyConverYNAR`
  - Atribut terkait pajak (`BookToTax`, `TaxYearBeginMonth`)
  - `AddressBookInterface`

### 3. AddressBookMaster
- **Deskripsi:** Master data untuk semua alamat dan informasi kontak dalam sistem.
- **Primary Key:**
  - `AddressNumber [PK1]`
- **Atribut Penting:**
  - `NameAlpha`, `DescripCompressed`
  - `CostCenter`
  - Berbagai `AddressType` (misalnya, `AddressType1` hingga `AddressType5`, `AddressTypePayables`, `AddressTypeReceivables`, `AddressTypeEmployee`)
  - Atribut terkait pajak (`TaxId`, `TaxDeductionCodes`, `DistributeTaxCode`, `TaxOrDedCompStat`)

### 4. CostCenterMaster
- **Deskripsi:** Master data untuk pusat biaya, mendefinisikan unit organisasi dan akuntansi.
- **Primary Key:**
  - `CostCenter [PK1]`
- **Atribut Penting:**
  - `CostCenterType`, `DescripCompressed`
  - `Company [FK]`, `AddressNumber [FK]`
  - Berbagai `CategoryCodeCostCt` dan `CategoryCodeCostCenter` untuk klasifikasi.
  - Atribut terkait pajak (`TaxArea`, `TaxDeductionCodes`, `TaxOrDedCompStat`).
  - Atribut akuntansi dan alokasi (`GlBankAccount`, `AllocationLevel`, `LaborLoadingMethod`).

### 5. AccountMaster
- **Deskripsi:** Master data untuk Chart of Accounts (COA), mendefinisikan akun GL.
- **Primary Key:**
  - `Accountld [PK1]`
- **Atribut Penting:**
  - `Company [FK]`, `CostCenter [FK]`, `ObjectAccount [FK]`, `Subsidiary`
  - `Description001`
  - `LevelOfDetailAcctCde`
  - `CurrencyCodeFrom`
  - Berbagai `CategoryCodeG` untuk klasifikasi akun.

### 6. AccountLedger
- **Deskripsi:** Tabel ledger utama yang menyimpan semua transaksi akuntansi (General Ledger).
- **Primary Keys:**
  - `CompanyKey [PK1]`
  - `DocumentType [PK2]`
  - `DocVoucherInvoiceE [PK3]`
  - `DateForGLandVoucherJULIA [PK4]`
  - `JournalEntryLineNo [PK5]`
  - `LedgerType [PK6] [FK]`
  - `LineExtensionCode [PK7]`
- **Atribut Penting:**
  - `GLPostedCode`
  - `BatchNumber [FK]`, `BatchType [FK]`
  - `Accountid [FK]`, `CostCenter`, `ObjectAccount`, `Subsidiary`
  - `Subledger [FK]`, `SubledgerType [FK]`
  - `AmountField`, `Units`, `UnitOfMeasure`
  - Informasi tanggal dan periode fiskal (`DateBatchJulian`, `PeriodNoGeneralLedge`, `Century`, `FiscalYear1`)
  - Informasi mata uang (`CurrencyCodeFrom`, `CurrencyConverRateOv`)

### 7. ChartofAccountsReferenceFile
- **Deskripsi:** Menyediakan informasi referensi tambahan untuk akun dalam Chart of Accounts.
- **Primary Keys:**
  - `ObjectAccount [PK1]`
  - `Company [PK2]`
- **Atribut Penting:**
  - `Description001`
  - `LevelOfDetallAcctCde`

### 8. BatchControlRecords
- **Deskripsi:** Menyimpan informasi kontrol untuk batch transaksi yang diproses dalam sistem.
- **Primary Keys:**
  - `BatchType [PK1]`
  - `BatchNumber [PK2]`
- **Atribut Penting:**
  - `BatchStatus`, `BatchApprovedForPost`
  - `AmountBatchExpected`, `AmountEntered`
  - `NoOfDocumentsExpected`

### 9. AccountBalances
- **Deskripsi:** Menyimpan saldo akun yang diringkas untuk berbagai periode fiskal.
- **Primary Keys:**
  - `Accountid [PK1]`
  - `Century [PK2]`
  - `FiscalYear1 [PK3]`
  - `FiscalQtrFutureUse [PK4]`
  - `LedgerType [PK5]`
  - `Subledger [PK6]`
  - `SubledgerType [PK7]`
  - `CurrencyCodeFrom [PK8]`
- **Atribut Penting:**
  - `Company`
  - `AmtBeginningBalancePy`
  - `AmountNetPosting001` hingga `AmountNetPosting006`

## Hubungan Antar Entitas Utama:
- **DateFiscalPatterns** terkait dengan **CompanyConstants** (mendefinisikan pola fiskal perusahaan).
- **CompanyConstants** adalah entitas pusat yang terkait dengan **AddressBookMaster**, **CostCenterMaster**, **AccountMaster**, **AccountLedger**, **ChartofAccountsReferenceFile**, dan **AccountBalances**.
- **AddressBookMaster** terkait dengan **CostCenterMaster** dan **AccountLedger**.
- **CostCenterMaster** terkait dengan **AccountMaster** dan **AccountLedger**.
- **AccountMaster** terkait dengan **AccountLedger**, **ChartofAccountsReferenceFile**, dan **AccountBalances**.
- **AccountLedger** adalah ledger transaksi utama yang terkait dengan **BatchControlRecords** (untuk kontrol batch) dan mereferensikan banyak master data lainnya seperti Company, Account, Cost Center, Subledger, dan informasi fiskal/mata uang.
- **BatchControlRecords** mengelola batch transaksi yang masuk ke **AccountLedger**.
- **AccountBalances** menyimpan ringkasan saldo berdasarkan Account, periode fiskal, ledger type, subledger, dan mata uang.

---

---

# JDE Inventory Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Inventory Management, mencakup master data item, biaya item, lokasi inventaris, manajemen lot, dan konstanta inventaris.

## Entitas Utama:

### 1. ItemMaster
- **Deskripsi:** Entitas pusat untuk mendefinisikan item dalam sistem.
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `DescriptionLine1`, `DescriptionLine2`
  - `SearchText`, `SearchTextCompressed`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchReportingCode10`
  - `CommodityCode`, `ProductGroupFrom`, `DispatchGrp`
  - `PrimaryLastVendorNo`, `AddressNumberPlanner`, `Buyer`
  - `GICategory`, `CountryOfOrigin`
  - `ReorderPointInput`, `ReorderQuantityInput`, `ReorderQuantityMaximum`

### 2. ItemBranchFile
- **Deskripsi:** Menyimpan data item spesifik per cabang atau lokasi, termasuk informasi pelaporan penjualan dan pembelian, serta pengaturan reorder.
- **Primary Keys:**
  - `CostCenter [PK2] [FK]`
  - `SystemCode [PK6] [FK]`
  - `Lot [PK7] [FK]`
  - `IdentifierShortItem [PK8] [FK]`
  - `Location [PK9] [FK]`
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchReportingCode10`
  - `CommodityCode`, `ProductGroupFrom`, `DispatchGrp`
  - `PrimaryLastVendorNo`, `AddressNumberPlanner`, `Buyer`
  - `GICategory`, `CountryOfOrigin`
  - `ReorderPointInput`, `ReorderQuantityInput`, `ReorderQuantityMaximum`

### 3. ItemCostFile
- **Deskripsi:** Berisi informasi biaya unit untuk setiap item, termasuk detail costing dan referensi pengguna.
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `LotGrade`, `AmountUnitCost`
  - `CostingSelectionPurchasi`, `CostingSelectionInventor`
  - `UserReservedCode`, `UserReservedDate`, `UserReservedAmount`, `UserReservedNumber`, `UserReservedReference`
  - `Userld`, `Programid`, `WorkStationId`, `DateUpdated`, `TimeOfDay`

### 4. ItemLocationFile
- **Deskripsi:** Menyimpan detail kuantitas item di lokasi tertentu, termasuk status lot, tanggal penerimaan terakhir, dan berbagai status komitmen kuantitas.
- **Primary Keys:**
  - `Lot [PK1] [FK]`
  - `CostCenter [PK2] [FK]`
  - `IdentifierShortItem [PK3] [FK]`
  - `Location [PK4] [FK]`
  - `SystemCode [PK5] [FK]`
- **Atribut Penting:**
  - `PrimaryBinPS`, `GICategory`, `LotStatusCode`, `DateLastReceipt1`
  - `QtyOnHandPrimaryUn`, `QtyBackorderedInPri`, `QtyOnPurchaseOrderPr`, `QuantityOnWoReceipt`
  - `Qty1OtherPrimaryUn`, `Qty2OtherPrimaryUn`, `QtyOtherPurchasing1`
  - `QtyHardCommitted`, `QuantitySoftCommitted`, `QtyOnFutureCommit`, `WorkOrderSoftCommit`
  - `QuantityOnWorkorder`, `QtyInTranPrimaryUn`, `QtyInInspPrimaryUn`
  - `QuantityOnLoanToMa`, `QuantityInboundWareh`, `QuantityOutboundWare`

### 5. LotMaster
- **Deskripsi:** Master data untuk lot, mendefinisikan atribut spesifik lot seperti deskripsi, status, potensi, dan tanggal kedaluwarsa.
- **Primary Keys:**
  - `Lot [PK1]`
  - `CostCenter [PK2]`
  - `IdentifierShortItem [PK3]`
- **Atribut Penting:**
  - `DescriptionLot`, `LotStatusCode`
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `PrimaryLastVendorNo`, `CompanyKeyOrderNo`, `DocumentOrderInvoiceE`
  - `OrderType`, `VendorLotNumber`, `LotPotency`, `LotGrade`, `DateLayerExpiration`, `SerialNumberLot`
  - `DateUserDefinedDat001` hingga `DateUserDefinedDat004`

### 6. LocationMaster
- **Deskripsi:** Master data untuk lokasi inventaris, mendefinisikan karakteristik lokasi seperti lorong, bin, tipe penyimpanan, dan aturan penanganan.
- **Primary Keys:**
  - `CostCenter [PK1]`
  - `Location [PK2]`
- **Atribut Penting:**
  - `AisleLocation`, `BinLocation`
  - `CategoryCodeLocation003` hingga `CategoryCodeLocation010`
  - `LocationLevelOfDetail`, `StorageType`, `LocationCharacteristics`
  - `HoldCodeLocation`, `FreezeRule`, `NettableAllocatable`
  - `MinimumUtilizationPercentage`, `MinimumPickPercentage`, `CodeLocationTaxStat`
  - `MethodMove`, `PalletType`, `CartonizeFlag`, `MixContainersYN`, `ItemMultipleDates`
  - `MaximumNumberOfItems`, `StagingLocationYN`, `CodeLocationVerifica`
  - `PutawayConfirmationRequired`, `PickingConfirmationRequired`
  - `AllowPutawayYN`, `AllowPickYN`, `AllowReplenishmentYN`

### 7. ItemCostComponentAddOns
- **Deskripsi:** Menyimpan komponen biaya tambahan untuk item, termasuk berbagai faktor standar dan tarif.
- **Primary Keys:**
  - `CostCenterAlt [PK2]`
  - `CostType [PK6]`
  - `CostCenter [PK7] [FK]`
  - `SystemCode [PK8] [FK]`
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`, `LotGrade`
  - `AmtCurrentStandardUnt`, `AmtStdMfgCostSim`, `StandardCostRollup`, `AmtStdRollupSim`
  - `StandardFactorCodeFro`, `StandardFactorCodeSim`, `StandardFactorFrozen`, `StandardFactorSim`
  - `StandardRateCodeFro`, `StandardRateCodeSim`, `StandardRateFrozen`, `StandardRateSim`
  - `StandardProcessingFlag`, `Userld`, `Programid`, `WorkStationId`, `DateUpdated`

### 8. InventoryConstants
- **Deskripsi:** Tabel konfigurasi untuk konstanta umum yang mempengaruhi modul inventaris, termasuk pengaturan GL dan karakterisasi data.
- **Primary Keys:**
  - `SystemCode [PK1]`
  - `CostCenter [PK2]`
- **Atribut Penting:**
  - `GLExplanation`
  - `SymToldentifyShrtInv`, `SymToldentLongInvN`, `SymToldent3rdInvNu`, `SymToldentCustomer`
  - `DelimiterSegment`, `SeparatorLocation`
  - `NumberCharactersAis`, `NumberCharactersBin`
  - `NumberCharactersCod03` hingga `NumberCharactersCod10`
  - `JustifyAisle`, `JustifyBin`, `JustifyCode3` hingga `JustifyCode7`

## Hubungan Antar Entitas:
- **ItemLocationFile** memiliki hubungan dengan **LotMaster**, **LocationMaster**, **ItemCostFile**, dan **ItemBranchFile**
- **ItemCostFile** memiliki hubungan dengan **ItemMaster**, **ItemBranchFile**, dan **ItemCostComponentAddOns**
- **ItemMaster** memiliki hubungan dengan **ItemBranchFile**
- **ItemBranchFile** memiliki hubungan dengan **InventoryConstants**
- **LotMaster** memiliki hubungan dengan **ItemCostFile**
- **LocationMaster** memiliki hubungan dengan **ItemLocationFile**
- **ItemCostComponentAddOns** memiliki hubungan dengan **InventoryConstants**

---

# JDE General Ledger (GL) & Cost Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul General Ledger (GL) dan Cost Management, mencakup master data akun, transaksi GL, saldo akun, konstanta perusahaan dan job cost, master pusat biaya, serta riwayat pengakuan keuntungan.

## Entitas Utama:

### 1. CompanyConstants
- **Deskripsi:** Tabel konfigurasi umum yang menyimpan konstanta dan pengaturan tingkat perusahaan yang memengaruhi berbagai modul, termasuk keuangan dan pelaporan.
- **Primary Key:**
  - `Company [PK1]`
- **Atribut Penting:**
  - `Name`, `AlternateCompanyName`
  - `Datefiscalyearbeginsj`, `PeriodNumberCurrent`, `NumberOfPeriodsNormal`, `FiscalDatePattern`, `FinancialReportingYear`
  - `GlinterfaceFigPropEq` (pengaturan interface GL)
  - `BookToTax`, `TaxYearBeginMonth`, `TaxYearBeginMonthold`, `DateNewTaxYearEndJ` (terkait pajak)
  - `CurrencyConverYNAR`, `WorkersCompPremBase1`, `WorkersCompPremBase2`, `SearchTypeSecurity`
  - `UseCcFrAssetCstFlag`, `UseCcForDepreExpFlg`, `UseCcFrAccumDepreFl`, `UseCcForRevBillFlag`
  - `ComMethoditdOrRem1`, `AddressBookinterface`

### 2. CompanyConstants.JobCost
- **Deskripsi:** Tabel konstanta spesifik untuk modul Job Costing, mendefinisikan pengaturan terkait perhitungan dan pelaporan biaya proyek.
- **Primary Key:**
  - `Company [PK1] [FK]` (Foreign Key ke CompanyConstants)
- **Atribut Penting:**
  - `WeeklyFiscalDatePat`, `DateFiscalYearWeekly`, `NumberOfPeriodsWeekly`, `PeriodNumberCurrentW`
  - `DateJobCostMonthly`, `DateJobCostWeekly`
  - `FileMaintOptions`, `BudgetAuditTrail`, `ProjectionAuditTrail`
  - `JobCostProjections`, `CommitmentRelief`, `CommittedDisplay`
  - `JobCostFutureConst1`, `JobCostFutureConst2`

### 3. CostCenterMaster
- **Deskripsi:** Master data untuk pusat biaya, yang mendefinisikan unit organisasi dan akuntansi.
- **Primary Keys:**
  - `CostCenter [PK1]`
  - `Company [PK2] [FK]` (Foreign Key ke CompanyConstants)
- **Atribut Penting:**
  - `CostCenterType`, `DescripCompressed`
  - `LevelOfDetailCcCode`
  - `AddressNumber`, `AddressNumberJobAr`, `County`, `State`
  - `ModelAccountsandConsolid`
  - `Description001` hingga `Description01004`
  - Berbagai `CategoryCodeCostCt` dan `CategoryCodeCostCenter`
  - Atribut terkait pajak (`TaxArea`, `TaxEntity`, `TaxArea1`, `TaxExplanationCode1`, `TaxDeductionCodes1` hingga `TaxDeductionCodes10`, `DistributeTaxCode001`)

### 4. ExtendedJobMaster
- **Deskripsi:** Tabel yang memperluas master data pekerjaan dengan informasi terkait anggaran dan pelaporan, sering digunakan dalam konteks Job Costing.
- **Primary Key:**
  - `CostCenter [PK1]` (Foreign Key ke CostCenterMaster)
- **Atribut Penting:**
  - `BudgetStartCentury`, `BudgetStartFiscalYear`, `BudgetThruCentury`, `BudgetThruFiscalYear`
  - `ReportCodeSelection1` hingga `ReportCodeSelection3`
  - `JobCostFutureConst6` hingga `JobCostFutureConst9`

### 5. AccountMaster
- **Deskripsi:** Master data untuk semua akun dalam General Ledger, mendefinisikan struktur akun dan propertinya.
- **Primary Key:**
  - `Accountid [PK1]`
- **Atribut Penting:**
  - `Company`, `CostCenter`, `ObjectAccount`, `Subsidiary`
  - `AccountNumber3rd`, `Description001`
  - `LevelOfDetailAcctCde`, `BudgetPatternCode`, `PostingEdit`, `BillableYN`
  - `CurrencyCodeFrom`, `UnitOfMeasure`
  - `CategoryCodeGl001` hingga `CategoryCodeGl016`

### 6. AccountLedger
- **Deskripsi:** File detail General Ledger yang menyimpan semua transaksi keuangan individual.
- **Primary Keys:**
  - `CompanyKey [PK1]` (FK ke CompanyConstants)
  - `DocumentType [PK2]`
  - `DocVoucherinvoiceE [PK3]`
  - `DateForGLandVoucherJULIA [PK4]`
  - `JournalEntryLineNo [PK5]`
  - `LineExtensionCode [PK6]`
  - `Subledger [PK12] [FK]`
  - `SubledgerType [PK13] [FK]`
  - `LedgerType [PK7] [FK]`
  - `Century [PK9] [FK]`
  - `FiscalYear1 [PK10] [FK]`
  - `FiscalQtrFutureUse [PK11] [FK]`
  - `CurrencyCodeFrom [PK14] [FK]`
  - `Accountid [PK8] [FK]` (FK ke AccountMaster)
- **Atribut Penting:**
  - `GLPostedCode`, `BatchNumber`, `BatchType`, `DateBatchJulian`, `DateBatchSystemDateJuliA`, `BatchTime`
  - `Company`, `AcctNoinputMode`, `AccountModeGL`, `CostCenter`, `ObjectAccount`, `Subsidiary`
  - `PeriodNoGeneralLedge`, `CurrencyConverRateOv`, `HistoricalCurrencyConver`, `HistoricalDateJulian`
  - `AmountField`, `Units`, `UnitOfMeasure`, `GlClass`
  - `ReverseOrVoidRV`, `NameAlphaExplanation`, `NameRemarkExplanation`
  - `Reference1JeVouchin`, `Reference2`, `Reference3AccountReconci`
  - `DocumentPayItem`, `OriginalDocumentNo`, `OriginalDocumentType`, `OriginalDocPayItem`
  - `CompanyKeyPurchase`, `CompanyKeyOriginal`, `DocumentTypePurchase`, `AddressNumber`, `CheckNumber`, `DateCheckJ`

### 7. AccountBalances
- **Deskripsi:** Tabel yang menyimpan saldo akun General Ledger yang diringkas untuk periode fiskal tertentu.
- **Primary Keys:**
  - `Accountid [PK1]` (FK ke AccountMaster)
  - `Century [PK2]`
  - `FiscalYear1 [PK3]`
  - `FiscalQtrFutureUse [PK4]`
  - `LedgerType [PK5]`
  - `Subledger [PK6]`
  - `SubledgerType [PK7]`
  - `CurrencyCodeFrom [PK8]`
- **Atribut Penting:**
  - `Company`
  - `AmtBeginningBalancePy` (saldo awal periode)
  - `AmountNetPosting001` hingga `AmountNetPosting014` (posting bersih untuk setiap periode)

### 8. ProfitRecognitionHistory
- **Deskripsi:** Tabel yang mencatat riwayat pengakuan keuntungan, termasuk metode, ambang batas, anggaran, pendapatan, dan biaya aktual serta proyeksi.
- **Primary Keys:**
  - `Version [PK1]`
  - `CostCenter [PK2] [FK]` (Foreign Key ke CostCenterMaster)
  - `Subledger [PK3]`
  - `SubledgerType [PK4]`
  - `DateEffective [PK5]`
  - `TypeOfRecord [PK6]`
  - `Company [PK7] [FK]` (Foreign Key ke CompanyConstants)
- **Atribut Penting:**
  - `MethodProfitRecog`, `NextNumberValue`, `DeferredProfitRecongni`, `ProfitThresholdPercent`
  - `CostOriginalBudget`, `RevnOriginalBudget`, `CostChanges`, `RevnChanges`
  - `ActualCostToDate`, `ActualRevnToDate`
  - `CostProjectedFinal`, `CostProjectedFinalAdj`
  - `RevnProjectedFinal`, `RevnProjectedFinalAdj`
  - `StoredMaterials`, `JobToDateEarnedCost`, `JobToDateEarnedReven`, `CostEarnedPriorYr`, `RevnEarnedPriorYr`

### 9. DrawReportingMasterFile
- **Deskripsi:** File master yang kemungkinan digunakan untuk pelaporan keuangan spesifik atau proses penarikan (draws).
- **Primary Keys:** (Banyak FK yang sama dengan AccountLedger, menunjukkan hubungan kuat)
  - `DocumentType [PK1] [FK]`
  - `DocVoucherinvoiceE [PK2] [FK]`
  - `DateForGLandVoucherJULIA [PK3] [FK]`
  - `JournalEntryLineNo [PK4] [FK]`
  - `Subledger [PK12] [FK]`
  - `SubledgerType [PK13] [FK]`
  - `Accountid [PK14] [FK]`
  - `CompanyKey [PK5] [FK]`
  - `LineExtensionCode [PK6] [FK]`
  - `LedgerType [PK7] [FK]`
  - `Century [PK8] [FK]`
  - `FiscalYear1 [PK9] [FK]`
  - `FiscalQtrFutureUse [PK10] [FK]`
  - `CurrencyCodeFrom [PK11] [FK]`
- **Atribut Penting:**
  - `Company`, `CostCenter`, `Subsidiary`, `ObjectAccount`

## Hubungan Antar Entitas Utama:
- **CompanyConstants** adalah entitas pusat yang terkait dengan **CostCenterMaster**, **AccountMaster**, **AccountLedger**, **AccountBalances**, dan **ProfitRecognitionHistory**
- **CostCenterMaster** terkait dengan **ExtendedJobMaster**, **AccountMaster**, **AccountLedger**, dan **ProfitRecognitionHistory**
- **AccountMaster** terkait dengan **AccountLedger** dan **AccountBalances**
- **AccountLedger** adalah ledger transaksi utama yang terkait dengan **DrawReportingMasterFile**
- **ProfitRecognitionHistory** terkait dengan **CostCenterMaster** dan **CompanyConstants**

---

---

# JDE Object Management & System Administration Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Object Management dan System Administration, mencakup manajemen versi objek, referensi silang, status objek, informasi form, log checkout, dan penjadwalan konversi tabel.

## Entitas Utama:

### 1. ObjectLibrarianMasterTable
- **Deskripsi:** Tabel master pusat untuk semua objek yang dikelola oleh Object Librarian dalam sistem JDE.
- **Primary Key:**
  - `NameObject [PK1]`
- **Atribut Penting:**
  - `MemberDescription`, `SystemCode`, `FunctionCodeOpenSystems`, `FunctionUse`
  - `PrefixFile`, `SourceLanguage`, `AnsiYN`, `ObjectCategory`
  - `CommonLibFileYOrN`, `CopyDataWithFile`, `OmitOption`, `OptionalDataFile`
  - `Application`, `ID`, `CurrencyLogicType`, `BusinessFunctionLocation`
  - `GlobalBuildOption`, `NameTextFile`, `TypeText`, `GenericTextFutureUse`
  - `JDETextYN`, `ProcessingOptionIDEveres`, `MemberIdAlt`, `BaseMemberName`
  - `ParentDLLLibrary`, `ParentObject`, `PackageCollection`
  - `ObjectLibrarianCode01` hingga `ObjectLibrarianCode05` (kode kategori khusus Object Librarian)
  - `ProgramId`, `UserId`, `WorkStationId`, `DateUpdated`, `TimeLastUpdated`

### 2. VersionsList
- **Deskripsi:** Menyimpan informasi detail tentang berbagai versi objek atau laporan dalam sistem.
- **Primary Keys:**
  - `ProgramId [PK1]`
  - `Version [PK2]`
  - `NameObject [PK3] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)
- **Atribut Penting:**
  - `REPORT_ID`, `Version_ID`, `VersionTitle`, `UserExclusive12`
  - `UserId`, `DateLastChanged`, `DateLastExecuted`
  - `PROCESSING_OPTION_TEMPLATE_ID`, `ProcessingOptionIdentifi`, `UBEOptionCode`
  - `VERSION_LIST_MODE`, `VERSION_TEXT_ID`, `Check_Out_Status`, `Check_Out_Date`
  - `User`, `Version_Availability`, `EnvironmentName`, `MachineKey`, `ProcOptData`

### 3. ObjectLibrarianStatusDetail
- **Deskripsi:** Menyediakan informasi status terperinci untuk objek yang dikelola oleh Object Librarian, termasuk status modifikasi dan rilis.
- **Primary Keys:**
  - `NameObject [PK1] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)
  - `MachineKey [PK2]`
  - `CodePath [PK3]`
- **Atribut Penting:**
  - `EnvironmentName`, `UserId`, `DateModified`, `VersionJDE`
  - `SarNumberModify`, `StatusCodeOpenSystems`, `DevelopmentProgressCd`
  - `ModificationFlag`, `MergeOption`, `ReleaseNumber`, `ModificationComment`
  - `ProgramId`, `WorkStationId`, `DateUpdated`, `TimeLastUpdated`

### 4. CrossReferenceFieldRelationship
- **Deskripsi:** Mendetailkan hubungan referensi silang antara bidang-bidang di berbagai objek, penting untuk analisis ketergantungan.
- **Primary Keys:**
  - `NameObject [PK1] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)
  - `FileFormatName [PK2]`
  - `DataFldName [PK3]`
  - `PrimaryObject [PK4]`
  - `PrimaryAttr [PK5]`
  - `Description001 [PK6]`
  - `KeySequence [PK7]`
  - `FunctionName [PK8]`
  - `Application [PK9]`
- **Atribut Penting:**
  - `ID`

### 5. TableConversionJDEScheduler
- **Deskripsi:** Mengelola penjadwalan dan detail konversi tabel dalam sistem JDE.
- **Primary Keys:**
  - `NameObject [PK1] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)
  - `ReleaseNumber [PK2]`
- **Atribut Penting:**
  - `CnvType`, `ConversionTypeSeq`, `ProgramName`, `Version`
  - `ConversionGroup`, `UserReservedNumber`, `UserReservedReference`, `UserReservedCode`
  - `ProgramId`, `WorkStationId`, `UserId`, `DateUpdated`, `TimeLastUpdated`

### 6. FormInformationFile
- **Deskripsi:** Berisi informasi tentang form-form JDE, termasuk deskripsi dan kategori.
- **Primary Keys:**
  - `FormName [PK1]`
  - `NameObject [PK2] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)
- **Atribut Penting:**
  - `FormIdentifier`, `MemberDescription`, `FormProcessType`, `ReleaseNumber`
  - `Entry`, `Point`, `SystemCode`, `FunctionCodeOpenSystems`, `Application`, `ID`
  - `HELP_ID`, `HelpFileName`, `VersionJDE`, `ModificationFlag`, `MergeOption`
  - `CategoriesForm001` hingga `CategoriesForm005` (kategori form)
  - `UserId`, `ProgramId`, `WorkStationId`, `DateUpdated`, `TimeLastUpdated`

### 7. CheckoutLogTable
- **Deskripsi:** Mencatat aktivitas checkout objek, termasuk siapa yang melakukan checkout dan kapan.
- **Primary Keys:**
  - `UserId [PK1]`
  - `DateUpdated [PK2]`
  - `TimeLastUpdated [PK3]`
  - `NameObject [PK4] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)
- **Atribut Penting:**
  - `SubmittalStatusCode`, `ActionCode1`, `Description001`
  - `FunctionCodeOpenSystems`, `Application`, `ID`, `Descript80Characters`

### 8. CrossReferenceRelationships
- **Deskripsi:** Mendefinisikan hubungan referensi silang umum antara objek-objek.
- **Primary Key:**
  - `NameObject [PK1] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)

### 9. ObjectLibrarianObjectRelationsh
- **Deskripsi:** Mendefinisikan hubungan spesifik antara objek-objek yang dikelola oleh Object Librarian.
- **Primary Keys:**
  - `NameObject [PK1] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)
  - `FunctionCodeOpenSystems [PK2]`
  - `RelatedNameObject [PK3]`
- **Atribut Penting:**
  - `VersionJDE`, `ModificationFlag`, `MergeOption`
  - `ProgramId`, `UserId`, `WorkStationId`, `DateUpdated`, `TimeLastUpdated`

### 10. ObjectLibrarianFunctionDetail
- **Deskripsi:** Menyediakan informasi terperinci tentang fungsi-fungsi dalam Object Librarian, termasuk deskripsi dan kategori fungsi bisnis.
- **Primary Keys:**
  - `NameObject [PK1] [FK]` (merujuk ke `ObjectLibrarianMasterTable`)
  - `FunctionName [PK2]`
- **Atribut Penting:**
  - `MemberDescription`, `EVENT_DESCRIPTION_ID`, `BusinessFunctionID`
  - `DS_Template_ID`, `VersionJDE`, `ModificationFlag`, `MergeOption`
  - `BusinessFunctionCategory` hingga `BusinessFunctionCat5` (kategori fungsi bisnis)
  - `UserId`, `ProgramId`, `WorkStationId`, `DateUpdated`, `TimeLastUpdated`

## Hubungan Antar Entitas:
- **ObjectLibrarianMasterTable** adalah entitas pusat yang memiliki hubungan satu-ke-banyak dengan hampir semua tabel lain dalam diagram ini melalui atribut `NameObject`.
- **VersionsList** memiliki hubungan dengan `ObjectLibrarianMasterTable` dan dapat terkait dengan berbagai objek.
- **ObjectLibrarianObjectRelationsh** menunjukkan hubungan rekursif antar objek dalam sistem.

---

# JDE Menu Management & Navigation Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Manajemen Menu dan Navigasi, mencakup master data menu, detail pilihan menu, override teks menu, dan definisi jalur navigasi.

## Entitas Utama:

### 1. MenuMasterFile
- **Deskripsi:** Entitas master untuk definisi menu dalam sistem JDE.
- **Primary Key:**
  - `MenuIdentification [PK1]`
- **Atribut Penting:**
  - `SystemCode`: Kode sistem yang terkait dengan menu.
  - `MenuAdvancedOper`, `MenuTechnicalOperMenu`: Indikator untuk operasi menu lanjutan atau teknis.
  - `LevelOfMenu`: Tingkat hierarki menu.
  - `ClientMenuDisplayStyle`, `TexticonDisplay`, `ClientMenuType`: Pengaturan tampilan dan jenis menu.
  - `AuthorizationMask`, `JobMask`, `KnowledgeMask`, `DepartmentMask`, `FutureUseMask`: Masker untuk otorisasi dan klasifikasi.
  - `Userld`, `Programld`, `DateUpdated`, `WorkStationld`, `TimeLastUpdated`: Informasi audit dan pembaruan.

### 2. MenuSelectionsFile
- **Deskripsi:** Menyimpan detail setiap pilihan (item) yang ada dalam sebuah menu.
- **Primary Keys:**
  - `MenuIdentification [PK1] [FK]` (Kunci Asing dari `MenuMasterFile`)
  - `MenuSelection [PK2]`
- **Atribut Penting:**
  - `JobToExecute`: Pekerjaan atau program yang akan dijalankan saat pilihan menu dipilih.
  - `SelectionBatchDesignatio`: Penunjukan batch untuk pilihan.
  - `HelpStartKey`, `OptionCode`, `OptionKey`: Kunci bantuan dan kode/kunci opsi.
  - `Versionconsolidated`, `RunTimeMessage`, `MenuSelectionHighlight`: Informasi versi, pesan runtime, dan penyorotan pilihan.
  - `MenutoExecute`, `MenuSelectionType`, `MenuCountryRegionCodes`: Menu yang dieksekusi, jenis pilihan, dan kode negara/wilayah.
  - `SystemCodeApplicationOve`, `ProcessingOptionIdentifi`, `ApplicationIdentifier`, `FormIdentifier`, `IconIdentifier`: Berbagai pengidentifikasi terkait aplikasi dan UI.
  - `RunMinimized`, `SelectionConsequences`: Indikator minimalisasi dan konsekuensi pilihan.
  - `ObjectName`, `FormName`: Nama objek dan formulir yang terkait.
  - `AuthorizationMask`, `JobMask`, `KnowledgeMask`, `DepartmentMask`, `FutureUseMask`: Masker otorisasi.
  - `Userld`, `Programld`, `DateUpdated`, `WorkStationld`, `TimeLastUpdated`: Informasi audit dan pembaruan.

### 3. MenuTextOverrideFile
- **Deskripsi:** Digunakan untuk menyimpan teks override atau pengganti untuk pilihan menu, seringkali untuk tujuan lokalisasi atau kustomisasi.
- **Primary Keys:**
  - `MenuIdentification [PK1] [FK]` (Kunci Asing dari `MenuSelectionsFile`)
  - `MenuSelection [PK2] [FK]` (Kunci Asing dari `MenuSelectionsFile`)
  - `LanguagePreference [PK3]`
- **Atribut Penting:**
  - `MenuText`: Teks menu yang di-override.
  - `Userld`, `Programld`, `DateUpdated`, `WorkStationld`, `TimeLastUpdated`: Informasi audit dan pembaruan.

### 4. MenuPathFile
- **Deskripsi:** Mendefinisikan jalur navigasi atau urutan menu dalam sistem JDE.
- **Primary Keys:**
  - `MenuIdentification [PK1] [FK]` (Kunci Asing dari `MenuSelectionsFile`)
  - `MenuSelection [PK2] [FK]` (Kunci Asing dari `MenuSelectionsFile`)
  - `PathType [PK3]`
- **Atribut Penting:**
  - `Path`: Detail jalur navigasi.
  - `Userld`, `Programld`, `DateUpdated`, `WorkStationld`, `TimeLastUpdated`: Informasi audit dan pembaruan.

## Hubungan Antar Entitas:
- `MenuMasterFile` **(1:N)** `MenuSelectionsFile`: Satu menu master dapat memiliki banyak pilihan menu.
- `MenuSelectionsFile**(1:N)** `MenuTextOverrideFile`: Satu pilihan menu dapat memiliki banyak teks override (berdasarkan preferensi bahasa).
- `MenuSelectionsFile**(1:N)** `MenuPathFile`: Satu pilihan menu dapat memiliki banyak jalur navigasi (berdasarkan jenis jalur).

---

---

# JDE Data Dictionary & Metadata Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Data Dictionary dan Metadata Management, mencakup definisi item data, deskripsi, spesifikasi field, pesan kesalahan, objek media, dan smart fields.

## Entitas Utama:

### 1. DataItemMaster
- **Deskripsi:** Entitas pusat yang mendefinisikan item data dasar dalam sistem JDE. Ini adalah master data untuk semua elemen data.
- **Primary Key:**
  - `DataItem [PK1]`
- **Atribut Penting:**
  - `SystemCode`: Kode sistem tempat item data berada.
  - `SystemCodeReporting`: Kode sistem untuk tujuan pelaporan.
  - `GlossaryGroup`: Grup glosarium tempat item data dikelompokkan.
  - `UserId`, `ProgramId`, `DateUpdated`, `WorkStationId`, `TimeLastUpdated`: Atribut audit standar.

### 2. DataItemAlphaDescriptions
- **Deskripsi:** Menyimpan deskripsi tekstual (alpha descriptions) untuk item data, mendukung berbagai bahasa dan konteks tampilan.
- **Primary Keys:**
  - `DataItem [PK1] [FK]` (Foreign Key ke `DataItemMaster`)
  - `LanguagePreference [PK2]`
  - `SystemCodeReporting [PK3]`
  - `ScreenName [PK4]`
- **Atribut Penting:**
  - `DescriptionAlpha`: Deskripsi alfanumerik dari item data.
  - `DescCompressed`: Versi deskripsi yang dikompresi.
- **Hubungan:** Satu `DataItemMaster` dapat memiliki banyak `DataItemAlphaDescriptions`.

### 3. DataFieldDisplayText
- **Deskripsi:** Menyimpan teks tampilan atau judul kolom untuk field data, juga mendukung berbagai bahasa dan konteks pelaporan.
- **Primary Keys:**
  - `DataItem [PK1] [FK]` (Foreign Key ke `DataItemMaster`)
  - `LanguagePreference [PK2]`
  - `SystemCodeReporting [PK3]`
- **Atribut Penting:**
  - `ColTitle1XrefBuild`, `ColTitle2XrefBuild`, `ColTitle3XrefBuild`: Judul kolom untuk referensi silang.
  - `DescriptionRow`: Baris deskripsi.
- **Hubungan:** Satu `DataItemMaster` dapat memiliki banyak `DataFieldDisplayText` entries.

### 4. DataFieldSpecifications (OneWorl)
- **Deskripsi:** Tabel yang sangat komprehensif yang mendefinisikan spesifikasi teknis dan perilaku field data, termasuk tipe data, ukuran, aturan tampilan, aturan edit, dan integrasi dengan komponen JDE (misalnya, OneWorld, Everest).
- **Primary Key:**
  - `DataItem [PK1] [FK]` (Foreign Key ke `DataItemMaster`)
- **Atribut Penting:**
  - `DataItemClass`, `DataItemType`, `DataItemSize`, `DataFileDecimals`: Properti dasar field data.
  - `DataFieldParent`, `NumberOfArrayElements`: Untuk field yang merupakan bagian dari struktur atau array.
  - `ValueForEntryDefault`, `JustifyLeftOrRghtCde`: Nilai default dan justifikasi.
  - `DataDisplayRules`, `DataDisplayParameters`, `DataEditRules`, `DataEditOp1`, `DataEditOp2`: Aturan untuk tampilan dan validasi data.
  - `HelpTextProgram`, `HelpListProgram`: Program terkait teks bantuan.
  - `ControlType`, `SecurityFlag`, `UpperCaseOnly`, `AllowBlankEntry`: Kontrol UI dan properti validasi.
  - `DataEditRulesOW`, `EditRulesSpec1OW`, `EditRulesSpec2OW`, `DataDisplayRulesOW`, `DataDisplayParmsOW`: Aturan spesifik untuk OneWorld.
  - `DisplayBehaviorIDEverest`, `DispBusFunctionObjectName`, `EditBehaviorIDEverest`, `EditBusFuncObjectName`, `SearchFormIDEverest`, `SearchFormObjectName`, `BusinessViewIDEverest`, `BusinessViewObjectName`: Integrasi dengan modul Everest dan objek terkait.
  - `PlatformFlag`, `DataDictionaryIdentifier`, `AutoInclude`: Flag dan identifikasi tambahan.
- **Hubungan:** Satu `DataItemMaster` dapat memiliki banyak `DataFieldSpecifications`.

### 5. DataDictionaryErrorMessageInfor
- **Deskripsi:** Menyimpan informasi tentang pesan kesalahan yang terkait dengan item data tertentu.
- **Primary Key:**
  - `DataItem [PK1]`
- **Atribut Penting:**
  - `ProgramName`: Program yang menghasilkan pesan kesalahan.
  - `ErrorLevel`: Tingkat keparahan kesalahan.
  - `DataStructureTemplateID`, `DataStructureObjectName`: Identifikasi struktur data terkait.
  - `DataDictionaryIdentifier`: Identifikasi kamus data.
- **Hubungan:** Satu `DataItemMaster` dapat memiliki banyak `DataDictionaryErrorMessageInfor` entries.

### 6. MediaObjectsstorage
- **Deskripsi:** Menyimpan informasi tentang objek media (teks, gambar, objek OLE, dll.) yang terkait dengan berbagai objek JDE.
- **Primary Keys:**
  - `NameObject [PK1]`
  - `GenericTextKey [PK2]`
  - `LanguagePreference [PK3]`
- **Atribut Penting:**
  - `GenericTextProcOptions`: Opsi pemrosesan teks generik.
  - `CreatedByUser`, `DateQuestionEntered`, `TimeEnteredProg`, `RecordUpdateByUserNa`, `DateUpdated`, `TimeOfDay`, `DateEffectiveJulian1`, `DateExpiredJulian1`: Atribut audit dan waktu.
  - `PrintBeforeYN`, `GenericTextTemplateFlag`, `GenericTextFileFlag`: Flag terkait pencetakan dan tipe file.
  - `MediaObjectLengthOfText`, `MediaObjectLengthImageObjects`, `MediaObjectLengthOLEObject`, `MediaObjectLengthMiscObjects`, `MediaObjectLengthFutureObjects`, `MediaObjectVariableLengthColumn`: Panjang atau ukuran berbagai jenis objek media.
- **Hubungan:** Meskipun tidak ada FK langsung ke `DataItemMaster` yang terlihat, `NameObject` dan `GenericTextKey` kemungkinan digunakan untuk mengaitkan objek media dengan item data atau objek JDE lainnya secara logis.

### 7. DataDictionarySmartFields
- **Deskripsi:** Mendefinisikan properti "smart field", kemungkinan terkait dengan bagaimana nilai ditampilkan atau dipetakan secara cerdas.
- **Primary Key:**
  - `DataItem [PK1]`
- **Atribut Penting:**
  - `SmartFColValueBF`, `SmartFColValueMap`: Atribut terkait nilai smart field.
  - `SmartFColHeaderBF`, `SmartFColHeaderMap`: Atribut terkait header smart field.
- **Hubungan:** Satu `DataItemMaster` dapat memiliki banyak `DataDictionarySmartFields` entries.

---

# JDE Development Tools & Database Metadata Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Development Tools dan Database Metadata, mencakup manajemen objek, spesifikasi business view, template struktur data, form dan report design aid, event rules, dan metadata database.

## Entitas Utama:

### 1. ObjectLibrarianMasterTable
- **Deskripsi:** Tabel master pusat untuk semua objek yang dikelola oleh Object Librarian JDE.
- **Atribut Penting:**
  - `ObjectName`, `ObjectType`, `ObjectLibrary`, `ObjectStatus`
  - `VersionNumber`, `ObjectDescription`, `ObjectText`
  - `UserId`, `DateCreated`, `DateModified`, `WorkStationId`

### 2. BusinessViewSpecifications
- **Deskripsi:** Mendefinisikan spesifikasi untuk business view yang digunakan dalam aplikasi JDE.
- **Primary Keys:**
  - `BusinessViewName [PK1]`
  - `VersionNumber [PK2]`
- **Atribut Penting:**
  - `BusinessViewDescription`, `BusinessViewText`
  - `DataSourceName`, `DataSourceLibrary`
  - `UserId`, `DateCreated`, `DateModified`

### 3. DataStructureTemplates
- **Deskripsi:** Template untuk struktur data yang digunakan dalam aplikasi JDE.
- **Primary Keys:**
  - `TemplateName [PK1]`
  - `VersionNumber [PK2]`
- **Atribut Penting:**
  - `TemplateDescription`, `TemplateText`
  - `DataStructureType`, `NumberOfFields`
  - `UserId`, `DateCreated`, `DateModified`

### 4. FormsDesignAidSpecificationinfo
- **Deskripsi:** Spesifikasi untuk form design aid dalam JDE.
- **Primary Keys:**
  - `FormName [PK1]`
  - `VersionNumber [PK2]`
- **Atribut Penting:**
  - `FormDescription`, `FormText`
  - `FormType`, `NumberOfControls`
  - `UserId`, `DateCreated`, `DateModified`

### 5. FormsDesignAidTextinformation
- **Deskripsi:** Informasi teks untuk form design aid.
- **Primary Keys:**
  - `FormName [PK1] [FK]`
  - `TextID [PK2]`
- **Atribut Penting:**
  - `TextDescription`, `TextValue`
  - `TextType`, `LanguageCode`
  - `UserId`, `DateCreated`, `DateModified`

### 6. FormsDesignAid/SoftwareVersions
- **Deskripsi:** Informasi versi software untuk form design aid.
- **Primary Keys:**
  - `FormName [PK1] [FK]`
  - `SoftwareVersion [PK2]`
- **Atribut Penting:**
  - `VersionDescription`, `CompatibilityInfo`
  - `ReleaseDate`, `EndOfSupportDate`
  - `UserId`, `DateCreated`, `DateModified`

### 7. ReportDesignAidSpecificationinf
- **Deskripsi:** Spesifikasi untuk report design aid dalam JDE.
- **Primary Keys:**
  - `ReportName [PK1]`
  - `VersionNumber [PK2]`
- **Atribut Penting:**
  - `ReportDescription`, `ReportText`
  - `ReportType`, `NumberOfSections`
  - `UserId`, `DateCreated`, `DateModified`

### 8. ReportDesignAidTextinformation
- **Deskripsi:** Informasi teks untuk report design aid.
- **Primary Keys:**
  - `ReportName [PK1] [FK]`
  - `TextID [PK2]`
- **Atribut Penting:**
  - `TextDescription`, `TextValue`
  - `TextType`, `LanguageCode`
  - `UserId`, `DateCreated`, `DateModified`

### 9. JDEBLCBehaviorInformation
- **Deskripsi:** Informasi perilaku untuk Business Logic Components (BLC) JDE.
- **Primary Keys:**
  - `BLCName [PK1]`
  - `BehaviorType [PK2]`
- **Atribut Penting:**
  - `BehaviorDescription`, `BehaviorParameters`
  - `TriggerEvent`, `ExecutionOrder`
  - `UserId`, `DateCreated`, `DateModified`

### 10. MediaObject
- **Deskripsi:** Objek media yang digunakan dalam aplikasi JDE.
- **Primary Keys:**
  - `ObjectName [PK1]`
  - `ObjectType [PK2]`
- **Atribut Penting:**
  - `ObjectDescription`, `ObjectData`
  - `ObjectFormat`, `ObjectSize`
  - `UserId`, `DateCreated`, `DateModified`

### 11. EventRulesSpecificationTable
- **Deskripsi:** Spesifikasi untuk event rules dalam JDE.
- **Primary Keys:**
  - `EventName [PK1]`
  - `RuleID [PK2]`
- **Atribut Penting:**
  - `RuleDescription`, `RuleText`
  - `TriggerCondition`, `ActionType`
  - `UserId`, `DateCreated`, `DateModified`

### 12. EventRulesLinkTable
- **Deskripsi:** Tabel penghubung untuk event rules.
- **Primary Keys:**
  - `EventName [PK1] [FK]`
  - `RuleID [PK2] [FK]`
  - `LinkID [PK3]`
- **Atribut Penting:**
  - `LinkDescription`, `LinkType`
  - `SourceObject`, `TargetObject`
  - `UserId`, `DateCreated`, `DateModified`

### 13. PrimaryIndexHeader
- **Deskripsi:** Header untuk primary index dalam database JDE.
- **Primary Key:**
  - `TableName [PK1]`
- **Atribut Penting:**
  - `IndexName`, `IndexDescription`
  - `IndexType`, `NumberOfColumns`
  - `UserId`, `DateCreated`, `DateModified`

### 14. PrimaryIndexDetail
- **Deskripsi:** Detail untuk primary index dalam database JDE.
- **Primary Keys:**
  - `TableName [PK1] [FK]`
  - `ColumnName [PK2]`
- **Atribut Penting:**
  - `ColumnOrder`, `SortOrder`
  - `ColumnType`, `ColumnSize`
  - `UserId`, `DateCreated`, `DateModified`

### 15. TableHeader
- **Deskripsi:** Header untuk tabel dalam database JDE.
- **Primary Key:**
  - `TableName [PK1]`
- **Atribut Penting:**
  - `TableDescription`, `TableType`
  - `NumberOfColumns`, `NumberOfRows`
  - `UserId`, `DateCreated`, `DateModified`

### 16. TableColumns
- **Deskripsi:** Informasi kolom untuk tabel dalam database JDE.
- **Primary Keys:**
  - `TableName [PK1] [FK]`
  - `ColumnName [PK2]`
- **Atribut Penting:**
  - `ColumnDescription`, `ColumnType`
  - `ColumnSize`, `ColumnPrecision`
  - `IsNullable`, `DefaultValue`
  - `UserId`, `DateCreated`, `DateModified`

---

---

# JDE Human Resources (HR), Payroll, and Job Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Human Resources, Payroll, dan Job Management, mencakup master data karyawan, informasi pekerjaan, profil pajak payroll, dan data tambahan terkait. Ini memperluas informasi `EmployeeMaster Information` yang telah diperkenalkan sebelumnya, menunjukkan hubungan detailnya dengan berbagai sub-modul HR dan Payroll.

## Entitas Utama:

### 1. Address Book
- **Deskripsi:** Tabel master untuk semua alamat dalam sistem, yang menjadi dasar untuk informasi karyawan.
- **Primary Key:**
  - `AddressNumber [PK1]`
- **Hubungan:**
  - Berelasi satu-ke-banyak dengan `EmployeeMaster Information` melalui `AddressNumber`.

### 2. Organization@AddressNumberParen
- **Deskripsi:** Merepresentasikan nomor alamat organisasi induk, yang kemungkinan terkait dengan `Address Book` dan `EmployeeMaster Information`.
- **Hubungan:**
  - Hubungan implisit dengan `EmployeeMaster Information` melalui `AddressNumber`.

### 3. EmployeeMaster Information
- **Deskripsi:** Entitas pusat yang menyimpan data master karyawan yang komprehensif, termasuk informasi pribadi, pekerjaan, dan status. Tabel ini berfungsi sebagai penghubung utama yang menghubungkan berbagai data terkait HR, Payroll, dan Pekerjaan.
- **Primary Keys (Komposit, termasuk Foreign Keys):**
  - `AddressNumber [PK1] [FK]`
  - `CostCenterHome [PK12] [FK]`
  - `PayTypeHSP [PK3] [FK]`
  - `JobCategory [PK13] [FK]`
  - `JobStep [PK7] [FK]`
  - `Change Reason [PK11] [FK]`
  - `DatePayStops [PK14] [FK]`
  - `PayGrade [PK4] [FK]`
  - `SalaryDataLocality [PK5] [FK]`
  - `DateEffective [PK2] [FK]`
  - `JobType [PK6] [FK]`
  - `Dataltem [PK8] [FK]`
  - `TurnoverData [PK9] [FK]`
  - `DateEffective On [PK10] [FK]`
  - `FileName [PK15] [FK]`
  - `SequenceNumberView [PK16] [FK]`
- **Atribut Penting (Non-Key Data):**
  - `Name Alpha` - Nama karyawan
  - `Social SecurityNumber` - Nomor jaminan sosial
  - `Employee Number Third` - Nomor karyawan ketiga
  - `SexMale Female` - Jenis kelamin
  - `Marital StatusTax` - Status pernikahan untuk pajak
  - `Marital Status TaxState` - Status pernikahan untuk pajak negara
  - `ResidencyStatus12` - Status residensi
  - `EarnincomeCredStatus` - Status kredit penghasilan
  - `NumberOfDependents` - Jumlah tanggungan
  - `EmploymentStatus` - Status kepegawaian
  - `Employee Classification` - Klasifikasi karyawan
  - `TaxArea Residence` - Area pajak tempat tinggal
  - `TaxArea Work` - Area pajak tempat kerja
  - `School DistrictCode` - Kode distrik sekolah
  - `StateHome` - Negara bagian rumah
  - `State Working` - Negara bagian kerja
  - `Location Home` - Lokasi rumah
  - `Location WorkCity` - Kota lokasi kerja
  - `Location WorkCounty` - Kabupaten lokasi kerja
  - `CompanyHome` - Perusahaan rumah
  - `CostCenter` - Cost center
  - `Control Group` - Grup kontrol
  - `Routing CodeCheck` - Kode routing cek

### 4. EmployeeMaster Additionalinforma
- **Deskripsi:** Menyimpan informasi tambahan karyawan yang mungkin tidak sering diakses atau bersifat spesifik, seperti status perkawinan, negara kelahiran, dan kewarganegaraan.
- **Primary Keys:**
  - `AddressNumber [PK1]`
  - `PayTypeHSP [PK2]`
  - `PayGrade [PK3]`
  - `SalaryDataLocality [PK4]`
  - `DateEffective [PK5]`
- **Atribut Penting (Non-Key Data):**
  - `MaritalStatusActual`, `CountryBirth`, `Nationality1st`, `Nationality2nd`, `Nationality3rd`, `DataProtectionCode`, `DateDataProtection`, `DateUpdated`, `Userid`
- **Hubungan:**
  - Berelasi satu-ke-satu dengan `EmployeeMaster Information`.

### 5. PayGrade/Salary Range Table
- **Deskripsi:** Mendefinisikan rentang gaji dan tingkat pembayaran berdasarkan berbagai kriteria seperti grade, lokasi, dan jenis pekerjaan.
- **Primary Keys (Komposit, termasuk Foreign Keys):**
  - `PayGrade [PK1] [FK]`
  - `SalaryDataLocality [PK2] [FK]`
  - `PayTypeHSP [PK3] [FK]`
  - `DateEffective [PK4] [FK]`
  - `AddressNumber [PK5] [FK]`
  - `CostCenterHome [PK6] [FK]`
  - `JobCategory [PK7] [FK]`
  - `JobStep [PK8] [FK]`
  - `Change Reason [PK9] [FK]`
  - `DatePayStops [PK10] [FK]`
  - `JobType [PK11] [FK]`
  - `DataItem [PK12] [FK]`
  - `TurnoverData [PK13] [FK]`
  - `DateEffectiveOn [PK14] [FK]`
  - `FileName [PK15] [FK]`
  - `SequenceNumberView [PK16] [FK]`
- **Atribut Penting (Non-Key Data):**
  - `MinimumSalaryAmount`, `MidpointSalaryAmount`, `MaximumSalaryAmount`, `FourthQuartileAmount`, `OtherSalaryAmount`, `NameRemark`, `SourceOfSalaryData`, `PayStep`, `AmountStep`, `RangeSpreadPercent`, `Userid`, `Programid`, `DateUpdated`, `WorkStationId`
- **Hubungan:**
  - Berelasi satu-ke-banyak dengan `EmployeeMaster Information`.

### 6. PayrollTax Area Profile
- **Deskripsi:** Berisi profil pajak yang terkait dengan area kerja dan jenis pajak payroll, termasuk kode statutori dan aturan pajak.
- **Primary Keys:**
  - `TaxAreaWork [PK1]`
  - `PayrollTaxType [PK2]`
- **Atribut Penting (Non-Key Data):**
  - `DescripCompressed`, `DescriptionAlpha`, `StatutoryCode01`, `AddressNumberPayee`, `CoEmployeePaidTax`, `PrintOnPaycheckYN`, `Userid`, `Programid`, `DateUpdated`, `OccTaxWhFrequency`, `SuiReportingLevel`, `SchoolDistrictCode`, `TaxArrearageRules`, `TaxPriority`, `TaxAdjustmentLimit`, `TaxCategoryCode`, `BenefitDeductionTable`, `GenerateVoucherFlag`
- **Hubungan:**
  - Berelasi satu-ke-banyak dengan `EmployeeMaster Information`.

### 7. JobInformation
- **Deskripsi:** Mendefinisikan karakteristik pekerjaan, langkah-langkah pekerjaan, metode evaluasi, dan berbagai atribut terkait pekerjaan seperti frekuensi pembayaran dan kelompok tunjangan.
- **Primary Keys:**
  - `JobType [PK1]`
  - `JobStep [PK2]`
  - `AddressNumber [PK3]`
  - `PayGrade [PK4]`
  - `SalaryDataLocality [PK5]`
  - `PayTypeHSP [PK5]`
  - `DateEffective [PK6]`
- **Atribut Penting (Non-Key Data):**
  - `JobGroup`, `Description001`, `PayFrequency`, `JobCategoryEeo`, `WorkersCompinsurCode`, `FloatCode`, `FisaExemptYN`, `BenefitGroupCode`, `UnionCode`, `JobEvaluationMethod`, `DateJobEvaluation`, `JobEvaluationPoints`, `EvalFactorDegrees001` hingga `EvalFactorDegrees010`, `JobEvalFactorPnts001`, `JobEvalFactorPnts002`
- **Hubungan:**
  - Berelasi satu-ke-banyak dengan `EmployeeMaster Information`.
  - Berelasi satu-ke-banyak dengan `Supplemental Data`.

### 8. Supplemental Data
- **Deskripsi:** Tabel fleksibel untuk menyimpan berbagai jenis data tambahan yang terkait dengan karyawan dan pekerjaan, dikategorikan berdasarkan kode database dan jenis data.
- **Primary Keys (Komposit, termasuk Foreign Keys):**
  - `SupplementalDatabaseCode [PK1]`
  - `TypeofData [PK2]`
  - `SuppDataAlphaKey1 [PK3]`
  - `CompanyKey [PK4]`
  - `SuppDataAlphaKey2 [PK5]`
  - `CostCenter [PK6]`
  - `SuppDataNumerickey1 [PK7]`
  - `SuppDataNumericKey2 [PK8]`
  - `UserDefinedCode [PK9]`
  - `DateEffectiveRates [PK10]`
  - `AddressNumber [PK11] [FK]`
  - `RequisitionNumber [PK12] [FK]`
  - `JobStep [PK13] [FK]`
  - `PayGrade [PK14] [FK]`
  - `SalaryDataLocality [PK15] [FK]`
  - `PayTypeHSP [PK16] [FK]`
  - `JobType [PK17] [FK]`
  - `DateEffective [PK18] [FK]`
- **Atribut Penting (Non-Key Data):**
  - `UnitsTransactionQty`, `DateEndingEffective`, `AmountUserDefined`, `AmountUserDefined2`
- **Hubungan:**
  - Berelasi satu-ke-banyak dengan `EmployeeMaster Information`.
  - Berelasi satu-ke-banyak dengan `JobInformation`.
  - Berelasi satu-ke-banyak dengan `Job Supplemental Data`.

### 9. Job Supplemental Data
- **Deskripsi:** Entitas konseptual atau placeholder untuk data tambahan spesifik pekerjaan, yang terhubung ke tabel `Supplemental Data` yang lebih umum.
- **Hubungan:**
  - Berelasi satu-ke-banyak dengan `Supplemental Data`.

---

# JDE Bill of Material & Item Costing Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk manajemen Bill of Material (BOM), biaya item, dan perencanaan co-products, merinci bagaimana komponen, biaya, dan hubungan produksi dikelola.

## Entitas Utama:

### 1. BillofMaterialMasterFile
- **Deskripsi:** Tabel master untuk Bill of Material (BOM), mendefinisikan struktur produk, komponen, dan hubungan produksi.
- **Primary Keys:**
  - `TypeBill [PK1]`
  - `ItemNumberShortKit [PK2]`
  - `CostCenterAlt [PK3]`
  - `ComponentNumber [PK4]`
  - `SubstituteItemSequenceNu [PK5]`
  - `UnitsBatchQuantity [PK6]`
  - `CoproductsByproducts [PK7]`
- **Foreign Keys:**
  - `IdentifierShortitem [PK8] [FK]` (terhubung ke ItemMaster)
  - `CostCenter [PK9] [FK]` (terhubung ke CostCenterMaster)
- **Atribut Penting:**
  - `ItemNumber2ndKit`, `ItemNumber3rdKit`, `Identifier2ndItem`, `Identifierarditem` (terkait identifikasi kit/item)
  - `BranchComponent`
  - `PartialsAllowedYN`, `QtyRequiredStandard`, `UnitOfMeasure`, `UnitOfMeasureAsInput`
  - `FixedorvariableBatchSize`
  - `EffectiveFromDate`, `EffectiveThruDate`, `EffectiveFromSerialNo`, `EffectiveThruSerialNo` (periode validitas)
  - `IssueTypeCode`, `RequiredYN`, `OptionalltemKit`, `DefaultComponent`
  - `ComponentCostingMethod`, `CostMethodPurchasing`, `OrderWithYN`, `FixedOrVariableQty`
  - `ComponentType`, `FromPotency`, `ThruPotency`, `FromGrade`, `ThruGrade`
  - `SequenceNoOperations`, `BubbleSequence`, `FeaturePlannedPercent`

### 2. ItemCostComponentAddOns
- **Deskripsi:** Tabel yang menyimpan detail komponen biaya tambahan atau penyesuaian biaya untuk item, sering digunakan dalam perhitungan biaya standar atau aktual.
- **Primary Keys:** (Kombinasi FKs membentuk PK komposit)
  - `CostCenterAlt [PK2]`
  - `Location [PK3] [FK]`
  - `Lot [PK4] [FK]`
  - `LedgType [PK5] [FK]`
  - `CostType [PK6]`
  - `CostCenter [PK7] [FK]`
  - `SystemCode [PK8] [FK]`
  - `IdentifierShortitem [PK9] [FK]`
- **Foreign Keys:**
  - `Location [PK3] [FK]` (terhubung ke LocationMaster)
  - `Lot [PK4] [FK]` (terhubung ke LotMaster)
  - `LedgType [PK5] [FK]`
  - `CostCenter [PK7] [FK]` (terhubung ke CostCenterMaster)
  - `SystemCode [PK8] [FK]`
  - `IdentifierShortitem [PK9] [FK]` (terhubung ke ItemMaster)
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `LotGrade`
  - `AmtCurrentStandardUnt`, `AmtStdMfgCostSim`, `StandardCostRollup`, `AmtStdRollupSim`
  - `StandardFactorCodeFro`, `StandardFactorCodeSim`, `StandardFactorFrozen`, `StandardFactorSim`
  - `StandardRateCodeFro`, `StandardRateCodeSim`, `StandardRateFrozen`, `StandardRateSim`
  - `StandardProcessingFlag`
  - `Userid`, `Programid`, `WorkStationId`, `DateUpdated`

### 3. CoProductsPlanning/Costing Table
- **Deskripsi:** Tabel yang digunakan untuk perencanaan dan perhitungan biaya produk sampingan (co-products) dalam proses produksi.
- **Primary Keys:**
  - `CostCenterAlt [PK1]`
  - `IdentifierShortitem [PK2] [FK]`
  - `BranchComponent [PK3]`
  - `EffectiveThruDate [PK4]`
  - `ItemNumberShortKit [PK5]`
- **Foreign Keys:**
  - `IdentifierShortitem [PK2] [FK]` (terhubung ke ItemMaster)
  - `CostCenter [PK6] [FK]` (terhubung ke CostCenterMaster)
- **Atribut Penting:**
  - `FeatureCostPercent`
  - `EffectiveFromDate`
  - `FeaturePlannedPercent`
  - `Userid`, `Programid`, `WorkStationld`, `DateUpdated`, `TimeOfDay`

## Hubungan dengan Modul Lain:
- **Item Master (ItemMaster):** `BillofMaterialMasterFile`, `ItemCostComponentAddOns`, dan `CoProductsPlanning/Costing Table` memiliki hubungan kuat dengan `ItemMaster` untuk detail item dasar.
- **Item Branch (ItemBranchFile):** `ItemBranchFile` menyediakan data item spesifik per cabang yang relevan untuk perencanaan dan costing.
- **Work Center (WorkCenterMasterFile):** `WorkCenterMasterFile` menyediakan detail pusat kerja yang mungkin terkait dengan proses produksi yang menghasilkan co-products atau menggunakan BOM.
- **Cost Center (CostCenterMaster):** `CostCenterMaster` adalah master data fundamental yang digunakan oleh `BillofMaterialMasterFile`, `ItemCostComponentAddOns`, dan `CoProductsPlanning/Costing Table` untuk mengasosiasikan biaya dan perencanaan dengan pusat biaya yang relevan.

---

---

# JDE Human Capital Management - Recruitment and Applicant Management Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Human Capital Management, khususnya fokus pada proses Rekrutmen dan Manajemen Pelamar, mencakup permintaan posisi, aktivitas rekrutmen, data pelamar, dan informasi pekerjaan.

## Entitas Utama:

### 1. RequisitionInformation
- **Deskripsi:** Entitas pusat yang mendefinisikan detail permintaan posisi atau rekrutmen baru dalam sistem.
- **Primary Keys:**
  - `RequisitionNumber [PK1]`
  - `JobType [PK2]`
  - `DateEffective [PK3]`
  - `JobStep [PK4]`
  - `AddressNumber [PK5]`
  - `PayGrade [PK6]`
  - `SalaryDataLocality [PK7]`
  - `PayTypeHSP [PK8]`
- **Atribut Penting:**
  - `CostCenter`, `PositionID`, `Description001`, `FiscalYear1`, `DateRequisitioned`, `RequisitionStatus`, `TypeRequisition`, `AmountExpectedSalary`, `BudgetedFte`, `BudgetedPositionHours`, `JobCategory`, `PayGradeStep`, `DateEffectiveFrom`, `DateEffectiveThru`, `DateBeginningEffective`, `FIsaExemptYN`, `AddNoApprovedBy`, `DateApproved`, `Description01002`, `Descript240Characters`, `CategoryCodeReqn001` hingga `CategoryCodeReqn006`, `Userld`, `Programld`, `DateUpdated`, `WorkStationld`, `CostCenterHome`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `RequisitionActivity` (satu permintaan dapat memiliki banyak aktivitas).
  - Berhubungan satu-ke-banyak dengan `Supplemental Data` (melalui kunci komposit).
  - Berhubungan satu-ke-banyak dengan `JobInformation` (melalui kunci komposit).

### 2. RequisitionActivity
- **Deskripsi:** Mencatat berbagai aktivitas atau status yang terkait dengan permintaan rekrutmen tertentu, seperti tanggal ketersediaan atau status kandidat.
- **Primary Keys:**
  - `RequisitionNumber [PK1] [FK]`
  - `AddressNumber [PK2] [FK]`
  - `JobStep [PK3] [FK]`
  - `PayGrade [PK4] [FK]`
  - `SalaryDataLocality [PK5] [FK]`
  - `PayTypeHSP [PK6] [FK]`
  - `JobType [PK7] [FK]`
  - `DateEffective [PK8] [FK]`
- **Atribut Penting:**
  - `DateAvailableToBegin`, `CandidateRequisitionStat`, `CRS`, `Userld`, `Programld`, `DateUpdated`, `WorkStationld`, `UserComboGuideRequired`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `RequisitionInformation`.
  - Berhubungan banyak-ke-satu dengan `Employee Master`.
  - Berhubungan banyak-ke-satu dengan `Address Book`.
  - Berhubungan banyak-ke-satu dengan `ApplicantMaster`.

### 3. ApplicantMaster
- **Deskripsi:** Menyimpan data master yang komprehensif untuk setiap pelamar kerja, termasuk informasi pribadi dan status aplikasi.
- **Primary Keys:**
  - `AddressNumber [PK1] [FK]`
  - `JobType [PK2] [FK]`
  - `PayGrade [PK3] [FK]`
  - `SalaryDataLocality [PK4] [FK]`
  - `PayTypeHSP [PK5] [FK]`
  - `DateEffective [PK6] [FK]`
  - `JobStep [PK7] [FK]`
- **Atribut Penting:**
  - `NameAlpha`, `ApplicantStatus`, `SocialSecurityNumber`, `CostCenter`, `PositionID`, `JobCategory`, `JobCategoryEeo`, `MinorityEeo`, `SexMaleFemale`, `I9Status`, `Veteran`, `DisabledVeteran`, `Handicapped`, `CategoryCodeAplcnt005` hingga `CategoryCodeAplcnt010`, `CategoryCodeApplcnt001` hingga `CategoryCodeApplcnt010`, `DateBirth`, `DateApplication`, `DateRecruitingEnd`, `DateFirstInterview`, `DateAvailableToBegin`, `RtSalaryAsking`, `HoursAvailToWork`, `Userld`, `Programld`, `DateUpdated`, `WorkStationld`, `CostCenterHome`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `RequisitionActivity`.
  - Berhubungan banyak-ke-satu dengan `Address Book`.
  - Berhubungan banyak-ke-satu dengan `JobInformation`.
  - Berhubungan banyak-ke-satu dengan `Supplemental Data`.

### 4. JobInformation
- **Deskripsi:** Mendefinisikan informasi detail tentang jenis pekerjaan atau posisi, termasuk atribut terkait penggajian dan evaluasi.
- **Primary Keys:**
  - `JobType [PK1]`
  - `JobStep [PK2]`
  - `AddressNumber [PK3]`
  - `PayGrade [PK4]`
  - `SalaryDataLocality [PK5]`
  - `PayTypeHSP [PK5]`
  - `DateEffective [PK6]`
- **Atribut Penting:**
  - `JobGroup`, `Description001`, `PayFrequency`, `JobCategoryEeo`, `WorkersCompInsurCode`, `FloatCode`, `FlsaExemptYN`, `BenefitGroupCode`, `UnionCode`, `JobEvaluationMethod`, `DateJobEvaluation`, `JobEvaluationPoints`, `EvalFactorDegrees001` hingga `EvalFactorDegrees005`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `RequisitionInformation`.
  - Berhubungan banyak-ke-satu dengan `ApplicantMaster`.
  - Berhubungan banyak-ke-satu dengan `Supplemental Data`.

### 5. Supplemental Data
- **Deskripsi:** Tabel generik yang digunakan untuk menyimpan data tambahan atau kustom yang terkait dengan berbagai entitas dalam sistem, termasuk rekrutmen dan pelamar.
- **Primary Keys:**
  - `SupplementalDatabaseCode [PK1]`
  - `TypeofData [PK2]`
  - `SuppDataAlphaKey1 [PK3]`
  - `CompanyKey [PK4]`
  - `SuppDataAlphaKey2 [PK5]`
  - `CostCenter [PK6]`
  - `SuppDataNumericKey1 [PK7]`
  - `SuppDataNumericKey2 [PK8]`
  - `UserDefinedCode [PK9]`
  - `DateEffectiveRates [PK10]`
  - `AddressNumber [PK11] [FK]`
  - `RequisitionNumber [PK12] [FK]`
  - `JobStep [PK13] [FK]`
  - `PayGrade [PK14] [FK]`
  - `SalaryDataLocality [PK15] [FK]`
  - `PayTypeHSP [PK16] [FK]`
  - `JobType [PK17] [FK]`
  - `DateEffective [PK18] [FK]`
- **Atribut Penting:**
  - `UnitsTransactionQty`, `DateEndingEffective`, `AmountUserDefined`, `AmountUserDefined2`, `NameRemark`, `NameRemarksLine2`, `UpdatedDate`, `DaysUserDefined`, `DocumentOrderInvoiceE`, `UdcEquivalentWw`, `Userld`, `Programld`, `WorkStationld`, `DateUpdated`, `TimeOfDay`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `RequisitionInformation`.
  - Berhubungan banyak-ke-satu dengan `ApplicantMaster`.
  - Berhubungan banyak-ke-satu dengan `JobInformation`.

### 6. Address Book
- **Deskripsi:** Tabel master untuk semua alamat dalam sistem JDE, berfungsi sebagai referensi untuk entitas seperti pelamar dan aktivitas rekrutmen.
- **Primary Key:**
  - `AddressNumber [PK1]`
- **Atribut Penting:** (Tidak ada atribut non-kunci yang ditampilkan dalam diagram ini, namun ini adalah tabel master umum yang berisi detail alamat dan kontak).
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `RequisitionActivity`.
  - Berhubungan satu-ke-banyak dengan `ApplicantMaster`.

---

# JDE Purchasing, Accounts Payable, dan Inventory/Item Ledger Data Architecture

## Overview
Bagian ini berisi ringkasan arsitektur data JDE untuk modul Purchasing, Accounts Payable, dan Inventory/Item Ledger, merinci entitas yang terlibat dalam pembuatan pesanan pembelian, penerimaan barang, faktur vendor, serta dampak keuangan dan inventarisnya.

## Entitas Utama:

### 1. PurchaseOrderHeader
- **Deskripsi:** Entitas utama yang menyimpan informasi header untuk setiap pesanan pembelian.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1] [FK]`
  - `DocumentOrderInvoiceE [PK2] [FK]`
  - `OrderType [PK3] [FK]`
  - `OrderSuffix [PK4]`
- **Foreign Keys:**
  - `AddressNumber [PK5] [FK]` (ke AddressBookMaster dan SupplierMaster)
  - `TypeAddressNumber [PK6] [FK]` (ke AddressBookMaster)
- **Atribut Penting:**
  - `CostCenter`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `PurchaseOrderDetailFile` dan `PurchaseOrderReceiverFile`.
  - Berhubungan banyak-ke-satu dengan `AddressBookMaster`, `SupplierMaster`, dan `OrderAddressInformation`.

### 2. PurchaseOrderDetailFile
- **Deskripsi:** Menyimpan detail baris untuk setiap pesanan pembelian, termasuk item, kuantitas, dan harga.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1] [FK]`
  - `DocumentOrderInvoiceE [PK2] [FK]`
  - `OrderType [PK3] [FK]`
  - `OrderSuffix [PK4] [FK]`
  - `LineNumber [PK5]`
- **Foreign Keys:**
  - `AddressNumber [PK9] [FK]` (ke SupplierPrice/CatalogFile)
  - `UnitOfMeasureAsinput [PK12] [FK]` (ke SupplierPrice/CatalogFile)
  - `UnitsTransactionQty [PK13] [FK]` (ke SupplierPrice/CatalogFile)
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `PurchaseOrderHeader`.
  - Berhubungan satu-ke-banyak dengan `P.O.DetailLedgerFileFlexibleVer`.
  - Berhubungan banyak-ke-satu dengan `SupplierPrice/CatalogFile` dan `ItemMaster` (implied).

### 3. PurchaseOrderReceiverFile
- **Deskripsi:** Mencatat detail penerimaan barang atau jasa terkait pesanan pembelian.
- **Primary Keys:**
  - `MatchType [PK1]`
  - `NoOfLinesOnOrder [PK6]`
  - `DocVoucherinvoiceE [PK7]`
  - `CompanyKeyOrderNo [PK8] [FK]`
  - `DocumentOrderInvoiceE [PK9] [FK]`
  - `OrderType [PK10] [FK]`
  - `OrderSuffix [PK11] [FK]`
  - `LineNumber [PK12] [FK]`
- **Atribut Penting:**
  - `AddressNumber`, `AssociatedLine`, `WrittenBy`, `ContractNumberDistributi`, `ContractSupplementDistri`, `ContractBalancesUpdatedY`, `IdentifierShortitem`, `Identifier2nditem`, `Identifier3rditem`, `CostCenteritem`, `Location`, `Lot`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `PurchaseOrderHeader`.
  - Berhubungan satu-ke-banyak dengan `ItemLedgerFile`.

### 4. AccountsPayableLedger
- **Deskripsi:** Entitas pusat untuk transaksi hutang usaha (Accounts Payable), mencatat faktur vendor dan pembayaran.
- **Primary Keys:**
  - `CompanyKey [PK1]`
  - `DocVoucherinvoiceE [PK2]`
  - `DocumentType [PK3]`
  - `DocumentPayItem [PK4]`
  - `PayitemExtensionNumber [PK5]`
- **Foreign Keys:**
  - `LineNumber [PK10] [FK]` (ke P.O.DetailLedgerFileFlexibleVer)
  - `OrderSuffix [PK9] [FK]` (ke P.O.DetailLedgerFileFlexibleVer)
  - `CompanyKeyOrderNo [PK6] [FK]` (ke P.O.DetailLedgerFileFlexibleVer)
  - `DocumentOrderInvoiceE [PK7] [FK]` (ke P.O.DetailLedgerFileFlexibleVer)
  - `OrderType [PK8] [FK]` (ke P.O.DetailLedgerFileFlexibleVer)
- **Atribut Penting:**
  - `DocumentTypeAdjusting`, `AddressNumber`, `PayeeAddressNumber`, `AddressNumberSentTo`, `DateInvoiceJ`, `DateServiceCurrency`, `DateDueJulian`, `DateDiscountDueJulian`, `DateForGLandVoucherJULIA`, `FiscalYear1`, `Century`, `PeriodNoGeneralLedge`, `Company`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `P.O.DetailLedgerFileFlexibleVer`.
  - Berhubungan banyak-ke-satu dengan `AccountLedger` (untuk posting GL).

### 5. P.O.DetailLedgerFileFlexibleVer
- **Deskripsi:** File ledger detail untuk pesanan pembelian, sering digunakan untuk fleksibilitas pelaporan dan integrasi.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1] [FK]`
  - `DocumentOrderinvoiceE [PK2] [FK]`
  - `OrderType [PK3] [FK]`
  - `OrderSuffix [PK4] [FK]`
  - `LineNumber [PK5] [FK]`
  - `LedgerType [PK6]`
  - `NumberChangeOrder [PK7]`
  - `DateUpdated [PK8]`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `PurchaseOrderDetailFile`.
  - Berhubungan satu-ke-banyak dengan `AccountsPayableLedger`.

### 6. SupplierMaster
- **Deskripsi:** Master data untuk semua vendor atau pemasok.
- **Primary Key:**
  - `AddressNumber [PK1]`
- **Atribut Penting:**
  - `APClass`, `CostCenterApDefault`, `ObjectAcctsPayable`, `SubsidiaryAcctsPayable`, `CompanyKeyAPModel`, `DocApDefault.Je`, `DocTyApDefault.Je`, `CurrencyCodeAP`, `TaxArea2`, `TaxExemptReason2`, `HoldPaymentCode`, `TaxRateArea3Withholding`, `TaxExplCode3Withhholding`, `TaxAuthorityAp`, `PercentWithholding`, `PaymentTermsAP`, `MultipleChecksYN`, `Paymentinstrument`, `AddressNumberSentTo`, `MiscCode1`, `FloatDaysForChecks`, `SequenceForLedgrinq`, `CurrencyCodeAmounts`, `AmountVoucheredYtd`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `PurchaseOrderHeader` dan `SupplierPrice/CatalogFile`.
  - Berhubungan banyak-ke-satu dengan `AddressBookMaster`.

### 7. SupplierPrice/CatalogFile
- **Deskripsi:** Menyimpan informasi harga dan katalog item dari pemasok.
- **Primary Keys:**
  - `CostCenter [PK1]`
  - `AddressNumber [PK2]`
  - `IdentifierShortitem [PK3]`
  - `CatalogName [PK4]`
  - `CurrencyCodeFrom [PK5]`
  - `UnitOfMeasureAsinput [PK6]`
  - `UnitsTransactionQty [PK7]`
  - `DateExpiredJulian1 [PK8]`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `PurchaseOrderDetailFile`.
  - Berhubungan banyak-ke-satu dengan `ItemMaster` dan `SupplierMaster`.

### 8. OrderAddressInformation
- **Deskripsi:** Menyimpan detail alamat spesifik yang terkait dengan pesanan (misalnya, alamat pengiriman).
- **Primary Keys:**
  - `DocumentOrderinvoiceE [PK1]`
  - `OrderType [PK2]`
  - `CompanyKeyOrderNo [PK3]`
  - `TypeAddressNumber [PK4]`
- **Atribut Penting:**
  - `NameMailing`, `AddressLine1`, `AddressLine2`, `AddressLine3`, `AddressLine4`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `PurchaseOrderHeader`.
  - Berhubungan banyak-ke-satu dengan `AddressBookMaster`.

### 9. ItemMaster
- **Deskripsi:** Entitas pusat untuk mendefinisikan item dalam sistem.
- **Atribut Penting:**
  - `Identifier2nditem`, `Identifier3rditem`, `DescriptionLine1`, `DescriptionLine2`, `SearchText`, `SearchTextCompressed`, `SalesReportingCode1`, `SalesReportingCode2`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `ItemBranchFile`, `ItemLocationFile`, `SupplierPrice/CatalogFile`, dan `WorkOrderMasterFile`.

### 10. ItemBranchFile
- **Deskripsi:** Menyimpan data item spesifik per cabang atau lokasi.
- **Atribut Penting:**
  - `Identifier2nditem`, `Identifier3rditem`, `SalesReportingCode1` hingga `SalesReportingCode6`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemMaster`.

### 11. ItemLocationFile
- **Deskripsi:** Menyimpan detail kuantitas item di lokasi inventaris tertentu.
- **Atribut Penting:**
  - `PrimaryBinPS`, `GICategory`, `LotStatusCode`, `DateLastReceipt1`, `QtyOnHandPrimaryUn`, `QtyBackorderedinPri`, `QtyOnPurchaseOrderPr`, `QuantityOnWoReceipt`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemMaster`.

### 12. ItemLedgerFile
- **Deskripsi:** Mencatat semua transaksi yang mempengaruhi kuantitas dan nilai inventaris item.
- **Primary Keys:**
  - `UniqueKeyIDInternal [PK1]`
  - `OrderSuffix [PK2] [FK]`
  - `CompanyKeyOrderNo [PK3] [FK]`
  - `DocumentOrderInvoiceE [PK4] [FK]`
  - `OrderType [PK5] [FK]`
  - `LineNumber [PK6] [FK]`
- **Atribut Penting:**
  - `NoOfLinesOnOrder`, `IdentifierShortitem`, `Identifier2nditem`, `Identifier3rditem`, `CostCenter`, `Location`, `Lot`, `ParentLot`, `StorageUnitNumber`, `SequenceNumberLocati`, `TransactionLineNr`, `FromTo`, `LotMasterCardexYN`, `LotStatusCode`, `LotPotency`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `PurchaseOrderReceiverFile`.
  - Berhubungan banyak-ke-satu dengan `AccountLedger` (untuk posting GL).

### 13. AccountLedger
- **Deskripsi:** Entitas pusat untuk semua transaksi buku besar umum (General Ledger).
- **Primary Keys:**
  - `CompanyKey [PK1]`
  - `DocumentType [PK2]`
  - `DocVoucherinvoiceE [PK3]`
  - `DateForGLandVoucherJULIA [PK4]`
  - `JournalEntryLineNo [PK5]`
  - `LineExtensionCode [PK6]`
- **Foreign Keys:**
  - `OrderType [PK28] [FK]`
  - `LineNumber [PK29] [FK]`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `AccountsPayableLedger`, `ItemLedgerFile`, dan `AccountBalances`.

### 14. AccountBalances
- **Deskripsi:** Menyimpan saldo akun pada berbagai tingkat agregasi (misalnya, per periode fiskal, per kuartal).
- **Primary Keys:**
  - `Accountid [PK1]`
  - `Century [PK2]`
  - `FiscalYear1 [PK3]`
  - `FiscalQtrFutureUse [PK4]`
  - `LedgerType [PK5]`
  - `Subledger [PK6]`
  - `SubledgerType [PK7]`
  - `CurrencyCodeFrom [PK8]`
- **Atribut Penting:**
  - `Company`, `AmtBeginningBalancePy`, `AmountNetBesting001`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `AccountLedger`.

### 15. WorkOrderMasterFile
- **Deskripsi:** Master data untuk perintah kerja (Work Orders).
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1]`
  - `CategoriesWorkOrder001 [PK2] [FK]`
  - `CategoriesWorkOrder002 [PK3] [FK]`
  - `CategoriesWorkOrder003 [PK4] [FK]`
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `RelatedOrderType`, `RelatedPoSoNumber`, `LineNumber`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemMaster`.

## Ringkasan Komprehensif Arsitektur Data JDE

### Modul yang Telah Dianalisis (32 Modul Utama):

1. **Equipment Maintenance** - Manajemen pemeliharaan peralatan
2. **Financial Modules (A/R & A/P)** - Modul keuangan (Piutang & Hutang)
3. **Manufacturing & Production Planning** - Perencanaan produksi & manufaktur
4. **Address Book & Customer/Supplier Management** - Manajemen buku alamat & pelanggan/pemasok
5. **Advanced Price Adjustments** - Penyesuaian harga lanjutan
6. **Product Configuration & Sales Order Management** - Konfigurasi produk & manajemen pesanan penjualan
7. **Workflow & Messaging System** - Sistem workflow & pesan
8. **Human Resources (HR) & Employee Management** - Manajemen SDM & karyawan
9. **Manufacturing & Asset Management** - Manajemen manufaktur & aset
10. **Forecasting & Item Management** - Peramalan & manajemen item
11. **Fixed Assets & Asset Management** - Aset tetap & manajemen aset
12. **Payroll & Establishment Constants** - Penggajian & konstanta perusahaan
13. **General Ledger (GL) & Financial Master Data** - Buku besar umum & data master keuangan
14. **Inventory Management** - Manajemen inventaris
15. **General Ledger (GL) & Cost Management** - Buku besar umum & manajemen biaya
16. **Object Management & System Administration** - Manajemen objek & administrasi sistem
17. **Menu Management & Navigation** - Manajemen menu & navigasi
18. **Data Dictionary & Metadata Management** - Kamus data & manajemen metadata
19. **Development Tools & Database Metadata** - Alat pengembangan & metadata database
20. **Human Resources (HR), Payroll, and Job Management** - SDM, penggajian & manajemen pekerjaan
21. **Bill of Material & Item Costing** - Bill of material & penetapan biaya item
22. **Human Capital Management - Recruitment and Applicant Management** - Manajemen modal manusia - rekrutmen & manajemen pelamar
23. **Purchasing, Accounts Payable, dan Inventory/Item Ledger** - Pembelian, hutang dagang & buku besar inventaris/item
24. **Supplier Management & Catalog System** - Manajemen pemasok & sistem katalog
25. **Order Processing & Address Management** - Pemrosesan pesanan & manajemen alamat
26. **Financial Integration & Ledger Management** - Integrasi keuangan & manajemen buku besar
27. **Master Production Scheduling (MPS), Material Requirements Planning (MRP), Distribution Requirements Planning (DRP)** - Perencanaan produksi master, perencanaan kebutuhan material, & perencanaan kebutuhan distribusi
28. **Sales Order Management & Item Costing Integration** - Manajemen pesanan penjualan & integrasi penetapan biaya item
29. **Workflow and Messaging System Data Architecture** - Arsitektur Data Sistem Workflow dan Pesan
30. **Manufacturing Work Order Management & Shop Floor Control** - Manajemen Pesanan Kerja Manufaktur & Kontrol Lantai Produksi
31. **Work Order Management with Default Coding & Record Types** - Manajemen Pesanan Kerja dengan Pengkodean Default & Tipe Rekam
32. **JDE Data Dictionary & Metadata Management System** - Sistem Kamus Data JDE & Manajemen Metadata

### Fitur Utama yang Teridentifikasi:

#### 1. **Integrasi Keuangan Komprehensif**
- Multi-currency support
- GL posting otomatis
- Tax management
- Cost center tracking
- Budget control

#### 2. **Manajemen Inventaris Terpadu**
- Real-time stock tracking
- Lot management
- Location-based inventory
- BOM integration
- Cost tracking

#### 3. **Workflow & Approval System**
- Multi-level approvals
- Status tracking
- Audit trail
- Document management

#### 4. **Human Capital Management**
- Employee lifecycle management
- Recruitment workflow
- Payroll integration
- Performance tracking
- Compliance management

#### 5. **Manufacturing & Production**
- Work order management
- Capacity planning
- Quality control
- Cost center management
- Production scheduling

#### 6. **Supplier & Customer Management**
- Address book integration
- Price management
- Contract management
- Payment terms
- Credit management

### Kunci Implementasi:

1. **Data Consistency**: Semua modul menggunakan struktur data yang konsisten dengan primary keys dan foreign keys yang terstandarisasi
2. **Audit Trail**: Setiap transaksi memiliki tracking lengkap dengan user ID, program ID, dan timestamp
3. **Flexibility**: Penggunaan category codes dan supplemental data memungkinkan kustomisasi tanpa mengubah struktur database
4. **Scalability**: Arsitektur mendukung multi-company, multi-currency, dan multi-location operations
5. **Integration**: Semua modul terintegrasi melalui common entities seperti Address Book, Account Ledger, dan Item Master

### Best Practices:

1. **Data Integrity**: Gunakan foreign key constraints untuk memastikan referential integrity
2. **Performance**: Implementasikan indexing yang tepat pada primary keys dan foreign keys
3. **Security**: Implementasikan role-based access control berdasarkan user ID dan program ID
4. **Backup**: Lakukan backup regular untuk semua master data dan transaction data
5. **Monitoring**: Monitor performance dan implementasikan alerting untuk critical business processes

## 27. JDE Master Production Scheduling (MPS), Material Requirements Planning (MRP), Distribution Requirements Planning (DRP) Data Architecture

### Overview
Arsitektur data untuk sistem perencanaan produksi master (MPS), perencanaan kebutuhan material (MRP), dan perencanaan kebutuhan distribusi (DRP) yang terintegrasi dengan manajemen item dan cabang.

### Entitas Utama:

#### 1. Demand/SupplyInclusionRules
- **Deskripsi:** Mendefinisikan aturan untuk memasukkan permintaan dan pasokan dalam proses perencanaan.
- **Primary Keys:**
  - `ResourceVersion [PK1]`
  - `OrderType [PK2]`
  - `LineType [PK3]`
  - `StatusLine [PK4]`
- **Fitur Utama:**
  - Kontrol granular atas apa yang dimasukkan dalam perhitungan MRP
  - Dukungan untuk berbagai jenis pesanan dan status
  - Fleksibilitas dalam definisi aturan perencanaan

#### 2. ItemMaster
- **Deskripsi:** Entitas pusat untuk data item dengan atribut perencanaan.
- **Atribut Penting:**
  - `Identifier2nditem`, `Identifier3rditem`
  - `DescriptionLine1`, `DescriptionLine2`
  - `SearchText`, `SearchTextCompressed`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchasingReportCode3`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `ItemBranchFile`

#### 3. ItemBranchFile
- **Deskripsi:** Data item spesifik per cabang dengan kode pelaporan.
- **Atribut Penting:**
  - `Identifier2nditem`, `Identifier3rdItem`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchasingReportCode8`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemMaster`
  - Berhubungan satu-ke-banyak dengan `BranchRelationshipsMasterFile`, `CoProductsPlanning/CostingTable`, dan `MPS/MRP/DRPMessageFile`

#### 4. BranchRelationshipsMasterFile
- **Deskripsi:** Mendefinisikan hubungan antar cabang dan aturan transfer.
- **Primary Keys:**
  - `CostCenterAlt [PK1]`
  - `IdentifierShortItem [PK2] [FK]`
  - `BranchComponent [PK3]`
  - `GenericReportCode [PK4]`
  - `BranchLevel [PK5]`
  - `BranchSequence [PK6]`
  - `CostCenter [PK7] [FK]`
  - `Location [PK8] [FK]`
  - `Lot [PK9] [FK]`
  - `LedgType [PK10] [FK]`
- **Atribut Penting:**
  - `ExcludeIncludeCode`, `AvailabilityCheck`
  - `EffectiveFromDate`, `EffectiveThruDate`
  - `TransitLeadtime`, `SourcePercent`
  - `PercentToFillA`, `PercentMarkup`, `FixedMarkupAmount`
  - `UnitExtended`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemBranchFile`

#### 5. MPS/MRP/DRPMessageFile
- **Deskripsi:** Menyimpan pesan dan rekomendasi dari sistem perencanaan.
- **Primary Keys:**
  - `UniqueKeyIDInternal [PK1]`
- **Atribut Penting:**
  - `IdentifierShortItem`, `CostCenter`, `CostCenterAlt`
  - `MessageCde`, `ActionMessageControl`, `HoldCode`
  - `CompanyKeyOrderNo`, `DocumentOrderInvoiceE`, `OrderType`, `LineNumber`, `OrderSuffix`
  - `DescriptionLine1`, `QuantityTransaction`
  - `PrimaryLastVendorNo`
  - `DateRequestedJulian`, `DateStart`
  - `DateRecommendedStart`, `DateRecommendedComplet`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemBranchFile`
  - Berhubungan satu-ke-banyak dengan `MPS/MRP/DRPLowerLevelRequiremen`

#### 6. MPS/MRP/DRPLowerLevelRequiremen
- **Deskripsi:** Menyimpan kebutuhan level rendah yang dihasilkan dari perencanaan.
- **Primary Keys:**
  - `UniqueKeyIDInternal [PK1]`
- **Atribut Penting:**
  - `IdentifierShortItem`, `CostCenter`, `CostCenterAlt`
  - `DateRequestedJulian`, `LeadtimeOffsetDays`
  - `ItemNumberShortKit`, `UnitsTransactionQty`
  - `DocumentOrderInvoiceE`, `OrderType`
  - `CompanyKeyRelated`, `RelatedPoSoNumber`, `RelatedOrderType`, `RelatedPoSoLineNo`
  - `PeggingRecordLinkInterna`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `MPS/MRP/DRPMessageFile`

#### 7. CoProductsPlanning/CostingTable
- **Deskripsi:** Mengelola perencanaan dan penetapan biaya untuk produk bersama.
- **Primary Keys:**
  - `CostCenterAlt [PK1]`
  - `IdentifierShortItem [PK2] [FK]`
  - `BranchComponent [PK3]`
  - `EffectiveThruDate [PK4]`
  - `ItemNumberShortKit [PK5]`
  - `CostCenter [PK6] [FK]`
  - `Location [PK7] [FK]`
  - `Lot [PK8] [FK]`
  - `LedgType [PK9] [FK]`
- **Atribut Penting:**
  - `FeatureCostPercent`, `EffectiveFromDate`
  - `FeaturePlannedPercent`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemBranchFile`
  - Berhubungan satu-ke-banyak dengan `MPS/MRP/DRPSummaryFile`

#### 8. MPS/MRP/DRPSummaryFile
- **Deskripsi:** Menyimpan ringkasan data perencanaan untuk analisis dan pelaporan.
- **Primary Keys:**
  - `IdentifierShortItem [PK1]`
  - `CostCenter [PK2]`
  - `QuantityType [PK3]`
  - `DateStart [PK4]`
- **Atribut Penting:**
  - `QuantityTransaction`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `CoProductsPlanning/CostingTable`

### Hubungan Antar Entitas:
- **ItemMaster → ItemBranchFile**: Satu item dapat memiliki banyak cabang
- **ItemBranchFile → BranchRelationshipsMasterFile**: Setiap item-cabang dapat memiliki aturan hubungan
- **ItemBranchFile → CoProductsPlanning/CostingTable**: Item-cabang dapat memiliki produk bersama
- **ItemBranchFile → MPS/MRP/DRPMessageFile**: Pesan perencanaan dihasilkan per item-cabang
- **MPS/MRP/DRPMessageFile → MPS/MRP/DRPLowerLevelRequiremen**: Pesan dapat menghasilkan kebutuhan level rendah
- **CoProductsPlanning/CostingTable → MPS/MRP/DRPSummaryFile**: Data produk bersama masuk ke ringkasan

### Fitur Utama:
1. **Perencanaan Terintegrasi**: MPS, MRP, dan DRP dalam satu sistem
2. **Manajemen Cabang**: Dukungan untuk operasi multi-cabang
3. **Produk Bersama**: Perencanaan dan penetapan biaya untuk produk bersama
4. **Pesan Perencanaan**: Sistem pesan untuk rekomendasi dan tindakan
5. **Pegging**: Pelacakan hubungan antar kebutuhan
6. **Lead Time Management**: Pengelolaan waktu tunggu dan offset

---

## 28. JDE Sales Order Management & Item Costing Integration Data Architecture

### Overview
Arsitektur data untuk manajemen pesanan penjualan yang terintegrasi dengan penetapan biaya item dan sistem keuangan.

### Entitas Utama:

#### 1. AddressBookMaster
- **Deskripsi:** Entitas pusat untuk data alamat dan kontak.
- **Primary Keys:**
  - `AddressNumber [PK1]`
- **Atribut Penting:**
  - `AlternateAddressKey`, `Taxid`, `NameAlpha`, `DescripCompressed`
  - `CostCenter`, `StandardIndustryCode`, `LanguagePreference`
  - `AddressType1` hingga `AddressType5`, `AddressTypePayables`
  - `PersonCorporationCode`, `CreditMessage`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `CustomerMaster` dan `SalesOrderHeaderFile`

#### 2. ItemMaster
- **Deskripsi:** Data master item dengan atribut penjualan.
- **Atribut Penting:**
  - `Identifier2nditem`, `Identifier3rditem`
  - `DescriptionLine1`, `DescriptionLine2`
  - `SearchText`, `SearchTextCompressed`
  - `SalesReportingCode1` hingga `SalesReportingCode6`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `ItemBranchFile`, `ItemLocationFile`, `ItemCostFile`, dan `ItemBasePriceFile`

#### 3. ItemBranchFile
- **Deskripsi:** Data item per cabang dengan kode pelaporan penjualan.
- **Atribut Penting:**
  - `Identifier2nditem`, `Identifier3rdItem`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemMaster`

#### 4. SalesOrderHeaderFile
- **Deskripsi:** Header pesanan penjualan.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1]`
  - `DocumentOrderinvolceE [PK2]`
  - `OrderType [PK3]`
  - `AddressNumber [PK4] [FK]`
- **Atribut Penting:**
  - `OrderSuffix`, `CostCenter`, `Company`
  - `CompanyKeyOriginal`, `OriginalPoSoNumber`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `AddressBookMaster`
  - Berhubungan satu-ke-banyak dengan `SalesOrderHeaderHistoryFileFlex`

#### 5. ItemLocationFile
- **Deskripsi:** Data inventaris item per lokasi.
- **Atribut Penting:**
  - `PrimaryBinPS`, `GICategory`, `LotStatusCode`
  - `DateLastReceipt1`
  - `QtyOnHandPrimaryUn`, `QtyBackorderedinPri`, `QtyOnPurchaseOrderPr`, `QuantityOnWoReceipt`
  - `Qty1OtherPrimaryUn`, `Qty2OtherPrimaryUn`, `QtyOtherPurchasing1`, `QtyHardCommitted`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemMaster`

#### 6. ItemCostFile
- **Deskripsi:** Data biaya item per lokasi dan lot.
- **Primary Keys:**
  - `IdentifierShortitem [PK1]`
  - `CostCenter [PK2]`
  - `Location [PK3]`
  - `Lot [PK4]`
  - `LedgType [PK5]`
- **Atribut Penting:**
  - `Identifier2nditem`, `Identifier3rdItem`, `LotGrade`
  - `AmountUnitCost`
  - `CostingSelectionPurchasi`, `CostingSelectionInventor`
  - `UserReservedCode`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemMaster`

#### 7. ItemBasePriceFile
- **Deskripsi:** Harga dasar item per pelanggan dan mata uang.
- **Primary Keys:**
  - `IdentifierShortitem [PK1]`
  - `CostCenter [PK2]`
  - `Location [PK3]`
  - `Lot [PK4]`
  - `AddressNumber [PK5]`
  - `ItemCustomerKeyID [PK6]`
  - `LotGrade [PK7]`
  - `FromPotency [PK8]`
  - `CurrencyCodeFrom [PK9]`
  - `UnitOfMeasureAsinput [PK10]`
  - `DateExpiredJulian1 [PK11]`
- **Atribut Penting:**
  - `Identifier2nditem`, `Identifier3rditem`
  - `DateEffectiveJulian1`
  - `AmtPricePerUnit2`, `AmountCreditPrice`
  - `BasisCode`, `LedgType`, `FactorValue`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `ItemMaster`

#### 8. CustomerMaster
- **Deskripsi:** Data master pelanggan dengan konfigurasi keuangan.
- **Primary Keys:**
  - `AddressNumber [PK1]`
- **Atribut Penting:**
  - `ARClass`, `CostCenterArDefault`
  - `ObjectAcctsReceivable`, `SubsidiaryAcctsReceiv`
  - `CompanyKeyARModel`, `DocArDefault.Je`, `DocTyArDefault.Je`
  - `CurrencyCodeFrom`, `TaxArea1`, `TaxExplanationCode1`
  - `AmountCreditLimit`, `ArHoldinvoices`, `PaymentTermsAR`, `AltPayor`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `AddressBookMaster`

#### 9. SalesOrderHeaderHistoryFileFlex
- **Deskripsi:** Riwayat header pesanan penjualan.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1]`
  - `DocumentOrderinvoiceE [PK2]`
  - `OrderType [PK3]`
  - `OrderSuffix [PK4]`
- **Atribut Penting:**
  - `CostCenter`, `Company`
  - `CompanyKeyOriginal`, `OriginalPoSoNumber`, `OriginalOrderType`
  - `CompanyKeyRelated`, `RelatedPoSoNumber`, `RelatedOrderType`
  - `AddressNumber`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `SalesOrderHeaderFile`

#### 10. SalesOrder/Purchasing TextDetail
- **Deskripsi:** Detail teks untuk pesanan penjualan.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1] [FK]`
  - `DocumentOrderInvoiceE [PK2] [FK]`
  - `OrderType [PK3] [FK]`
  - `LineNumber [PK4] [FK]`
  - `LineNumberWorkOrder [PK5]`
  - `UniqueKeyDinternal [PK6] [FK]`
  - `IdentifierShortitem [PK7] [FK]`
  - `CostCenter [PK8] [FK]`
  - `Location [PK9] [FK]`
  - `Lot [PK10] [FK]`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `SalesOrderHeaderFile`

#### 11. SalesOrderHistoryFileFlexibleVer
- **Deskripsi:** Riwayat detail pesanan penjualan.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1]`
  - `DocumentOrderinvoiceE [PK2]`
  - `OrderType [PK3]`
  - `LineNumber [PK4]`
- **Atribut Penting:**
  - `OrderSuffix`, `CostCenter`, `Company`
  - `CompanyKeyOriginal`, `OriginalPoSoNumber`, `OriginalOrderType`, `OriginalLineNumber`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `SalesOrderHeaderFile`

#### 12. ItemLedgerFile
- **Deskripsi:** Buku besar item untuk semua transaksi inventaris.
- **Primary Keys:**
  - `UniqueKeyIDInternal [PK1]`
  - `OrderSuffix [PK2] [FK]`
  - `CompanyKeyOrderNo [PK3] [FK]`
  - `DocumentOrderInvoiceE [PK4] [FK]`
  - `OrderType [PK5] [FK]`
  - `LineNumber [PK6] [FK]`
- **Atribut Penting:**
  - `NoOfLinesOnOrder`
  - `IdentifierShortitem`, `Identifier2nditem`, `Identifier3rditem`
  - `CostCenter`, `Location`, `Lot`, `ParentLot`
  - `StorageUnitNumber`, `SequenceNumberLocati`
  - `TransactionLineNr`, `FromTo`
  - `LotMasterCardexYN`, `LotStatusCode`, `LotPotency`, `LotGrade`
  - `ItemNumberShortKit`, `CostCenterAlt`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `SalesOrderHeaderFile`

#### 13. AccountsReceivableLedger
- **Deskripsi:** Buku besar piutang dagang.
- **Primary Keys:**
  - `CompanyKey [PK1]`
  - `DocumentType [PK2]`
  - `DocVoucherinvoiceE [PK3]`
  - `DocumentPayitem [PK4]`
  - `DocTypeMatching [PK5]`
  - `DocMatchingCheckOr [PK6]`
- **Atribut Penting:**
  - `AddressNumber`, `DateInvoiceJ`
  - `DocPayitemMatchCl`, `DateMatchingCheckOr`
  - `DateForGLandVoucherJULIA`
  - `FiscalYear1`, `Century`, `PeriodNoGeneralLedge`, `Company`
  - `BatchType`, `BatchNumber`, `DateBatchJulian`
  - `AddressNumberParent`, `AddNoAlternatePayee`
  - `GLPostedCode`, `BalancedJournalEntries`, `PayStatusCode`, `AmountGross`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `AccountLedger`

#### 14. AccountLedger
- **Deskripsi:** Buku besar umum untuk semua transaksi keuangan.
- **Primary Keys:**
  - `CompanyKey [PK1]`
  - `DocumentType [PK2]`
  - `DocVoucherinvoiceE [PK3]`
  - `DateForGLandVoucherJULIA [PK4]`
  - `JournalEntryLineNo [PK5]`
  - `LineExtensionCode [PK6]`
- **Foreign Keys:**
  - `OrderType [PK28] [FK]`
  - `LineNumber [PK29] [FK]`
  - `CompanyKeyOrderNo [PK15] [FK]`
  - `DocumentOrderInvoiceE [PK16] [FK]`
  - `OrderSuffix [PK33] [FK]`
- **Atribut Penting:**
  - `GLPostedCode`, `BatchNumber`, `BatchType`
- **Hubungan:**
  - Berhubungan satu-ke-banyak dengan `AccountsReceivableLedger`, `S.O.DetailLedgerFileFlexibleVer`

#### 15. S.O.DetailLedgerFileFlexibleVer
- **Deskripsi:** Buku besar detail pesanan penjualan yang fleksibel.
- **Primary Keys:**
  - `CompanyKeyOrderNo [PK1] [FK]`
  - `DocumentOrderinvoiceE [PK2] [FK]`
  - `OrderType [PK3] [FK]`
  - `LineNumber [PK4] [FK]`
  - `CostCenter [PK17] [FK]`
  - `AddressNumber [PK20] [FK]`
  - `IdentifierShortitem [PK16] [FK]`
  - `Location [PK18] [FK]`
  - `Lot [PK19] [FK]`
  - `FromPotency [PK21] [FK]`
  - `UnitOfMeasureAsinput [PK23] [FK]`
  - `CompanyKey [PK24] [FK]`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `SalesOrderHeaderFile`
  - Berhubungan satu-ke-banyak dengan `AccountLedger`

#### 16. PriceAdjustmentDetail
- **Deskripsi:** Detail penyesuaian harga yang diterapkan pada pesanan.
- **Primary Keys:**
  - `PriceAdjustmentType [PK1]`
  - `IdentifierShortitem [PK2] [FK]`
  - `AddressNumber [PK20] [FK]`
  - `ItemCustomerKeyID [PK3] [FK]`
  - `CurrencyCodeFrom [PK4] [FK]`
  - `UnitOfMeasureAsInput [PK5] [FK]`
  - `QuantityMinimum [PK6]`
  - `DateExpiredJulian1 [PK7] [FK]`
  - `LedgType [PK19] [FK]`
  - `CompanyKeyOrderNo [PK8] [FK]`
  - `DocumentOrderinvoiceE [PK9] [FK]`
  - `OrderType [PK10] [FK]`
  - `LineNumber [PK11] [FK]`
  - `LineNumberWorkOrder [PK12] [FK]`
  - `UniqueKeyDinternal [PK13] [FK]`
  - `CostCenter [PK14] [FK]`
  - `Location [PK15] [FK]`
  - `Lot [PK16] [FK]`
  - `LotGrade [PK17] [FK]`
- **Hubungan:**
  - Berhubungan banyak-ke-satu dengan `SalesOrderHeaderFile`

### Hubungan Antar Entitas:
- **AddressBookMaster → CustomerMaster**: Satu alamat dapat menjadi pelanggan
- **AddressBookMaster → SalesOrderHeaderFile**: Pesanan terkait dengan alamat
- **ItemMaster → ItemBranchFile**: Satu item dapat memiliki banyak cabang
- **ItemMaster → ItemLocationFile**: Satu item dapat memiliki banyak lokasi
- **ItemMaster → ItemCostFile**: Satu item dapat memiliki banyak biaya
- **ItemMaster → ItemBasePriceFile**: Satu item dapat memiliki banyak harga dasar
- **SalesOrderHeaderFile → SalesOrderHeaderHistoryFileFlex**: Header memiliki riwayat
- **SalesOrderHeaderFile → SalesOrder/Purchasing TextDetail**: Header memiliki detail teks
- **SalesOrderHeaderFile → SalesOrderHistoryFileFlexibleVer**: Header memiliki riwayat detail
- **SalesOrderHeaderFile → ItemLedgerFile**: Pesanan mempengaruhi buku besar item
- **ItemLedgerFile → AccountLedger**: Buku besar item terhubung ke buku besar umum
- **AccountLedger → AccountsReceivableLedger**: Buku besar umum terhubung ke piutang
- **S.O.DetailLedgerFileFlexibleVer → AccountLedger**: Detail pesanan terhubung ke buku besar
- **PriceAdjustmentDetail → SalesOrderHeaderFile**: Penyesuaian harga diterapkan pada pesanan

### Fitur Utama:
1. **Integrasi Penuh**: Sales order terintegrasi dengan inventaris, biaya, dan keuangan
2. **Multi-Currency**: Dukungan untuk berbagai mata uang
3. **Lot Management**: Pelacakan lot untuk inventaris
4. **Price Management**: Sistem harga yang fleksibel dengan penyesuaian
5. **Audit Trail**: Pelacakan lengkap semua transaksi
6. **Flexible Ledger**: Buku besar yang fleksibel untuk berbagai jenis transaksi
7. **Customer Management**: Manajemen pelanggan terintegrasi
8. **Cost Tracking**: Pelacakan biaya per item, lokasi, dan lot

## 29. JDE Workflow and Messaging System Data Architecture

### Overview
Arsitektur data untuk sistem workflow dan pesan yang mengelola definisi, konfigurasi, dan instansi dari proses workflow dan aktivitas dalam sistem JD Edwards EnterpriseOne.

### Entitas Utama:

#### 1. WorkflowProcessRouteMaster
- **Deskripsi:** Tabel master yang mendefinisikan proses workflow secara keseluruhan.
- **Primary Keys:**
  - `ProcessName [PK1]`
  - `ProcessVersion [PK2]`
- **Atribut Penting:**
  - `ProcessDescription` - Deskripsi proses
  - `ProcessVersionStatus` - Status versi proses
  - `SystemCodeReporting`, `ProcessDataStructure`, `ProcessKeyDataStructure`
  - `NextProcessInstance`, `WorkflowIconPath`, `GenericLong`
  - `ProcessCategoryCode1`, `ProcessCategoryCode2`, `ProcessCategoryCode3` - Kode kategori untuk klasifikasi proses
  - `Userid`, `Programid`, `WorkStationid`, `DateUpdated`, `TimeOfDay`

#### 2. WorkflowActivityRouteMaster
- **Deskripsi:** Mendefinisikan master data untuk setiap aktivitas individual dalam workflow.
- **Primary Keys:**
  - `ProcessName [PK1] [FK]`
  - `ProcessVersion [PK2] [FK]`
  - `ActivityName [PK3]`
- **Foreign Keys:**
  - `ProcessName`, `ProcessVersion` (ke `WorkflowProcessRouteMaster`)
- **Atribut Penting:**
  - `ActivityDescription` - Deskripsi aktivitas
  - `ActivityType` - Tipe aktivitas (persetujuan, notifikasi, dll)
  - `NextActivityInstance`, `WorkflowIconPath`, `GenericLong`
  - `TransitionAttribute`, `TransitionFunction`, `TransitionAndJoin` - Logika transisi antar aktivitas
  - `StructureAttribute`, `StructureFunction`
  - `ActivityCategoryCode1`, `ActivityCategoryCode2`, `ActivityCategoryCode3` - Kode kategori aktivitas

#### 3. WorkflowActivityRelationships
- **Deskripsi:** Mendefinisikan hubungan dan transisi antar aktivitas dalam workflow.
- **Primary Keys:**
  - `ProcessName [PK1] [FK]`
  - `ProcessVersion [PK2] [FK]`
  - `ActivityName [PK3] [FK]`
  - `NextActivity [PK4]`
  - `TransitionValue [PK5]`
- **Foreign Keys:**
  - `ProcessName`, `ProcessVersion`, `ActivityName` (ke `WorkflowActivityRouteMaster`)

#### 4. WorkflowOrganizationalStructure
- **Deskripsi:** Menghubungkan proses dan aktivitas workflow dengan struktur organisasi.
- **Primary Keys:**
  - `ProcessName [PK1]`
  - `ProcessVersion [PK2]`
  - `ActivityName [PK3]`
  - `RulesValue [PK4]`
- **Atribut Penting:**
  - `OrganizationalModel`, `OrganizationTypeStructur`

#### 5. WorflowOrganizationalModelMaste (Workflow Organizational Model Master)
- **Deskripsi:** Tabel master untuk model organisasi yang dihubungkan dengan elemen workflow.
- **Primary Keys:**
  - `OrganizationalModel [PK1]`
  - `OrganizationTypeStructur [PK2]`
  - `ProcessName [PK3] [FK]`
  - `ProcessVersion [PK4] [FK]`
  - `ActivityName [PK5] [FK]`
  - `RulesValue [PK6] [FK]`
- **Foreign Keys:**
  - `ProcessName`, `ProcessVersion`, `ActivityName`, `RulesValue` (ke `WorkflowOrganizationalStructure`)
- **Atribut Penting:**
  - `ThresholdBusinessFunction`, `Threshold`, `AssociatedDataItem`
  - `GroupType`, `AuthorizationRequired`, `HigherLevelOverride`

#### 6. WorkflowActivitySpecifications
- **Deskripsi:** Spesifikasi teknis dan aturan event untuk aktivitas workflow.
- **Primary Keys:**
  - `EVERESTPT [PK1]`
  - `ApplicationIDOW [PK2]`
  - `FRMIDEVEREST [PK3]`
  - `ControlID [PK4]`
  - `EVERESTWEVENT [PK5]`
  - `EVERESTERID3 [PK6]`
- **Atribut Penting:**
  - `EVERESTEVSPEC`, `EventSpecKey`, `EventRulesBlob`
  - `ProcessName`, `ActivityName`, `ProcessVersion`

#### 7. WorkflowProcessInstance
- **Deskripsi:** Mencatat setiap instansi (eksekusi) dari proses workflow.
- **Primary Keys:**
  - `ProcessName [PK1]`
  - `ProcessVersion [PK2]`
  - `ProcessInstance [PK3]`
- **Atribut Penting:**
  - `ProcessStatus` - Status instansi proses
  - `AttributesData`, `KeyData`
  - `InstanceOriginator` - Penginisiasi instansi
  - `StartDate9`, `StartTime`, `EndDate9`, `EndTime` - Waktu mulai dan selesai

#### 8. WorkflowActivityInstance
- **Deskripsi:** Mencatat setiap instansi aktivitas individual dalam workflow.
- **Primary Keys:**
  - `ProcessName [PK1] [FK]`
  - `ProcessVersion [PK2] [FK]`
  - `ProcessInstance [PK3] [FK]`
  - `ActivityName [PK4]`
  - `Activitystance [PK5]`
  - `OrganizationalGroupNumber [PK6]`
  - `SequenceNumber9 [PK7]`
- **Foreign Keys:**
  - `ProcessName`, `ProcessVersion`, `ProcessInstance` (ke `WorkflowProcessInstance`)
- **Atribut Penting:**
  - `Resource` - Sumber daya yang ditugaskan
  - `RequiredYN9`, `ActivityStatus`, `ActivityAction`
  - `HigherLevelOverride`, `EmailSerialNumber`
  - `StartDate9`, `StartTime`, `EndDate9`, `EndTime`
  - `SubProcessDescription`, `SubProcessInstance`, `SubProcessVersion`

### Hubungan Antar Entitas:
- **WorkflowProcessRouteMaster → WorkflowActivityRouteMaster**: Satu proses dapat memiliki banyak aktivitas
- **WorkflowActivityRouteMaster → WorkflowActivityRelationships**: Aktivitas dapat memiliki banyak transisi
- **WorkflowProcessInstance → WorkflowActivityInstance**: Satu instansi proses dapat memiliki banyak instansi aktivitas
- **WorkflowOrganizationalStructure ↔ WorflowOrganizationalModelMaste**: Integrasi dengan struktur organisasi
- **WorkflowActivitySpecifications**: Spesifikasi teknis untuk aktivitas

### Fitur Utama:
1. **Definisi Workflow Fleksibel**: Perancangan proses bisnis kompleks dengan berbagai langkah
2. **Manajemen Instansi**: Pelacakan real-time setiap eksekusi workflow
3. **Otomatisasi Proses**: Dukungan otomatisasi alur kerja dan notifikasi
4. **Integrasi Organisasi**: Penugasan berdasarkan struktur organisasi dan peran
5. **Pelacakan Audit**: Riwayat lengkap setiap instansi untuk audit
6. **Kustomisasi Aturan**: Definisi aturan bisnis yang disesuaikan

---

## 30. JDE Manufacturing Work Order Management & Shop Floor Control Data Architecture

### Overview
Arsitektur data untuk manajemen pesanan kerja manufaktur, kontrol lantai produksi, dan integrasi dengan sistem keuangan dalam JD Edwards EnterpriseOne.

### Entitas Utama:

#### 1. WorkOrderMasterFile
- **Deskripsi:** File master untuk semua pesanan kerja dengan informasi umum dan status.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1]`
  - `CategoriesWorkOrder001 [PK2] [FK]`
  - `CategoriesWorkOrder002 [PK3] [FK]`
  - `CategoriesWorkOrder003 [PK4] [FK]`
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `RelatedOrderType`, `RelatedPoSoNumber`, `LineNumber`
  - `PegToWorkOrder`, `ParentWoNumber`, `TypeWo`, `PriorityWo`
  - `Description001`, `StatusCommentWo`, `Company`, `CostCenter`, `CostCenterAlt`
  - `Location`, `AisleLocation`, `BinLocation`, `StatusCodeWo`
  - `DateStatusChanged`, `Subsidiary`, `AddressNumber`, `AddNoOriginator`
  - `AddressNumberManager`, `Supervisor`, `AddNoAssignedTo`, `AddressNumberInspector`
  - `DateTransactionJulian`, `DateStart`, `DateRequestedJulian`, `DateWoPlanCompleted`
  - `DateCompletion`, `DateAssignedTo`, `DateAssignToInspector`
  - `CategoriesWorkOrder004` hingga `CategoriesWorkOrder010`
  - `AmountOriginalDollars`, `CrewSize`, `RateDistribuOrBill`

#### 2. WorkOrderInstructionsFile
- **Deskripsi:** Instruksi spesifik atau detail tambahan untuk pesanan kerja.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1] [FK]`
  - `OrderType [PK2]`
  - `OrderSuffix [PK3]`
  - `WODetailedRecordType [PK4]`
  - `LineNumberWorkOrder [PK5]`
  - `CategoriesWorkOrder001 [PK6] [FK]`
  - `CategoriesWorkOrder002 [PK7] [FK]`
  - `CategoriesWorkOrder003 [PK8] [FK]`
- **Atribut Penting:**
  - `DateAssociatedSar`, `DescriptionWorkOrder`, `AssociatedItemNo`

#### 3. ShopFloorControlRoutingInstruct
- **Deskripsi:** Urutan operasi atau rute produksi untuk pesanan kerja.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1] [FK]`
  - `ItemNumberShortKit [PK2]`
  - `SequenceNoOperations [PK3]`
  - `TypeOperationCode [PK4]`
  - `AtoLineType [PK5]`
  - `ParentSegmentNumber [PK6]`
  - `CategoriesWorkOrder001 [PK7] [FK]`
  - `CategoriesWorkOrder002 [PK8] [FK]`
  - `CategoriesWorkOrder003 [PK9] [FK]`
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `TypeRouting`
  - `ItemNumber2ndKit`, `ItemNumber3rdKit`, `CostCenterAlt`
  - `LineIdentifier`, `AutoLoadDescription`, `DescriptionLine1`
  - `OperationStatusCodeWo`, `InspectionCode`, `TimeBasisCode`
  - `LaborOrMachine`, `PayPointCode`

#### 4. ShopFloorControlPartsList
- **Deskripsi:** Daftar komponen atau material yang dibutuhkan (BOM) untuk pesanan kerja.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1] [FK]`
  - `UniqueKeyIDInternal [PK2]`
  - `CategoriesWorkOrder001 [PK3] [FK]`
  - `CategoriesWorkOrder002 [PK4] [FK]`
  - `CategoriesWorkOrder003 [PK5] [FK]`
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `TypeBill`, `FixedOrVariableQty`
  - `IssueTypeCode`, `CoproductsByproducts`, `ComponentType`
  - `ComponentNumber`, `FromPotency`, `ThruPotency`, `FromGrade`, `ThruGrade`
  - `CompanyKeyRelated`, `RelatedPoSoNumber`, `RelatedOrderType`, `RelatedPoSoLineNo`
  - `SequenceNoOperations`, `BubbleSequence`, `ResourcePercent`
  - `PercentOfScrap`, `ReworkPercent`, `AsisPercent`, `PercentCumulativePla`
  - `StepScrapPercent`, `LeadtimeOffsetDays`
  - `ComponentItemNoShort`, `ComponentItemNo2nd`, `ComponentThirdNumber`
  - `BranchComponent`, `DescriptionLine1`, `DescriptionLine2`
  - `Location`, `Lot`, `AddressNumber`, `LineType`, `SerialNumberLot`
  - `DateTransactionJulian`, `DateRequestedJulian`, `BeginningHhMmss`
  - `UnitsTransactionQty`, `QuantityTransaction`
  - `UnitsQuantityCanceled`, `UnitsQuanBackorHeld`

#### 5. WorkOrderTimeTransactions
- **Deskripsi:** Transaksi waktu dan biaya terkait operasi pesanan kerja.
- **Primary Keys:**
  - `UniqueKeyIDInternal [PK1]`
- **Atribut Penting:**
  - `ProcessedCode`, `DocumentOrderInvoiceE`, `OrderType`, `AddressNumber`
  - `PayrollTransactionNo`, `ItemNumberShortKit`, `ItemNumber2ndKit`, `ItemNumber3rdKit`
  - `CostCenterAlt`, `CostCenter`, `SequenceNoOperations`
  - `OperationStatusCodeWb`, `ReasonOde`, `TypeOfHours`
  - `NameRemarkExplanation`, `BatchNumber`, `DocumentType`
  - `DtForGLAndVouch1`

#### 6. WorkOrderVariance
- **Deskripsi:** Varians antara biaya standar/terencana dan biaya aktual.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1]`
  - `IdentifierShortItem [PK2]`
  - `CastType [PK3]`
  - `ParentChildRelationshi [PK4]`
- **Atribut Penting:**
  - `OrderType`, `SequenceNoOperations`
  - `Identifier2ndItem`, `Identifier3rdItem`, `VarianceCode`
  - `StandardUnits`, `StandardAmount`, `ActualUnits`, `ActualAmount`
  - `CurrentUnits`, `CurrentAmount`, `PlannedUnits`, `PlannedAmount`
  - `CompletedUnits`, `CompletedAmount`, `ScrappedUnits`, `ScrappedAmount`
  - `CurrentUnaccountedUnits`, `CurrentUnaccountedAmount`
  - `UnpostableUnits`, `UnpostableAmount`, `UnitOfMeasureAsInput`

#### 7. ItemMaster
- **Deskripsi:** Data master untuk semua item dengan atribut umum.
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `DescriptionLine1`, `DescriptionLine2`
  - `SearchText`, `SearchTextCompressed`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchasingReportCode10`
  - `CommodityCode`, `ProductGroupFrom`, `DispatchGrp`
  - `PricingCategory`, `RepriceBasketPriceCat`, `OrderRepriceCategory`
  - `Buyer`, `DrawingNumber`, `RevisionNumber`, `DrawingSize`

#### 8. ItemBranchFile
- **Deskripsi:** Data item spesifik per cabang atau lokasi.
- **Primary Keys:**
  - `CostCenter [PK1] [FK]`
  - `SystemCode [PK2] [FK]`
- **Atribut Penting:**
  - `Identifier2ndItem`, `Identifier3rdItem`
  - `SalesReportingCode1` hingga `SalesReportingCode10`
  - `PurchasingReportCode1` hingga `PurchasingReportCode10`
  - `CommodityCode`, `ProductGroupFrom`, `DispatchGrp`
  - `PrimaryLastVendorNo`, `AddressNumberPlanner`, `Buyer`
  - `GICategory`, `CountryOfOrigin`
  - `ReorderPointInput`, `ReorderQuantityInput`, `ReorderQuantityMaximum`
  - `ReorderQuantityMinimum`, `OrderMultiples`, `ServiceLevel`
  - `SafetyStockDays`, `ShelfLifeDays`, `CheckAvailabilityYN`
  - `LayerCodeSource`, `LotStatusCode`, `ConstantFutureUse1`

#### 9. CoProductsPlanning/CostingTable
- **Deskripsi:** Perencanaan dan penetapan biaya produk sampingan (co-products).
- **Primary Keys:**
  - `CostCenterAlt [PK1]`
  - `IdentifierShortItem [PK2] [FK]`
  - `BranchComponent [PK3]`
  - `EffectiveThruDate [PK4]`
  - `ItemNumberShortKit [PK5]`
  - `CostCenter [PK6] [FK]`
- **Atribut Penting:**
  - `FeatureCostPercent`, `EffectiveFromDate`, `FeaturePlannedPercent`

#### 10. CostCenterMaster
- **Deskripsi:** Data master untuk pusat biaya.
- **Primary Keys:**
  - `CostCenter [PK1]`
- **Atribut Penting:**
  - `CostCenterType`, `DescripCompressed`, `LevelOfDetailCcCode`
  - `Company`, `AddressNumber`, `AddressNumberJobAr`
  - `County`, `State`, `ModelAccountsandConsolid`
  - `Description001` hingga `Description01004`
  - `CategoryCodeCostC001` hingga `CategoryCodeCostC023`
  - `CategoryCodeCostCenter25` hingga `CategoryCodeCostCenter29`

#### 11. AccountLedger
- **Deskripsi:** Buku besar akuntansi untuk semua transaksi keuangan.
- **Primary Keys:**
  - `CompanyKey [PK1]`
  - `DocumentType [PK2]`
  - `DocVoucherInvoiceE [PK3]`
  - `DateForGLandVoucherJULIA [PK4]`
  - `JournalEntryLineNo [PK5]`
  - `LineExtensionCode [PK6]`
  - `LedgerType [PK7] [FK]`
  - `AssetItemNumber [PK8] [FK]`
  - `Accountid [PK9] [FK]`
  - `Century [PK10] [FK]`
  - `FiscalYear1 [PK11] [FK]`
  - `FiscalQtrFutureUse [PK12] [FK]`
  - `Subledger [PK13] [FK]`
  - `SubledgerType [PK14] [FK]`
- **Atribut Penting:**
  - `GLPostedCode`, `BatchNumber`, `BatchType`
  - `DateBatchJulian`, `DateBatchSystemDateJuliA`, `BatchTime`, `Company`

### Hubungan Antar Entitas:
- **WorkOrderMasterFile** adalah pusat utama yang terhubung ke semua entitas workflow
- **WorkOrderMasterFile → WorkOrderInstructionsFile**: Instruksi detail untuk pesanan kerja
- **WorkOrderMasterFile → ShopFloorControlRoutingInstruct**: Rute produksi
- **WorkOrderMasterFile → ShopFloorControlPartsList**: Kebutuhan material/BOM
- **WorkOrderMasterFile → WorkOrderTimeTransactions**: Pelacakan waktu dan tenaga kerja
- **WorkOrderMasterFile → WorkOrderVariance**: Analisis varians biaya
- **ItemMaster → ItemBranchFile**: Data item per cabang
- **CostCenterMaster**: Pusat biaya untuk akuntansi
- **AccountLedger**: Integrasi keuangan untuk semua transaksi

### Fitur Utama:
1. **Siklus Hidup Pesanan Kerja Komprehensif**: Dari pengaturan awal hingga instruksi, routing, konsumsi material, pencatatan waktu, dan rekonsiliasi keuangan
2. **Integrasi Item dan Biaya**: Manajemen data item pada tingkat master dan cabang dengan penetapan biaya produk sampingan
3. **Dampak Keuangan Langsung**: Integrasi langsung dengan AccountLedger untuk pelacakan biaya real-time
4. **Kategorisasi Fleksibel**: Penggunaan ekstensif category codes untuk pelaporan dan klasifikasi
5. **Pelacakan Detail**: Atribut granular untuk kemajuan produksi, penggunaan material, dan tenaga kerja
6. **Kontrol Lantai Produksi**: Routing instructions dan parts list untuk manajemen produksi

---

## 31. JDE Work Order Management with Default Coding & Record Types Data Architecture

### Overview
Arsitektur data untuk manajemen pesanan kerja dengan sistem pengkodean default, tipe rekam, dan instruksi yang terstruktur dalam JD Edwards EnterpriseOne.

### Entitas Utama:

#### 1. WorkOrderDefaultCodingFile
- **Deskripsi:** Menyimpan informasi pengkodean default atau kategori yang dapat diterapkan pada pesanan kerja.
- **Primary Keys:**
  - `CategoriesWorkOrder001 [PK1]`
  - `CategoriesWorkOrder002 [PK2]`
  - `CategoriesWorkOrder003 [PK3]`
- **Atribut Penting:**
  - `AddressNumberManager` - Nomor alamat manajer
  - `Supervisor` - Supervisor

#### 2. WorkOrderMasterFile
- **Deskripsi:** File master pusat untuk pesanan kerja dengan detail komprehensif.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1]`
  - `CategoriesWorkOrder001 [PK2] [FK]` (Foreign Key ke `WorkOrderDefaultCodingFile`)
  - `CategoriesWorkOrder002 [PK3] [FK]` (Foreign Key ke `WorkOrderDefaultCodingFile`)
  - `CategoriesWorkOrder003 [PK4] [FK]` (Foreign Key ke `WorkOrderDefaultCodingFile`)
- **Atribut Penting:**
  - `OrderType`, `OrderSuffix`, `RelatedOrderType`, `RelatedPoSoNumber`, `LineNumber`
  - `PegToWorkOrder`, `ParentWoNumber`, `TypeWo`, `PriorityWo`
  - `Description001`, `StatusCommentWo`, `Company`, `CostCenter`, `CostCenterAlt`
  - `Location`, `AisleLocation`, `BinLocation`, `StatusCodeWo`, `DateStatusChanged`
  - `Subsidiary`, `AddressNumber`, `AddNoOriginator`, `AddressNumberManager`
  - `Supervisor`, `AddNoAssignedTo`, `AddressNumberInspector`, `NextAddressNumber`
  - `DateTransactionJulian`, `DateStart`, `DateRequestedJulian`, `DateWoPlanCompleted`
  - `DateCompletion`, `DateAssignedTo`, `DateAssignToInspector`, `PaperPrintedDate`
  - `CategoriesWorkOrder004` hingga `CategoriesWorkOrder010` (kode kategori tambahan)
  - `Reference1`, `Reference2Vendor`, `AmountOriginalDollars`, `CrewSize`
  - `RateDistribuOrBill`, `PayDeductBenefitType`, `AmtChngToOriginalD`

#### 3. WorkOrderRecordTypesFile
- **Deskripsi:** Mendefinisikan berbagai tipe rekam yang terkait dengan pesanan kerja.
- **Primary Keys:**
  - `WODetailedRecordType [PK1]`
  - `DocumentOrderInvoiceE [PK2] [FK]` (Foreign Key ke `WorkOrderMasterFile`)
  - `CategoriesWorkOrder001 [PK3] [FK]` (Foreign Key ke `WorkOrderMasterFile`)
  - `CategoriesWorkOrder002 [PK4] [FK]` (Foreign Key ke `WorkOrderMasterFile`)
  - `CategoriesWorkOrder003 [PK5] [FK]` (Foreign Key ke `WorkOrderMasterFile`)
- **Atribut Penting:**
  - `Description001`
  - `SubTitleDescription01` hingga `SubTitleDescription06`
  - `Item1EditSystem`, `Item1EditCodes`
  - `Item2EditSystem`, `Item2EditCodes`
  - `Item3EditSystem`, `Item3EditCodes`

#### 4. WorkOrderInstructionsFile
- **Deskripsi:** Menyimpan instruksi spesifik atau langkah-langkah terkait pesanan kerja.
- **Primary Keys:**
  - `DocumentOrderInvoiceE [PK1] [FK]` (Foreign Key ke `WorkOrderMasterFile`)
  - `OrderType [PK2]`
  - `OrderSuffix [PK3]`
  - `WODetailedRecordType [PK4]` (Foreign Key ke `WorkOrderRecordTypesFile`)
  - `LineNumberWorkOrder [PK5]`
  - `CategoriesWorkOrder001 [PK6] [FK]` (Foreign Key ke `WorkOrderMasterFile`)
  - `CategoriesWorkOrder002 [PK7] [FK]` (Foreign Key ke `WorkOrderMasterFile`)
  - `CategoriesWorkOrder003 [PK8] [FK]` (Foreign Key ke `WorkOrderMasterFile`)
- **Atribut Penting:**
  - `DateAssociatedSar` - Tanggal terkait SAR
  - `DescriptionWorkOrder` - Deskripsi pesanan kerja
  - `AssociatedItemNo1`, `AssociatedItemNo2`, `AssociatedItemNo3` - Item terkait

### Hubungan Antar Entitas:
- **WorkOrderDefaultCodingFile → WorkOrderMasterFile**: Hubungan satu-ke-banyak. Kategori pengkodean default dapat diterapkan ke banyak pesanan kerja.
- **WorkOrderMasterFile → WorkOrderRecordTypesFile**: Hubungan satu-ke-banyak. Tipe rekam terkait dengan pesanan kerja master.
- **WorkOrderMasterFile → WorkOrderInstructionsFile**: Hubungan satu-ke-banyak. Instruksi terkait langsung dengan pesanan kerja master.
- **WorkOrderRecordTypesFile → WorkOrderInstructionsFile**: Hubungan melalui `WODetailedRecordType`, menunjukkan bahwa instruksi dapat dikategorikan berdasarkan tipe rekam.

### Fitur Utama:
1. **Sistem Pengkodean Default**: Kategori standar yang dapat diterapkan ke pesanan kerja
2. **Tipe Rekam Fleksibel**: Definisi berbagai tipe rekam untuk klasifikasi pesanan kerja
3. **Instruksi Terstruktur**: Instruksi detail yang terkait dengan tipe rekam
4. **Kategorisasi Multi-Level**: Penggunaan multiple category codes untuk klasifikasi
5. **Manajemen Master Data**: File master yang komprehensif untuk semua detail pesanan kerja
6. **Integrasi Data**: Hubungan yang jelas antar semua komponen sistem

---

## 32. JDE Data Dictionary & Metadata Management System Data Architecture

### Overview
Arsitektur data untuk sistem kamus data JDE dan manajemen metadata yang mendefinisikan setiap elemen data dengan properti tampilan, alias, spesifikasi teknis, dan pesan terkait.

### Entitas Utama:

#### 1. DataItemMaster
- **Deskripsi:** Entitas pusat yang mendefinisikan item data.
- **Primary Keys:**
  - `DataItem [PK1]`
- **Atribut Penting:**
  - `SystemCode` - Kode sistem
  - `SystemCodeReporting` - Kode sistem untuk pelaporan
  - `GlossaryGroup` - Grup glosarium
  - `UserId`, `ProgramId`, `DateUpdated`, `WorkStationId`, `TimeLastUpdated`

#### 2. DataFieldDisplayText
- **Deskripsi:** Menyimpan teks tampilan untuk field data, berpotensi dilokalisasi berdasarkan bahasa.
- **Primary Keys:**
  - `DataItem [PK1] [FK]` (Foreign Key ke `DataItemMaster.DataItem`)
  - `LanguagePreference [PK2]`
  - `SystemCodeReporting [PK3]`
- **Atribut Penting:**
  - `ColTitle1XrefBuild`, `ColTitle2XrefBuild`, `ColTitle3XrefBuild`
  - `DescriptionRow`

#### 3. DataItemAliases
- **Deskripsi:** Mengelola nama alternatif atau alias untuk item data.
- **Primary Keys:**
  - `DataItem [PK1] [FK]` (Foreign Key ke `DataItemMaster.DataItem`)
  - `FieldNameAliasXreflt [PK2]`
  - `AliasType [PK3]`

#### 4. DataFieldSpecifications
- **Deskripsi:** Berisi spesifikasi teknis detail dan aturan untuk field data.
- **Primary Keys:**
  - `DataItem [PK1] [FK]` (Foreign Key ke `DataItemMaster.DataItem`)
- **Atribut Penting:**
  - `DataItemClass`, `DataItemType`, `DataItemSize`, `DataFileDecimals`
  - `DataFieldParent`, `NumberOfArrayElements`, `ValueForEntryDefault`
  - `JustifyLeftOrRghtCde` - Kode justifikasi kiri atau kanan
  - `DataDisplayDecimals`, `DataDisplayRules`, `DataDisplayParameters`
  - `DataEditRules`, `DataEditOp1`, `DataEditOp2`
  - `HelpTextProgram`, `HelpListProgram`
  - `NextNumberingIndexNo`, `SystemCodeNextNumbe` - Kode sistem untuk penomoran berikutnya
  - `ReleaseNumber`, `UserId`, `DateUpdated`, `ProgramId`, `WorkStationId`, `TimeLastUpdated`

#### 5. DataItemAlphaDescriptions
- **Deskripsi:** Menyimpan deskripsi alfanumerik untuk item data, berpotensi dilokalisasi dan spesifik untuk nama layar.
- **Primary Keys:**
  - `DataItem [PK1] [FK]` (Foreign Key ke `DataItemMaster.DataItem`)
  - `LanguagePreference [PK2]`
  - `SystemCodeReporting [PK3]`
  - `ScreenName [PK4]`
- **Atribut Penting:**
  - `DescriptionAlpha` - Deskripsi alfanumerik
  - `DescCompressed` - Deskripsi terkompresi

#### 6. DataDictionaryGenericTextKeyInd
- **Deskripsi:** Indeks atau kunci untuk entri teks generik, kemungkinan terkait dengan spesifikasi field data.
- **Atribut Penting:**
  - `CompositeKey` - Kunci komposit
  - `ModelRecord` - Rekam model
  - `UserId`, `DateQuestionEntered`, `TimeEnteredProg`
  - `RecordUpdateByUserNa` - Rekam diperbarui oleh nama pengguna
  - `DateUpdated`, `TimeLastUpdated`

#### 7. DataDictionaryGenericText
- **Deskripsi:** Menyimpan konten teks generik yang sebenarnya.
- **Atribut Penting:**
  - `Line-Number` - Nomor baris
  - `Generic-Text` - Teks generik

#### 8. DataDictionaryErrorMessageProgr (Data Dictionary Error Message Program)
- **Deskripsi:** Menghubungkan item data dengan program pesan error spesifik.
- **Primary Keys:**
  - `DataItem [PK1]`
- **Atribut Penting:**
  - `ProgramName` - Nama program

### Hubungan Antar Entitas:
- **DataItemMaster (1) → DataFieldDisplayText (Many)**: Satu item data dapat memiliki banyak teks tampilan, dibedakan berdasarkan bahasa dan kode sistem.
- **DataItemMaster (1) → DataItemAliases (Many)**: Satu item data dapat memiliki banyak alias.
- **DataItemMaster (1) → DataFieldSpecifications (Many)**: Satu item data dapat memiliki banyak spesifikasi detail.
- **DataItemMaster (1) → DataItemAlphaDescriptions (Many)**: Satu item data dapat memiliki banyak deskripsi alfanumerik, bervariasi berdasarkan bahasa, kode sistem, dan konteks layar.
- **DataItemMaster (1) → DataDictionaryErrorMessageProgr (Many)**: Satu item data dapat dikaitkan dengan banyak program pesan error.
- **DataFieldSpecifications (1) → DataDictionaryGenericTextKeyInd (Many)**: Spesifikasi field data dapat dikaitkan dengan banyak indikator kunci teks generik.
- **DataDictionaryGenericTextKeyInd (1) → DataDictionaryGenericText (Many)**: Satu indikator kunci teks generik dapat memiliki banyak baris teks generik.

### Fitur Utama:
1. **Definisi Data Komprehensif**: Setiap elemen data didefinisikan secara menyeluruh dengan properti tampilan, alias, dan spesifikasi teknis
2. **Dukungan Multi-Bahasa**: Teks tampilan dan deskripsi dapat dilokalisasi berdasarkan preferensi bahasa
3. **Sistem Alias Fleksibel**: Dukungan untuk nama alternatif atau alias untuk item data
4. **Spesifikasi Teknis Detail**: Aturan validasi, aturan tampilan, dan parameter teknis untuk setiap field
5. **Manajemen Teks Generik**: Sistem untuk mengelola teks generik dan pesan error
6. **Program Bantuan Terintegrasi**: Program bantuan teks dan daftar yang terkait dengan field data
7. **Konsistensi Data**: Kamus data yang kuat untuk mempertahankan konsistensi data
8. **Pengembangan Aplikasi**: Fasilitas untuk pengembangan dan kustomisasi aplikasi dalam lingkungan JD Edwards EnterpriseOne

---

*Dokumen ini dibuat berdasarkan analisis diagram arsitektur data JDE yang komprehensif mencakup 32 modul utama sistem ERP JD Edwards EnterpriseOne. Knowledge base ini menyediakan pemahaman mendalam tentang struktur data, hubungan antar entitas, dan integrasi sistem yang diperlukan untuk implementasi dan maintenance sistem JDE yang efektif.*
