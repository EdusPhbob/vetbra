import { NextRequest, NextResponse } from 'next/server';
import { getPresignedDownloadUrl } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Chave do documento não fornecida.' }, { status: 400 });
    }

    // Segurança básica: previne path traversal
    if (key.includes('..') || key.startsWith('/')) {
      return NextResponse.json({ error: 'Chave inválida.' }, { status: 400 });
    }

    const downloadUrl = await getPresignedDownloadUrl(key, 900); // 15 minutos de validade

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 });
    }

    // Se for URL externa pré-assinada do S3/MinIO, redireciona temporariamente (307)
    if (downloadUrl.startsWith('http')) {
      return NextResponse.redirect(downloadUrl, { status: 307 });
    }

    // Se for rota local de desenvolvimento
    return NextResponse.redirect(new URL(downloadUrl, request.url));
  } catch (error) {
    console.error('Erro ao acessar documento privado:', error);
    return NextResponse.json({ error: 'Erro ao gerar acesso ao documento.' }, { status: 500 });
  }
}
