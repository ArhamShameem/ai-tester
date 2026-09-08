import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ArtifactStorage } from "./artifact-storage";
import { LocalArtifactStorage } from "./local-artifact.storage";

export class SupabaseArtifactStorage implements ArtifactStorage {
  private client: SupabaseClient;
  private bucketName: string;
  private localFallback: LocalArtifactStorage;
  private bucketEnsured: boolean = false;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    bucketName: string = "test-artifacts"
  ) {
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    this.bucketName = bucketName;
    this.localFallback = new LocalArtifactStorage();
  }

  /**
   * Ensures that the target storage bucket exists in Supabase.
   * If not, attempts to auto-create it as a public bucket.
   */
  private async ensureBucket(): Promise<void> {
    if (this.bucketEnsured) return;

    try {
      const { data: buckets, error } = await this.client.storage.listBuckets();
      if (!error && buckets) {
        const exists = buckets.some((b) => b.name === this.bucketName);
        if (!exists) {
          const { error: createErr } = await this.client.storage.createBucket(
            this.bucketName,
            {
              public: true,
              fileSizeLimit: 10485760, // 10MB
              allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"]
            }
          );

          if (createErr) {
            console.warn(
              `[SupabaseStorage] Could not auto-create bucket '${this.bucketName}':`,
              createErr.message
            );
          } else {
            console.log(
              `[SupabaseStorage] Created public bucket '${this.bucketName}' successfully.`
            );
          }
        }
      }
      this.bucketEnsured = true;
    } catch (err) {
      console.warn(
        "[SupabaseStorage] Warning: Failed bucket existence check:",
        err instanceof Error ? err.message : err
      );
    }
  }

  /**
   * Saves screenshot buffer to Supabase Storage bucket and returns public CDN URL.
   * Seamlessly falls back to local disk storage if upload fails.
   */
  async saveScreenshot(
    projectId: string,
    testRunId: string,
    testResultId: string,
    buffer: Buffer
  ): Promise<string> {
    const cleanProject = projectId.replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanRun = testRunId.replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanResult = testResultId.replace(/[^a-zA-Z0-9_-]/g, "");
    const objectPath = `projects/${cleanProject}/runs/${cleanRun}/${cleanResult}.png`;

    try {
      await this.ensureBucket();

      const { error: uploadError } = await this.client.storage
        .from(this.bucketName)
        .upload(objectPath, buffer, {
          contentType: "image/png",
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = this.client.storage
        .from(this.bucketName)
        .getPublicUrl(objectPath);

      if (!data?.publicUrl) {
        throw new Error("Failed to retrieve public URL from Supabase");
      }

      return data.publicUrl;
    } catch (err) {
      console.warn(
        `[SupabaseStorage] Failed to upload screenshot to Supabase Storage, falling back to local disk:`,
        err instanceof Error ? err.message : err
      );

      return this.localFallback.saveScreenshot(
        projectId,
        testRunId,
        testResultId,
        buffer
      );
    }
  }

  async getScreenshotPath(
    projectId: string,
    testRunId: string,
    filename: string
  ): Promise<string | null> {
    const cleanProject = projectId.replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanRun = testRunId.replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "");
    const objectPath = `projects/${cleanProject}/runs/${cleanRun}/${cleanFilename}`;

    try {
      const { data } = this.client.storage
        .from(this.bucketName)
        .getPublicUrl(objectPath);

      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } catch {
      // Ignore and check local fallback
    }

    return this.localFallback.getScreenshotPath(projectId, testRunId, filename);
  }
}
