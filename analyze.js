document.getElementById('uscFile').addEventListener('change', function() {
    const fileInput = this;
    const resultsDiv = document.getElementById('result');

    if (fileInput.files.length === 0) {
        resultsDiv.innerHTML = "USCファイルを選択してください。";
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const content = event.target.result;
        analyzeUSC(content);
    };

    reader.readAsText(file);
});

function analyzeUSC(content) {
    const resultsDiv = document.getElementById('result');
    resultsDiv.innerHTML = "";  // Clear previous results

    let messages = [];  // ここでメッセージを初期化

    const lanes = content.match(/"lane":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const sizes = content.match(/"size":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const fades = content.match(/"fade":\s*"(.*?)"/g) || [];
    const timescales = content.match(/"timeScale":\s*([-+]?[0-9]*\.?[0-9]+)/g) || [];
    const types = content.match(/"type":\s*"(.*?)"/g) || [];
    const colors = content.match(/"color":\s*"(.*?)"/g) || [];
    const directions = content.match(/"direction":\s*"(.*?)"/g) || [];
    const eases = content.match(/"ease":\s*"(.*?)"/g) || [];

    // ルールチェック
    if (types.filter(type => type.includes('timeScaleGroup')).length >= 2) {
        messages.push("・レイヤーが複数あります");
    }


    if (eases.some(ease => ease.includes('inout') || ease.includes('outin'))) {
        messages.push("・直線、加速、減速以外の曲線が使われています");
    }

    if (colors.some(color => ['neutral', 'red', 'blue', 'purple', 'black', 'cyan'].includes(color.split('"')[3]))) {
        messages.push("・緑、黄以外の色ガイドが使われています");
    }

    if (data.hasOwnProperty('timeScale')) {
        const timeScaleValue = parseFloat(data.timeScale);
        if (timeScaleValue < 0) {
            messages.push("・逆走が使用されています");
        }
    }



    // LaneとSizeのチェック
    const allowedLanes = new Set([-6.0, -5.5, -5.0, -4.5, -4.0, -3.5, -3.0, -2.5, -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0]);
    const allowedSizes = new Set([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0]);

    // メッセージフラグ
    let laneViolationMessage = false;
    let sizeViolationMessage = false;

    for (let i = 0; i < lanes.length; i++) {
        const laneValue = parseFloat(lanes[i].match(/([-+]?[0-9]*\.?[0-9]+)/)[0]);
        const sizeValue = i < sizes.length ? parseFloat(sizes[i].match(/([-+]?[0-9]*\.?[0-9]+)/)[0]) : null;

        // 1. Laneが-6.0または6.0の場合、Sizeは0.5である必要がある
        if ((laneValue === -6.0 || laneValue === 6.0) && sizeValue !== 0.5 && !laneViolationMessage) {
            messages.push("・レーン外にノーツが使われています");
            laneViolationMessage = true; // メッセージを追加したらフラグを立てる
        }

        // Laneが許可された値内であること
        if (!allowedLanes.has(laneValue) && !laneViolationMessage) {
            messages.push("・レーン外、または小数レーンにノーツが使われています");
            laneViolationMessage = true; // メッセージを追加したらフラグを立てる
        }

        // Sizeが許可された値内であること
        if (sizeValue !== null && !allowedSizes.has(sizeValue) && !sizeViolationMessage) {
            messages.push("・1~12の整数幅ではないノーツが使われています");
            sizeViolationMessage = true; // メッセージを追加したらフラグを立てる
            console.log("Invalid size detected:", sizeValue); // デバッグ用
        }

        // Sizeが2倍になった結果の条件チェック
        if (sizeValue !== null) {
            const sizeDoubled = sizeValue * 2;
            if ((sizeDoubled % 2 === 0 && laneValue % 1 !== 0) || (sizeDoubled % 2 !== 0 && laneValue % 1 === 0)) {
                if (!laneViolationMessage) {
                    messages.push("・レーン外、または小数レーンにノーツが使われています");
                    laneViolationMessage = true; // メッセージを追加したらフラグを立てる
                }
            }
        }
    }

    // その他のルールのチェック
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
