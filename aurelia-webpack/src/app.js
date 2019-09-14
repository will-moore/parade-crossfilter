//
// Copyright (C) 2017 University of Dundee & Open Microscopy Environment.
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

// deps
import { bootstrap } from 'aurelia-bootstrapper';
import * as Bluebird from 'bluebird';

// global scope settings
Bluebird.config({ warnings: { wForgottenReturn: false } });

/* IMPORTANT:
 * we have to set the public path here to include any potential prefix
 * has to happen before the bootstrap!
 */
let prefix = typeof window.URI_PREFIX === 'string' || "";
__webpack_public_path__ = prefix + '/static/aurelia_example/';

/**
 * aurelia bootstrap function
 * @function
 * @param {Object} aurelia the aurelia instance
 */
bootstrap((aurelia) => {
    aurelia.use.basicConfiguration();
    aurelia.start().then(
        () => aurelia.setRoot(PLATFORM.moduleName('index'), document.body));
});
