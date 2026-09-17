import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

// Configurações do Storage (S3 / MinIO TrueNAS / Nextcloud S3 / Cloudflare R2)
const S3_ENDPOINT = process.env.S3_ENDPOINT; // ex: https://s3.seutruenas.local:9000 ou https://minio.seudominio.com
const S3_REGION = process.env.S3_REGION || 'auto';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'vetbra-storage';
const S3_PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL; // CDN opcional para arquivos públicos (ex: fotos de perfil)

// O cliente S3 só é instanciado se houver credenciais configuradas
const isS3Configured = Boolean(S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY);

const s3Client = isS3Configured
  ? new S3Client({
      endpoint: S3_ENDPOINT,
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID!,
        secretAccessKey: S3_SECRET_ACCESS_KEY!,
      },
      // forcePathStyle: true é mandatório para MinIO / TrueNAS / Nextcloud S3
      forcePathStyle: true,
    })
  : null;

export interface UploadOptions {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder: 'crmv' | 'perfis' | 'geral';
  isPrivate?: boolean;
}

export interface UploadResult {
  url: string;
  key: string;
  isS3: boolean;
  isPrivate: boolean;
}

/**
 * Upload de arquivo unificado:
 * - Se S3 / TrueNAS estiver configurado, envia para o bucket MinIO/S3.
 * - Se não estiver configurado, salva no disco local em public/uploads/.
 */
export async function uploadFile({
  buffer,
  filename,
  contentType,
  folder,
  isPrivate = false,
}: UploadOptions): Promise<UploadResult> {
  const key = `${folder}/${filename}`;

  if (s3Client) {
    // Upload via S3 / MinIO
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Se privado (como CRMV/Selfie), não recebe ACL pública
      ACL: isPrivate ? 'private' : 'public-read',
    });

    await s3Client.send(command);

    let url: string;
    if (isPrivate) {
      // Para arquivos privados, a URL base guardada é o identificador seguro
      url = `/api/documentos/privado?key=${encodeURIComponent(key)}`;
    } else if (S3_PUBLIC_BASE_URL) {
      url = `${S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
    } else {
      url = `${S3_ENDPOINT?.replace(/\/$/, '')}/${S3_BUCKET_NAME}/${key}`;
    }

    return {
      url,
      key,
      isS3: true,
      isPrivate,
    };
  }

  // Fallback Local (desenvolvimento offline ou sem S3 configurado)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  const localUrl = `/uploads/${folder}/${filename}`;

  return {
    url: localUrl,
    key,
    isS3: false,
    isPrivate,
  };
}

/**
 * Gera uma URL assinada temporária (Presigned URL) para acesso seguro a documentos confidenciais de CRMV.
 * O link expira automaticamente no tempo definido (padrão: 15 minutos).
 */
export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string | null> {
  if (!s3Client) {
    // Se estiver em modo local, retorna a rota local direta
    return `/uploads/${key}`;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return presignedUrl;
  } catch (error) {
    console.error('Erro ao gerar Presigned URL no S3:', error);
    return null;
  }
}

/**
 * Remove um arquivo do S3 ou do disco local
 */
export async function deleteFile(key: string): Promise<boolean> {
  if (s3Client) {
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
        })
      );
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo do S3:', error);
      return false;
    }
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', key);
    await unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
