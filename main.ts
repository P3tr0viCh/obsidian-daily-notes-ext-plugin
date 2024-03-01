import { Plugin, Notice, Editor, MarkdownView } from 'obsidian';
import { getDailyNote, getAllDailyNotes, getDailyNoteSettings } from 'obsidian-daily-notes-interface';

import moment, { Moment } from 'moment';

import * as S from 'strings';

export default class DailyNotesExtPlugin extends Plugin {
	getDailyNoteDate(): Moment | null {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (markdownView) {
			const dailyNoteSettings = getDailyNoteSettings();

			const dailyNotePath = markdownView.file.parent.path;
			const dailyNoteName = markdownView.file.basename;

			if (dailyNotePath == dailyNoteSettings.folder) {
				const date = moment(dailyNoteName, dailyNoteSettings.format);

				if (date.isValid()) {
					return date;
				} else {
					new Notice('invalid date');
					return null;
				}
			}
		}

		return moment();
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
		const ribbonIconEl = this.addRibbonIcon('calendar-clock', S.BUTTON_PREV_YEAR_NOTE, async (evt: MouseEvent) => {
			const date = this.getDailyNoteDate();

			if (date) {
				if (date.isLeapYear() && date.month() == 1 && date.date() == 29) {
					date.subtract(4, 'years');
				} else {
					date.subtract(1, 'years');
				}

				//new Notice(date.toString());

				if (!await this.openDailyNote(date, true)) {
					new Notice(S.ERROR_PREV_YEAR_NOTE_NOT_EXISTS);
				}
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
				}
			}
		});
	}

	onunload() {
	}
}