-- Αποθήκευση αρχείων σε MinIO (PROJECT_SPEC.md §12 βήμα 7).
--
-- Το `document_size` κρατούσε συμβολοσειρά προβολής ('2.4 MB'), γραμμένη από
-- το UI όσο δεν υπήρχε πραγματικό αρχείο. Τη θέση του παίρνει το μέγεθος σε
-- bytes, που είναι το μόνο που ξέρει ο server μετά το ανέβασμα· η μορφοποίηση
-- γίνεται στην προβολή.
--
-- Τα `document_key`/`transcript_key` υπαρχουσών γραμμών δείχνουν σε objects που
-- δεν υπήρξαν ποτέ (γράφτηκαν πριν υπάρξει bucket). Δεν πειράζονται εδώ: η λήψη
-- απαντά καθαρό 404 και τα δεδομένα επίδειξης ξαναστήνονται με `npm run db:seed`.
ALTER TABLE "diplomas" ADD COLUMN "document_bytes" integer;--> statement-breakpoint
ALTER TABLE "diplomas" DROP COLUMN "document_size";--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "transcript_name" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "transcript_bytes" integer;