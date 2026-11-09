from pathlib import Path

import qrcode
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = Path("/home/whetherit/Презентация_проекта_Шаблон.pptx")
OUTPUT = ROOT / "presentation" / "StudyFlow_Агафонов_Глеб.pptx"
QR_PATH = ROOT / "presentation" / "repository-qr.png"
REPO_URL = "https://github.com/whetherit/studyflow-semester-project"

BLUE = RGBColor(19, 72, 141)
DARK = RGBColor(26, 39, 56)
MUTED = RGBColor(83, 102, 124)
LIGHT = RGBColor(235, 243, 252)
GREEN = RGBColor(31, 107, 79)
LIME = RGBColor(217, 242, 111)
WHITE = RGBColor(255, 255, 255)


def set_text(shape, text, size=22, bold=False, color=DARK, align=PP_ALIGN.LEFT):
    frame = shape.text_frame
    frame.clear()
    frame.word_wrap = True
    frame.vertical_anchor = MSO_ANCHOR.MIDDLE
    paragraph = frame.paragraphs[0]
    paragraph.alignment = align
    run = paragraph.add_run()
    run.text = text
    run.font.name = "Arial"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return run


def set_title(slide, text):
    title = slide.shapes[2]
    title.left = Inches(2.0)
    title.top = Inches(0.75)
    title.width = Inches(10.4)
    title.height = Inches(0.8)
    set_text(title, text, size=32, bold=True, color=BLUE)


def set_subtitle(slide, text):
    body = slide.shapes[1]
    body.left = Inches(1.0)
    body.top = Inches(1.55)
    body.width = Inches(11.3)
    body.height = Inches(0.6)
    set_text(body, text, size=18, color=MUTED)


def add_card(slide, x, y, w, h, title, body, accent=BLUE, number=None):
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    card.fill.solid()
    card.fill.fore_color.rgb = WHITE
    card.line.color.rgb = RGBColor(205, 219, 235)
    card.line.width = Pt(1)

    if number is not None:
        badge = slide.shapes.add_shape(
            MSO_SHAPE.OVAL, Inches(x + 0.25), Inches(y + 0.27), Inches(0.48), Inches(0.48)
        )
        badge.fill.solid()
        badge.fill.fore_color.rgb = accent
        badge.line.fill.background()
        set_text(badge, str(number), size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        title_x = x + 0.86
        title_w = w - 1.1
    else:
        title_x = x + 0.28
        title_w = w - 0.56

    title_box = slide.shapes.add_textbox(
        Inches(title_x), Inches(y + 0.25), Inches(title_w), Inches(0.45)
    )
    set_text(title_box, title, size=18, bold=True, color=accent)

    body_box = slide.shapes.add_textbox(
        Inches(x + 0.28), Inches(y + 0.82), Inches(w - 0.56), Inches(h - 1.0)
    )
    frame = body_box.text_frame
    frame.clear()
    frame.word_wrap = True
    for index, line in enumerate(body):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        paragraph.text = line
        paragraph.font.name = "Arial"
        paragraph.font.size = Pt(15)
        paragraph.font.color.rgb = DARK
        paragraph.space_after = Pt(7)
    return card


def add_picture_contain(slide, path, x, y, w, h):
    with Image.open(path) as image:
        ratio = image.width / image.height
    box_ratio = w / h
    if ratio > box_ratio:
        image_w = w
        image_h = w / ratio
    else:
        image_h = h
        image_w = h * ratio
    return slide.shapes.add_picture(
        str(path),
        Inches(x + (w - image_w) / 2),
        Inches(y + (h - image_h) / 2),
        width=Inches(image_w),
        height=Inches(image_h),
    )


def remove_shape(shape):
    shape._element.getparent().remove(shape._element)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    qrcode.make(REPO_URL).save(QR_PATH)
    presentation = Presentation(TEMPLATE)

    # 1. Титульный слайд
    slide = presentation.slides[0]
    title = slide.shapes[0]
    title.top = Inches(1.45)
    title.height = Inches(1.8)
    set_text(title, "StudyFlow\nУчебный планировщик", size=34, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
    author = slide.shapes[2]
    author.left = Inches(8.85)
    author.top = Inches(5.25)
    author.width = Inches(3.6)
    author.height = Inches(0.75)
    set_text(author, "Агафонов Глеб Артемович\nгруппа АСУб-25-2", size=14, color=DARK, align=PP_ALIGN.CENTER)
    set_text(slide.shapes[3], "Иркутск 2026", size=15, color=DARK, align=PP_ALIGN.CENTER)
    repo_box = slide.shapes[4]
    repo_box.left = Inches(8.85)
    repo_box.top = Inches(4.45)
    repo_box.width = Inches(3.6)
    repo_box.height = Inches(0.6)
    repo_run = set_text(repo_box, "github.com/whetherit/\nstudyflow-semester-project", size=11, color=BLUE, align=PP_ALIGN.CENTER)
    repo_run.hyperlink.address = REPO_URL
    add_picture_contain(slide, QR_PATH, 9.85, 2.85, 1.55, 1.55)

    # 2. Актуальность
    slide = presentation.slides[1]
    set_title(slide, "Актуальность")
    set_subtitle(slide, "Учебные задания приходят из разных источников, а общий список обычно отсутствует")
    add_card(slide, 0.9, 2.35, 3.65, 2.55, "Задания теряются", ["Чаты, тетради и заметки не дают единого места для работы."], number=1)
    add_card(slide, 4.85, 2.35, 3.65, 2.55, "Сроки забываются", ["Без наглядных дат трудно вовремя увидеть ближайшую сдачу."], number=2)
    add_card(slide, 8.8, 2.35, 3.65, 2.55, "Прогресс не виден", ["Студенту сложно оценить, сколько задач осталось в работе."], number=3)
    goal = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.0), Inches(5.25), Inches(9.35), Inches(0.85))
    goal.fill.solid(); goal.fill.fore_color.rgb = LIME; goal.line.fill.background()
    set_text(goal, "Цель: собрать учебные задачи в одном простом приложении", size=20, bold=True, color=DARK, align=PP_ALIGN.CENTER)

    # 3. Решение
    slide = presentation.slides[2]
    set_title(slide, "Предлагаемое решение")
    set_subtitle(slide, "StudyFlow хранит личный учебный план прямо в браузере пользователя")
    add_card(slide, 0.9, 2.3, 3.65, 2.75, "Записать", ["Название", "Предмет", "Срок и приоритет"], accent=GREEN, number=1)
    add_card(slide, 4.85, 2.3, 3.65, 2.75, "Спланировать", ["Поиск", "Фильтры", "Статистика"], accent=GREEN, number=2)
    add_card(slide, 8.8, 2.3, 3.65, 2.75, "Выполнить", ["Отметка готовности", "Редактирование", "Резервная копия"], accent=GREEN, number=3)
    set_subtitle_box = slide.shapes.add_textbox(Inches(2.0), Inches(5.35), Inches(9.4), Inches(0.7))
    set_text(set_subtitle_box, "Без регистрации · Без сервера · Данные не уходят в интернет", size=18, bold=True, color=BLUE, align=PP_ALIGN.CENTER)

    # 4. Стек
    slide = presentation.slides[3]
    set_title(slide, "Используемый стек технологий")
    set_subtitle(slide, "Инструменты выбраны так, чтобы проект можно было запустить на любом учебном компьютере")
    technologies = [
        ("HTML5", "Структура страницы"), ("CSS3", "Адаптивный интерфейс"),
        ("JavaScript", "Логика приложения"), ("localStorage", "Хранение данных"),
        ("Node.js", "Автоматические тесты"), ("Git + GitHub", "Версии и публикация"),
    ]
    for index, (name, purpose) in enumerate(technologies):
        row, column = divmod(index, 3)
        add_card(slide, 0.85 + column * 4.15, 2.25 + row * 1.7, 3.75, 1.35, name, [purpose], accent=BLUE)

    # 5. Реализация
    slide = presentation.slides[4]
    set_title(slide, "Реализация и архитектура")
    set_subtitle(slide, "Логика отделена от интерфейса, поэтому основные правила проверяются автоматически")
    layers = [
        ("Браузер", "Клиентский слой"),
        ("HTML + CSS", "Презентационный слой"),
        ("task-model.js", "Бизнес-правила"),
        ("localStorage", "Ресурсный слой"),
    ]
    for index, (name, purpose) in enumerate(layers):
        y = 2.1 + index * 1.02
        box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(y), Inches(5.0), Inches(0.78))
        box.fill.solid(); box.fill.fore_color.rgb = LIGHT; box.line.color.rgb = RGBColor(191, 211, 234)
        set_text(box, f"{name}  —  {purpose}", size=17, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
    code = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.25), Inches(2.1), Inches(6.05), Inches(3.85))
    code.fill.solid(); code.fill.fore_color.rgb = RGBColor(31, 42, 55); code.line.fill.background()
    code_text = "filterTasks(tasks, filters)\n\ncreateTask(input)\nupdateTask(task, input)\ngetStats(tasks)\n\n// 16 автоматических тестов"
    set_text(code, code_text, size=17, color=RGBColor(223, 242, 231))

    # 6. Работа автора
    slide = presentation.slides[5]
    set_title(slide, "Разделение работы")
    set_subtitle(slide, "Проект выполнен индивидуально")
    badge = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.95), Inches(2.15), Inches(2.15), Inches(2.15))
    badge.fill.solid(); badge.fill.fore_color.rgb = GREEN; badge.line.fill.background()
    set_text(badge, "1\nавтор", size=24, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    name = slide.shapes.add_textbox(Inches(3.55), Inches(2.0), Inches(8.1), Inches(0.65))
    set_text(name, "Агафонов Глеб Артемович", size=25, bold=True, color=BLUE)
    tasks_box = slide.shapes.add_textbox(Inches(3.55), Inches(2.8), Inches(8.0), Inches(2.9))
    frame = tasks_box.text_frame; frame.clear(); frame.word_wrap = True
    for index, line in enumerate(["Анализ проблемы и постановка задачи", "Проектирование интерфейса и архитектуры", "Разработка HTML, CSS и JavaScript", "Тестирование, документация и публикация"]):
        p = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        p.text = "✓  " + line; p.font.name = "Arial"; p.font.size = Pt(20); p.font.color.rgb = DARK; p.space_after = Pt(12)

    # 7. Результат
    slide = presentation.slides[6]
    set_title(slide, "Результат")
    set_subtitle(slide, "Готовое адаптивное веб-приложение · запись работы: demo/StudyFlow_demo.webm")
    add_picture_contain(slide, ROOT / "docs/images/studyflow-desktop.png", 0.55, 2.05, 7.2, 4.75)
    add_card(slide, 8.0, 2.2, 4.35, 1.25, "16 / 16", ["автоматических тестов пройдено"], accent=GREEN)
    add_card(slide, 8.0, 3.75, 4.35, 1.25, "390 px", ["проверена мобильная ширина"], accent=GREEN)
    add_card(slide, 8.0, 5.3, 4.35, 1.25, "0 ошибок", ["в консоли браузера"], accent=GREEN)

    # 8. История разработки
    slide = presentation.slides[7]
    set_title(slide, "Прогресс в репозитории")
    set_subtitle(slide, "Каждое понятное изменение сохранено отдельным коммитом")
    if len(slide.shapes) > 3:
        remove_shape(slide.shapes[3])
    add_picture_contain(slide, ROOT / "docs/images/github-commits.png", 0.65, 2.05, 8.65, 4.75)
    stat = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.55), Inches(2.35), Inches(2.65), Inches(2.2))
    stat.fill.solid(); stat.fill.fore_color.rgb = LIME; stat.line.fill.background()
    set_text(stat, "44+\nкоммита", size=29, bold=True, color=DARK, align=PP_ALIGN.CENTER)
    link_box = slide.shapes.add_textbox(Inches(9.35), Inches(4.85), Inches(3.05), Inches(1.0))
    run = set_text(link_box, "github.com/whetherit/\nstudyflow-semester-project", size=13, color=BLUE, align=PP_ALIGN.CENTER)
    run.hyperlink.address = REPO_URL

    # 9. Выводы
    slide = presentation.slides[8]
    set_title(slide, "Выводы")
    set_subtitle(slide, "Проект прошёл путь от проблемы и требований до испытаний и публикации")
    conclusions = [
        ("ИТ-архитектура", "Разделение приложения на слои"),
        ("Разработка", "HTML, CSS и JavaScript на практике"),
        ("Качество", "Автоматические и ручные проверки"),
        ("Git", "Работа с версиями и GitHub"),
    ]
    for index, (title_text, body_text) in enumerate(conclusions):
        row, column = divmod(index, 2)
        add_card(slide, 1.0 + column * 6.0, 2.25 + row * 1.75, 5.45, 1.4, title_text, [body_text], accent=GREEN)
    result = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.2), Inches(5.9), Inches(8.9), Inches(0.65))
    result.fill.solid(); result.fill.fore_color.rgb = LIME; result.line.fill.background()
    set_text(result, "StudyFlow готов к учебной демонстрации", size=20, bold=True, color=DARK, align=PP_ALIGN.CENTER)

    presentation.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build()
