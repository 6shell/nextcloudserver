/**
 * Copyright (c) 2014 Vincent Petry <pvince81@owncloud.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 * @author Vincent Petry <vincent@nextcloud.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

describe('OCA.Files.FavoritesPlugin tests', function() {
	var Plugin = OCA.Files.FavoritesPlugin;
	var fileList;

	beforeEach(function() {
		$('#testArea').append(
			'<div id="content">' +
			'<div id="app-navigation">' +
			'<ul><li data-id="files"><a>Files</a></li>' +
			'<li data-id="sharingin"><a></a></li>' +
			'<li data-id="sharingout"><a></a></li>' +
			'</ul></div>' +
			'<div id="app-content">' +
			'<div id="app-content-files" class="hidden">' +
			'</div>' +
			'<div id="app-content-favorites" class="hidden">' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>'
		);
		OC.Plugins.attach('OCA.Files.App', Plugin);
		fileList = Plugin.showFileList($('#app-content-favorites'));
	});
	afterEach(function() {
		OC.Plugins.detach('OCA.Files.App', Plugin);
	});

	describe('initialization', function() {
		it('inits favorites list on show', function() {
			expect(fileList).toBeDefined();
		});
	});
	describe('file actions', function() {
		it('provides default file actions', function() {
			var fileActions = fileList.fileActions;

			expect(fileActions.actions.all).toBeDefined();
			expect(fileActions.actions.all.Delete).toBeDefined();
			expect(fileActions.actions.all.Rename).toBeDefined();
			expect(fileActions.actions.all.Download).toBeDefined();

			expect(fileActions.defaults.dir).toEqual('Open');
		});
		it('provides custom file actions', function() {
			var actionStub = sinon.stub();
			// regular file action
			OCA.Files.fileActions.register(
					'all',
					'RegularTest',
					OC.PERMISSION_READ,
					OC.imagePath('core', 'actions/shared'),
					actionStub
			);

			Plugin.favoritesFileList = null;
			fileList = Plugin.showFileList($('#app-content-favorites'));

			expect(fileList.fileActions.actions.all.RegularTest).toBeDefined();
		});
		it('redirects to files app when opening a directory', function() {
			var oldList = OCA.Files.App.fileList;
			// dummy new list to make sure it exists
			OCA.Files.App.fileList = new OCA.Files.FileList($('<table><thead></thead><tbody></tbody></table>'));

			var setActiveViewStub = sinon.stub(OCA.Files.App, 'setActiveView');
			// create dummy table so we can click the dom
			var $table = '<table><thead></thead><tbody class="files-fileList"></tbody></table>';
			$('#app-content-favorites').append($table);

			Plugin.favoritesFileList = null;
			fileList = Plugin.showFileList($('#app-content-favorites'));

			fileList.setFiles([{
				name: 'testdir',
				type: 'dir',
				path: '/somewhere/inside/subdir',
				counterParts: ['user2'],
				shareOwner: 'user2'
			}]);

			fileList.findFileEl('testdir').find('td .nametext').click();

			expect(OCA.Files.App.fileList.getCurrentDirectory()).toEqual('/somewhere/inside/subdir/testdir');

			expect(setActiveViewStub.calledOnce).toEqual(true);
			expect(setActiveViewStub.calledWith('files')).toEqual(true);

			setActiveViewStub.restore();

			// restore old list
			OCA.Files.App.fileList = oldList;
		});
	});
});

