// API endpoints
const API_BASE_URL = 'http://localhost:3000/api';

document.getElementById('excelFile').addEventListener('change', handleFileUpload);
document.getElementById('generateButton').addEventListener('click', generateQuestionPaper);
document.getElementById('downloadButton').addEventListener('click', downloadQuestionPaper);

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

        alert('Excel file processed successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Error uploading file: ' + error.message);
    }
}

async function generateQuestionPaper() {
    const paperType = document.getElementById('paperType').value;

    try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paperType })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error generating question paper');
        }

        displayQuestionPaper(data.questions, data.paperDetails);
        document.getElementById('downloadButton').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating question paper: ' + error.message);
    }
}

function displayQuestionPaper(questions, paperDetails) {
    const html = `
        <div class="paper-header">
            <h4>Subject : ${paperDetails.subject} (${paperDetails.subjectCode})</h4>
            <p>Branch: ${paperDetails.branch}</p>
            <p>Regulation: ${paperDetails.regulation}</p>
            <p>Year: ${paperDetails.year} | Semester: ${paperDetails.semester}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Question</th>
                    <th>Unit</th>
                    <th>B.T Level</th>
                </tr>
            </thead>
            <tbody>
                ${questions.map((q, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${q.question}</td>
                        <td>${q.unit}</td>
                        <td>${q.btLevel}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('questionPaper').innerHTML = html;
}

// ... (previous code remains the same until the event listeners)

// Add event listener for paper type change
document.getElementById('paperType').addEventListener('change', function(e) {
    const specialMidOptions = document.getElementById('specialMidOptions');
    specialMidOptions.style.display = e.target.value === 'special' ? 'block' : 'none';
});

async function generateQuestionPaper() {
    const paperType = document.getElementById('paperType').value;
    let requestBody = { paperType };

    // Add main unit for special mid
    if (paperType === 'special') {
        const mainUnit = parseInt(document.getElementById('mainUnit').value);
        requestBody.mainUnit = mainUnit;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error generating question paper');
        }

        displayQuestionPaper(data.questions, data.paperDetails);
        document.getElementById('downloadButton').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating question paper: ' + error.message);
    }
}

// ... (rest of the frontend code remains the same)

function downloadQuestionPaper() {
    const questionPaper = document.getElementById('questionPaper');
    const content = questionPaper.innerHTML;
    
    const style = `
        <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; }
            .paper-header { margin-bottom: 20px; }
        </style>
    `;
    
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Question Paper</title>
            ${style}
        </head>
        <body>
            ${content}
        </body>
        </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_paper.html';
    a.click();
    window.URL.revokeObjectURL(url);
}
