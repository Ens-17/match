function analyzeUSC(content) {
    const resultsDiv = document.getElementById('result');
    resultsDiv.innerHTML = "";

    let messages = [];
    const lines = content.split("\n"); // 行単位で分割

    const lanes = content.match(/"lane":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const sizes = content.match(/"size":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const fades = content.match(/"fade":\s*"(.*?)"/g) || [];
    const timescales = content.match(/"timeScale":\s*([-]?[0-9]*\.?[0-9]+)/g) || [];
    const types = content.match(/"type":\s*"(.*?)"/g) || [];
    const colors = content.match(/"color":\s*"(.*?)"/g) || [];
    const directions = content.match(/"direction":\s*"(.*?)"/g) || [];
    const eases = content.match(/"ease":\s*"(.*?)"/g) || [];

    // 各要素の行番号を記録する関数
    function getLineNumbers(matches, content) {
        const lineNumbers = [];
        matches.forEach(match => {
            const index = content.indexOf(match);
            const lineNumber = content.substring(0, index).split("\n").length;
            lineNumbers.push(lineNumber);
        });
        return lineNumbers;
    }

    // 各要素の行番号リストを取得
    const laneLines = getLineNumbers(lanes, content);
    const sizeLines = getLineNumbers(sizes, content);
    const fadeLines = getLineNumbers(fades, content);
    const timescaleLines = getLineNumbers(timescales, content);
    const typeLines = getLineNumbers(types, content);
    const colorLines = getLineNumbers(colors, content);
    const directionLines = getLineNumbers(directions, content);
    const easeLines = getLineNumbers(eases, content);

    if (types.filter(type => type.includes('timeScaleGroup')).length >= 2) {
        messages.push("・レイヤーが複数あります");
    }

    eases.forEach((ease, index) => {
        if (ease.includes('inout') || ease.includes('outin')) {
            messages.push(`・直線、加速、減速以外の曲線が使われています [${easeLines[index]}]`);
        }
    });

    colors.forEach((color, index) => {
        const colorValue = color.split('"')[3];
        if (!['green', 'yellow'].includes(colorValue)) {
            messages.push(`・緑、黄以外の色ガイドが使われています [${colorLines[index]}]`);
        }
    });

    timescales.forEach((timescale, index) => {
        const value = parseFloat(timescale.match(/([-+]?[0-9]*\.?[0-9]+)/)[0]);
        if (value < 0) {
            messages.push(`・逆走が使われています [${timescaleLines[index]}]`);
        }
    });

    const allowedLanes = new Set([-5.5, -5.0, -4.5, -4.0, -3.5, -3.0, -2.5, -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5]);
    const allowedSizes = new Set([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0]);

    let laneViolationMessage = false;
    let sizeViolationMessage = false;

    for (let i = 0; i < lanes.length; i++) {
        const laneValue = parseFloat(lanes[i].match(/([-+]?[0-9]*\.?[0-9]+)/)[0]);
        const sizeValue = i < sizes.length ? parseFloat(sizes[i].match(/([-+]?[0-9]*\.?[0-9]+)/)[0]) : null;

        if (!allowedLanes.has(laneValue) && !laneViolationMessage) {
            messages.push(`・レーン外、または小数レーンにノーツが使われています [${laneLines[i]}]`);
            laneViolationMessage = true;
        }

        if (sizeValue !== null && !allowedSizes.has(sizeValue) && !sizeViolationMessage) {
            messages.push(`・1~12の整数幅ではないノーツが使われています [${sizeLines[i]}]`);
            sizeViolationMessage = true;
        }
    }

    types.forEach((type, index) => {
        if (type.includes('damage')) {
            messages.push(`・ダメージノーツが使われています [${typeLines[index]}]`);
        }
    });

    directions.forEach((direction, index) => {
        if (direction.includes('none')) {
            messages.push(`・矢印無しフリックが使われています [${directionLines[index]}]`);
        }
    });

    fades.forEach((fade, index) => {
        if (fade.includes('in')) {
            messages.push(`・フェードインガイドが使われています [${fadeLines[index]}]`);
        }
    });

    // 結果の出力
    if (messages.length > 0) {
        resultsDiv.innerHTML = messages.join("<br>") + "<br>";
    } else {
        resultsDiv.innerHTML = "公式レギュレーション内です<br>";
    }
}

document.getElementById('uscFile').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            analyzeUSC(e.target.result);
        };
        reader.readAsText(file);
    }
});
