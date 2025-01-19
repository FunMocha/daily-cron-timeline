from flask import Blueprint, request, jsonify
from croniter import croniter
from datetime import datetime, timedelta
from .models import Schedule, CronEntry

bp = Blueprint('routes', __name__, static_folder='../static', static_url_path='')

@bp.route('/', methods=['GET'])
def index():
    return bp.send_static_file('index.html')

@bp.route('/api/analyze_cron', methods=['POST'])
def analyze_cron():
    # 解析対象の日付を取得(yyyy-mm-dd形式の文字列)
    date_str = request.form['date']
    # フォーマットが正しいか確認
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
    except:
        return jsonify({'error': 'Invalid date format'})
    
    # 00:00の実行予定も取得したいため、前日の23:59:59を起点として次の実行予定の取得を行っていく
    date = datetime.strptime(date_str, '%Y-%m-%d')
    base_datetime = date - timedelta(seconds=1)
    
    # 解析対象のcron式を取得(複数行許容)
    cron_entries_str = request.form['cron-entries']
    cron_entries_str = cron_entries_str.strip()
    cron_entry_str_list = cron_entries_str.splitlines()
    
    schedule_list = []
    cron_entry_list = []
    error_row_list = []
    
    entry_id = 1
    # cron式を解析
    for cron_entry_str in cron_entry_str_list:
        trimmed_cron_entry_str = cron_entry_str.strip()
        if trimmed_cron_entry_str == '':
            # 空行は無視
            continue
        if trimmed_cron_entry_str.startswith('#'):
            # コメント行は無視
            continue
        
        if not CronEntry.is_valid_row(trimmed_cron_entry_str):
            # 解析出来ない行はエラーとして扱う
            error_row_list.append(trimmed_cron_entry_str)
            continue
        
        cron_entry = CronEntry(entry_id, trimmed_cron_entry_str)
        cron_entry_list.append(cron_entry)
        entry_id += 1
        
        # cron式を解析
        # 指定日の実行予定を取得
        iter = croniter(cron_entry.get_cron_expression(), base_datetime)
        
        while True:
            next_execute_datetime = iter.get_next(datetime)
            if next_execute_datetime.strftime('%Y-%m-%d') != date_str:
                break
            schedule = Schedule(next_execute_datetime, cron_entry)
            schedule_list.append(schedule.to_json())
        
    # 実行予定時刻昇順でソート
    schedule_list.sort(key=lambda x: x['time'])
    
    return jsonify({
        'date': date_str,
        'schedule_list': schedule_list,
        'error_row_list': error_row_list,
        'cron_entry_list': [cron_entry.to_json() for cron_entry in cron_entry_list]
    })

    
    