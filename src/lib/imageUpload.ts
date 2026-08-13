/**
 * Image Upload Helper
 * Uploads images to ImgBB image hosting service using API Key.
 * Replaces Firebase Storage for image backups and storage.
 */

const IMGBB_API_KEY = "ab2e5f162e826273cb3649b55debc0bd";

export async function uploadImageToHost(fileOrBase64: File | string): Promise<string> {
  if (!fileOrBase64) return '';

  try {
    const formData = new FormData();

    if (typeof fileOrBase64 === 'string') {
      // If it's already an external HTTP URL, no need to re-upload
      if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
        return fileOrBase64;
      }
      // If base64 data URL, strip header prefix
      const cleanBase64 = fileOrBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      formData.append('image', cleanBase64);
    } else {
      formData.append('image', fileOrBase64);
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success && result.data && (result.data.url || result.data.display_url)) {
      return result.data.url || result.data.display_url;
    }
  } catch (error) {
    console.warn('Image upload to host failed, returning fallback:', error);
  }

  // Fallback if network or host service fails
  if (typeof fileOrBase64 === 'string') {
    return fileOrBase64;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string) || '');
    reader.readAsDataURL(fileOrBase64);
  });
}
