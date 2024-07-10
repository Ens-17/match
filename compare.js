function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

async function compareFiles() {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];
    const resultElement = document.getElementById('result');
    const detailedComparison = document.getElementById('detailedComparison').checked;

    if (!file1 || !file2) {
        resultElement.textContent = 'Please select both files.';
        return;
    }

    const allowedExtensions = ['usc', 'sus'];

    if (!isAllowedExtension(file1, allowedExtensions) || !isAllowedExtension(file2, allowedExtensions)) {
        resultElement.textContent = 'Please select .usc or .sus files only.';
        return;
    }

    try {
        const [content1, content2] = await Promise.all([readFile(file1), readFile(file2)]);

        if (detailedComparison) {
            const comparisonResult = getDetailedComparison(content1, content2);
            resultElement.innerHTML = comparisonResult;
        } else {
            if (content1 === content2) {
                resultElement.textContent = '一致しています';
            } else {
                const diff = getDifferences(content1, content2);
                resultElement.textContent = `不一致の部分:\n${diff}`;
            }
        }
    } catch (error) {
        resultElement.textContent = `Error reading files: ${error}`;
    }
}

function isAllowedExtension(file, allowedExtensions) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(fileExtension);
}

function getDifferences(text1, text2) {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLength = Math.max(lines1.length, lines2.length);
    let diff = '';

    for (let i = 0; i < maxLength; i++) {
        if (lines1[i] !== lines2[i]) {
            diff += `Line ${i + 1}:\nFile 1: ${lines1[i] || ''}\nFile 2: ${lines2[i] || ''}\n\n`;
        }
    }

    return diff;
}

function getDetailedComparison(text1, text2) {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLength = Math.max(lines1.length, lines2.length);
    let result = '';

    for (let i = 0; i < maxLength; i++) {
        if (lines1[i] === lines2[i]) {
            result += `<span class="match"><span class="line-number">Line ${i + 1}</span>: ${lines1[i] || ''}</span>`;
        } else {
            result += `<span class="mismatch"><span class="line-number">Line ${i + 1}</span> (不一致):<br>File 1: ${lines1[i] || ''}<br>File 2: ${lines2[i] || ''}</span><br>`;
        }
    }

    return result;
}
