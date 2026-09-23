export async function downloadCertificate(cert: any) {
  // Wait for image to load
  const img = new Image();
  img.src = '/certificate-template.png';
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  // Use a high resolution scale to ensure text is sharp
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw background image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Set default text styles
  ctx.fillStyle = '#1A1412';
  
  // 1. DATE OF COMPLETION (Top Left)
  // Approximate coordinates based on template
  ctx.font = '14px "Inter", sans-serif';
  ctx.textAlign = 'left';
  const dateStr = new Date(cert.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  ctx.fillText(dateStr, canvas.width * 0.11, canvas.height * 0.20);

  // 2. PARTICIPANT NAME (Center line)
  ctx.font = '500 22px "Inter", sans-serif';
  ctx.textAlign = 'center';
  const fullName = `${cert.user?.firstName || ''} ${cert.user?.lastName || ''}`.trim().toUpperCase();
  ctx.fillText(fullName, canvas.width * 0.385, canvas.height * 0.485);

  // 3. WORKSHOP TITLE (Large, below "has successfully completed")
  ctx.font = 'bold 36px "Inter", serif'; // fallback
  ctx.textAlign = 'left';
  ctx.fillText(cert.workshop?.title?.toUpperCase() || '', canvas.width * 0.11, canvas.height * 0.585);

  // 4. PROVIDER ORGANISATION (Bottom Center-Right)
  ctx.font = '500 12px "Inter", sans-serif';
  ctx.textAlign = 'center';
  const provider = cert.workshop?.department?.organization?.name || "TRACE Academia";
  ctx.fillText(provider, canvas.width * 0.53, canvas.height * 0.835);

  // 5. CERTIFICATE CODE (Bottom Right)
  ctx.font = '500 10px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(cert.certificateCode, canvas.width * 0.81, canvas.height * 0.825);
  ctx.fillText(cert.certificateCode, canvas.width * 0.86, canvas.height * 0.85);

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Certificate_${cert.certificateCode}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
