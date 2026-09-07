import { ArtifactStorage } from "./artifact-storage";
import { LocalArtifactStorage } from "./local-artifact.storage";

export class StorageService {
  private static instance: ArtifactStorage | null = null;

  public static getStorage(): ArtifactStorage {
    if (!this.instance) {
      this.instance = new LocalArtifactStorage();
    }
    return this.instance;
  }

  public static setStorage(storage: ArtifactStorage): void {
    this.instance = storage;
  }
}
