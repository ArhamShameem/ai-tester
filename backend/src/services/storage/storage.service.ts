import { ArtifactStorage } from "./artifact-storage";
import { LocalArtifactStorage } from "./local-artifact.storage";
import { SupabaseArtifactStorage } from "./supabase-artifact.storage";

export class StorageService {
  private static instance: ArtifactStorage | null = null;

  public static getStorage(): ArtifactStorage {
    if (!this.instance) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_KEY;
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "test-artifacts";

      if (supabaseUrl && supabaseKey) {
        console.log(
          `[StorageService] Using SupabaseArtifactStorage (bucket: '${bucketName}')`
        );
        this.instance = new SupabaseArtifactStorage(
          supabaseUrl,
          supabaseKey,
          bucketName
        );
      } else {
        console.log(
          "[StorageService] Using LocalArtifactStorage (backend/artifacts)"
        );
        this.instance = new LocalArtifactStorage();
      }
    }
    return this.instance;
  }

  public static setStorage(storage: ArtifactStorage): void {
    this.instance = storage;
  }
}
