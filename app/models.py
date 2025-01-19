from croniter import croniter
from datetime import datetime

# 実行日時とコマンドのペアを格納するVO
class Schedule:
    def __init__(self, datetime, cron_entry):
        self.datetime = datetime
        self.cron_entry = cron_entry

    def to_json(self):
        return {
            'time': self.datetime.strftime('%H:%M'),
            'entry_id': self.cron_entry.get_entry_id(),
            'command': self.cron_entry.get_command()
        }

class CronEntry:
    def __init__(self, entry_id, row_str):
        if not self.is_valid_row(row_str):
            raise ValueError('Invalid cron row')
        self.entry_id = entry_id
        self.row_str = row_str
        
    def get_entry_id(self):
        return self.entry_id
    
    def get_row_str(self):
        return self.row_str
    
    def get_cron_expression(self):
        return self.extract_cron_expression_part(self.row_str)
    
    def get_command(self):
        return self.extract_command_part(self.row_str)
        
    @classmethod
    def is_valid_row(cls, row):
        splitted_row = row.split(' ')
        if len(splitted_row) < 6:
            return False
        try:
            croniter(' '.join(splitted_row[:5]), datetime.now())
        except:
            return False
        return True
    
    @classmethod
    def extract_cron_expression_part(cls, row):
        splitted_row = row.split(' ')
        return ' '.join(splitted_row[:5])
    
    @classmethod
    def extract_command_part(cls, row):
        splitted_row = row.split(' ')
        return ' '.join(splitted_row[5:])
        
    def to_json(self):
        return {
            'entry_id': self.entry_id,
            'row': self.row_str,
            'command_text': self.get_command()
        }