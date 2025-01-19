# DailyCronTimeline

cronスケジュールを解析し、指定日のコマンド実行予定を時系列で表示するWebアプリケーションです。

## セットアップ

1. リポジトリをクローンします。
    ```sh
    git clone <repository_url>
    cd <repository_directory>
    ```

2. 必要なパッケージをインストールします。
    ```sh
    pip install -r requirements.txt
    ```

3. アプリケーションを起動します。
    ```sh
    python app.py
    ```

    デフォルトではポート5000で起動します。別のポートを使用する場合は、コマンドライン引数でポート番号を指定します。
    ```sh
    python app.py 8080
    ```

## 使用方法

1. ブラウザで `http://localhost:5000` にアクセスします。
2. `Cron設定` テキストエリアに解析したいcronエントリを入力します。
3. `日付` フィールドに解析対象の日付を入力します。
4. `解析` ボタンをクリックします。
5. 解析結果が表示されます。
