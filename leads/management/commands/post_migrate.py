from django.core.management.base import BaseCommand
from django.db.models.signals import post_migrate
from django.dispatch import receiver
import sqlite3
import os

class Command(BaseCommand):
    help = 'Обновляет schema.sql после миграций'

    def handle(self, *args, **options):
        db_path = 'db.sqlite3'
        if not os.path.exists(db_path):
            self.stdout.write(self.style.WARNING('База данных не найдена'))
            return
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL")
        schemas = cursor.fetchall()
        
        with open('schema.sql', 'w', encoding='utf-8') as f:
            f.write('-- SQL-схема базы данных RSC Agency\n')
            f.write('-- Обновлено автоматически после миграций\n\n')
            for schema in schemas:
                f.write(schema[0] + ';\n\n')
        
        self.stdout.write(self.style.SUCCESS(f'✅ schema.sql обновлён (таблиц: {len(schemas)})'))
        conn.close()
