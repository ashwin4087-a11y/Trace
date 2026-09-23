import { isObjectStorageConfigured } from "../../config/storage";

export type StoredObject = {
  url: string;
  driver: "local" | "object-storage";
};

/**
 * Local disk is the working driver.
 * Cloud object storage is selected only when STORAGE_* variables are present,
 * and even then this MVP keeps the file URL contract without a vendor SDK.
 */
export async function storeUploadedFile(publicPath: string): Promise<StoredObject> {
  if (isObjectStorageConfigured()) {
    return { url: publicPath, driver: "object-storage" };
  }
  return { url: publicPath, driver: "local" };
}
