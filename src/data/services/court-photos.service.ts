import { supabase } from '../../lib/supabase';

const BUCKET = 'court-photos';

const isRemoteUrl = (uri: string) => uri.startsWith('http://') || uri.startsWith('https://');

const guessExtension = (contentType: string | null) => {
  if (!contentType) return 'jpg';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('heic')) return 'heic';
  return 'jpg';
};

export async function uploadCourtPhotos(clubId: string, localUris: string[]): Promise<string[]> {
  if (!localUris.length) return [];
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }

  const uploaded: string[] = [];

  for (let index = 0; index < localUris.length; index += 1) {
    const uri = localUris[index];

    if (isRemoteUrl(uri)) {
      uploaded.push(uri);
      continue;
    }

    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('No pudimos leer una foto del celular. Proba elegirla de nuevo.');
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    const extension = guessExtension(contentType);
    const path = `${clubId}/${Date.now()}-${index}.${extension}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      throw new Error(
        error.message.includes('Bucket not found')
          ? 'Falta configurar Storage en Supabase (migracion 011).'
          : `No pudimos subir la foto: ${error.message}`,
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    uploaded.push(data.publicUrl);
  }

  return uploaded;
}
