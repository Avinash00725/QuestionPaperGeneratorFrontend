const API_BASE_URL = 'http://localhost:3000/api';

// Event listeners
document.getElementById('excelFile').addEventListener('change', handleFileUpload);
document.getElementById('generateButton').addEventListener('click', generateQuestionPaper);
document.getElementById('downloadButton').addEventListener('click', downloadQuestionPaper);
document.getElementById('paperType').addEventListener('change', handlePaperTypeChange);

// Function to handle file upload
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error uploading file');
        }

        alert('Excel file uploaded and processed successfully!');
    } catch (error) {
        console.error('Upload Error:', error);
        alert('Error uploading file: ' + error.message);
    }
}

// Function to generate the question paper
async function generateQuestionPaper() {
    const paperType = document.getElementById('paperType').value;
    let requestBody = { paperType };

    if (paperType === 'special') {
        const mainUnit = parseInt(document.getElementById('mainUnit').value);
        requestBody.mainUnit = mainUnit;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error generating question paper');
        }

        displayQuestionPaper(data.questions, data.paperDetails);
        document.getElementById('downloadButton').style.display = 'block';
    } catch (error) {
        console.error('Generation Error:', error);
        alert('Error generating question paper: ' + error.message);
    }
}

// Function to display the generated question paper with improved formatting
function displayQuestionPaper(questions, paperDetails) {
    const html = `
        <div id="questionPaperContainer" style="padding: 60px; margin: 60px auto; text-align: center; max-width: 800px;">
            <div style=" align-items: center; justify-content: space-between; border-bottom: 1px solid black;">
                <div style="text-align: left; font-weight: semi-bold;">
                    <p>Subject Code: ${paperDetails.subjectCode}</p>
                </div>
                <div style="text-align: center; flex-grow: 1;">
                    <img src="image.png" alt="Institution Logo" style="max-width: 100% ; height: auto;">
                </div>
            </div>
            <h3>B.Tech ${paperDetails.year} Year ${paperDetails.semester} Semester II Mid-Term Examinations</h3>
            <p>(${paperDetails.regulation} Regulation)</p>
            <p><span style="float:left;"><strong>Time:</strong> 90 Min. </span><span style="float:right;"><strong>Max Marks:</strong> 20</span></p>
            <br>
            <p><span style="float:left;"><strong>Subject:</strong> ${paperDetails.subject} </span><span style="float:center;"><strong>Branch:</strong> ${paperDetails.branch}</span> <span style="float:right;"> Date:_______</span></p>
            <hr>
            <p><strong>Note:</strong> Question paper consists of 2 ½ Units, Answer any 4 full questions out of 6 questions. Each question carries 5 marks and may have sub-questions.</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid black; padding: 8px;">S. No</th>
                        <th style="border: 1px solid black; padding: 8px;">Question</th>
                        <th style="border: 1px solid black; padding: 8px;">Unit</th>
                        <th style="border: 1px solid black; padding: 8px;">B.T Level</th>
                    </tr>
                </thead>
                <tbody>
                    ${questions.map((q, index) => `
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;">${index + 1}</td>
                            <td style="border: 1px solid black; padding: 8px; text-align: left;">${q.question}</td>
                            <td style="border: 1px solid black; padding: 8px;">${q.unit}</td>
                            <td style="border: 1px solid black; padding: 8px;">${q.btLevel}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('questionPaper').innerHTML = html;
}

// Handle paper type change (show/hide special mid options)
function handlePaperTypeChange(e) {
    const specialMidOptions = document.getElementById('specialMidOptions');
    specialMidOptions.style.display = e.target.value === 'special' ? 'block' : 'none';
}

// Function to download the question paper as a properly formatted PDF
async function downloadQuestionPaper() {
    const questionPaperContainer = document.getElementById('questionPaperContainer');

    if (!questionPaperContainer) {
        alert('No question paper to download!');
        return;
    }

    const { jsPDF } = window.jspdf;

    // Convert question paper to an image using html2canvas
    html2canvas(questionPaperContainer, {
        scale: 3, // Increase resolution for better quality
        useCORS: true // Ensure cross-origin images load properly
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png'); // Convert to image
        const pdf = new jsPDF({
            orientation: 'p', // Portrait mode
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
        const pageHeight = 297; // A4 height in mm
        let position = 10; // Start position

        if (imgHeight > pageHeight) { 
            let heightLeft = imgHeight;
            while (heightLeft > 0) {
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                if (heightLeft > 0) {
                    pdf.addPage();
                    position = 0;
                }
            }
        } else {
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        }

        pdf.save('question_paper.pdf'); // Download the PDF
    }).catch(error => {
        console.error('PDF generation error:', error);
        alert('Error generating PDF! Check console for details.');
    });
}
