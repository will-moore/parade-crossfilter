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

// css, images and fonts
require('./../css/app.css');
require('./../css/images/ome-icon-opacity.png');

import $ from "jquery";

export class Index  {

    ready = false;

    error = null;

    projects = [];

    /**
     * Overridden aurelia lifecycle method:
     * fired when PAL (dom abstraction) is ready for use
     *
     * @memberof Index
     */
    attached() {
        let projectRequestUrl = window.PARAMS.WEB_API + "m/projects?limit=10";
        let successHandler = (response) => {
            if (response && Array.isArray(response.data)) {
                this.projects = response.data;
            } else this.error = "No response";
            this.ready = true;
        };
        let errorHandler = (error) => {
            this.error = "failed to retrieve the project list.";
            console.error(error);
            this.ready = true;
        };
        $.ajax({
            url : projectRequestUrl,
            success : successHandler,
            error : errorHandler
        });
    }
}
