#
# Copyright (c) 2017 University of Dundee.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

from django.shortcuts import render
from django.core.urlresolvers import reverse

from omeroweb.decorators import login_required

from version import __version__

APP_PREFIX = "backbone_example"
WEB_API_VERSION = 0


@login_required()
def index(request, conn=None, **kwargs):
    # pass on version to rendered template
    params = {'VERSION': __version__}
    params['WEB_API'] = reverse(
        'api_base', kwargs={'api_version': WEB_API_VERSION})

    return render(
        request, APP_PREFIX + '/index.html',
        {'params': params, APP_PREFIX + '_url_suffix': u"?_"
            + APP_PREFIX + "-%s" % __version__}
    )
