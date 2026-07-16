import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
provider.addScope("https://www.googleapis.com/auth/drive");
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/drive.readonly");
let isSigningIn = false;
let cachedAccessToken = null;
export const initAuth = (onAuthSuccess, onAuthFailure) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};
export const googleSignIn = async () => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get Google Drive access token from authentication.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};
export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
export const getAccessToken = () => {
  return cachedAccessToken;
};
export const getOrCreateFolder = async (accessToken, folderName = "BizPilot Backups") => {
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(folderName)}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!searchRes.ok) {
      throw new Error(`Folder search failed: ${searchRes.statusText}`);
    }
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
    const createUrl = "https://www.googleapis.com/drive/v3/files";
    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder"
      })
    });
    if (!createRes.ok) {
      throw new Error(`Folder creation failed: ${createRes.statusText}`);
    }
    const createData = await createRes.json();
    return createData.id;
  } catch (error) {
    console.error("Error finding or creating Google Drive folder:", error);
    throw error;
  }
};
export const uploadBackupFile = async (accessToken, folderId, filename, content) => {
  try {
    const boundary = "bizpilot_backup_boundary";
    const metadata = {
      name: filename,
      mimeType: "application/json",
      parents: [folderId]
    };
    const multipartBody = `\r
--${boundary}\r
Content-Type: application/json; charset=UTF-8\r
\r
${JSON.stringify(metadata)}\r
--${boundary}\r
Content-Type: application/json\r
\r
${JSON.stringify(content)}\r
--${boundary}--`;
    const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime";
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });
    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error uploading backup to Google Drive:", error);
    throw error;
  }
};
export const listBackupFiles = async (accessToken, folderId) => {
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false and mimeType='application/json'&orderBy=createdTime desc&fields=files(id,name,size,createdTime)&pageSize=100`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      throw new Error(`Failed to list files: ${res.statusText}`);
    }
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error("Error listing files from Google Drive folder:", error);
    throw error;
  }
};
export const downloadBackupContent = async (accessToken, fileId) => {
  try {
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      throw new Error(`Failed to download file content: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error downloading file content from Google Drive:", error);
    throw error;
  }
};
export const deleteBackupFile = async (accessToken, fileId) => {
  try {
    const deleteUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    const res = await fetch(deleteUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      throw new Error(`Failed to delete file from Google Drive: ${res.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting file from Google Drive:", error);
    throw error;
  }
};
