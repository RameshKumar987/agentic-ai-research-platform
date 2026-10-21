from __future__ import annotations

from dataclasses import dataclass

FieldTuple = tuple[str, str, str]
EndpointTuple = tuple[str, str, str, str]


@dataclass(frozen=True)
class EntitySpec:
    name: str
    purpose: str
    fields: tuple[FieldTuple, ...]
    relationships: tuple[str, ...]


@dataclass(frozen=True)
class RiskSpec:
    title: str
    impact: str
    mitigation: str


@dataclass(frozen=True)
class DomainProfile:
    label: str
    context: str
    audience: tuple[str, ...]
    features: tuple[tuple[str, str], ...]
    functional: tuple[str, ...]
    non_functional: tuple[str, ...]
    technology: tuple[tuple[str, str, str], ...]
    endpoints: tuple[EndpointTuple, ...]
    entities: tuple[EntitySpec, ...]
    risks: tuple[RiskSpec, ...]


HEALTHCARE = DomainProfile(
    label="Healthcare",
    context=(
        "Hospital and clinic workflows are often split across scheduling tools, "
        "records systems, diagnostics portals, and paper or spreadsheet handoffs. "
        "That fragmentation creates delays, duplicate data entry, and avoidable "
        "clinical risk."
    ),
    audience=(
        "Patients and caregivers managing appointments and results",
        "Doctors and specialists coordinating consultations",
        "Hospital administrators overseeing capacity and compliance",
        "Laboratory and diagnostics staff",
        "Privacy and compliance officers",
    ),
    features=(
        ("Appointment scheduling", "Availability-aware booking, rescheduling, cancellation, and waiting lists."),
        ("Unified patient records", "A longitudinal record that links encounters, notes, documents, and results."),
        ("Diagnostics tracking", "Order lab or imaging work, track status, and attach results to the encounter."),
        ("Doctor workflow", "A prioritized worklist, consultation notes, and quick access to patient history."),
        ("Prescription management", "Create, review, and track prescriptions with interaction checks."),
        ("Role-based access and audit", "Granular permissions plus an immutable trail of clinical record access."),
        ("Billing and insurance", "Capture charges and support claims or reimbursement workflows."),
        ("Patient notifications", "Reminders, result-ready alerts, and secure messaging."),
        ("Operational analytics", "Capacity, no-show, turnaround-time, and utilization reporting."),
        ("FHIR interoperability", "Standards-based exchange with labs, pharmacies, and existing hospital systems."),
    ),
    functional=(
        "The system shall let patients request, reschedule, and cancel appointments using live availability.",
        "The system shall maintain a longitudinal patient record with version history and role-based access.",
        "The system shall attach diagnostic orders and results to the correct patient encounter.",
        "The system shall give clinicians a prioritized worklist and a structured consultation note editor.",
        "The system shall record an immutable audit event for every clinical record read or write.",
        "The system shall send appointment reminders and secure result-ready notifications.",
        "The system shall support consent capture and data-sharing preferences for patient records.",
        "The system shall expose FHIR-compatible interfaces for approved external integrations.",
        "The system shall provide operational dashboards for capacity, utilization, and turnaround time.",
    ),
    non_functional=(
        "Clinical data shall be encrypted in transit and at rest, with least-privilege access.",
        "Critical clinical reads should complete within 300 ms at the 95th percentile.",
        "The platform should target 99.9% availability, degrading gracefully for non-clinical modules.",
        "Audit logs should be tamper-evident and retained according to healthcare policy.",
        "Patient-facing flows should meet WCAG 2.2 AA accessibility requirements.",
        "Analytics should use de-identified or aggregated data with explicit consent.",
    ),
    technology=(
        ("PostgreSQL", "Database", "Transactional storage for patients, encounters, and audit events."),
        ("Redis", "Cache and queues", "Appointment availability caching and background notification jobs."),
        ("Keycloak / OIDC", "Identity", "Role-based clinical access, SSO, and session policy."),
        ("HAPI FHIR", "Interoperability", "Standards-based exchange with labs and hospital systems."),
        ("S3-compatible storage", "Documents", "Encrypted clinical documents and imaging references."),
    ),
    endpoints=(
        ("POST", "/api/v1/auth/login", "Authenticate staff or patients and issue scoped tokens.", "Public"),
        ("GET", "/api/v1/appointments", "List availability or appointments by doctor and date.", "JWT"),
        ("POST", "/api/v1/appointments", "Book an appointment with conflict detection.", "JWT"),
        ("GET", "/api/v1/patients/{patientId}/records", "Read a consented, audited patient record.", "JWT + role"),
        ("POST", "/api/v1/encounters/{encounterId}/notes", "Append a structured consultation note.", "JWT + role"),
        ("GET", "/api/v1/diagnostics/{patientId}", "List diagnostic orders and results for a patient.", "JWT + role"),
    ),
    entities=(
        EntitySpec(
            "Patient",
            "Master demographic and consent record.",
            (
                ("id", "UUID", "Primary key"),
                ("fullName", "string", "Display name"),
                ("dateOfBirth", "date", "Used for identity matching"),
                ("contact", "jsonb", "Phone, email, address"),
                ("consentFlags", "jsonb", "Sharing and analytics consent"),
            ),
            ("Has many appointments", "Has many encounters"),
        ),
        EntitySpec(
            "Appointment",
            "Scheduled clinical visit or consultation.",
            (
                ("id", "UUID", "Primary key"),
                ("patientId", "UUID", "FK to Patient"),
                ("doctorId", "UUID", "FK to staff directory"),
                ("scheduledAt", "timestamptz", "Start of the slot"),
                ("status", "enum", "requested, confirmed, completed, cancelled"),
            ),
            ("Belongs to Patient", "Belongs to Doctor", "May create an Encounter"),
        ),
        EntitySpec(
            "Encounter",
            "A clinical interaction and its notes.",
            (
                ("id", "UUID", "Primary key"),
                ("patientId", "UUID", "FK to Patient"),
                ("doctorId", "UUID", "FK to staff directory"),
                ("notes", "text", "Structured consultation note"),
                ("startedAt", "timestamptz", "Encounter start"),
            ),
            ("Belongs to Patient", "Has many MedicalRecords", "Has many Diagnostics"),
        ),
        EntitySpec(
            "MedicalRecord",
            "Versioned clinical document or observation.",
            (
                ("id", "UUID", "Primary key"),
                ("patientId", "UUID", "FK to Patient"),
                ("encounterId", "UUID", "FK to Encounter"),
                ("recordType", "enum", "note, observation, document"),
                ("payload", "jsonb", "Structured record content"),
                ("version", "integer", "Optimistic concurrency"),
            ),
            ("Belongs to Encounter", "Belongs to Patient"),
        ),
        EntitySpec(
            "DiagnosticResult",
            "Lab or imaging order and its result.",
            (
                ("id", "UUID", "Primary key"),
                ("patientId", "UUID", "FK to Patient"),
                ("orderedBy", "UUID", "Clinician identifier"),
                ("testName", "string", "Ordered test or panel"),
                ("result", "jsonb", "Structured result payload"),
                ("status", "enum", "ordered, in_progress, ready, reviewed"),
            ),
            ("Belongs to Patient", "Linked to Encounter"),
        ),
        EntitySpec(
            "Prescription",
            "Medication order issued during an encounter.",
            (
                ("id", "UUID", "Primary key"),
                ("encounterId", "UUID", "FK to Encounter"),
                ("medication", "string", "Drug and strength"),
                ("dosage", "string", "Directions"),
                ("status", "enum", "active, completed, cancelled"),
            ),
            ("Belongs to Encounter", "Belongs to Patient through Encounter"),
        ),
        EntitySpec(
            "AuditEvent",
            "Append-only access and change log.",
            (
                ("id", "UUID", "Primary key"),
                ("actorId", "UUID", "User or service"),
                ("action", "string", "read, create, update, export"),
                ("resourceType", "string", "Affected resource"),
                ("resourceId", "UUID", "Affected record"),
                ("createdAt", "timestamptz", "Immutable timestamp"),
            ),
            ("References any clinical resource", "Belongs to Actor"),
        ),
    ),
    risks=(
        RiskSpec(
            "Clinical privacy and consent",
            "Severe: a data leak or consent violation can cause regulatory and patient harm.",
            "Enforce least privilege, encryption, immutable auditing, consent checks, and a formal threat model before launch.",
        ),
        RiskSpec(
            "Legacy hospital integration",
            "High: existing HIS, lab, and billing systems may not expose modern APIs.",
            "Introduce a FHIR adapter layer, validate with real integration partners, and roll out domain by domain.",
        ),
        RiskSpec(
            "Alert fatigue and workflow disruption",
            "Medium: clinicians may ignore notifications or work around the platform.",
            "Co-design with clinicians, measure notification value, and keep critical workflows to a few deliberate steps.",
        ),
    ),
)

EDUCATION = DomainProfile(
    label="Education",
    context=(
        "Learners, instructors, and administrators often work across disconnected "
        "content, assessment, and reporting tools. A coherent learning platform "
        "can reduce manual coordination while keeping educators in control."
    ),
    audience=(
        "Students and lifelong learners",
        "Instructors and teaching assistants",
        "Academic advisors",
        "Program administrators",
        "Parents or guardians where applicable",
    ),
    features=(
        ("Course catalog", "Browse structured programs, modules, and prerequisites."),
        ("Adaptive learning paths", "Recommend next activities based on progress and goals."),
        ("Assessments", "Quizzes, assignments, rubrics, and scheduled exams."),
        ("Progress analytics", "Learner and cohort progress with actionable signals."),
        ("Feedback loop", "Instructor feedback, peer review, and revision history."),
        ("Content library", "Versioned lessons, media, and reusable question banks."),
        ("Notifications", "Deadlines, feedback, and at-risk learner nudges."),
        ("Role-based access", "Separate learner, instructor, and administrator capabilities."),
        ("LTI interoperability", "Connect external tools through standards-based launches."),
        ("Accessibility tools", "Captions, alt text workflows, and readable formats."),
    ),
    functional=(
        "The system shall let instructors publish modules, lessons, and assessments with draft preview.",
        "The system shall enroll learners and enforce prerequisite or cohort rules.",
        "The system shall record assessment submissions with version history and rubric feedback.",
        "The system shall calculate progress from completed activities and assessment outcomes.",
        "The system shall give learners a clear upcoming-work and feedback view.",
        "The system shall allow administrators to export cohort-level reports without learner PII.",
        "The system shall support accessibility metadata for published learning content.",
        "The system shall integrate external learning tools through a standards-based launch flow.",
    ),
    non_functional=(
        "Learner data shall be protected with least-privilege access and encryption.",
        "Course pages should load within 2 seconds on typical campus networks.",
        "Assessment submission must be durable and idempotent to prevent lost work.",
        "The experience should meet WCAG 2.2 AA, including keyboard-only use.",
        "Cohort analytics should refresh within 15 minutes of an event.",
        "The platform should support seasonal load spikes during enrollment and exams.",
    ),
    technology=(
        ("PostgreSQL", "Database", "Courses, enrollments, submissions, and audit data."),
        ("S3-compatible storage", "Media", "Course assets, submissions, and generated exports."),
        ("Redis", "Cache and queues", "Session cache and asynchronous grading or notification jobs."),
        ("LTI 1.3", "Interoperability", "Secure launches into external learning tools."),
        ("ClickHouse", "Analytics", "Fast cohort and engagement reporting."),
    ),
    endpoints=(
        ("POST", "/api/v1/auth/login", "Authenticate learners and staff.", "Public"),
        ("GET", "/api/v1/courses", "List published courses with filters.", "JWT"),
        ("POST", "/api/v1/enrollments", "Enroll a learner after prerequisite checks.", "JWT"),
        ("GET", "/api/v1/courses/{courseId}/modules", "Read the ordered module and lesson structure.", "JWT"),
        ("POST", "/api/v1/assessments/{assessmentId}/submissions", "Submit or resubmit an assessment.", "JWT"),
        ("GET", "/api/v1/learners/{learnerId}/progress", "Read progress and feedback summary.", "JWT + role"),
    ),
    entities=(
        EntitySpec(
            "Learner",
            "A person enrolled in one or more courses.",
            (
                ("id", "UUID", "Primary key"),
                ("displayName", "string", "Preferred name"),
                ("email", "string", "Unique login identifier"),
                ("accessibilityNeeds", "jsonb", "Opt-in accommodations"),
            ),
            ("Has many Enrollments",),
        ),
        EntitySpec(
            "Course",
            "A structured learning offering.",
            (
                ("id", "UUID", "Primary key"),
                ("title", "string", "Course name"),
                ("status", "enum", "draft, published, archived"),
                ("instructorId", "UUID", "Owner"),
            ),
            ("Has many Modules", "Has many Assessments"),
        ),
        EntitySpec(
            "Enrollment",
            "Links a learner to a course cohort.",
            (
                ("id", "UUID", "Primary key"),
                ("learnerId", "UUID", "FK to Learner"),
                ("courseId", "UUID", "FK to Course"),
                ("enrolledAt", "timestamptz", "Enrollment time"),
                ("status", "enum", "active, completed, withdrawn"),
            ),
            ("Belongs to Learner", "Belongs to Course"),
        ),
        EntitySpec(
            "Module",
            "An ordered unit of learning content.",
            (
                ("id", "UUID", "Primary key"),
                ("courseId", "UUID", "FK to Course"),
                ("title", "string", "Module title"),
                ("position", "integer", "Display order"),
                ("contentRef", "string", "Versioned content reference"),
            ),
            ("Belongs to Course", "Has many Lessons"),
        ),
        EntitySpec(
            "Assessment",
            "A graded activity with rubric.",
            (
                ("id", "UUID", "Primary key"),
                ("courseId", "UUID", "FK to Course"),
                ("type", "enum", "quiz, assignment, exam"),
                ("dueAt", "timestamptz", "Deadline"),
                ("rubric", "jsonb", "Criteria and weights"),
            ),
            ("Belongs to Course", "Has many Submissions"),
        ),
        EntitySpec(
            "Submission",
            "A learner attempt and its evaluation.",
            (
                ("id", "UUID", "Primary key"),
                ("assessmentId", "UUID", "FK to Assessment"),
                ("learnerId", "UUID", "FK to Learner"),
                ("payloadRef", "string", "Stored response reference"),
                ("score", "numeric", "Final score"),
                ("status", "enum", "submitted, graded, returned"),
            ),
            ("Belongs to Assessment", "Belongs to Learner"),
        ),
        EntitySpec(
            "ProgressEvent",
            "Append-only learning activity signal.",
            (
                ("id", "UUID", "Primary key"),
                ("learnerId", "UUID", "FK to Learner"),
                ("activityId", "UUID", "Lesson or assessment"),
                ("eventType", "enum", "started, completed, viewed"),
                ("createdAt", "timestamptz", "Event time"),
            ),
            ("Belongs to Learner",),
        ),
    ),
    risks=(
        RiskSpec(
            "Academic integrity",
            "High: online assessment can be gamed, undermining trust in outcomes.",
            "Use assessment design, time-boxed sessions, audit trails, and clear policy rather than invasive surveillance.",
        ),
        RiskSpec(
            "Student privacy and minors",
            "High: education records are sensitive, and minors add compliance obligations.",
            "Minimize collected data, enforce role boundaries, support retention/deletion, and review FERPA/GDPR obligations.",
        ),
        RiskSpec(
            "Accessibility gaps",
            "Medium: inaccessible content excludes learners and may create legal exposure.",
            "Build accessibility checks into publishing, test with assistive technology, and require alt text and captions.",
        ),
    ),
)

FINANCE = DomainProfile(
    label="Finance",
    context=(
        "Financial workflows require high accuracy, clear auditability, and strong "
        "fraud controls. Users expect real-time visibility without sacrificing "
        "compliance or data integrity."
    ),
    audience=(
        "Retail customers and account holders",
        "Financial analysts and operations staff",
        "Compliance and risk officers",
        "Customer support agents",
        "Auditors",
    ),
    features=(
        ("Account overview", "Unified balances, cards, and linked accounts."),
        ("Transactions", "Search, categorize, and annotate account activity."),
        ("Budgeting", "Period budgets, alerts, and spending trends."),
        ("Fraud alerts", "Risk scoring with review and escalation states."),
        ("Transfers and payments", "Controlled money movement with confirmation steps."),
        ("Financial reports", "Exportable statements and category summaries."),
        ("KYC onboarding", "Identity verification with document checks."),
        ("Audit trail", "Immutable logs for sensitive account actions."),
        ("Role-based controls", "Maker-checker and least-privilege access."),
        ("Open banking", "Consented external account connectivity."),
    ),
    functional=(
        "The system shall show authorized users a consolidated, up-to-date account overview.",
        "The system shall support idempotent transfers with explicit confirmation and status tracking.",
        "The system shall categorize transactions and allow user corrections with an audit trail.",
        "The system shall flag suspicious activity and route it to a review queue.",
        "The system shall generate period-based budgets and threshold alerts.",
        "The system shall record immutable audit entries for all sensitive actions.",
        "The system shall enforce maker-checker controls for administrative and high-value operations.",
        "The system shall export statements and transaction history in a machine-readable format.",
    ),
    non_functional=(
        "All sensitive data shall be encrypted in transit and at rest with strong key management.",
        "Payment and transfer operations must be idempotent and fully auditable.",
        "Account reads should return within 400 ms at the 95th percentile.",
        "The platform should target 99.95% availability for payment-critical paths.",
        "Fraud review queues should surface new high-risk alerts within 60 seconds.",
        "Regulatory retention and deletion rules shall be configurable and enforced.",
    ),
    technology=(
        ("PostgreSQL", "Database", "Accounts, transactions, and audit records with strong constraints."),
        ("Kafka", "Event streaming", "Durable transaction and fraud-event pipelines."),
        ("Redis", "Cache and idempotency", "Fast reads and transfer deduplication keys."),
        ("Open banking API", "Integration", "Consented account connectivity."),
        ("TimescaleDB", "Time series", "Spending trends and alert analytics."),
    ),
    endpoints=(
        ("POST", "/api/v1/auth/login", "Authenticate with MFA-ready token flow.", "Public"),
        ("GET", "/api/v1/accounts", "List authorized accounts and balances.", "JWT + MFA"),
        ("GET", "/api/v1/accounts/{accountId}/transactions", "Paginated transaction history.", "JWT + MFA"),
        ("POST", "/api/v1/transfers", "Create an idempotent transfer with confirmation.", "JWT + MFA"),
        ("GET", "/api/v1/budgets", "List budgets and threshold status.", "JWT"),
        ("POST", "/api/v1/fraud-alerts/{alertId}/review", "Resolve or escalate a fraud alert.", "JWT + role"),
    ),
    entities=(
        EntitySpec(
            "Customer",
            "Verified account holder.",
            (
                ("id", "UUID", "Primary key"),
                ("fullName", "string", "Legal name"),
                ("kycStatus", "enum", "pending, verified, rejected"),
                ("riskTier", "enum", "low, medium, high"),
            ),
            ("Has many Accounts",),
        ),
        EntitySpec(
            "Account",
            "A financial account owned by a customer.",
            (
                ("id", "UUID", "Primary key"),
                ("customerId", "UUID", "FK to Customer"),
                ("currency", "char(3)", "ISO currency code"),
                ("balance", "numeric(18,2)", "Ledger-derived balance"),
                ("status", "enum", "active, frozen, closed"),
            ),
            ("Belongs to Customer", "Has many Transactions"),
        ),
        EntitySpec(
            "Transaction",
            "A debit, credit, or transfer entry.",
            (
                ("id", "UUID", "Primary key"),
                ("accountId", "UUID", "FK to Account"),
                ("amount", "numeric(18,2)", "Signed amount"),
                ("category", "string", "User or model category"),
                ("status", "enum", "pending, posted, reversed"),
                ("occurredAt", "timestamptz", "Event time"),
            ),
            ("Belongs to Account",),
        ),
        EntitySpec(
            "Budget",
            "A period spending plan.",
            (
                ("id", "UUID", "Primary key"),
                ("customerId", "UUID", "FK to Customer"),
                ("period", "daterange", "Budget window"),
                ("limitAmount", "numeric(18,2)", "Spending cap"),
            ),
            ("Belongs to Customer",),
        ),
        EntitySpec(
            "FraudAlert",
            "A risk signal requiring review.",
            (
                ("id", "UUID", "Primary key"),
                ("transactionId", "UUID", "FK to Transaction"),
                ("score", "numeric", "Risk score"),
                ("status", "enum", "open, escalated, cleared"),
                ("reviewedBy", "UUID", "Reviewer"),
            ),
            ("References Transaction",),
        ),
        EntitySpec(
            "AuditLog",
            "Immutable record of sensitive actions.",
            (
                ("id", "UUID", "Primary key"),
                ("actorId", "UUID", "User or service"),
                ("action", "string", "Performed action"),
                ("resourceId", "UUID", "Affected resource"),
                ("createdAt", "timestamptz", "Event time"),
            ),
            ("References any sensitive resource",),
        ),
    ),
    risks=(
        RiskSpec(
            "Fraud and account takeover",
            "Severe: attackers could move funds or expose account data.",
            "Require MFA, device risk signals, step-up authentication, immutable audit logs, and human review for high-risk actions.",
        ),
        RiskSpec(
            "Financial accuracy and reconciliation",
            "High: rounding errors or duplicate transfers erode trust and create liabilities.",
            "Use ledger-style records, idempotency keys, reconciliation jobs, and property-based tests for money movement.",
        ),
        RiskSpec(
            "Regulatory change",
            "High: KYC, retention, and reporting rules vary by jurisdiction.",
            "Keep policy rules configuration-driven, document data lineage, and review with compliance before launch.",
        ),
    ),
)

ECOMMERCE = DomainProfile(
    label="E-commerce",
    context=(
        "Online stores must deliver fast discovery, trustworthy checkout, and "
        "accurate inventory across channels. Small operational mistakes quickly "
        "become lost revenue or poor customer experience."
    ),
    audience=(
        "Shoppers on web and mobile",
        "Marketplace sellers",
        "Store operations and fulfillment staff",
        "Customer support agents",
        "Merchandisers",
    ),
    features=(
        ("Product catalog", "Structured products, variants, media, and pricing."),
        ("Search and discovery", "Typo-tolerant search, filters, and collections."),
        ("Cart and checkout", "Guest checkout, promotions, and payment retries."),
        ("Order management", "Order lifecycle, fulfillment, and tracking."),
        ("Inventory sync", "Real-time stock and reservation handling."),
        ("Personalized recommendations", "Related products based on behavior and catalog signals."),
        ("Returns", "Return requests, eligibility, and refund status."),
        ("Seller dashboard", "Listing management and order performance."),
        ("Notifications", "Transactional email and shipment updates."),
        ("Analytics", "Conversion, cart abandonment, and inventory health."),
    ),
    functional=(
        "The system shall let shoppers browse, filter, and search a versioned product catalog.",
        "The system shall maintain a cart that survives sign-in and supports promotions.",
        "The system shall create orders idempotently and reserve inventory during checkout.",
        "The system shall expose order status and tracking to the customer.",
        "The system shall process payment webhooks and reconcile payment state.",
        "The system shall support return requests with eligibility rules and refund tracking.",
        "The system shall give sellers a scoped view of their listings and orders.",
        "The system shall emit analytics events for discovery, cart, and checkout steps.",
    ),
    non_functional=(
        "Product listing pages should render within 1.5 seconds at the 75th percentile.",
        "Checkout must be idempotent and tolerate payment-provider retries.",
        "The catalog should remain available during peak campaigns with graceful degradation.",
        "Payment data shall never be stored directly; use a PCI-compliant provider.",
        "Search and recommendations should not expose internal margin data.",
        "Customer data access shall follow least privilege and retention policy.",
    ),
    technology=(
        ("PostgreSQL", "Database", "Catalog, orders, payments, and inventory records."),
        ("Redis", "Cache", "Session carts, hot product reads, and rate limits."),
        ("Stripe", "Payments", "PCI-compliant checkout and webhooks."),
        ("Meilisearch", "Search", "Typo-tolerant catalog search and facets."),
        ("S3-compatible storage", "Media", "Product images and generated exports."),
    ),
    endpoints=(
        ("GET", "/api/v1/products", "Search and filter the product catalog.", "Public"),
        ("GET", "/api/v1/products/{productId}", "Read product detail and variants.", "Public"),
        ("POST", "/api/v1/carts", "Create or resume a cart.", "Session or JWT"),
        ("POST", "/api/v1/checkout", "Create an idempotent order from a cart.", "JWT"),
        ("GET", "/api/v1/orders/{orderId}", "Read order status and fulfillment details.", "JWT"),
        ("POST", "/api/v1/returns", "Request a return for an eligible order item.", "JWT"),
    ),
    entities=(
        EntitySpec(
            "Customer",
            "Shopper account and preferences.",
            (
                ("id", "UUID", "Primary key"),
                ("email", "string", "Unique contact"),
                ("displayName", "string", "Preferred name"),
                ("defaultAddressId", "UUID", "Saved address"),
            ),
            ("Has many Orders", "Has one Cart"),
        ),
        EntitySpec(
            "Product",
            "Sellable item with variants.",
            (
                ("id", "UUID", "Primary key"),
                ("title", "string", "Product name"),
                ("slug", "string", "URL identifier"),
                ("price", "numeric(12,2)", "Base price"),
                ("status", "enum", "draft, active, archived"),
            ),
            ("Has many Variants", "Has many InventoryItems"),
        ),
        EntitySpec(
            "InventoryItem",
            "Stock for a product variant at a location.",
            (
                ("id", "UUID", "Primary key"),
                ("variantId", "UUID", "FK to Variant"),
                ("locationId", "UUID", "Warehouse"),
                ("onHand", "integer", "Physical stock"),
                ("reserved", "integer", "Checkout reservations"),
            ),
            ("Belongs to Variant", "Belongs to Location"),
        ),
        EntitySpec(
            "Order",
            "A confirmed purchase.",
            (
                ("id", "UUID", "Primary key"),
                ("customerId", "UUID", "FK to Customer"),
                ("status", "enum", "pending, paid, shipped, delivered, cancelled"),
                ("total", "numeric(12,2)", "Order total"),
                ("idempotencyKey", "string", "Checkout deduplication"),
            ),
            ("Belongs to Customer", "Has many OrderItems", "Has many Payments"),
        ),
        EntitySpec(
            "OrderItem",
            "A product line captured at purchase time.",
            (
                ("id", "UUID", "Primary key"),
                ("orderId", "UUID", "FK to Order"),
                ("variantId", "UUID", "Purchased variant"),
                ("quantity", "integer", "Units purchased"),
                ("unitPrice", "numeric(12,2)", "Historical price"),
            ),
            ("Belongs to Order",),
        ),
        EntitySpec(
            "Payment",
            "Payment attempt and provider state.",
            (
                ("id", "UUID", "Primary key"),
                ("orderId", "UUID", "FK to Order"),
                ("provider", "string", "Payment provider"),
                ("providerRef", "string", "External reference"),
                ("status", "enum", "requires_action, succeeded, failed, refunded"),
            ),
            ("Belongs to Order",),
        ),
        EntitySpec(
            "ReturnRequest",
            "Customer return and refund workflow.",
            (
                ("id", "UUID", "Primary key"),
                ("orderId", "UUID", "FK to Order"),
                ("reason", "string", "Return reason"),
                ("status", "enum", "requested, approved, received, refunded"),
            ),
            ("Belongs to Order",),
        ),
    ),
    risks=(
        RiskSpec(
            "Payment failures and fraud",
            "High: failed or fraudulent payments directly affect revenue and customer trust.",
            "Use a PCI-compliant provider, webhook verification, idempotency, and rules-based fraud review.",
        ),
        RiskSpec(
            "Inventory drift",
            "High: overselling during campaigns creates cancellations and support load.",
            "Reserve stock transactionally, reconcile with WMS events, and alert on drift thresholds.",
        ),
        RiskSpec(
            "Peak-traffic resilience",
            "Medium: campaign spikes can slow catalog and checkout paths.",
            "Cache hot reads, isolate checkout, load-test realistic peaks, and add graceful degradation.",
        ),
    ),
)

OTHER = DomainProfile(
    label="Other",
    context=(
        "The problem spans a specialized workflow that is not covered by a standard "
        "template. The blueprint therefore emphasizes a configurable core, clear "
        "roles, and integrations rather than domain-specific assumptions."
    ),
    audience=(
        "Primary end users completing the core workflow",
        "Team leads or administrators",
        "Operations and support staff",
        "Integration partners",
    ),
    features=(
        ("Guided onboarding", "Role-aware setup and first-run checklist."),
        ("Core workflow", "A configurable primary workflow with explicit states."),
        ("Search", "Fast retrieval across records the user is allowed to access."),
        ("Collaboration", "Comments, assignments, and activity history."),
        ("Notifications", "In-app and email updates for meaningful events."),
        ("Role-based access", "Scoped permissions for users, admins, and partners."),
        ("Reporting", "Configurable operational and outcome reporting."),
        ("Integrations", "Webhooks and API-based connections to existing tools."),
        ("Audit trail", "Traceable history of sensitive actions."),
        ("Billing", "Plan and entitlement management where relevant."),
    ),
    functional=(
        "The system shall guide new users through a role-aware onboarding flow.",
        "The system shall support the primary workflow with explicit, recoverable states.",
        "The system shall enforce role-based access on every record and action.",
        "The system shall provide search scoped to the user's permissions.",
        "The system shall notify users of changes that require their attention.",
        "The system shall expose audit history for sensitive records.",
        "The system shall provide configurable reports for administrators.",
        "The system shall expose webhook and API integrations with signed requests.",
    ),
    non_functional=(
        "All data shall be encrypted in transit and at rest with least-privilege access.",
        "Core pages should load within 2 seconds at the 75th percentile.",
        "Writes must be idempotent where retries are possible.",
        "The interface should meet WCAG 2.2 AA accessibility requirements.",
        "Audit events should be retained according to configurable policy.",
        "The service should degrade gracefully when optional integrations fail.",
    ),
    technology=(
        ("PostgreSQL", "Database", "Core records, permissions, and audit events."),
        ("Redis", "Cache and queues", "Session cache and background jobs."),
        ("S3-compatible storage", "Documents", "Uploads and generated exports."),
        ("OpenSearch", "Search", "Permission-aware full-text search at scale."),
        ("OIDC provider", "Identity", "SSO, MFA, and role claims."),
    ),
    endpoints=(
        ("POST", "/api/v1/auth/login", "Authenticate and issue scoped tokens.", "Public"),
        ("GET", "/api/v1/resources", "List resources visible to the caller.", "JWT"),
        ("POST", "/api/v1/resources", "Create a resource in the core workflow.", "JWT"),
        ("GET", "/api/v1/resources/{resourceId}", "Read one authorized resource.", "JWT"),
        ("PATCH", "/api/v1/resources/{resourceId}", "Update state with concurrency checks.", "JWT + role"),
        ("GET", "/api/v1/audit-events", "Read audit history for administrators.", "JWT + admin"),
    ),
    entities=(
        EntitySpec(
            "User",
            "A person with a scoped role.",
            (
                ("id", "UUID", "Primary key"),
                ("email", "string", "Unique login"),
                ("displayName", "string", "Preferred name"),
                ("role", "enum", "member, admin, partner"),
            ),
            ("Has many Resources", "Has many AuditEvents"),
        ),
        EntitySpec(
            "Workspace",
            "A tenant or team boundary.",
            (
                ("id", "UUID", "Primary key"),
                ("name", "string", "Workspace name"),
                ("plan", "enum", "free, team, enterprise"),
            ),
            ("Has many Users", "Has many Resources"),
        ),
        EntitySpec(
            "Resource",
            "The primary object in the core workflow.",
            (
                ("id", "UUID", "Primary key"),
                ("workspaceId", "UUID", "Tenant boundary"),
                ("title", "string", "Display name"),
                ("status", "enum", "draft, active, done, archived"),
                ("ownerId", "UUID", "Responsible user"),
            ),
            ("Belongs to Workspace", "Belongs to User", "Has many Activities"),
        ),
        EntitySpec(
            "Activity",
            "A comment, state change, or assignment.",
            (
                ("id", "UUID", "Primary key"),
                ("resourceId", "UUID", "FK to Resource"),
                ("actorId", "UUID", "User or service"),
                ("type", "enum", "comment, status, assignment"),
                ("payload", "jsonb", "Activity details"),
            ),
            ("Belongs to Resource",),
        ),
        EntitySpec(
            "AuditEvent",
            "Immutable security and change log.",
            (
                ("id", "UUID", "Primary key"),
                ("actorId", "UUID", "User or service"),
                ("action", "string", "Action performed"),
                ("resourceId", "UUID", "Affected resource"),
                ("createdAt", "timestamptz", "Event time"),
            ),
            ("References Resource",),
        ),
    ),
    risks=(
        RiskSpec(
            "Scope ambiguity",
            "High: a broad idea can expand indefinitely without a defined first release.",
            "Choose one primary persona and one end-to-end workflow, then defer secondary features explicitly.",
        ),
        RiskSpec(
            "Adoption and workflow fit",
            "Medium: users may not change established habits for a partial solution.",
            "Run task-based usability tests early and measure completion, not feature count.",
        ),
        RiskSpec(
            "Security and permissions",
            "High: cross-tenant or cross-role leakage is difficult to reverse.",
            "Model tenant boundaries explicitly, enforce authorization server-side, and test with negative cases.",
        ),
    ),
)

PROFILES: dict[str, DomainProfile] = {
    "Healthcare": HEALTHCARE,
    "Education": EDUCATION,
    "Finance": FINANCE,
    "E-commerce": ECOMMERCE,
    "Other": OTHER,
}
