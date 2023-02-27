import { Plugin, Notice, Editor, MarkdownView } from 'obsidian';
import { getDailyNote, getAllDailyNotes, getDailyNoteSettings } from 'obsidian-daily-notes-interface';

import { EOL } from 'os';

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
				}
			} else {
				new Notice(S.ERROR_NO_OPEN_DAILY_NOTE);
			}
		} else {
			new Notice(S.ERROR_NO_OPEN_NOTE);
		}

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
		const ribbonIconEl = this.addRibbonIcon('calendar-clock', S.BUTTON_PREV_YEAR_NOTE, async (evt: MouseEvent) => {
			const date = moment();

			date.subtract(1, 'years');

			if (!await this.openDailyNote(date, true)) {
				new Notice(S.ERROR_PREV_YEAR_NOTE_NOT_EXISTS);
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