const pdfInput = document.getElementById('pdfInput');
const pdfList = document.getElementById('pdfList');
const sortOrderInputs = document.getElementById('sortOrderInputs');
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
  sortOrderInputs.innerHTML = ''; // Clear the sort order inputs

  const arrayBuffer = await file.arrayBuffer();
  pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

  // Display pages with checkboxes and sort order inputs
  pdfDoc.getPages().forEach((page, index) => {
    const listItem = document.createElement('div');
    listItem.innerHTML = `
      <input type="checkbox" id="page-${index}" class="page-checkbox">
      <label for="page-${index}">Page ${index + 1}</label>
    `;
    pdfList.appendChild(listItem);

    const sortInput = document.createElement('input');
    sortInput.type = 'number';
    sortInput.value = index + 1;
    sortInput.min = 1;
    sortInput.max = pdfDoc.getPages().length;
    sortOrderInputs.appendChild(sortInput);
  });
});

// Sort PDF Pages
sortBtn.addEventListener('click', async () => {
  if (!pdfDoc) {
    alert('Please upload a PDF first.');
    return;
  }

  const sortInputs = document.querySelectorAll('.sort-order-inputs input');
  const newOrder = Array.from(sortInputs).map(input => parseInt(input.value) - 1);

  // Validate the new order
  const pageCount = pdfDoc.getPages().length;
  const isValidOrder = newOrder.length === pageCount &&
                       new Set(newOrder).size === pageCount &&
                       newOrder.every(index => index >= 0 && index < pageCount);

  if (!isValidOrder) {
    alert('Invalid page order. Please ensure each page number is unique and within range.');
    return;
  }

  // Create a new PDF with the sorted pages
  const newPdf = await PDFLib.PDFDocument.create();
  for (const index of newOrder) {
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [index]);
    newPdf.addPage(copiedPage);
  }

  const newPdfBytes = await newPdf.save();
  downloadPdf(newPdfBytes, 'sorted.pdf');
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
  sortOrderInputs.innerHTML = ''; // Clear the sort order inputs
  pdfInput.value = ''; // Reset the file input
  pdfDoc = null; // Reset the PDF document
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
