/**
 * Γεννήτρια PDF για τα δεδομένα επίδειξης.
 *
 * Το seed δεν βάζει μόνο γραμμές στη βάση αλλά και πραγματικά αρχεία στο MinIO:
 * χωρίς αυτά τα σεμινάρια «Λήψη PDF» της επίδειξης θα κατέληγαν σε 404, και μια
 * εγγραφή που δείχνει σε ανύπαρκτο object είναι ακριβώς το είδος ασυνέπειας που
 * δεν θέλουμε να μπορεί να υπάρξει.
 *
 * Γράφεται με το χέρι αντί για βιβλιοθήκη — ένα PDF μιας σελίδας είναι λίγες
 * δεκάδες bytes δομής, και μια εξάρτηση μόνο για τα δεδομένα επίδειξης θα
 * κουβαλιόταν και στο production image.
 */

/** Ό,τι δεν είναι ASCII δεν αποδίδεται από τη Helvetica· τα δείγματα είναι λατινικά. */
function pdfSafe(text: string): string {
  return text.replace(/[()\]/g, ' ').replace(/[^\x20-\x7e]/g, ' ')
}

export function placeholderPdf(title: string): Uint8Array {
  const content = `BT /F1 16 Tf 72 760 Td (${pdfSafe(title)}) Tj ET\n`

  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]' +
      '/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>',
    `<</Length ${content.length}>>\nstream\n${content}endstream`,
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  ]

  // Το xref table κρατά το byte offset κάθε object· γι' αυτό χτίζεται το αρχείο
  // σειριακά και σημειώνεται η θέση πριν από κάθε εγγραφή. Όλο το περιεχόμενο
  // είναι ASCII, οπότε μήκος συμβολοσειράς = bytes.
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []

  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })

  const xrefAt = pdf.length
  const size = objects.length + 1

  pdf += `xref\n0 ${size}\n0000000000 65535 f \n`
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<</Size ${size}/Root 1 0 R>>\nstartxref\n${xrefAt}\n%%EOF\n`

  return new Uint8Array(Buffer.from(pdf, 'latin1'))
}
