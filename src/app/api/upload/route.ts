import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { uploadFile } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderType = (formData.get('folder') as string) || 'crmv'; // 'crmv' ou 'perfis'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Validação de tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Formatos permitidos: JPG, PNG, WebP ou PDF.' },
        { status: 400 }
      );
    }

    // Limite de 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. O tamanho máximo permitido é 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanExt = ext.replace(/[^a-z0-9]/g, '');
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${cleanExt}`;

    const isPrivate = folderType === 'crmv'; // CRMV e Selfies são estritamente privados
    const folder = folderType === 'perfis' ? 'perfis' : 'crmv';

    const result = await uploadFile({
      buffer,
      filename,
      contentType: file.type,
      folder,
      isPrivate,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      isS3: result.isS3,
      isPrivate: result.isPrivate,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Erro no upload de arquivo:', error);
    return NextResponse.json({ error: 'Erro ao processar o upload do arquivo.' }, { status: 500 });
  }
}
