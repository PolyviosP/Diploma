# PROJECT SPEC — Σύστημα Διαχείρισης Διπλωματικών Εργασιών

> Αρχείο οδηγιών για Claude Code. Διάβασέ το ολόκληρο πριν ξεκινήσεις.

---

## 0. Τι είναι το project

Web εφαρμογή για τη διαχείριση διπλωματικών εργασιών Πανεπιστημίου.
Οι διδάσκοντες καταχωρούν θέματα, οι φοιτητές δηλώνουν ενδιαφέρον, ο διδάσκων
επιλέγει φοιτητή, η τριμελής επιτροπή βαθμολογεί, η γραμματεία λαμβάνει αποτελέσματα.

**Γλώσσα UI:** Ελληνικά
**Στόχος:** Ακαδημαϊκό project (ανάλυση → σχεδίαση → υλοποίηση)

---

## 1. Tech Stack (υποχρεωτικό — μην αλλάξεις)

| Τομέας | Τεχνολογία |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Firebase Firestore |
| Auth | Firebase Auth (SAML/OIDC provider για SSO) |
| Storage | Firebase Storage |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |
| Testing | Jest + React Testing Library |
| Diagrams | PlantUML |
| PM | Jira (εκτός repo) |

---

## 2. Actors & Ρόλοι

- **student** — Φοιτητής
- **professor** — Διδάσκων (μπορεί να είναι και μέλος τριμελούς)
- **secretariat** — Γραμματεία
- Το SSO του Πανεπιστημίου κάνει την αυθεντικοποίηση. Ο ρόλος αποθηκεύεται στο `users` collection.

---

## 3. Λειτουργικές Απαιτήσεις

### Κοινά
- Login μόνο μέσω SSO. Χωρίς τοπικούς κωδικούς.
- Μετά το login → redirect σε dashboard ανάλογα με ρόλο.
- Κάθε χρήστης βλέπει μόνο ό,τι τον αφορά.

### Διδάσκων
1. Καταχώρηση θέματος (τίτλος, περιγραφή, προαπαιτούμενα, λέξεις-κλειδιά)
2. Επεξεργασία/διαγραφή θέματος **μόνο** όσο status = AVAILABLE
3. Προβολή λίστας φοιτητών που δήλωσαν ενδιαφέρον
4. Επιλογή ενός φοιτητή → δημιουργία Thesis, αυτόματη απόρριψη υπολοίπων
5. Ορισμός 2 επιπλέον μελών τριμελούς
6. Καταχώρηση βαθμού (0–10) + σχόλια

### Φοιτητής
1. Αναζήτηση θεμάτων με φίλτρα (διδάσκων, λέξεις-κλειδιά)
2. Δήλωση ενδιαφέροντος (έως 3 ενεργές δηλώσεις)
3. Ανάκληση δήλωσης όσο status = PENDING
4. Προβολή κατάστασης δηλώσεων
5. Upload τελικού κειμένου (PDF, max 20MB)
6. Προβολή τελικού βαθμού

### Τριμελής
1. Προβολή τελικού κειμένου
2. Καταχώρηση βαθμού (0–10, βήμα 0.5) + σχόλια

### Γραμματεία
1. Προβολή όλων των διπλωματικών με φίλτρα
2. Export αποτελεσμάτων σε CSV

---

## 4. Business Rules (να επιβληθούν σε κώδικα ΚΑΙ σε Firestore Rules)

| # | Κανόνας |
|---|---|
| BR-1 | Κάθε φοιτητής → μία ενεργή διπλωματική |
| BR-2 | Έως 3 ενεργές δηλώσεις ανά φοιτητή |
| BR-3 | Κάθε θέμα → ένας φοιτητής |
| BR-4 | Επιλογή φοιτητή → οι υπόλοιπες δηλώσεις γίνονται REJECTED αυτόματα |
| BR-5 | Τριμελής = 3 διδάσκοντες, ο επιβλέπων υποχρεωτικά μέλος |
| BR-6 | Βαθμολόγηση μόνο αφού υπάρχει uploaded PDF |
| BR-7 | Τελικός βαθμός = μέσος όρος 3 βαθμών, οριστικοποιείται στους 3/3 |
| BR-8 | Βαθμός ≥ 5 → επιτυχία |
| BR-9 | Data isolation ανά ρόλο |

---

## 5. Καταστάσεις

```
Topic:       AVAILABLE → ASSIGNED → UNDER_EXAMINATION → COMPLETED
Application: PENDING → APPROVED | REJECTED | WITHDRAWN
Thesis:      IN_PROGRESS → UNDER_EXAMINATION → COMPLETED
Grading:     PENDING → PARTIAL → COMPLETE
```

---

## 6. Firestore Data Model

```
users/{uid}
  name: string
  email: string
  role: 'student' | 'professor' | 'secretariat'
  am?: string            // μόνο student
  semester?: number      // μόνο student
  department?: string    // μόνο professor

topics/{topicId}
  title: string
  description: string
  prerequisites: string
  keywords: string[]
  professorId: string
  professorName: string
  status: 'AVAILABLE' | 'ASSIGNED' | 'UNDER_EXAMINATION' | 'COMPLETED'
  createdAt: timestamp

applications/{applicationId}
  topicId: string
  topicTitle: string
  studentId: string
  studentName: string
  studentAm: string
  statement: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  submittedAt: timestamp

theses/{thesisId}
  topicId: string
  topicTitle: string
  studentId: string
  studentName: string
  supervisorId: string
  committee: string[]        // 3 professor uids, [0] = supervisor
  status: 'IN_PROGRESS' | 'UNDER_EXAMINATION' | 'COMPLETED'
  documentUrl: string | null
  finalGrade: number | null
  passed: boolean | null
  assignedAt: timestamp

grades/{gradeId}
  thesisId: string
  professorId: string
  professorName: string
  score: number              // 0-10
  comments: string
  createdAt: timestamp
```

---

## 7. Δομή Φακέλων (να δημιουργηθεί)

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # landing + login
│   │   ├── globals.css
│   │   ├── login/page.tsx
│   │   ├── student/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # dashboard
│   │   │   ├── topics/page.tsx           # αναζήτηση θεμάτων
│   │   │   ├── applications/page.tsx     # οι δηλώσεις μου
│   │   │   └── thesis/page.tsx           # η διπλωματική μου + upload
│   │   ├── professor/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── topics/page.tsx           # τα θέματά μου
│   │   │   ├── topics/new/page.tsx
│   │   │   ├── topics/[id]/page.tsx      # υποψήφιοι + επιλογή
│   │   │   ├── theses/page.tsx           # επιβλέψεις
│   │   │   └── grading/page.tsx          # βαθμολόγηση ως μέλος τριμελούς
│   │   ├── secretariat/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── results/page.tsx          # πίνακας + CSV export
│   │   └── api/
│   ├── components/
│   │   ├── ui/                           # Button, Card, Input, Badge, Table, Modal
│   │   ├── layout/                       # Navbar, Sidebar, RoleGuard
│   │   ├── topics/                       # TopicCard, TopicForm, TopicFilters
│   │   ├── applications/                 # ApplicationList, ApplicationRow
│   │   └── grading/                      # GradeForm, GradeSummary
│   ├── lib/
│   │   ├── firebase.ts                   # init
│   │   ├── auth.ts                        # SSO helpers, useAuth hook
│   │   ├── firestore/
│   │   │   ├── topics.ts
│   │   │   ├── applications.ts
│   │   │   ├── theses.ts
│   │   │   └── grades.ts
│   │   ├── storage.ts                    # PDF upload
│   │   ├── rules.ts                      # business rules validation
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts                      # όλα τα TypeScript interfaces
│   └── constants/
│       └── index.ts                      # statuses, labels στα ελληνικά
├── docs/
│   ├── requirements.md
│   └── diagrams/
│       ├── use-case.puml
│       ├── activity-assignment.puml
│       ├── activity-grading.puml
│       ├── sequence-application.puml
│       ├── sequence-grading.puml
│       └── class.puml
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── firestore.rules
├── storage.rules
├── firebase.json
├── .env.local.example
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 8. Οδηγίες Υλοποίησης

### Βήμα 1 — Bootstrap
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint
npm install firebase
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Βήμα 2 — Types & Constants
Δημιούργησε `src/types/index.ts` με interfaces για User, Topic, Application, Thesis, Grade
βάσει του data model στην ενότητα 6.
Δημιούργησε `src/constants/index.ts` με ελληνικά labels για κάθε status.

### Βήμα 3 — Firebase setup
- `src/lib/firebase.ts` — init με env vars
- `src/lib/auth.ts` — `signInWithSSO()`, `useAuth()` hook που επιστρέφει `{user, role, loading}`
- `.env.local.example` με όλα τα `NEXT_PUBLIC_FIREBASE_*`

### Βήμα 4 — Firestore layer
Ένα αρχείο ανά collection με typed CRUD functions.
Οι business rules (BR-1 έως BR-9) να ελέγχονται εδώ πριν από κάθε write.

### Βήμα 5 — UI Components
Απλά, καθαρά, με Tailwind. Χωρίς εξωτερικές βιβλιοθήκες UI.
Χρώματα: neutral base, ένα accent χρώμα. Responsive.

### Βήμα 6 — Σελίδες
Με τη σειρά: login → student → professor → secretariat.
`RoleGuard` component που κάνει redirect αν ο ρόλος δεν ταιριάζει.

### Βήμα 7 — Firestore Rules
Γράψε `firestore.rules` που επιβάλλει:
- Ο φοιτητής διαβάζει μόνο τις δικές του applications/thesis
- Ο διδάσκων γράφει μόνο στα δικά του topics
- Μόνο μέλη τριμελούς γράφουν grade για τη συγκεκριμένη thesis
- Η γραμματεία έχει read σε όλα

### Βήμα 8 — GitHub Actions
`ci.yml`: on push/PR → install → typecheck → test → build
`deploy.yml`: on push to main → build → deploy Firebase Hosting

### Βήμα 9 — Διαγράμματα PlantUML
Δημιούργησε τα 6 `.puml` αρχεία στο `docs/diagrams/` βάσει των απαιτήσεων:
- use-case.puml (και οι 4 actors με τα use cases τους)
- activity-assignment.puml (δήλωση → επιλογή → ανάθεση)
- activity-grading.puml (upload → βαθμολόγηση → αποτελέσματα)
- sequence-application.puml (φοιτητής δηλώνει ενδιαφέρον)
- sequence-grading.puml (τριμελής βαθμολογεί → υπολογισμός Μ.Ο.)
- class.puml (domain model με συσχετίσεις)

### Βήμα 10 — README
Οδηγίες εγκατάστασης, env vars, τρέξιμο, deploy.

---

## 9. Κανόνες κώδικα

- TypeScript strict — χωρίς `any`
- Server Components by default, `'use client'` μόνο όπου χρειάζεται
- Ελληνικά strings στο UI, αγγλικά στον κώδικα
- Κάθε Firestore write περνά από validation function
- Χωρίς hardcoded Firebase keys — μόνο env vars
- Σχόλια στα ελληνικά όπου η λογική είναι business rule

---

## 10. Σειρά εκτέλεσης

Δούλεψε με αυτή τη σειρά και δείξε μου κάθε βήμα πριν προχωρήσεις:

1. Bootstrap + δομή φακέλων
2. Types + constants
3. Firebase lib + auth
4. Firestore data layer + business rules
5. UI components
6. Σελίδες ανά ρόλο
7. Firestore/Storage rules
8. GitHub Actions
9. PlantUML διαγράμματα
10. README + τελικός έλεγχος
