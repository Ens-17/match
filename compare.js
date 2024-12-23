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
    const sortContent = document.getElementById('sortContent').checked;

    if (!file1 || !file2) {
        resultElement.textContent = '両方にファイルを選択してください';
        return;
    }

    const allowedExtensions = ['usc', 'sus', 'chs', 'ccmmws', 'mmws'];

    if (!isAllowedExtension(file1, allowedExtensions) || !isAllowedExtension(file2, allowedExtensions)) {
        resultElement.textContent = '譜面ファイルにのみ対応しています';
        return;
    }

    if (!hasSameExtension(file1, file2)) {
        resultElement.textContent = '選択されたファイルの拡張子が一致していません';
        return;
    }

    try {
        let [content1, content2] = await Promise.all([readFile(file1), readFile(file2)]);

        if (sortContent) {
            content1 = sortText(content1);
            content2 = sortText(content2);
        }

        if (detailedComparison) {
            const comparisonResult = getDetailedComparison(content1, content2, file1.name, file2.name);
            resultElement.innerHTML = comparisonResult;
        } else {
            if (content1 === content2) {
                resultElement.textContent = '一致しています';
            } else {
                const diff = getDifferences(content1, content2, file1.name, file2.name);
                resultElement.innerHTML = `<span class="mismatch">${diff}</span>`;
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

function hasSameExtension(file1, file2) {
    const ext1 = file1.name.split('.').pop().toLowerCase();
    const ext2 = file2.name.split('.').pop().toLowerCase();
    return ext1 === ext2;
}

function getDifferences(text1, text2, file1Name, file2Name) {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLength = Math.max(lines1.length, lines2.length);
    let diff = '';

    for (let i = 0; i < maxLength; i++) {
        if (lines1[i] !== lines2[i]) {
            diff += `<div><span class="line-number">Line ${i + 1}:</span><br>
<span class="mismatch">${file1Name}: ${lines1[i] || ''}</span>
<span class="mismatch">${file2Name}: ${lines2[i] || ''}</span></div><br>`;
        }
    }

    return diff;
}

function getDetailedComparison(text1, text2, file1Name, file2Name) {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLength = Math.max(lines1.length, lines2.length);
    let result = '';

    for (let i = 0; i < maxLength; i++) {
        if (lines1[i] === lines2[i]) {
            result += `<span class="match"><span class="line-number">Line ${i + 1}</span>: ${lines1[i] || ''}</span><br>`;
        } else {
            result += `<span class="mismatch"><span class="line-number">Line ${i + 1}</span> (不一致):<br>
${file1Name}: ${lines1[i] || ''}
${file2Name}: ${lines2[i] || ''}</span><br>`;
        }
    }

    return result;
}

function sortText(text) {
    const lines = text.split('\n');
    lines.sort();
    return lines.join('\n');
}

// スクロールして一定量下がったらボタンを表示
window.onscroll = function() {
    const btn = document.getElementById("scrollToTopBtn");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
};

// トップにスクロールする関数
function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}
