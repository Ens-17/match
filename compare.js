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

    if (!file1 || !file2) {
        resultElement.textContent = 'Please select both files.';
        return;
    }

    try {
        const [content1, content2] = await Promise.all([readFile(file1), readFile(file2)]);

        if (content1 === content2) {
            resultElement.textContent = '一致しています';
        } else {
            const diff = getDifferences(content1, content2, file1.name, file2.name);
            resultElement.textContent = `不一致の部分:\n${diff}`;
        }
    } catch (error) {
        resultElement.textContent = `Error reading files: ${error}`;
    }
}

function getDifferences(text1, text2, fileName1, fileName2) {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLength = Math.max(lines1.length, lines2.length);
    let diff = '';

    for (let i = 0; i < maxLength; i++) {
        if (lines1[i] !== lines2[i]) {
            diff += `Line ${i + 1}:\n${fileName1}: ${lines1[i] || ''}\n${fileName2}: ${lines2[i] || ''}\n\n`;
        }
    }

    return diff;
}
