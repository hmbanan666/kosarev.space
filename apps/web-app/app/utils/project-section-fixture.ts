import type { ProjectSections } from './project-sections'

export interface SampleProjectPage {
  title: string
  kind: string
  description: string
  work: string
  linkLabel: string
  sections: ProjectSections
}

const sampleHref = 'https://example.com/fixture'

export const sampleProjectPage: Record<'ru' | 'en', SampleProjectPage> = {
  en: {
    title: 'Sample project',
    kind: 'Layout sample',
    description: 'A short summary sits here. The sections below are fixture text for the reading layout.',
    work: 'This line stands in for the existing short implementation note.',
    linkLabel: 'Sample link',
    sections: {
      problem: 'Someone needs to read a project as a case, not as a card. This paragraph is sample text for that opening.',
      built: 'The sample column holds the build note under its own heading, with a line length meant for reading.',
      decisions: [
        {
          title: 'One reason per decision',
          why: 'The fixture pairs a short title with the reason, so a list of slogans cannot pass as a case.',
        },
        {
          title: 'Leave empty sections out',
          why: 'A heading with nothing under it is noise, so this sample only includes sections that have text.',
        },
      ],
      stack: ['Sample markup', 'Sample type'],
      statusNext: 'The sample is a layout check. It is not a status report for a real product.',
      links: [{ label: 'Sample reference', href: sampleHref }],
    },
  },
  ru: {
    title: 'Образец проекта',
    kind: 'Образец вёрстки',
    description: 'Короткая сводка остаётся здесь. Разделы ниже — текст фикстуры для проверки чтения.',
    work: 'Эта строка заменяет короткую заметку о реализации.',
    linkLabel: 'Пример ссылки',
    sections: {
      problem: 'Проект нужно прочитать как разбор, а не как карточку. Этот абзац — образец такого начала.',
      built: 'Колонка образца держит заметку о сделанном под своим заголовком, с длиной строки для чтения.',
      decisions: [
        {
          title: 'Одна причина на решение',
          why: 'Фикстура ставит рядом короткий заголовок и причину, чтобы список лозунгов не сошёл за разбор.',
        },
        {
          title: 'Пустые разделы не показывать',
          why: 'Заголовок без текста мешает чтению, поэтому в образце только заполненные разделы.',
        },
      ],
      stack: ['Образец разметки', 'Образец типа'],
      statusNext: 'Это проверка вёрстки, а не статус настоящего продукта.',
      links: [{ label: 'Образец ссылки', href: sampleHref }],
    },
  },
}
