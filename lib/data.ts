// Mock data & domain types for the diploma management prototype.
// No backend — everything here is static demo data (θα αντικατασταθεί από το API).

/* -------------------------------------------------------------------------- */
/*  Καταστάσεις θέματος / διπλωματικής                                          */
/* -------------------------------------------------------------------------- */

export type DiplomaStatus =
  | 'draft' // ΥΠΟ-ΕΠΕΞΕΡΓΑΣΙΑ
  | 'available' // ΔΙΑΘΕΣΙΜΟ
  | 'assigned' // ΑΝΑΤΕΘΕΙΜΕΝΟ
  | 'review' // ΥΠΟ ΕΞΕΤΑΣΗ
  | 'completed' // ΟΛΟΚΛΗΡΩΜΕΝΟ

export const STATUS_META: Record<
  DiplomaStatus,
  { label: string; className: string; step: number }
> = {
  draft: {
    label: 'ΥΠΟ ΕΠΕΞΕΡΓΑΣΙΑ',
    className: 'bg-status-draft text-status-draft-foreground',
    step: 0,
  },
  available: {
    label: 'ΔΙΑΘΕΣΙΜΟ',
    className: 'bg-status-available text-status-available-foreground',
    step: 1,
  },
  assigned: {
    label: 'ΑΝΑΤΕΘΕΙΜΕΝΟ',
    className: 'bg-status-assigned text-status-assigned-foreground',
    step: 2,
  },
  review: {
    label: 'ΥΠΟ ΕΞΕΤΑΣΗ',
    className: 'bg-status-review text-status-review-foreground',
    step: 3,
  },
  completed: {
    label: 'ΟΛΟΚΛΗΡΩΜΕΝΟ',
    className: 'bg-status-completed text-status-completed-foreground',
    step: 4,
  },
}

export const WORKFLOW_STEPS: { status: DiplomaStatus; label: string }[] = [
  { status: 'draft', label: 'Υπό επεξεργασία' },
  { status: 'available', label: 'Διαθέσιμο' },
  { status: 'assigned', label: 'Ανατεθειμένο' },
  { status: 'review', label: 'Υπό εξέταση' },
  { status: 'completed', label: 'Ολοκληρωμένο' },
]

/* -------------------------------------------------------------------------- */
/*  Καταστάσεις δήλωσης ενδιαφέροντος (Application)                             */
/* -------------------------------------------------------------------------- */

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'ΕΚΚΡΕΜΕΙ',
    className: 'bg-status-review text-status-review-foreground',
  },
  approved: {
    label: 'ΕΓΚΡΙΘΗΚΕ',
    className: 'bg-status-completed text-status-completed-foreground',
  },
  rejected: {
    label: 'ΑΠΟΡΡΙΦΘΗΚΕ',
    className: 'bg-status-rejected text-status-rejected-foreground',
  },
  withdrawn: {
    label: 'ΑΝΑΚΛΗΘΗΚΕ',
    className: 'bg-status-draft text-status-draft-foreground',
  },
}

/* -------------------------------------------------------------------------- */
/*  Καταστάσεις αιτήματος τροποποίησης θέματος                                  */
/* -------------------------------------------------------------------------- */

export type ChangeRequestStatus =
  | 'pending_student' // αναμονή επιβεβαίωσης φοιτητή
  | 'pending_secretary' // αναμονή έγκρισης γραμματείας
  | 'approved'
  | 'rejected'

export const CHANGE_REQUEST_STATUS_META: Record<
  ChangeRequestStatus,
  { label: string; className: string }
> = {
  pending_student: {
    label: 'ΑΝΑΜΟΝΗ ΦΟΙΤΗΤΗ',
    className: 'bg-status-assigned text-status-assigned-foreground',
  },
  pending_secretary: {
    label: 'ΑΝΑΜΟΝΗ ΓΡΑΜΜΑΤΕΙΑΣ',
    className: 'bg-status-review text-status-review-foreground',
  },
  approved: {
    label: 'ΕΓΚΡΙΘΗΚΕ',
    className: 'bg-status-completed text-status-completed-foreground',
  },
  rejected: {
    label: 'ΑΠΟΡΡΙΦΘΗΚΕ',
    className: 'bg-status-rejected text-status-rejected-foreground',
  },
}

/* -------------------------------------------------------------------------- */
/*  Ρόλοι                                                                       */
/* -------------------------------------------------------------------------- */

export type Role = 'student' | 'professor' | 'committee' | 'secretary'

export const ROLE_META: Record<
  Role,
  { label: string; description: string; person: string; detail: string }
> = {
  student: {
    label: 'Φοιτητής',
    description: 'Αναζήτηση θεμάτων, δηλώσεις ενδιαφέροντος και παρακολούθηση διπλωματικής.',
    person: 'Ελένη Παπαδοπούλου',
    detail: 'ΑΜ 3180142 · Τμήμα Πληροφορικής',
  },
  professor: {
    label: 'Διδάσκων',
    description: 'Δημιουργία θεμάτων, ανάθεση φοιτητών και ορισμός τριμελών επιτροπών.',
    person: 'Δρ. Γεώργιος Αντωνίου',
    detail: 'Αναπληρωτής Καθηγητής · Τμήμα Πληροφορικής',
  },
  committee: {
    label: 'Τριμελής Επιτροπή',
    description: 'Αξιολόγηση και βαθμολόγηση διπλωματικών εργασιών υπό εξέταση.',
    person: 'Δρ. Μαρία Κωνσταντίνου',
    detail: 'Μέλος επιτροπής · Τμήμα Πληροφορικής',
  },
  secretary: {
    label: 'Γραμματεία',
    description: 'Εποπτεία όλων των διπλωματικών και δημοσίευση αποτελεσμάτων.',
    person: 'Γραμματεία Τμήματος',
    detail: 'Διοικητικό προσωπικό',
  },
}

/** Τρέχουσες περσόνες του πρωτοτύπου (θα προέρχονται από το SSO). */
export const CURRENT_STUDENT = ROLE_META.student.person
export const CURRENT_PROFESSOR = ROLE_META.professor.person
export const CURRENT_COMMITTEE_MEMBER = ROLE_META.committee.person

/* -------------------------------------------------------------------------- */
/*  Διδάσκοντες                                                                 */
/* -------------------------------------------------------------------------- */

export type Professor = {
  name: string
  rank: string
  area: string
  email: string
}

export const PROFESSORS: Professor[] = [
  {
    name: 'Δρ. Γεώργιος Αντωνίου',
    rank: 'Αναπληρωτής Καθηγητής',
    area: 'Τεχνητή Νοημοσύνη',
    email: 'g.antoniou@uni.gr',
  },
  {
    name: 'Δρ. Μαρία Κωνσταντίνου',
    rank: 'Επίκουρη Καθηγήτρια',
    area: 'Ασφάλεια',
    email: 'm.konstantinou@uni.gr',
  },
  {
    name: 'Δρ. Νικόλαος Δήμου',
    rank: 'Καθηγητής',
    area: 'Δίκτυα Υπολογιστών',
    email: 'n.dimou@uni.gr',
  },
  {
    name: 'Δρ. Ελευθερία Σπανού',
    rank: 'Επίκουρη Καθηγήτρια',
    area: 'Βάσεις Δεδομένων',
    email: 'e.spanou@uni.gr',
  },
  {
    name: 'Δρ. Παύλος Ρήγας',
    rank: 'Λέκτορας',
    area: 'Λογισμικό',
    email: 'p.rigas@uni.gr',
  },
]

/* -------------------------------------------------------------------------- */
/*  Θέματα                                                                      */
/* -------------------------------------------------------------------------- */

export type Topic = {
  id: string
  title: string
  titleEn: string
  summary: string
  description: string
  descriptionEn: string
  prerequisites: string[]
  professor: string
  area: string
  tags: string[]
  status: DiplomaStatus
  createdAt: string
  student?: string
  studentAm?: string
  committee?: string[]
  applicants?: { name: string; am: string; date: string; note: string }[]
  grade?: number | null
  deadline?: string
  document?: { name: string; size: string; submittedAt: string }
}

export const AREAS = [
  'Τεχνητή Νοημοσύνη',
  'Δίκτυα Υπολογιστών',
  'Βάσεις Δεδομένων',
  'Ασφάλεια',
  'Λογισμικό',
  'Ανθρώπινη-Υπολογιστική Αλληλεπίδραση',
]

export const TOPICS: Topic[] = [
  {
    id: 'THE-2401',
    title: 'Ανίχνευση ανωμαλιών σε δίκτυα IoT με χρήση Deep Learning',
    titleEn: 'Anomaly detection in IoT networks using Deep Learning',
    summary:
      'Ανάπτυξη μοντέλου βαθιάς μάθησης για την αναγνώριση κακόβουλης κίνησης σε συσκευές IoT.',
    description:
      'Η εργασία εστιάζει στη σχεδίαση και εκπαίδευση νευρωνικών δικτύων για την ανίχνευση ανωμαλιών σε δεδομένα δικτυακής κίνησης IoT. Θα μελετηθούν αρχιτεκτονικές LSTM και autoencoders, θα γίνει σύγκριση απόδοσης και θα αξιολογηθεί η ανθεκτικότητα σε πραγματικά σύνολα δεδομένων.',
    descriptionEn:
      'The work focuses on designing and training neural networks for anomaly detection in IoT network traffic. LSTM and autoencoder architectures are compared and evaluated for robustness on real-world datasets.',
    prerequisites: ['Μηχανική Μάθηση', 'Δίκτυα Υπολογιστών', 'Καλή γνώση Python'],
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Ασφάλεια',
    tags: ['Deep Learning', 'IoT', 'Cybersecurity'],
    status: 'available',
    createdAt: '2025-02-10',
    deadline: '2025-03-15',
    applicants: [
      {
        name: 'Ελένη Παπαδοπούλου',
        am: '3180142',
        date: '2025-02-14',
        note: 'Έχω υλοποιήσει project ανίχνευσης εισβολών στο μάθημα Ασφάλειας.',
      },
      {
        name: 'Σοφία Μακρή',
        am: '3190088',
        date: '2025-02-16',
        note: 'Έχω εμπειρία σε projects Python και PyTorch.',
      },
    ],
  },
  {
    id: 'THE-2402',
    title: 'Σύστημα συστάσεων για ακαδημαϊκές δημοσιεύσεις',
    titleEn: 'Recommender system for academic publications',
    summary:
      'Μηχανή συστάσεων που προτείνει σχετικές δημοσιεύσεις βάσει ιστορικού ανάγνωσης.',
    description:
      'Στόχος είναι η υλοποίηση υβριδικού συστήματος συστάσεων (collaborative + content-based) για επιστημονικά άρθρα. Θα αξιοποιηθούν embeddings κειμένου και γράφοι συνεργασίας συγγραφέων.',
    descriptionEn:
      'Implementation of a hybrid (collaborative + content-based) recommender system for scientific papers, leveraging text embeddings and co-authorship graphs.',
    prerequisites: ['Ανάκτηση Πληροφορίας', 'Αλγόριθμοι', 'Βάσεις Δεδομένων'],
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Τεχνητή Νοημοσύνη',
    tags: ['Recommender Systems', 'NLP'],
    status: 'available',
    createdAt: '2025-02-04',
    deadline: '2025-03-20',
    applicants: [
      {
        name: 'Σοφία Μακρή',
        am: '3190088',
        date: '2025-02-11',
        note: 'Με ενδιαφέρει η ανάκτηση πληροφορίας και έχω άριστα στο σχετικό μάθημα.',
      },
    ],
  },
  {
    id: 'THE-2403',
    title: 'Κατανεμημένη βάση δεδομένων για εφαρμογές πραγματικού χρόνου',
    titleEn: 'Distributed database for real-time applications',
    summary: 'Σχεδίαση και αξιολόγηση κατανεμημένου συστήματος αποθήκευσης χαμηλής καθυστέρησης.',
    description:
      'Μελέτη μηχανισμών replication και consistency σε κατανεμημένες βάσεις δεδομένων. Θα υλοποιηθεί prototype και θα μετρηθεί η απόδοση κάτω από διαφορετικά φορτία.',
    descriptionEn:
      'Study of replication and consistency mechanisms in distributed databases. A prototype is implemented and benchmarked under varying workloads.',
    prerequisites: ['Βάσεις Δεδομένων', 'Κατανεμημένα Συστήματα'],
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Βάσεις Δεδομένων',
    tags: ['Distributed Systems', 'Databases'],
    status: 'draft',
    createdAt: '2025-02-18',
  },
  {
    id: 'THE-2404',
    title: 'Αυτόματη περίληψη νομικών κειμένων στα Ελληνικά',
    titleEn: 'Automatic summarization of Greek legal documents',
    summary: 'Μοντέλο NLP για την παραγωγή περιλήψεων εκτεταμένων νομικών εγγράφων.',
    description:
      'Η εργασία διερευνά transformer-based προσεγγίσεις για abstractive summarization σε ελληνικά νομικά κείμενα, με έμφαση στη διατήρηση της νομικής ορολογίας.',
    descriptionEn:
      'The work explores transformer-based approaches for abstractive summarization of Greek legal texts, with emphasis on preserving legal terminology.',
    prerequisites: ['Επεξεργασία Φυσικής Γλώσσας', 'Μηχανική Μάθηση'],
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Τεχνητή Νοημοσύνη',
    tags: ['NLP', 'Transformers', 'Greek'],
    status: 'assigned',
    createdAt: '2024-11-12',
    student: 'Ελένη Παπαδοπούλου',
    studentAm: '3180142',
    committee: ['Δρ. Γεώργιος Αντωνίου', 'Δρ. Μαρία Κωνσταντίνου', 'Δρ. Νικόλαος Δήμου'],
    deadline: '2025-06-30',
    applicants: [
      {
        name: 'Ελένη Παπαδοπούλου',
        am: '3180142',
        date: '2024-11-02',
        note: 'Έχω παρακολουθήσει τα μαθήματα NLP και Μηχανικής Μάθησης με άριστα.',
      },
    ],
  },
  {
    id: 'THE-2405',
    title: 'Οπτικοποίηση δεδομένων μεγάλης κλίμακας στον περιηγητή',
    titleEn: 'Large-scale data visualization in the browser',
    summary: 'Διαδραστική οπτικοποίηση εκατομμυρίων σημείων δεδομένων με WebGL.',
    description:
      'Ανάπτυξη βιβλιοθήκης οπτικοποίησης που αξιοποιεί WebGL για την απόδοση μεγάλων συνόλων δεδομένων με ομαλή διάδραση.',
    descriptionEn:
      'Development of a visualization library that leverages WebGL to render large datasets with smooth interaction.',
    prerequisites: ['Γραφικά Υπολογιστών', 'Ανάπτυξη Εφαρμογών Web'],
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Ανθρώπινη-Υπολογιστική Αλληλεπίδραση',
    tags: ['Visualization', 'WebGL', 'Frontend'],
    status: 'review',
    createdAt: '2024-09-05',
    student: 'Δημήτρης Ιωάννου',
    studentAm: '3180211',
    committee: ['Δρ. Γεώργιος Αντωνίου', 'Δρ. Μαρία Κωνσταντίνου', 'Δρ. Νικόλαος Δήμου'],
    deadline: '2025-02-28',
    document: {
      name: 'Ioannou_Diplomatiki_final.pdf',
      size: '8.4 MB',
      submittedAt: '2025-02-20',
    },
  },
  {
    id: 'THE-2406',
    title: 'Ανάλυση συναισθήματος σε ελληνικά social media δεδομένα',
    titleEn: 'Sentiment analysis on Greek social media data',
    summary: 'Ταξινόμηση συναισθήματος αναρτήσεων με χρήση προεκπαιδευμένων μοντέλων.',
    description:
      'Συλλογή και επισημείωση ελληνικών δεδομένων social media, fine-tuning μοντέλων και συγκριτική αξιολόγηση.',
    descriptionEn:
      'Collection and annotation of Greek social media data, model fine-tuning and comparative evaluation.',
    prerequisites: ['Επεξεργασία Φυσικής Γλώσσας', 'Στατιστική'],
    professor: 'Δρ. Μαρία Κωνσταντίνου',
    area: 'Τεχνητή Νοημοσύνη',
    tags: ['Sentiment Analysis', 'NLP'],
    status: 'completed',
    createdAt: '2024-02-15',
    student: 'Άννα Βασιλείου',
    studentAm: '3170455',
    committee: ['Δρ. Μαρία Κωνσταντίνου', 'Δρ. Γεώργιος Αντωνίου', 'Δρ. Νικόλαος Δήμου'],
    grade: 9.2,
    deadline: '2024-09-30',
    document: {
      name: 'Vasileiou_Diplomatiki_final.pdf',
      size: '5.1 MB',
      submittedAt: '2024-09-12',
    },
  },
  {
    id: 'THE-2407',
    title: 'Ανίχνευση ευπαθειών σε smart contracts',
    titleEn: 'Vulnerability detection in smart contracts',
    summary: 'Στατική ανάλυση κώδικα Solidity για εντοπισμό ευπαθειών ασφαλείας.',
    description:
      'Ανάπτυξη εργαλείου στατικής ανάλυσης που εντοπίζει κοινά μοτίβα ευπαθειών σε smart contracts blockchain.',
    descriptionEn:
      'Development of a static analysis tool that detects common vulnerability patterns in blockchain smart contracts.',
    prerequisites: ['Ασφάλεια Πληροφοριακών Συστημάτων', 'Μεταγλωττιστές'],
    professor: 'Δρ. Μαρία Κωνσταντίνου',
    area: 'Ασφάλεια',
    tags: ['Blockchain', 'Security', 'Static Analysis'],
    status: 'available',
    createdAt: '2025-01-28',
    deadline: '2025-03-30',
  },
  {
    id: 'THE-2408',
    title: 'Βελτιστοποίηση ενεργειακής κατανάλωσης σε data centers',
    titleEn: 'Energy consumption optimization in data centers',
    summary: 'Αλγόριθμοι δρομολόγησης εργασιών για μείωση ενεργειακού αποτυπώματος.',
    description:
      'Μελέτη και προσομοίωση αλγορίθμων scheduling με στόχο τη μείωση της ενεργειακής κατανάλωσης σε κέντρα δεδομένων.',
    descriptionEn:
      'Study and simulation of scheduling algorithms aiming to reduce energy consumption in data centers.',
    prerequisites: ['Λειτουργικά Συστήματα', 'Αλγόριθμοι'],
    professor: 'Δρ. Νικόλαος Δήμου',
    area: 'Δίκτυα Υπολογιστών',
    tags: ['Green Computing', 'Scheduling'],
    status: 'review',
    createdAt: '2024-10-01',
    student: 'Κωνσταντίνος Παύλου',
    studentAm: '3180377',
    committee: ['Δρ. Νικόλαος Δήμου', 'Δρ. Γεώργιος Αντωνίου', 'Δρ. Μαρία Κωνσταντίνου'],
    deadline: '2025-03-10',
    document: {
      name: 'Pavlou_Diplomatiki_v2.pdf',
      size: '6.8 MB',
      submittedAt: '2025-01-30',
    },
  },
]

export function topicById(id: string) {
  return TOPICS.find((t) => t.id === id)
}

/* -------------------------------------------------------------------------- */
/*  Δηλώσεις ενδιαφέροντος                                                      */
/* -------------------------------------------------------------------------- */

export type Application = {
  id: string
  topicId: string
  topicTitle: string
  professor: string
  student: string
  studentAm: string
  note: string
  status: ApplicationStatus
  submittedAt: string
  resolvedAt?: string
  reason?: string
}

export const APPLICATIONS: Application[] = [
  {
    id: 'APP-1041',
    topicId: 'THE-2404',
    topicTitle: 'Αυτόματη περίληψη νομικών κειμένων στα Ελληνικά',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    student: 'Ελένη Παπαδοπούλου',
    studentAm: '3180142',
    note: 'Έχω παρακολουθήσει τα μαθήματα NLP και Μηχανικής Μάθησης με άριστα.',
    status: 'approved',
    submittedAt: '2024-11-02',
    resolvedAt: '2024-11-12',
  },
  {
    id: 'APP-1102',
    topicId: 'THE-2401',
    topicTitle: 'Ανίχνευση ανωμαλιών σε δίκτυα IoT με χρήση Deep Learning',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    student: 'Ελένη Παπαδοπούλου',
    studentAm: '3180142',
    note: 'Έχω υλοποιήσει project ανίχνευσης εισβολών στο μάθημα Ασφάλειας.',
    status: 'pending',
    submittedAt: '2025-02-14',
  },
  {
    id: 'APP-1088',
    topicId: 'THE-2407',
    topicTitle: 'Ανίχνευση ευπαθειών σε smart contracts',
    professor: 'Δρ. Μαρία Κωνσταντίνου',
    student: 'Ελένη Παπαδοπούλου',
    studentAm: '3180142',
    note: 'Ενδιαφέρομαι για την ασφάλεια blockchain εφαρμογών.',
    status: 'rejected',
    submittedAt: '2025-01-30',
    resolvedAt: '2025-02-06',
    reason: 'Επιλέχθηκε άλλος υποψήφιος με μεγαλύτερη συνάφεια μαθημάτων.',
  },
  {
    id: 'APP-1063',
    topicId: 'THE-2402',
    topicTitle: 'Σύστημα συστάσεων για ακαδημαϊκές δημοσιεύσεις',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    student: 'Ελένη Παπαδοπούλου',
    studentAm: '3180142',
    note: 'Με ενδιαφέρει ο συνδυασμός NLP και γράφων.',
    status: 'withdrawn',
    submittedAt: '2024-12-18',
    resolvedAt: '2025-01-08',
  },
]

/** BR-2 — έως 3 ενεργές (εκκρεμείς) δηλώσεις ανά φοιτητή. */
export const MAX_ACTIVE_APPLICATIONS = 3

export function applicationsOf(student: string) {
  return APPLICATIONS.filter((a) => a.student === student)
}

/* -------------------------------------------------------------------------- */
/*  Βαθμολόγηση                                                                 */
/* -------------------------------------------------------------------------- */

export type GradeCriteria = {
  content: number
  methodology: number
  writing: number
  presentation: number
}

export const CRITERIA: {
  key: keyof GradeCriteria
  label: string
  description: string
  weight: number
}[] = [
  {
    key: 'content',
    label: 'Επιστημονικό περιεχόμενο',
    description: 'Πληρότητα, ορθότητα και πρωτοτυπία της εργασίας.',
    weight: 0.4,
  },
  {
    key: 'methodology',
    label: 'Μεθοδολογία',
    description: 'Καταλληλότητα προσέγγισης και τεκμηρίωση αποτελεσμάτων.',
    weight: 0.3,
  },
  {
    key: 'writing',
    label: 'Συγγραφή κειμένου',
    description: 'Δομή, σαφήνεια και βιβλιογραφική τεκμηρίωση.',
    weight: 0.2,
  },
  {
    key: 'presentation',
    label: 'Παρουσίαση',
    description: 'Προφορική υποστήριξη και απαντήσεις σε ερωτήσεις.',
    weight: 0.1,
  },
]

export type Grade = {
  id: string
  topicId: string
  professor: string
  role: 'supervisor' | 'member'
  criteria: GradeCriteria
  score: number
  comments: string
  createdAt: string
}

export const GRADES: Grade[] = [
  {
    id: 'GRD-501',
    topicId: 'THE-2406',
    professor: 'Δρ. Μαρία Κωνσταντίνου',
    role: 'supervisor',
    criteria: { content: 9.5, methodology: 9.5, writing: 9.5, presentation: 9.5 },
    score: 9.5,
    comments:
      'Εξαιρετική εργασία με πρωτότυπο dataset και προσεκτική αξιολόγηση. Η συγγραφή είναι σαφής και πλήρης.',
    createdAt: '2024-09-25',
  },
  {
    id: 'GRD-502',
    topicId: 'THE-2406',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    role: 'member',
    criteria: { content: 9, methodology: 9, writing: 9, presentation: 9 },
    score: 9,
    comments: 'Πολύ καλή μεθοδολογία. Θα ήθελα εκτενέστερη σύγκριση με baseline μοντέλα.',
    createdAt: '2024-09-26',
  },
  {
    id: 'GRD-503',
    topicId: 'THE-2406',
    professor: 'Δρ. Νικόλαος Δήμου',
    role: 'member',
    criteria: { content: 9, methodology: 8.5, writing: 9.5, presentation: 9 },
    score: 9,
    comments: 'Άρτια παρουσίαση και τεκμηρίωση των αποτελεσμάτων.',
    createdAt: '2024-09-27',
  },
  {
    id: 'GRD-511',
    topicId: 'THE-2408',
    professor: 'Δρ. Μαρία Κωνσταντίνου',
    role: 'member',
    criteria: { content: 8.5, methodology: 8.5, writing: 8, presentation: 9 },
    score: 8.5,
    comments: 'Καλή προσομοίωση, χρειάζεται όμως ισχυρότερη στατιστική τεκμηρίωση.',
    createdAt: '2025-02-08',
  },
  {
    id: 'GRD-512',
    topicId: 'THE-2405',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    role: 'supervisor',
    criteria: { content: 9, methodology: 9, writing: 8.5, presentation: 9.5 },
    score: 9,
    comments: 'Πολύ καλή τεχνική υλοποίηση με εντυπωσιακή απόδοση στον περιηγητή.',
    createdAt: '2025-02-24',
  },
]

/** BR-8 — βαθμός ≥ 5 σημαίνει επιτυχία. */
export const PASS_THRESHOLD = 5

export function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function gradesFor(topicId: string) {
  return GRADES.filter((g) => g.topicId === topicId)
}

/** BR-7 — τελικός βαθμός = μέσος όρος 3 βαθμών, οριστικοποιείται στους 3/3. */
export function finalGradeFor(topicId: string): number | null {
  const list = gradesFor(topicId)
  if (list.length < 3) return null
  return round1(list.reduce((sum, g) => sum + g.score, 0) / list.length)
}

export function weightedScore(criteria: GradeCriteria) {
  return round1(CRITERIA.reduce((sum, c) => sum + criteria[c.key] * c.weight, 0))
}

/* -------------------------------------------------------------------------- */
/*  Παρατηρήσεις επί του κειμένου                                               */
/* -------------------------------------------------------------------------- */

export type Annotation = {
  id: string
  topicId: string
  professor: string
  page: number
  text: string
  createdAt: string
}

export const ANNOTATIONS: Annotation[] = [
  {
    id: 'ANN-201',
    topicId: 'THE-2405',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    page: 14,
    text: 'Να προστεθεί αναφορά στη σχετική βιβλιογραφία για τα WebGL pipelines.',
    createdAt: '2025-02-23',
  },
  {
    id: 'ANN-202',
    topicId: 'THE-2405',
    professor: 'Δρ. Μαρία Κωνσταντίνου',
    page: 31,
    text: 'Τα γραφήματα απόδοσης χρειάζονται άξονες με μονάδες μέτρησης.',
    createdAt: '2025-02-25',
  },
  {
    id: 'ANN-211',
    topicId: 'THE-2408',
    professor: 'Δρ. Μαρία Κωνσταντίνου',
    page: 22,
    text: 'Η σύγκριση με τον αλγόριθμο FCFS δεν τεκμηριώνεται επαρκώς στον πίνακα 4.2.',
    createdAt: '2025-02-05',
  },
]

export function annotationsFor(topicId: string) {
  return ANNOTATIONS.filter((a) => a.topicId === topicId)
}

/* -------------------------------------------------------------------------- */
/*  Αιτήματα τροποποίησης θέματος                                               */
/* -------------------------------------------------------------------------- */

export type ChangeRequest = {
  id: string
  topicId: string
  currentTitle: string
  proposedTitle: string
  reason: string
  requestedBy: string
  student: string
  status: ChangeRequestStatus
  createdAt: string
  studentConfirmedAt?: string
  secretaryDecisionAt?: string
}

export const CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 'REQ-301',
    topicId: 'THE-2404',
    currentTitle: 'Αυτόματη περίληψη νομικών κειμένων στα Ελληνικά',
    proposedTitle:
      'Αυτόματη περίληψη νομικών κειμένων στα Ελληνικά με χρήση μεγάλων γλωσσικών μοντέλων',
    reason:
      'Η βιβλιογραφία εξελίχθηκε σημαντικά και η εργασία στράφηκε σε LLM-based προσεγγίσεις. Ο τίτλος πρέπει να αποτυπώνει το πραγματικό αντικείμενο.',
    requestedBy: 'Δρ. Γεώργιος Αντωνίου',
    student: 'Ελένη Παπαδοπούλου',
    status: 'pending_student',
    createdAt: '2025-03-04',
  },
  {
    id: 'REQ-302',
    topicId: 'THE-2405',
    currentTitle: 'Οπτικοποίηση δεδομένων μεγάλης κλίμακας στον περιηγητή',
    proposedTitle: 'Διαδραστική οπτικοποίηση δεδομένων μεγάλης κλίμακας με WebGPU',
    reason: 'Η υλοποίηση μεταφέρθηκε από WebGL σε WebGPU μετά από συμφωνία με τον φοιτητή.',
    requestedBy: 'Δρ. Γεώργιος Αντωνίου',
    student: 'Δημήτρης Ιωάννου',
    status: 'pending_secretary',
    createdAt: '2025-02-18',
    studentConfirmedAt: '2025-02-19',
  },
  {
    id: 'REQ-303',
    topicId: 'THE-2408',
    currentTitle: 'Βελτιστοποίηση ενεργειακής κατανάλωσης σε data centers',
    proposedTitle: 'Βελτιστοποίηση ενεργειακής κατανάλωσης σε υβριδικά data centers',
    reason: 'Διεύρυνση του αντικειμένου σε υβριδικές υποδομές cloud/on-premise.',
    requestedBy: 'Δρ. Νικόλαος Δήμου',
    student: 'Κωνσταντίνος Παύλου',
    status: 'approved',
    createdAt: '2024-12-02',
    studentConfirmedAt: '2024-12-03',
    secretaryDecisionAt: '2024-12-10',
  },
]

/* -------------------------------------------------------------------------- */
/*  Προϋποθέσεις ανάληψης διπλωματικής                                          */
/* -------------------------------------------------------------------------- */

/**
 * Προϋποθέσεις οδηγού σπουδών: ο φοιτητής πρέπει να βρίσκεται τουλάχιστον
 * στο 4ο έτος και να οφείλει έως 8 μαθήματα. Όταν δεν υπάρχει διασύνδεση με
 * το φοιτητολόγιο, η γραμματεία συντηρεί χειροκίνητα τη λίστα δικαιούχων.
 */
export const ELIGIBILITY_RULES = {
  minYear: 4,
  maxOwedCourses: 8,
  minCredits: 180,
}

export type StudentRecord = {
  name: string
  am: string
  email: string
  year: number
  semester: number
  owedCourses: number
  credits: number
  gpa: number
  /** Χειροκίνητη προσθήκη από τη γραμματεία (override φοιτητολογίου). */
  manualOverride: boolean
  transcript?: { name: string; uploadedAt: string }
}

export const STUDENTS: StudentRecord[] = [
  {
    name: 'Ελένη Παπαδοπούλου',
    am: '3180142',
    email: 'e.papadopoulou@uni.gr',
    year: 5,
    semester: 9,
    owedCourses: 2,
    credits: 228,
    gpa: 8.7,
    manualOverride: false,
    transcript: { name: 'analytiki_3180142.pdf', uploadedAt: '2025-01-15' },
  },
  {
    name: 'Δημήτρης Ιωάννου',
    am: '3180211',
    email: 'd.ioannou@uni.gr',
    year: 5,
    semester: 10,
    owedCourses: 1,
    credits: 234,
    gpa: 8.1,
    manualOverride: false,
    transcript: { name: 'analytiki_3180211.pdf', uploadedAt: '2024-10-02' },
  },
  {
    name: 'Σοφία Μακρή',
    am: '3190088',
    email: 's.makri@uni.gr',
    year: 4,
    semester: 8,
    owedCourses: 6,
    credits: 192,
    gpa: 7.9,
    manualOverride: false,
  },
  {
    name: 'Κωνσταντίνος Παύλου',
    am: '3180377',
    email: 'k.pavlou@uni.gr',
    year: 5,
    semester: 10,
    owedCourses: 0,
    credits: 240,
    gpa: 8.4,
    manualOverride: false,
    transcript: { name: 'analytiki_3180377.pdf', uploadedAt: '2024-09-20' },
  },
  {
    name: 'Άννα Βασιλείου',
    am: '3170455',
    email: 'a.vasileiou@uni.gr',
    year: 5,
    semester: 11,
    owedCourses: 0,
    credits: 240,
    gpa: 9.1,
    manualOverride: false,
  },
  {
    name: 'Γιώργος Λέκκας',
    am: '3200173',
    email: 'g.lekkas@uni.gr',
    year: 3,
    semester: 6,
    owedCourses: 11,
    credits: 132,
    gpa: 6.8,
    manualOverride: false,
  },
  {
    name: 'Ραφαήλ Μπίτσης',
    am: '3190412',
    email: 'r.bitsis@uni.gr',
    year: 4,
    semester: 8,
    owedCourses: 10,
    credits: 168,
    gpa: 7.2,
    // Προστέθηκε χειροκίνητα από τη γραμματεία μετά από απόφαση συνέλευσης.
    manualOverride: true,
  },
]

export type EligibilityCheck = {
  eligible: boolean
  reasons: string[]
}

/** Έλεγχος προϋποθέσεων — επιστρέφει και τους λόγους αποτυχίας για το UI. */
export function checkEligibility(student: StudentRecord): EligibilityCheck {
  if (student.manualOverride) return { eligible: true, reasons: [] }
  const reasons: string[] = []
  if (student.year < ELIGIBILITY_RULES.minYear) {
    reasons.push(
      `Απαιτείται φοίτηση τουλάχιστον στο ${ELIGIBILITY_RULES.minYear}ο έτος (τρέχον: ${student.year}ο).`,
    )
  }
  if (student.owedCourses > ELIGIBILITY_RULES.maxOwedCourses) {
    reasons.push(
      `Οφείλονται ${student.owedCourses} μαθήματα — το ανώτατο όριο είναι ${ELIGIBILITY_RULES.maxOwedCourses}.`,
    )
  }
  if (student.credits < ELIGIBILITY_RULES.minCredits) {
    reasons.push(
      `Απαιτούνται ${ELIGIBILITY_RULES.minCredits} ECTS (τρέχοντα: ${student.credits}).`,
    )
  }
  return { eligible: reasons.length === 0, reasons }
}

export function studentByName(name: string) {
  return STUDENTS.find((s) => s.name === name)
}

/* -------------------------------------------------------------------------- */
/*  Λοιπά                                                                       */
/* -------------------------------------------------------------------------- */

export const CANDIDATES = [
  {
    name: 'Ελένη Παπαδοπούλου',
    am: '3180142',
    gpa: 8.7,
    year: '5ο έτος',
    note: 'Έχω παρακολουθήσει τα μαθήματα NLP και Μηχανικής Μάθησης με άριστα.',
    date: '2024-11-02',
  },
  {
    name: 'Δημήτρης Ιωάννου',
    am: '3180211',
    gpa: 8.1,
    year: '5ο έτος',
    note: 'Ενδιαφέρομαι ιδιαίτερα για την εφαρμογή σε πραγματικά δεδομένα.',
    date: '2024-11-05',
  },
  {
    name: 'Σοφία Μακρή',
    am: '3190088',
    gpa: 7.9,
    year: '4ο έτος',
    note: 'Έχω εμπειρία σε projects Python και PyTorch.',
    date: '2024-11-08',
  },
]

export const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Νέα δήλωση ενδιαφέροντος',
    body: 'Η Σοφία Μακρή δήλωσε ενδιαφέρον για το θέμα THE-2402.',
    time: 'πριν 2 ώρες',
    unread: true,
  },
  {
    id: 2,
    title: 'Αίτημα τροποποίησης θέματος',
    body: 'Εκκρεμεί επιβεβαίωση για την αλλαγή τίτλου του THE-2404.',
    time: 'πριν 1 ημέρα',
    unread: true,
  },
  {
    id: 3,
    title: 'Υποβολή τελικού κειμένου',
    body: 'Ο Δημήτρης Ιωάννου υπέβαλε το τελικό κείμενο (THE-2405).',
    time: 'πριν 3 ημέρες',
    unread: false,
  },
]

export function statusMeta(status: DiplomaStatus) {
  return STATUS_META[status]
}

const DATE_FORMATTER = new Intl.DateTimeFormat('el-GR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/** Μορφοποίηση ISO ημερομηνίας σε ελληνικό format (π.χ. 04 Μαρ 2025). */
export function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return DATE_FORMATTER.format(date)
}
