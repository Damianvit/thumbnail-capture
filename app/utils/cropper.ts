
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  outputWidth = 1200,
  outputHeight = 630
): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((res) => (image.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context failed");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return canvas.toDataURL("image/jpeg");
};
