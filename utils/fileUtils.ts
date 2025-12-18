
export const fileToBase64 = (file: File): Promise<{ mimeType: string, base64Data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64Data] = result.split(',');
      const mimeTypeMatch = header.match(/:(.*?);/);
      
      if (!mimeTypeMatch || !base64Data) {
        return reject(new Error("Could not parse file data."));
      }

      const mimeType = mimeTypeMatch[1];
      resolve({ mimeType, base64Data });
    };
    reader.onerror = (error) => reject(error);
  });
};
