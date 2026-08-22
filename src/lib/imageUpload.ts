/**
 * Image Upload Helper
 * Uploads images and backs them up to Cloudflare persistent media storage.
 */
import { uploadMediaToCloudflare } from './cloudflare';

const IMGBB_API_KEY = "ab2e5f162e826273cb3649b55debc0bd";

export async function uploadImageToHost(fileOrBase64: File | string, originalName?: string, userId?: string): Promise<string> {
  if (!fileOrBase64) return '';

  let base64Result = '';

  // Convert File to Base64 if it's a File object
  if (typeof fileOrBase64 !== 'string') {
    base64Result = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.readAsDataURL(fileOrBase64);
    });
  } else {
    base64Result = fileOrBase64;
  }

  // Backup to Cloudflare Media Store immediately
  if (base64Result && base64Result.startsWith('data:')) {
    uploadMediaToCloudflare(base64Result, originalName || 'image.jpg', userId || 'user', 'image_upload').catch(() => {});
  }

  // Attempt ImgBB upload for global CDN URL
  try {
    const formData = new FormData();
    if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
        return fileOrBase64;
      }
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
    console.warn('Image upload to host fallback:', error);
  }

  // Return base64 or original URL
  return base64Result || (typeof fileOrBase64 === 'string' ? fileOrBase64 : '');
}
