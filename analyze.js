function analyzeUSC(content) {
    const resultsDiv = document.getElementById('result');
    resultsDiv.innerHTML = "";

    let messages = [];
    const data = {};

    const lanes = content.match(/"lane":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const sizes = content.match(/"size":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const fades = content.match(/"fade":\s*"(.*?)"/g) || [];
    const timescales = content.match(/"timeScale":\s*([-]?[0-9]*\.?[0-9]+)/g) || [];
    const types = content.match(/"type":\s*"(.*?)"/g) || [];
    const colors = content.match(/"color":\s*"(.*?)"/g) || [];
    const directions = content.match(/"direction":\s*"(.*?)"/g) || [];
    const eases = content.match(/"ease":\s*"(.*?)"/g) || [];

    if (types.filter(type => type.includes('timeScaleGroup')).length >= 2) {
        messages.push("・レイヤーが複数あります");
    }

    if (eases.some(ease => ease.includes('inout') || ease.includes('outin'))) {
        messages.push("・直線、加速、減速以外の曲線が使われています");
    }

    if (colors.some(color => ['neutral', 'red', 'blue', 'purple', 'black', 'cyan'].includes(color.split('"')[3]))) {
        messages.push("・緑、黄以外の色ガイドが使われています");
    }

    for (let timeScale of timescales) {
        const value = parseFloat(timeScale.match(/([-+]?[0-9]*\.?[0-9]+)/)[0]);
        if (value < 0) {
            messages.push("・逆走が使われています");
            break;
        }
    }

    const allowedLanes = new Set([-5.5, -5.0, -4.5, -4.0, -3.5, -3.0, -2.5, -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5]);
    const allowedSizes = new Set([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0]);

    let laneViolationMessage = false;
    let sizeViolationMessage = false;

    for (let i = 0; i < lanes.length; i++) {
        const laneValue = parseFloat(lanes[i].match(/([-+]?[0-9]*\.?[0-9]+)/)[0]);
        const sizeValue = i < sizes.length ? parseFloat(sizes[i].match(/([-+]?[0-9]*\.?[0-9]+)/)[0]) : null;

        // Laneが-nまたはnの場合、Sizeはx~yである必要がある
        if ((laneValue === -5.5 || laneValue === 5.5) && sizeValue !== 0.5 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 5.0 || laneValue === -5.0) && sizeValue !== 1.0 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 4.5 || laneValue === -4.5) && sizeValue !== 0.5 && sizeValue !== 1.5 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 4.0 || laneValue === -4.0) && sizeValue !== 1.0 && sizeValue !== 2.0 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 3.5 || laneValue === -3.5) && sizeValue !== 0.5 && sizeValue !== 1.5 && sizeValue !== 2.5 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 3.0 || laneValue === -3.0) && sizeValue !== 1.0 && sizeValue !== 2.0 && sizeValue !== 3.0 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 2.5 || laneValue === -2.5) && sizeValue !== 0.5 && sizeValue !== 1.5 && sizeValue !== 2.5 && sizeValue !== 3.5 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 2.0 || laneValue === -2.0) && sizeValue !== 1.0 && sizeValue !== 2.0 && sizeValue !== 3.0 && sizeValue !== 4.0 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 1.5 || laneValue === -1.5) && sizeValue !== 0.5 && sizeValue !== 1.5 && sizeValue !== 2.5 && sizeValue !== 3.5 && sizeValue !== 4.5 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 1.0 || laneValue === -1.0) && sizeValue !== 1.0 && sizeValue !== 2.0 && sizeValue !== 3.0 && sizeValue !== 4.0 && sizeValue !== 5.0 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 0.5 || laneValue === -0.5) && sizeValue !== 0.5 && sizeValue !== 1.5 && sizeValue !== 2.5 && sizeValue !== 3.5 && sizeValue !== 4.5 && sizeValue !== 5.5 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if ((laneValue === 0.0 || laneValue === -0.0) && sizeValue !== 1.0 && sizeValue !== 2.0 && sizeValue !== 3.0 && sizeValue !== 4.0 && sizeValue !== 5.0 && sizeValue !== 6.0 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true;
        }

        if (!allowedLanes.has(laneValue) && !laneViolationMessage) {
            messages.push("・レーン外、または小数レーンにノーツが使われています");
            laneViolationMessage = true;
        }

        if (sizeValue !== null && !allowedSizes.has(sizeValue) && !sizeViolationMessage) {
            messages.push("・1~12の整数幅ではないノーツが使われています");
            sizeViolationMessage = true;
            console.log("Invalid size detected:", sizeValue);
        }

        // Sizeが2倍になった結果の条件チェック
        if (sizeValue !== null) {
            const sizeDoubled = sizeValue * 2;
            if ((sizeDoubled % 2 === 0 && laneValue % 1 !== 0) || (sizeDoubled % 2 !== 0 && laneValue % 1 === 0)) {
                if (!laneViolationMessage) {
                    messages.push("・レーン外、または小数レーンにノーツが使われています");
                    laneViolationMessage = true;
                }
            }
        }
    }

    if (types.some(type => type.includes('damage'))) {
        messages.push("・ダメージノーツが使われています");
    }

    if (directions.some(direction => direction.includes('none'))) {
        messages.push("・矢印無しフリックが使われています");
    }

    if (fades.some(fade => fade.includes('in'))) {
        messages.push("・フェードインガイドが使われています");
    }

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
