document.getElementById('conversionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('uscFile');
    const format = document.getElementById('format').value;
    
    if (fileInput.files.length === 0) {
        alert('ファイルを選択してください');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        let content = e.target.result;

        if (format === 'ched') {
            content = convertToched(content);
        } else if (format === 'mmw') {
            content = convertToMMW(content);
        }

        const blob = new Blob([content], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        if (format === 'ched' || format === 'mmw') {
            link.download = file.name.replace('.usc', '.usc'); // .usc形式でダウンロード
        }

        link.click();
        URL.revokeObjectURL(link.href);
    };

    reader.readAsText(file); // テキストとして読み込む
});

// Ched形式への変換処理
function convertToMMW(content) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"type": "attach",')) {
            lines.splice(i + 1, 0, '            "ease": "linear",');
            i++; // 新しく追加した行をスキップ
        }
    }
    return lines.join('\n');
}

// MMW形式への変換処理
function convertToched(content) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"type": "attach",')) {
            lines.splice(i, 1); // 該当行を削除
            i--; // 削除した行の次の行を確認するためインデックスを戻す
        }
    }
    return lines.join('\n');
}
