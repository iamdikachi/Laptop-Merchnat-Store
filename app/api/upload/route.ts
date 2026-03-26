import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { file } = await req.json(); // Data URI: "data:image/png;base64,..."
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const timestamp = Math.round(new Date().getTime() / 1000);
    // Cloudinary requires signing parameters in alphabetical order
    const signatureString = `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    
    // Hash using SHA-1
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', process.env.CLOUDINARY_API_KEY!);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary Error Data:', data);
      return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ url: data.secure_url }, { status: 200 });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
