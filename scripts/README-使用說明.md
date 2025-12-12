# unused-css 工具 使用說明（中文）

本文檔放在 `scripts/` 下，說明如何快速使用本專案中兩個主要工具：

- `find-unused-css.js`：掃描專案 `src/` 下的 CSS，產生可能未被使用的選擇器報告（JSON）。
- `comment-unused-css.js`：根據報告備份並移除（或註解）對應的 CSS 區塊，備份放到 timestamped run 資料夾。

這份說明以 Windows 環境為主（Node.js 命令行），指令可在 PowerShell 或 CMD 中執行。所有產生的檔案均以 UTF-8 編碼儲存。

---

**快速起手（最短流程）**

1. 產生報告（會在 `scripts/` 下同時建立：
   - `scripts/unused-report.json`（穩定路徑，方便其他工具直接讀取）
   - `scripts/unused-report yyyy-MM-dd hh-mm-ss/unused-report.json`（帶時間戳的歸檔））：

```bash
node scripts/find-unused-css.js
```

2. 使用報告進行清除（會建立 `scripts/unused-cleanup yyyy-MM-dd hh-mm-ss/`，並把備份放在該資料夾中）：

```bash
node scripts/comment-unused-css.js --report=scripts/unused-report.json
```

---

**檔案與資料夾說明**

- `scripts/unused-report.json`
  - 穩定位置的 JSON 報告，其他工具或流程可直接使用此路徑。
- `scripts/unused-report yyyy-MM-dd hh-mm-ss/unused-report.json`
  - 每次執行掃描時的歸檔副本，含完整報告與 `generatedAt` 時間。
- `scripts/unused-cleanup yyyy-MM-dd hh-mm-ss/`
  - `comment-unused-css.js` 每次執行會建立的 run 資料夾，內含：
    - 已複製的報告檔（同報告檔名），例如 `unused-report.json`。
    - 對各個被修改 CSS 檔案的備份，命名為 `<原檔名>.bak.<timestamp>.css`。

範例：
```
scripts/
├─ unused-report.json
├─ unused-report 2025-12-10 17-20-31/unused-report.json
├─ unused-cleanup 2025-12-10 17-21-05/
│  ├─ unused-report.json
│  ├─ global.css.bak.2025-12-10 17-21-05.css
│  └─ scenes.css.bak.2025-12-10 17-21-05.css
```

---

**詳細操作說明 & 建議流程（安全做法）**

1. 先用 `git` 建一個暫時分支或 commit 所有變更：

```bash
git checkout -b cleanup-unused-css
git add -A
git commit -m "WIP: backup before css cleanup"
```

2. 執行掃描：
```bash
node scripts/find-unused-css.js
```
- 檢查輸出的 `scripts/unused-report.json` 或歸檔資料夾（`unused-report yyyy...`）裡的 JSON，手動打開檢視前幾項。該工具是啟發式（heuristic），可能會有誤報，請特別注意動態產生的 class 名稱或第三方庫使用的 selector。

3. 若要小範圍演示，手動挑選 `unused-report.json` 中想要刪除的條目並編輯（進階），或直接執行清除工具（會產生備份）：

```bash
node scripts/comment-unused-css.js --report=scripts/unused-report.json
```

4. 檢查 `scripts/unused-cleanup yyyy-MM-dd hh-mm-ss/` 下的備份與 `summary`（該工具會在 console 印出 summary），確認要保留或回復的檔案。

5. 若要回復某個被改動的 CSS 檔案，請使用備份覆蓋原檔（PowerShell 範例）：

```powershell
Copy-Item -Path "scripts\unused-cleanup 2025-12-10 17-21-05\global.css.bak.2025-12-10 17-21-05.css" -Destination "src\css\global.css" -Force
```

或用 CMD：

```cmd
copy "scripts\unused-cleanup 2025-12-10 17-21-05\global.css.bak.2025-12-10 17-21-05.css" "src\css\global.css"
```

6. 測試與驗證：在瀏覽器中開啟應用並測試各介面（特別是動態生成 class 的元件）。如果有問題，使用上面的方法從備份覆蓋回原檔。

7. 最終確認後，透過 `git diff` 與 `git add`、`commit` 提交變更到分支，並建立 Pull Request 供 code review。

---

**常見注意事項（FAQ）**

- Q：這個工具能保證不會刪掉會用到的 CSS 嗎？
  - A：不能保證。工具使用文字搜索與簡單正則，對於動態產生的 class（例如 JavaScript 在 runtime 拼接）或通過 pattern 應用的 selector 會有誤判。請務必在修改前人工 review 報告。

- Q：備份在哪裡？如何快速還原？
  - A：備份會放在 `scripts/unused-cleanup yyyy-MM-dd hh-mm-ss/`，每個被修改檔案都有 `<basename>.bak.<timestamp>.css`。
    將該備份複製回原路徑即可還原。

- Q：檔案編碼與平台？
  - A：所有工具以 UTF-8 讀寫檔案，檔名已針對 Windows 做過處理（移除了 `:`），可在 Windows 上直接使用。

---

如果你想要我加入：
- 更詳細的範例（列出 top 30 預計刪除的 selectors 並放到 README 中）；或
- 自動生成一個可 review 的 git patch 檔（`.patch`），我可以把產生流程也加入本說明裡，告訴你如何應用或回退。

請告訴我你要哪一個，我會接著幫你完成。祝操作順利！
