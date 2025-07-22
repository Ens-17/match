function analyzeUSC(content) {
    const resultsDiv = document.getElementById('result');
    const resultsDiv2 = document.getElementById('result2');

    resultsDiv.innerHTML = "";
    resultsDiv2.innerHTML = "";

    let messages = [];
    const lines = content.split("\n");

    const lanes = content.match(/"lane":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const sizes = content.match(/"size":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const fades = content.match(/"fade":\s*"(.*?)"/g) || [];
    const timescales = content.match(/"timeScale":\s*([-]?[0-9]*\.?[0-9]+)/g) || [];
    const types = content.match(/"type":\s*"(.*?)"/g) || [];
    const colors = content.match(/"color":\s*"(.*?)"/g) || [];
    const directions = content.match(/"direction":\s*"(.*?)"/g) || [];
    const eases = content.match(/"ease":\s*"(.*?)"/g) || [];

    function getBeatValues(matches, content) {
        const beats = [];
        matches.forEach(match => {
            const index = content.indexOf(match);
            const before = content.substring(0, index);
            const beatMatch = before.match(/"beat":\s*([-+]?[0-9]*\.?[0-9]+)/g);
            if (beatMatch && beatMatch.length > 0) {
                const last = beatMatch[beatMatch.length - 1];
                const value = last.match(/([-+]?[0-9]*\.?[0-9]+)/)[0];
                beats.push(value);
            } else {
                beats.push("不明");
            }
        });
        return beats;
    }

    const laneBeats = getBeatValues(lanes, content);
    const sizeBeats = getBeatValues(sizes, content);
    const fadeBeats = getBeatValues(fades, content);
    const timescaleBeats = getBeatValues(timescales, content);
    const typeBeats = getBeatValues(types, content);
    const colorBeats = getBeatValues(colors, content);
    const directionBeats = getBeatValues(directions, content);
    const easeBeats = getBeatValues(eases, content);

    const flags = {
        laneViolation: false,
        sizeViolation: false,
        laneViolation2: false,
        sizeViolation2: false,
        sizeViolation3: false,
        typeViolation: false,
        directionViolation: false,
        fadeViolation: false,
        easeViolation: false,
        colorViolation: false,
        timescaleViolation: false,
        sizeLaneMismatch: false,
        sizeLaneMismatch2: false,
    };

    const redMessages = [];
    const greenMessages = [];

    eases.forEach((ease, index) => {
        if ((ease.includes('inout') || ease.includes('outin')) && !flags.easeViolation) {
            redMessages.push(`️直線、加速、減速以外の曲線が使われています [${easeBeats[index]}]`);
            flags.easeViolation = true;
        }
    });

    if (types.filter(type => type.includes('timeScaleGroup')).length >= 2) {
        redMessages.push("️レイヤーが複数あります");
    }

    colors.forEach((color, index) => {
        const colorValue = color.split('"')[3];
        if (!['green', 'yellow'].includes(colorValue) && !flags.colorViolation) {
            redMessages.push(`緑、黄以外の色ガイドが使われています [${colorBeats[index]}]`);
            flags.colorViolation = true;
        }
    });

    timescales.forEach((timescale, index) => {
        const value = parseFloat(timescale.match(/([-+]?[0-9]*\.?[0-9]+)/)[0]);
        if (value < 0 && !flags.timescaleViolation) {
            redMessages.push(`逆走が使われています [${timescaleBeats[index]}]`);
            flags.timescaleViolation = true;
        }
    });

    const allowedLanes = new Set([-5.5, -5.0, -4.5, -4.0, -3.5, -3.0, -2.5, -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5]);
    const allowedSizes = new Set([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0]);

    for (let i = 0; i < lanes.length; i++) {
        const laneValue = parseFloat(lanes[i].match(/([-+]?[0-9]*\.?[0-9]+)/)[0]);
        const sizeValue = i < sizes.length ? parseFloat(sizes[i].match(/([-+]?[0-9]*\.?[0-9]+)/)[0]) : null;

        if (laneValue % 1 !== 0 && !allowedLanes.has(laneValue) && !flags.laneViolation) {
            redMessages.push(`️小数レーンにノーツが置かれています [${laneBeats[i]}]`);
            flags.laneViolation = true;
        }

        const leftEdge = laneValue - sizeValue;
        const rightEdge = laneValue + sizeValue;

        if ((leftEdge < -6.0 || rightEdge > 6.0) && !flags.laneViolation2) {
            redMessages.push(`ノーツがレーン外に飛び出しています [${laneBeats[i]}]`);
            flags.laneViolation2 = true;
        }

        if (sizeValue !== null) {
            if (sizeValue * 2 > 0 && sizeValue * 2 < 13 && !allowedSizes.has(sizeValue) && !flags.sizeViolation) {
                redMessages.push(`小数幅のノーツが使われています [${sizeBeats[i]}]`);
                flags.sizeViolation = true;
            }

            if (sizeValue * 2 >= 13 && !flags.sizeViolation2) {
                redMessages.push(`13幅以上のノーツが置かれています [${sizeBeats[i]}]`);
                flags.sizeViolation2 = true;
            }

            if (sizeValue * 2 === 0 && !flags.sizeViolation3) {
                redMessages.push(`️0幅のノーツが置かれています [${sizeBeats[i]}]`);
                flags.sizeViolation3 = true;
            }

            if (laneValue % 1 === 0 && sizeValue !== null && sizeValue * 2 % 2 !== 0 && !flags.sizeLaneMismatch) {
                redMessages.push(`️ノーツが公式ではありえないレーンに置かれています [${laneBeats[i]}]`);
                flags.sizeLaneMismatch = true;
            }

            if (laneValue % 1 === 0.5 && sizeValue !== null && sizeValue * 2 % 2 !== 1 && !flags.sizeLaneMismatch) {
                redMessages.push(`️ノーツが公式ではありえないレーンに置かれています [${laneBeats[i]}]`);
                flags.sizeLaneMismatch = true;
            }
        }
    }

    types.forEach((type, index) => {
        if (type.includes('damage') && !flags.typeViolation) {
            redMessages.push(`️ダメージノーツが使われています [${typeBeats[index]}]`);
            flags.typeViolation = true;
        }
    });

    directions.forEach((direction, index) => {
        if (direction.includes('none') && !flags.directionViolation) {
            redMessages.push(`️矢印無しフリックが使われています [${directionBeats[index]}]`);
            flags.directionViolation = true;
        }
    });

    fades.forEach((fade, index) => {
        if (fade.includes('in') && !flags.fadeViolation) {
            redMessages.push(`フェードインガイドが使われています [${fadeBeats[index]}]`);
            flags.fadeViolation = true;
        }
    });

    if (redMessages.length > 0 && greenMessages.length > 0) {
        resultsDiv.innerHTML = greenMessages.join("<br>") + "<br>";
        resultsDiv2.innerHTML = redMessages.join("<br>") + "<br>";
        resultsDiv.style.display = "block";
        resultsDiv2.style.display = "block";
    } else if (redMessages.length > 0) {
        resultsDiv2.innerHTML = redMessages.join("<br>") + "<br>";
        resultsDiv2.style.display = "block";
        resultsDiv.style.display = "none";
    } else if (greenMessages.length > 0) {
        resultsDiv.innerHTML = greenMessages.join("<br>") + "<br>";
        resultsDiv.style.display = "block";
        resultsDiv2.style.display = "none";
    } else {
        resultsDiv.innerHTML = "✔️ 公式レギュレーション内です<br>";
        resultsDiv.style.display = "block";
        resultsDiv2.style.display = "none";
    }
}

document.getElementById('uscFile').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const resultsDiv = document.getElementById('result');
    const resultsDiv2 = document.getElementById('result2');

    if (!file) {
        resultsDiv.innerHTML = "ファイルを選択してください";
        return;
    }

    if (file.name.endsWith('.usc')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            analyzeUSC(content);
        };
        reader.readAsText(file);
    } else if (file.name.endsWith('.sus')) {
        resultsDiv.innerHTML = "現在susには対応していません。";
        resultsDiv.style.display = "block";
        resultsDiv2.style.display = "none";
    } else {
        resultsDiv.innerHTML = "譜面ファイルを選択してください。";
        resultsDiv.style.display = "block";
        resultsDiv2.style.display = "none";
    }
});
