import sqlite3
import os

def format_sql_normal(sql):
    if not sql:
        return sql
    
    start = sql.find('(')
    if start == -1:
        return sql
    
    end = len(sql) - 1
    paren_count = 0
    for i, ch in enumerate(sql):
        if ch == '(':
            paren_count += 1
        elif ch == ')':
            paren_count -= 1
            if paren_count == 0:
                end = i
                break
    
    prefix = sql[:start+1].strip()
    content = sql[start+1:end]
    suffix = sql[end:]
    
    fields = []
    current = ''
    in_quote = False
    quote_char = None
    paren_level = 0
    bracket_level = 0
    
    for ch in content:
        if ch in '"\'' and not in_quote:
            in_quote = True
            quote_char = ch
        elif ch == quote_char and in_quote:
            in_quote = False
            quote_char = None
        elif ch == '(' and not in_quote:
            paren_level += 1
        elif ch == ')' and not in_quote:
            paren_level -= 1
        elif ch == '[' and not in_quote:
            bracket_level += 1
        elif ch == ']' and not in_quote:
            bracket_level -= 1
        elif ch == ',' and not in_quote and paren_level == 0 and bracket_level == 0:
            fields.append(current.strip())
            current = ''
            continue
        current += ch
    if current.strip():
        fields.append(current.strip())

    result = prefix + '\n'
    for i, field in enumerate(fields):
        comma = ',' if i < len(fields) - 1 else ''
        for line in field.split('\n'):
            result += f'    {line}\n'
        result = result.rstrip('\n') + comma + '\n'
    result += ')'
    
    return result

def update_schema():
    db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')
    if not os.path.exists(db_path):
        print('❌ Файл базы данных не найден!')
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL ORDER BY name")
    schemas = cursor.fetchall()
    
    with open('schema.sql', 'w', encoding='utf-8') as f:
        f.write('-- SQL-схема базы данных RSC Agency\n')
        f.write('-- Обновлено: автоматически из db.sqlite3\n\n')
        for schema in schemas:
            formatted = format_sql_normal(schema[0])
            f.write(formatted + ';\n\n')
    
    print(f'✅ schema.sql обновлён. Найдено таблиц: {len(schemas)}')
    conn.close()

if __name__ == '__main__':
    update_schema()