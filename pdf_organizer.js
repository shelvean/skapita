const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');
const mergeBtn = document.getElementById('mergeBtn');
const sortBtn = document.getElementById('sortBtn');
const deleteBtn = document.getElementById('deleteBtn');
const rotateBtn = document.getElementById('rotateBtn');

let pdfFiles = [];

// Load PDF files
pdfInput.addEventListener('change', async (event) => {
  const files = event.target.files;
  for (let file of files) {
    pdfFiles.push(file);
    const listItem = document.createElement('div');
    listItem.textContent = file.name;
    pdfList.appendChild(listItem);
  }
});

// Merge PDFs
mergeBtn.addEventListener('click', async () => {
  if (pdfFiles.length < 2) {
    alert('Please select at least 2 PDFs to merge.');
    return;
  }

  const { PDFDocument } = PDFLib;

  const mergedPdf = await PDFDocument.create();
  for (let file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  downloadPdf(mergedPdfBytes, 'merged.pdf');
});

// Sort PDFs (alphabetically by filename)
sortBtn.addEventListener('click', () => {
  pdfFiles.sort((a, b) => a.name.localeCompare(b.name));
  updatePdfList();
});

// Delete Selected PDFs
deleteBtn.addEventListener('click', () => {
  // Implement logic to delete selected files (e.g., using checkboxes)
  alert('Delete functionality not implemented yet.');
});

// Rotate PDF
rotateBtn.addEventListener('click', async () => {
  if (pdfFiles.length === 0) {
    alert('Please select a PDF to rotate.');
    return;
  }

  const { PDFDocument } = PDFLib;
  const file = pdfFiles[0];
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  pages.forEach(page => page.setRotation(90)); // Rotate 90 degrees

  const rotatedPdfBytes = await pdfDoc.save();
  downloadPdf(rotatedPdfBytes, 'rotated.pdf');
});

// Helper function to download PDF
function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Update PDF list display
function updatePdfList() {
  pdfList.innerHTML = '';
  pdfFiles.forEach(file => {
    const listItem = document.createElement('div');
    listItem.textContent = file.name;
    pdfList.appendChild(listItem);
  });
}
