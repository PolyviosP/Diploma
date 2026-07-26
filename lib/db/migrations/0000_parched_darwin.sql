CREATE TYPE "public"."app_status" AS ENUM('pending', 'approved', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."committee_role" AS ENUM('supervisor', 'member');--> statement-breakpoint
CREATE TYPE "public"."diploma_status" AS ENUM('in_progress', 'review', 'completed');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending_student', 'pending_secretary', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."topic_status" AS ENUM('draft', 'available', 'assigned', 'review', 'completed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'professor', 'secretary');--> statement-breakpoint
CREATE TABLE "annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diploma_id" uuid NOT NULL,
	"professor_id" uuid NOT NULL,
	"page" integer NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "annotations_page_positive" CHECK ("annotations"."page" > 0)
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"note" text,
	"status" "app_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"reason" text,
	CONSTRAINT "applications_topic_student_key" UNIQUE("topic_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "change_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diploma_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"proposed_title_el" text NOT NULL,
	"proposed_title_en" text NOT NULL,
	"reason" text NOT NULL,
	"status" "request_status" DEFAULT 'pending_student' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"student_confirmed_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"decided_by" uuid
);
--> statement-breakpoint
CREATE TABLE "committee_members" (
	"diploma_id" uuid NOT NULL,
	"professor_id" uuid NOT NULL,
	"role" "committee_role" NOT NULL,
	CONSTRAINT "committee_members_diploma_id_professor_id_pk" PRIMARY KEY("diploma_id","professor_id")
);
--> statement-breakpoint
CREATE TABLE "diplomas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" text NOT NULL,
	"student_id" uuid NOT NULL,
	"supervisor_id" uuid NOT NULL,
	"status" "diploma_status" DEFAULT 'in_progress' NOT NULL,
	"document_key" text,
	"document_name" text,
	"submitted_at" timestamp with time zone,
	"presented_at" timestamp with time zone,
	"final_grade" numeric(3, 1),
	"passed" boolean GENERATED ALWAYS AS (final_grade >= 5) STORED,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "diplomas_topic_id_unique" UNIQUE("topic_id")
);
--> statement-breakpoint
CREATE TABLE "eligibility_rules" (
	"id" boolean PRIMARY KEY DEFAULT true NOT NULL,
	"min_year" smallint DEFAULT 4 NOT NULL,
	"max_owed_courses" smallint DEFAULT 8 NOT NULL,
	"min_credits" smallint DEFAULT 180 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "eligibility_rules_singleton" CHECK ("eligibility_rules"."id")
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diploma_id" uuid NOT NULL,
	"professor_id" uuid NOT NULL,
	"content" numeric(3, 1) NOT NULL,
	"methodology" numeric(3, 1) NOT NULL,
	"writing" numeric(3, 1) NOT NULL,
	"presentation" numeric(3, 1) NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"comments" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grades_diploma_professor_key" UNIQUE("diploma_id","professor_id"),
	CONSTRAINT "grades_content_range" CHECK ("grades"."content" BETWEEN 0 AND 10),
	CONSTRAINT "grades_methodology_range" CHECK ("grades"."methodology" BETWEEN 0 AND 10),
	CONSTRAINT "grades_writing_range" CHECK ("grades"."writing" BETWEEN 0 AND 10),
	CONSTRAINT "grades_presentation_range" CHECK ("grades"."presentation" BETWEEN 0 AND 10),
	CONSTRAINT "grades_score_range" CHECK ("grades"."score" BETWEEN 0 AND 10)
);
--> statement-breakpoint
CREATE TABLE "professors" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"rank" text NOT NULL,
	"department" text NOT NULL,
	"area" text
);
--> statement-breakpoint
CREATE TABLE "students" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"am" text NOT NULL,
	"year" smallint NOT NULL,
	"semester" smallint NOT NULL,
	"owed_courses" smallint DEFAULT 0 NOT NULL,
	"credits" smallint DEFAULT 0 NOT NULL,
	"gpa" numeric(4, 2),
	"manual_override" boolean DEFAULT false NOT NULL,
	"phone" text,
	"address" text,
	"transcript_key" text,
	"transcript_at" timestamp with time zone,
	CONSTRAINT "students_am_unique" UNIQUE("am"),
	CONSTRAINT "students_year_range" CHECK ("students"."year" BETWEEN 1 AND 10)
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY NOT NULL,
	"title_el" text NOT NULL,
	"title_en" text NOT NULL,
	"summary" text NOT NULL,
	"description_el" text NOT NULL,
	"description_en" text NOT NULL,
	"prerequisites" text[] DEFAULT '{}' NOT NULL,
	"area" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"professor_id" uuid NOT NULL,
	"status" "topic_status" DEFAULT 'draft' NOT NULL,
	"deadline" date,
	"attachment_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keycloak_sub" text,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_keycloak_sub_unique" UNIQUE("keycloak_sub")
);
--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_diploma_id_diplomas_id_fk" FOREIGN KEY ("diploma_id") REFERENCES "public"."diplomas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_professor_id_professors_user_id_fk" FOREIGN KEY ("professor_id") REFERENCES "public"."professors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_diploma_id_diplomas_id_fk" FOREIGN KEY ("diploma_id") REFERENCES "public"."diplomas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_requested_by_professors_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."professors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_diploma_id_diplomas_id_fk" FOREIGN KEY ("diploma_id") REFERENCES "public"."diplomas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_professor_id_professors_user_id_fk" FOREIGN KEY ("professor_id") REFERENCES "public"."professors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diplomas" ADD CONSTRAINT "diplomas_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diplomas" ADD CONSTRAINT "diplomas_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diplomas" ADD CONSTRAINT "diplomas_supervisor_id_professors_user_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."professors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_diploma_id_diplomas_id_fk" FOREIGN KEY ("diploma_id") REFERENCES "public"."diplomas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_professor_id_professors_user_id_fk" FOREIGN KEY ("professor_id") REFERENCES "public"."professors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professors" ADD CONSTRAINT "professors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_professor_id_professors_user_id_fk" FOREIGN KEY ("professor_id") REFERENCES "public"."professors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_diploma_per_student" ON "diplomas" USING btree ("student_id") WHERE status <> 'completed';--> statement-breakpoint
CREATE INDEX "topics_status_idx" ON "topics" USING btree ("status");--> statement-breakpoint
CREATE INDEX "topics_tags_idx" ON "topics" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");