/**
 * 日付入力欄の初期値を設定する
 */
function initDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const dateInput = form.querySelector('input[name="date"]');
  dateInput.value = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

/**
 * コマンド表示/非表示制御用のチェックボックスエリアの内容をクリアする
 */
function clearCheckboxContainer() {
  checkboxContainer.innerHTML = "";
}

/**
 * スケジュール表示エリアをクリアする
 */
function clearScheduleContainer() {
  scheduleContainer.innerHTML = "";
}

/**
 * コマンドカードの表示/非表示を切り替える
 */
function updateCommandCardVisibility() {
  const commandCardList = document.querySelectorAll(".command-card");
  commandCardList.forEach((commandCard) => {
    const commandList = commandCard.querySelector(".command-list");
    const commandLiList = commandList.querySelectorAll("li");
    let hasVisibleLi = false;
    commandLiList.forEach((li) => {
      if (!li.classList.contains("hidden")) {
        hasVisibleLi = true;
      }
    });

    if (hasVisibleLi) {
      // カード内に表示状態のli要素がある場合、カードを表示する
      commandCard.classList.remove("hidden");
    } else {
      // カード内に表示状態のli要素がない場合、カードを非表示にする
      commandCard.classList.add("hidden");
    }
  });
}

/**
 * コマンド文字列に正規表現を適用して表示を更新する
 */
function updateCommandTextsWithRegExp() {
  // filter-regex 要素の値を取得
  const regexp = new RegExp(regexpInput.value, "g");
  const dataRefEntryIdElemList = document.querySelectorAll(
    "[data-ref_entry_id]"
  );
  dataRefEntryIdElemList.forEach((elem) => {
    const refEntryId = elem.dataset.ref_entry_id;
    const originalCommandText = cronEntryList.find((cronEntry) => {
      return cronEntry.entry_id == refEntryId;
    }).command_text;

    if (regexpInput.value === "") {
      // 正規表現が空の場合はコマンド原文を表示
      elem.textContent = originalCommandText;
      return;
    }

    const match = originalCommandText.match(regexp);
    if (match) {
      // 正規表現にマッチした場合、最初にマッチした部分のテキストのみ表示()
      elem.textContent = match[0];
      return;
    }

    // マッチしなかった場合はコマンド原文を表示
    elem.textContent = originalCommandText;
  });
}

/**
 * 表示するカードのない時間帯には（実行予定なし）を表示する
 */
function updateEmptyHourTextVisibility() {
  const hourlyScheduleContainerList = document.querySelectorAll(
    ".hourly-schedule-container"
  );
  hourlyScheduleContainerList.forEach((commandCardsElem) => {
    const commandCardList = commandCardsElem.querySelectorAll(".command-card");
    let hasVisibleCard = false;
    commandCardList.forEach((commandCard) => {
      if (!commandCard.classList.contains("hidden")) {
        hasVisibleCard = true;
      }
    });

    const emptyHour = commandCardsElem.querySelector(".empty-hour");
    if (hasVisibleCard) {
      // （実行予定なし）を非表示
      emptyHour.classList.add("hidden");
    } else {
      // （実行予定なし）を表示
      emptyHour.classList.remove("hidden");
    }
  });
}

/**
 * コマンドカード内のli要素の下線の表示/非表示を切り替える
 */
function updateCommandBorderLines() {
  const allCommandListUl = document.querySelectorAll(".command-list");
  allCommandListUl.forEach((ul) => {
    const liList = ul.querySelectorAll("li");

    // 自要素のli以降にhiddenでないliがある場合、自要素のliにborder-bottomを表示
    for (let i = 0; i < liList.length; i++) {
      const currentLi = liList[i];
      if (currentLi.classList.contains("hidden")) {
        // hiddenのliには下線を表示しない
        currentLi.style.borderBottom = "none";
        continue;
      }

      // hiddenでないliで、且つ自身以降にもhiddenでないliがある場合、下線を表示
      let hasVisibleLi = false;
      for (let j = i + 1; j < liList.length; j++) {
        const next_li = liList[j];
        if (!next_li.classList.contains("hidden")) {
          hasVisibleLi = true;
          break;
        }
      }

      if (hasVisibleLi) {
        currentLi.style.borderBottom = "1px solid #bababa";
      } else {
        currentLi.style.borderBottom = "none";
      }
    }
  });
}

/**
 * 結果表示エリアの表示内容の更新をまとめて行う
 */
function updateResultElements() {
  updateCommandCardVisibility();
  updateCommandTextsWithRegExp();
  updateCommandBorderLines();
  updateEmptyHourTextVisibility();
}

let cronEntryList = [];

// 主要な要素を取得
// 解析条件を設定するフォーム
const form = document.querySelector("form");
// コマンドの表示/非表示を切り替えるためのチェックボックスを配置するコンテナ
const checkboxContainer = document.querySelector(".checkbox-container");
// 解析結果の表示を行うエリア
const resultContainer = document.getElementById("result-container");
// スケジュール表示エリア
const scheduleContainer = document.getElementById("schedule-container");
// コマンド文字列のフィルタリング設定を正規表現で指定するためのinput要素
const regexpInput = document.getElementById("filter-regex");

initDate();
clearCheckboxContainer();
clearScheduleContainer();

regexpInput.addEventListener("input", (event) => {
  updateCommandTextsWithRegExp();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearCheckboxContainer();
  clearScheduleContainer();
  const formData = new FormData(form);
  const response = await fetch("/api/analyze_cron", {
    method: "POST",
    body: formData,
  });
  const json = await response.json();

  const dateStr = formData.get("date");
  const date = new Date(dateStr);

  // 解析結果表示エリアのタイトルを設定
  const scheduleDateElem = document.getElementById("schedule_date");
  // 〇年〇月〇日(〇曜日)のスケジュール
  let dateJa = `${date.getFullYear()}年${
    date.getMonth() + 1
  }月${date.getDate()}日`;
  const dayOfWeekList = ["日", "月", "火", "水", "木", "金", "土"];
  dateJa += `(${dayOfWeekList[date.getDay()]})`;
  scheduleDateElem.textContent = dateJa;

  // コマンドリスト
  cronEntryList = json.cron_entry_list;
  // スケジュールリスト (実行予定時刻昇順にソート済み)
  const scheduleList = json.schedule_list;
  let scheduleListIndex = 0;

  // 00~24で時間帯を表示する
  for (let currentHour = 0; currentHour < 24; currentHour++) {
    const hourStr = currentHour.toString().padStart(2, "0");

    // 「〇時」を表示
    const hourHeader = document.createElement("div");
    hourHeader.classList.add("hour-header");
    hourHeader.textContent = `${hourStr}時`;
    scheduleContainer.appendChild(hourHeader);

    // 1時間毎の予定をまとめて扱うためのコンテナを作成
    const hourlyScheduleContainer = document.createElement("div");
    hourlyScheduleContainer.classList.add("hourly-schedule-container");
    scheduleContainer.appendChild(hourlyScheduleContainer);

    while (true) {
      if (scheduleList.length <= scheduleListIndex) {
        break;
      }

      let nextSchedule = scheduleList[scheduleListIndex];
      let nextScheduleTime = nextSchedule.time;
      let nextScheduleHour = parseInt(nextScheduleTime.split(":")[0]);

      if (nextScheduleHour !== currentHour) {
        // 次のコマンドの実行予定時刻が現在の時間帯に含まれない場合、breakして次の時間帯の処理へ
        break;
      }

      scheduleListIndex++;

      // 同時刻(時、分が一致)のスケジュールをまとめる
      let sameTimeScheduleList = [nextSchedule];
      while (true) {
        if (scheduleList.length <= scheduleListIndex) {
          break;
        }
        let nextSchedule = scheduleList[scheduleListIndex];
        if (nextSchedule.time !== nextScheduleTime) {
          break;
        }
        sameTimeScheduleList.push(nextSchedule);
        scheduleListIndex++;
      }

      // ある時刻に実行予定のコマンドをまとめて表示するためのカードを作成
      const commandCard = document.createElement("div");
      commandCard.classList.add("command-card");
      commandCard.classList.add("card");

      const commandTimeElem = document.createElement("div");
      commandTimeElem.classList.add("command-time");
      commandTimeElem.textContent = nextScheduleTime;

      const commandListUl = document.createElement("ul");
      commandListUl.classList.add("command-list");

      sameTimeScheduleList.forEach((schedule) => {
        const li = document.createElement("li");
        li.dataset.ref_entry_id = schedule.entry_id;
        commandListUl.appendChild(li);
      });

      commandCard.appendChild(commandTimeElem);
      commandCard.appendChild(commandListUl);

      hourlyScheduleContainer.appendChild(commandCard);
    }

    // その時間帯に実行予定のコマンドがない場合に「（実行予定なし）」と表示するための要素を追加
    // この要素の表示/非表示制御は別途行う
    const emptyHourTextElem = document.createElement("div");
    emptyHourTextElem.classList.add("empty-hour");
    emptyHourTextElem.textContent = "（実行予定なし）";
    hourlyScheduleContainer.appendChild(emptyHourTextElem);
  }
  resultContainer.style.display = "block";

  // 各コマンドが何回実行される予定かをカウント
  const entryIdToExecCountMap = {};
  cronEntryList.forEach((cronEntry) => {
    // 全コマンドの実行予定回数を0で初期化
    entryIdToExecCountMap[cronEntry.entry_id] = 0;
  });
  scheduleList.forEach((schedule) => {
    entryIdToExecCountMap[schedule.entry_id]++;
  });

  // 実行予定回数降順でソート
  cronEntryList.sort((a, b) => {
    return (
      entryIdToExecCountMap[b.entry_id] - entryIdToExecCountMap[a.entry_id]
    );
  });

  cronEntryList.forEach((cronEntry) => {
    const commandItem = document.createElement("div");
    commandItem.classList.add("command-item");

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    label.appendChild(checkbox);
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.dataset.entry_id = cronEntry.entry_id;

    // コマンドチェックボックスの切替
    checkbox.addEventListener("change", (event) => {
      const checkbox = event.target;
      const entryId = checkbox.dataset.entry_id;
      const commandList = document.querySelectorAll(
        `.command-list li[data-ref_entry_id="${entryId}"]`
      );

      commandList.forEach((li) => {
        li.classList.toggle("hidden", !checkbox.checked);
      });

      updateResultElements();
    });

    // 実行回数
    const executionCount = document.createElement("span");
    executionCount.classList.add("execution-count");
    executionCount.textContent = entryIdToExecCountMap[cronEntry.entry_id];

    // 実行コマンド
    const commandText = document.createElement("div");
    commandText.classList.add("command-text-block");
    commandText.classList.add("command-text");
    commandText.dataset.ref_entry_id = cronEntry.entry_id;

    commandItem.appendChild(label);
    commandItem.appendChild(executionCount);
    commandItem.appendChild(commandText);

    checkboxContainer.appendChild(commandItem);
  });

  updateResultElements();

  const errorRowList = json.error_row_list;
  const errorListElem = document.getElementById("error_list");
  if (0 < errorRowList.length) {
    const errors = document.getElementById("errors");
    errors.style.display = "block";
    errorListElem.innerHTML = "";
    errorRowList.forEach((errorRow) => {
      const li = document.createElement("li");
      li.textContent = errorRow;
      errorListElem.appendChild(li);
    });

    const errorCountElem = document.getElementById("error-count");
    errorCountElem.textContent = errorRowList.length;
  } else {
    const errors = document.getElementById("errors");
    errors.style.display = "none";
    errorListElem.innerHTML = "";
  }
});
