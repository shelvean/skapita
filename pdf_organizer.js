const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');
const mergeBtn = document.getElementById('mergeBtn');
const sortBtn = document.getElementById('sortBtn');
const deleteBtn = document.getElementById('deleteBtn');
const rotateBtn = document.getElementById('rotateBtn');
const clearBtn = document.getElementById('clearBtn');

let pdfFiles = [];
let pdfDoc = null;

// Load PDF file
pdfInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  pdfFiles = []; // Clear existing files
  pdfList.innerHTML = ''; // Clear the list

  const arrayBuffer = await file.arrayBuffer();
  pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

  // Display pages with checkboxes
  pdfDoc.getPages().forEach((page, index) => {
    const listItem = document.createElement('div');
    listItem.innerHTML = `
      <input type="checkbox" id="page-${index}" class="page-checkbox">
      <label for="page-${index}">Page ${index + 1}</label>
    `;
    pdfList.appendChild(listItem);
  });
});

// Delete Selected Pages
deleteBtn.addEventListener('click', async () => {
  if (!pdfDoc) {
    alert('Please upload a PDF first.');
    return;
  }

  const checkboxes = document.querySelectorAll('.page-checkbox');
  const pagesToDelete = [];

  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      pagesToDelete.push(index);
    }
  });

  if (pagesToDelete.length === 0) {
    alert('Please select at least one page to delete.');
    return;
  }

  // Create a new PDF without the selected pages
  const newPdf = await PDFLib.PDFDocument.create();
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    if (!pagesToDelete.includes(i)) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
    }
  }

  const newPdfBytes = await newPdf.save();
  downloadPdf(newPdfBytes, 'updated.pdf');
});

// Clear Files
clearBtn.addEventListener('click', () => {
  pdfFiles = []; // Clear the files array
  pdfList.innerHTML = ''; // Clear the displayed list
  pdfInput.value = ''; // Reset the file input
  console.log('All files have been cleared.'); // Log to console for debugging
});

// Helper function to download PDF
function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link); // Append the link to the DOM
  link.click(); // Trigger the download
  document.body.removeChild(link); // Clean up
}
