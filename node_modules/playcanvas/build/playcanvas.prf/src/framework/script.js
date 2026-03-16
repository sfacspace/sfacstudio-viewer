import { getApplication } from './globals.js';

let _createdLoadingScreen = false;
const script = {
		app: null,
		createLoadingScreen (callback) {
				if (_createdLoadingScreen) {
						return;
				}
				_createdLoadingScreen = true;
				const app = getApplication();
				callback(app);
		}
};

export { script };
