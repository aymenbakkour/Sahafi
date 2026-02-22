// Using global variables from CDN scripts defined in index.html
declare const mammoth: any;
declare const htmlDocx: any;

export const docService = {
  importDocx: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) {
          reject("Failed to read file");
          return;
        }
        mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
          .then((result: any) => {
            resolve(result.value);
          })
          .catch((err: any) => reject(err));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  exportDocx: (htmlContent: string, title: string) => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; }
          p { margin-bottom: 10px; line-height: 1.5; }
        </style>
      </head>
      <body lang=AR-SA style='tab-interval:.5in'>
    `;
    const footer = "</body></html>";
    const fullContent = header + `<h1>${title}</h1>` + htmlContent + footer;
    
    const converted = htmlDocx.asBlob(fullContent);
    const url = URL.createObjectURL(converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'document'}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  }
};
