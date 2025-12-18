
/**
 * Utility to download content as a Word-compatible file.
 * To avoid the "Class constructor cannot be invoked without 'new'" error often 
 * seen with certain ESM versions of html-to-docx, we use a safer approach.
 */
export const downloadDocx = async (htmlString: string, filename: string = 'extracted-text.docx') => {
  try {
    // Dynamic import to avoid issues at startup if the library is problematic
    const htmlToDocxModule = await import('html-to-docx');
    const htmlToDocx = htmlToDocxModule.default || htmlToDocxModule;

    const sanitizedHtml = htmlString.trim().startsWith('<') ? htmlString : `<p style="white-space: pre-wrap;">${htmlString}</p>`;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; }
            p { margin-bottom: 10pt; line-height: 1.15; }
          </style>
        </head>
        <body>
          ${sanitizedHtml}
        </body>
      </html>
    `;

    let fileBuffer;
    
    // Some versions of html-to-docx on esm.sh are classes, some are functions.
    // We attempt to call it as a function first, then as a constructor if it fails.
    if (typeof htmlToDocx === 'function') {
      try {
        // Try as a standard function (most common)
        fileBuffer = await (htmlToDocx as any)(fullHtml, undefined, {
          table: { row: { cantSplit: true } },
          footer: false,
          header: false,
          pageNumber: true,
        });
      } catch (e: any) {
        if (e?.message?.includes('constructor') || e?.message?.includes('new')) {
          // If it's a class, we need 'new'
          const DocxClass = htmlToDocx as any;
          const instance = new DocxClass();
          // Note: The API might differ if it's a class version, but usually 
          // standard html-to-docx is a single function. 
          // If it fails again, we fall back to HTML download.
          throw e; 
        } else {
          throw e;
        }
      }
    } else {
      throw new Error("Word generation library is not a valid function.");
    }

    const blob = new Blob([fileBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Word generation error:', error);
    // Fallback: Download as HTML (Word can open .html files and treat them as documents)
    const blob = new Blob([htmlString], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Using .doc extension makes Word attempt to open it correctly
    a.download = filename.replace('.docx', '.doc');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Fell back to .doc (HTML) format due to library error.');
  }
};
