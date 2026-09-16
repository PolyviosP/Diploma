/**
 * Αποθήκευση αρχείων — MinIO μέσω του S3 API (PROJECT_SPEC.md §9, §12 βήμα 7).
 *
 * Τρεις αρχές, που εξηγούν όλες τις υπόλοιπες επιλογές του αρχείου:
 *
 * 1. **Το MinIO είναι λεπτομέρεια.** Μιλάμε S3, όχι MinIO — ο ίδιος κώδικας
 *    δουλεύει απέναντι σε AWS S3 ή Cloudflare R2 αλλάζοντας μόνο env vars. Γι'
 *    αυτό χρησιμοποιείται το `@aws-sdk/client-s3` και όχι ο client του MinIO.
 * 2. **Τα αρχεία δεν σερβίρονται δημόσια.** Το bucket είναι ιδιωτικό· η λήψη
 *    γίνεται με presigned URL λίγων δευτερολέπτων, που υπογράφεται μόνο αφού ο
 *    καλών περάσει τον έλεγχο ρόλου.
 * 3. **Το όνομα που δίνει ο χρήστης δεν γίνεται ποτέ object key.** Το key το
 *    φτιάχνει ο server (`{prefix}/{ownerId}/{uuid}.pdf`) και το πραγματικό όνομα
 *    ζει στη βάση — επιστρέφει στον χρήστη μόνο ως `Content-Disposition`.
 *
 * Δύο endpoints, ίδιο σκεπτικό με το `KEYCLOAK_INTERNAL_ISSUER`: ο server μιλάει
 * στο εσωτερικό hostname του compose, ενώ η υπογραφή του presigned URL πρέπει να
 * γίνει για το hostname που θα δει ο browser — η υπογραφή SigV4 καλύπτει και τον
 * `Host`, οπότε URL υπογεγραμμένο για `minio:9000` σκάει στο `localhost:9000`.
 */

import { randomUUID } from 'node:crypto'

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Το όριο ορίζεται στο `lib/utils.ts` ώστε να το ξέρει και ο browser χωρίς να
// φορτώσει το S3 SDK. Επανεξάγεται εδώ γιατί εδώ ανήκει εννοιολογικά.
import { MAX_UPLOAD_BYTES } from './utils'

export { MAX_UPLOAD_BYTES }

/** Μόνο PDF γίνονται δεκτά — αναλυτική βαθμολογία και τελικό κείμενο. */
export const PDF_MIME = 'application/pdf'

/** Διάρκεια ζωής του presigned URL. Όσο χρειάζεται για να ξεκινήσει η λήψη. */
const DOWNLOAD_TTL_SECONDS = 60

type StorageConfig = {
  bucket: string
  /** Ο client που χρησιμοποιεί ο server για put/delete μέσα στο δίκτυο. */
  internal: S3Client
  /** Ο client που υπογράφει URL προορισμένα για τον browser. */
  public: S3Client
}

let config: StorageConfig | undefined

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Το ${name} δεν έχει οριστεί. Σήκωσε το MinIO με \`docker compose up -d\` ` +
        'και βεβαιώσου ότι το .env είναι στη θέση του.',
    )
  }
  return value
}

/**
 * Η σύνδεση στήνεται στην πρώτη χρήση, όχι στο import — ίδιος λόγος με το
 * `lib/db/index.ts`: το `next build` αποτιμά το module graph χωρίς env vars.
 */
function storage(): StorageConfig {
  if (config) return config

  const credentials = {
    accessKeyId: required('S3_ACCESS_KEY'),
    secretAccessKey: required('S3_SECRET_KEY'),
  }
  const region = process.env.S3_REGION ?? 'us-east-1'
  const endpoint = required('S3_ENDPOINT')

  const common = {
    region,
    credentials,
    // Το MinIO δεν έχει DNS ανά bucket· χωρίς αυτό ο client θα ζητούσε
    // `http://diploma.localhost:9000`.
    forcePathStyle: true,
  }

  config = {
    bucket: process.env.S3_BUCKET ?? 'diploma',
    internal: new S3Client({ ...common, endpoint }),
    public: new S3Client({
      ...common,
      endpoint: process.env.S3_PUBLIC_ENDPOINT ?? endpoint,
    }),
  }

  return config
}

/* -------------------------------------------------------------------------- */
/*  Object keys                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Το key δεν περιέχει τίποτα από τον χρήστη. Το prefix δείχνει σε ποιον ανήκει
 * το αρχείο (χρήσιμο για policies και για ανθρώπινη επιθεώρηση του bucket), το
 * uuid εγγυάται ότι κάθε νέα έκδοση γράφεται σε νέο object αντί να πατήσει το
 * προηγούμενο — η διαγραφή του παλιού είναι ρητό βήμα, μετά το commit στη βάση.
 */
export function diplomaDocumentKey(diplomaId: string): string {
  return `diplomas/${diplomaId}/${randomUUID()}.pdf`
}

export function transcriptKey(studentId: string): string {
  return `transcripts/${studentId}/${randomUUID()}.pdf`
}

/* -------------------------------------------------------------------------- */
/*  Έλεγχοι εγκυρότητας                                                        */
/* -------------------------------------------------------------------------- */

/** Τα PDF ξεκινούν με `%PDF-`. Το content-type του client δεν αποδεικνύει τίποτα. */
export function looksLikePdf(bytes: Uint8Array): boolean {
  return (
    bytes.length > 5 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d //  -
  )
}

/**
 * Το όνομα κρατιέται μόνο για εμφάνιση και για το `Content-Disposition` της
 * λήψης. Καθαρίζεται ώστε ούτε εκεί να μπορεί να κάνει ζημιά: χωρίς διαδρομές,
 * χωρίς χαρακτήρες ελέγχου, με φραγμό μήκους για τη στήλη της βάσης.
 */
export function safeFileName(name: string): string {
  const base = name.split(/[\/]/).pop() ?? 'document.pdf'
  // eslint-disable-next-line no-control-regex
  const clean = base.replace(/[\u0000-\u001f\u007f"]/g, '').trim()
  return (clean || 'document.pdf').slice(0, 200)
}

/* -------------------------------------------------------------------------- */
/*  Λειτουργίες                                                                */
/* -------------------------------------------------------------------------- */

/** Ανέβασμα. Το content-type καρφώνεται — δεν έρχεται από τον client. */
export async function putPdf(key: string, body: Uint8Array): Promise<void> {
  const { internal, bucket } = storage()

  await internal.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: PDF_MIME,
      ContentLength: body.byteLength,
    }),
  )
}

/**
 * Presigned URL λήψης. Ο έλεγχος πρόσβασης έχει ήδη γίνει από τον καλούντα —
 * αυτή η συνάρτηση δεν ξέρει ποιος ζητά το αρχείο και δεν πρέπει να καλείται
 * πριν από `requireRole()` και έλεγχο ιδιοκτησίας.
 *
 * Το `ResponseContentDisposition` επιβάλλει κατέβασμα με το αρχικό όνομα αντί
 * για προβολή του uuid· το `ResponseContentType` κλειδώνει τον τύπο ώστε ένα
 * αρχείο να μη μπορεί να σερβιριστεί ως κάτι άλλο.
 */
export async function presignedDownloadUrl(
  key: string,
  fileName: string,
): Promise<string> {
  const { public: signer, bucket } = storage()

  return getSignedUrl(
    signer,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentType: PDF_MIME,
      ResponseContentDisposition: contentDisposition(fileName),
    }),
    { expiresIn: DOWNLOAD_TTL_SECONDS },
  )
}

/**
 * Διαγραφή παλιάς έκδοσης. Καλείται πάντα *μετά* το commit στη βάση: ένα ορφανό
 * object είναι σπατάλη χώρου, μια εγγραφή που δείχνει σε διαγραμμένο object
 * είναι σπασμένη σελίδα.
 */
export async function removeObject(key: string): Promise<void> {
  const { internal, bucket } = storage()
  await internal.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

/**
 * RFC 5987. Τα ονόματα εδώ είναι ελληνικά ως επί το πλείστον, και το σκέτο
 * `filename="…"` δέχεται μόνο ASCII — χωρίς το `filename*` οι browsers θα
 * κατέβαζαν αρχεία με κατεστραμμένο όνομα.
 */
function contentDisposition(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, '_')
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
}

/* -------------------------------------------------------------------------- */
/*  Παραλαβή ανεβασμένου αρχείου                                               */
/* -------------------------------------------------------------------------- */

export type PdfUpload =
  | { ok: true; bytes: Uint8Array; fileName: string }
  | { ok: false; status: number; error: string }

/**
 * Διαβάζει και ελέγχει ένα PDF από multipart αίτηση.
 *
 * Γιατί περνά το αρχείο από την εφαρμογή αντί για presigned PUT κατευθείαν στο
 * MinIO: μόνο εδώ μπορεί να αποδειχθεί ότι το περιεχόμενο είναι όντως PDF και
 * ότι τα bytes είναι όντως τόσα. Ο client δηλώνει ό,τι θέλει σε `type` και
 * `size`, και ένα presigned PUT που αποτυγχάνει στο δεύτερο βήμα αφήνει ορφανά
 * objects στο bucket. Ο όγκος εδώ είναι ένα αρχείο ανά φοιτητή ανά εξάμηνο —
 * δεν υπάρχει λόγος απόδοσης που να δικαιολογεί την απώλεια του ελέγχου.
 *
 * Η σειρά των ελέγχων είναι σκόπιμη: το `Content-Length` κοιτάζεται **πριν**
 * διαβαστεί το σώμα, γιατί το `formData()` φορτώνει τα πάντα στη μνήμη.
 */
export async function readPdfUpload(request: Request): Promise<PdfUpload> {
  const tooLarge = {
    ok: false as const,
    status: 413,
    error: `Το αρχείο ξεπερνά το όριο των ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
  }

  // Το multipart envelope προσθέτει λίγα bytes πάνω από το αρχείο· το περιθώριο
  // είναι για αυτά, όχι για ανοχή στο όριο.
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_UPLOAD_BYTES + 1024 * 1024) return tooLarge

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return { ok: false, status: 400, error: 'Μη έγκυρη αίτηση μεταφόρτωσης.' }
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return { ok: false, status: 400, error: 'Δεν στάλθηκε αρχείο.' }
  }
  if (file.size === 0) return { ok: false, status: 400, error: 'Το αρχείο είναι κενό.' }
  if (file.size > MAX_UPLOAD_BYTES) return tooLarge

  const fileName = safeFileName(file.name)
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    return { ok: false, status: 415, error: 'Επιτρέπονται μόνο αρχεία PDF.' }
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  // Το `file.size` είναι δήλωση του client· αυτό είναι μέτρηση.
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return tooLarge
  if (!looksLikePdf(bytes)) {
    return {
      ok: false,
      status: 415,
      error: 'Το αρχείο δεν είναι έγκυρο PDF, ανεξάρτητα από την κατάληξή του.',
    }
  }

  return { ok: true, bytes, fileName }
}
