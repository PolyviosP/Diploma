// Mock data & domain types for the thesis management prototype.
// No backend — everything here is static demo data.

export type ThesisStatus =
  | 'draft' // ΥΠΟ-ΕΠΕΞΕΡΓΑΣΙΑ
  | 'available' // ΔΙΑΘΕΣΙΜΟ
  | 'assigned' // ΑΝΑΤΕΘΕΙΜΕΝΟ
  | 'review' // ΥΠΟ ΕΞΕΤΑΣΗ
  | 'completed' // ΟΛΟΚΛΗΡΩΜΕΝΟ

export const STATUS_META: Record<
  ThesisStatus,
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

export const WORKFLOW_STEPS: { status: ThesisStatus; label: string }[] = [
  { status: 'draft', label: 'Υπό επεξεργασία' },
  { status: 'available', label: 'Διαθέσιμο' },
  { status: 'assigned', label: 'Ανατεθειμένο' },
  { status: 'review', label: 'Υπό εξέταση' },
  { status: 'completed', label: 'Ολοκληρωμένο' },
]

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

export type Topic = {
  id: string
  title: string
  summary: string
  description: string
  professor: string
  area: string
  tags: string[]
  status: ThesisStatus
  createdAt: string
  student?: string
  committee?: string[]
  applicants?: { name: string; am: string; date: string; note: string }[]
  grade?: number | null
  deadline?: string
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
    summary:
      'Ανάπτυξη μοντέλου βαθιάς μάθησης για την αναγνώριση κακόβουλης κίνησης σε συσκευές IoT.',
    description:
      'Η εργασία εστιάζει στη σχεδίαση και εκπαίδευση νευρωνικών δικτύων για την ανίχνευση ανωμαλιών σε δεδομένα δικτυακής κίνησης IoT. Θα μελετηθούν αρχιτεκτονικές LSTM και autoencoders, θα γίνει σύγκριση απόδοσης και θα αξιολογηθεί η ανθεκτικότητα σε πραγματικά σύνολα δεδομένων.',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Ασφάλεια',
    tags: ['Deep Learning', 'IoT', 'Cybersecurity'],
    status: 'available',
    createdAt: '2025-02-10',
    deadline: '2025-03-15',
  },
  {
    id: 'THE-2402',
    title: 'Σύστημα συστάσεων για ακαδημαϊκές δημοσιεύσεις',
    summary:
      'Μηχανή συστάσεων που προτείνει σχετικές δημοσιεύσεις βάσει ιστορικού ανάγνωσης.',
    description:
      'Στόχος είναι η υλοποίηση υβριδικού συστήματος συστάσεων (collaborative + content-based) για επιστημονικά άρθρα. Θα αξιοποιηθούν embeddings κειμένου και γράφοι συνεργασίας συγγραφέων.',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Τεχνητή Νοημοσύνη',
    tags: ['Recommender Systems', 'NLP'],
    status: 'available',
    createdAt: '2025-02-04',
    deadline: '2025-03-20',
  },
  {
    id: 'THE-2403',
    title: 'Κατανεμημένη βάση δεδομένων για εφαρμογές πραγματικού χρόνου',
    summary: 'Σχεδίαση και αξιολόγηση κατανεμημένου συστήματος αποθήκευσης χαμηλής καθυστέρησης.',
    description:
      'Μελέτη μηχανισμών replication και consistency σε κατανεμημένες βάσεις δεδομένων. Θα υλοποιηθεί prototype και θα μετρηθεί η απόδοση κάτω από διαφορετικά φορτία.',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Βάσεις Δεδομένων',
    tags: ['Distributed Systems', 'Databases'],
    status: 'draft',
    createdAt: '2025-02-18',
  },
  {
    id: 'THE-2404',
    title: 'Αυτόματη περίληψη νομικών κειμένων στα Ελληνικά',
    summary: 'Μοντέλο NLP για την παραγωγή περιλήψεων εκτεταμένων νομικών εγγράφων.',
    description:
      'Η εργασία διερευνά transformer-based προσεγγίσεις για abstractive summarization σε ελληνικά νομικά κείμενα, με έμφαση στη διατήρηση της νομικής ορολογίας.',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Τεχνητή Νοημοσύνη',
    tags: ['NLP', 'Transformers', 'Greek'],
    status: 'assigned',
    createdAt: '2024-11-12',
    student: 'Ελένη Παπαδοπούλου',
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
    summary: 'Διαδραστική οπτικοποίηση εκατομμυρίων σημείων δεδομένων με WebGL.',
    description:
      'Ανάπτυξη βιβλιοθήκης οπτικοποίησης που αξιοποιεί WebGL για την απόδοση μεγάλων συνόλων δεδομένων με ομαλή διάδραση.',
    professor: 'Δρ. Γεώργιος Αντωνίου',
    area: 'Ανθρώπινη-Υπολογιστική Αλληλεπίδραση',
    tags: ['Visualization', 'WebGL', 'Frontend'],
    status: 'review',
    createdAt: '2024-09-05',
    student: 'Δημήτρης Ιωάννου',
    committee: ['Δρ. Γεώργιος Αντωνίου', 'Δρ. Μαρία Κωνσταντίνου', 'Δρ. Νικόλαος Δήμου'],
    deadline: '2025-02-28',
  },
  {
    id: 'THE-2406',
    title: 'Ανάλυση συναισθήματος σε ελληνικά social media δεδομένα',
    summary: 'Ταξινόμηση συναισθήματος αναρτήσεων με χρήση προεκπαιδευμένων μοντέλων.',
    description:
      'Συλλογή και επισημείωση ελληνικών δεδομένων social media, fine-tuning μοντέλων και συγκριτική αξιολόγηση.',
    professor: 'Δρ. Μαρία Κωνσταντίνου',
    area: 'Τεχνητή Νοημοσύνη',
    tags: ['Sentiment Analysis', 'NLP'],
    status: 'completed',
    createdAt: '2024-02-15',
    student: 'Άννα Βασιλείου',
    committee: ['Δρ. Μαρία Κωνσταντίνου', 'Δρ. Γεώργιος Αντωνίου', 'Δρ. Νικόλαος Δήμου'],
    grade: 9.2,
    deadline: '2024-09-30',
  },
  {
    id: 'THE-2407',
    title: 'Ανίχνευση ευπαθειών σε smart contracts',
    summary: 'Στατική ανάλυση κώδικα Solidity για εντοπισμό ευπαθειών ασφαλείας.',
    description:
      'Ανάπτυξη εργαλείου στατικής ανάλυσης που εντοπίζει κοινά μοτίβα ευπαθειών σε smart contracts blockchain.',
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
    summary: 'Αλγόριθμοι δρομολόγησης εργασιών για μείωση ενεργειακού αποτυπώματος.',
    description:
      'Μελέτη και προσομοίωση αλγορίθμων scheduling με στόχο τη μείωση της ενεργειακής κατανάλωσης σε κέντρα δεδομένων.',
    professor: 'Δρ. Νικόλαος Δήμου',
    area: 'Δίκτυα Υπολογιστών',
    tags: ['Green Computing', 'Scheduling'],
    status: 'review',
    createdAt: '2024-10-01',
    student: 'Κωνσταντίνος Παύλου',
    committee: ['Δρ. Νικόλαος Δήμου', 'Δρ. Γεώργιος Αντωνίου', 'Δρ. Μαρία Κωνσταντίνου'],
    deadline: '2025-03-10',
  },
]

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
    title: 'Ορισμός τριμελούς επιτροπής',
    body: 'Ορίστηκε επιτροπή για τη διπλωματική THE-2404.',
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

export function statusMeta(status: ThesisStatus) {
  return STATUS_META[status]
}
