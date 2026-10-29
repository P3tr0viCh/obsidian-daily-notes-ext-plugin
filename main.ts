import { Plugin, Notice, MarkdownView } from 'obsidian';
import { getDailyNote, getAllDailyNotes, getDailyNoteSettings } from 'obsidian-daily-notes-interface';

import moment, { Moment } from 'moment';
import 'moment/locale/ru';

import * as S from 'strings';

export default class DailyNotesExtPlugin extends Plugin {
	statusBarItem!: HTMLElement;

	getDailyNoteDate(): Moment | null {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (!markdownView) return null;

		const file = markdownView.file;

		const dailyNoteSettings = getDailyNoteSettings();

		const dailyNoteFolder = dailyNoteSettings.folder ?? "";
		const dailyNoteFormat = dailyNoteSettings.format ?? "YYYY-MM-DD";

		if (!file.path.startsWith(dailyNoteFolder + '/') || !file.path.endsWith('.md')) return null;

		const fullPath = file.path;

		const relativePath = fullPath.substring(dailyNoteFolder.length + 1);

		const nameWithoutExt = relativePath.slice(0, -3);

		const date = moment(nameWithoutExt, dailyNoteFormat, true);

		if (date.isValid()) return date;

		new Notice(S.ERROR_FILENAME_FORMAT);

		return null;
	}

	async openDailyNote(date: Moment, newLeaf: boolean): Promise<boolean> {
		const dailyNote = getDailyNote(date, getAllDailyNotes());

		if (dailyNote) {
			const { workspace } = this.app;

			await workspace.getLeaf(newLeaf).openFile(dailyNote);

			return true;
		}

		return false;
	}

	async onload() {
		this.statusBarItem = this.addStatusBarItem();

		moment.locale('ru');

		this.addRibbonIcon('calendar-clock', S.BUTTON_PREV_YEAR_NOTE, async () => {
			const date = this.getDailyNoteDate();

			if (date) {
				if (date.isLeapYear() && date.month() == 1 && date.date() == 29) {
					date.subtract(4, 'years');
				} else {
					date.subtract(1, 'years');
				}

				if (!await this.openDailyNote(date, true)) {
					new Notice(S.ERROR_PREV_YEAR_NOTE_NOT_EXISTS);
				}
			} else {
				new Notice(S.ERROR_NOT_DAILY);
			}
		});

		this.addCommand({
			id: 'daily-notes-ext-prev-note-command',
			name: S.COMMAND_PREV_NOTE,
			callback: async () => {
				const date = this.getDailyNoteDate();

				if (date) {
					date.subtract(1, 'days');

					if (!await this.openDailyNote(date, false)) {
						new Notice(S.ERROR_PREV_NOTE_NOT_EXISTS);
					}
				} else {
					new Notice(S.ERROR_NOT_DAILY);
				}
			}
		});

		this.addCommand({
			id: 'daily-notes-ext-next-note-command',
			name: S.COMMAND_NEXT_NOTE,
			callback: async () => {
				const date = this.getDailyNoteDate();

				if (date) {
					date.add(1, 'days');

					if (!await this.openDailyNote(date, false)) {
						new Notice(S.ERROR_NEXT_NOTE_NOT_EXISTS);
					}
				} else {
					new Notice(S.ERROR_NOT_DAILY);
				}
			}
		});

		this.registerEvent(this.app.workspace.on('file-open', () => {
			const date = this.getDailyNoteDate();

			if (date) {
				this.statusBarItem.setText(date.format('dddd'));
			} else {
				this.statusBarItem.setText('');
			}
		}));
	}

	onunload() {
	}
}